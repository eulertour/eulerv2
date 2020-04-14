<template>
  <div class="d-flex full-width mt-2 mx-2">
    <div class="d-flex mr-2 flex-column full-width">
      <codemirror
        v-model="code"
        v-bind:options="{ mode: 'python', theme: 'rubyblue' }"
      />
      <EditorControls
        class="mt-2"
        v-bind:scene-choices="sceneChoices"
        v-bind:chosen-scene-prop="chosenScene"
        v-on:chosen-scene-update="(newScene)=>{this.chosenScene=newScene}"
        v-on:refresh-scene-choices="refreshSceneChoices"
        v-on:run-manim="runManim"
      />
    </div>
    <canvas class="renderer-element" ref="renderer"/>
  </div>
</template>

<script>
  import * as THREE from "three";
  import * as consts from "../constants.js";
  import axios from "axios";
  import path from "path";
  import { Mobject } from  "../Mobject.js";
  import { Scene, SingleStringTexMobject } from  "../manim.js";
  import EditorControls from  "./EditorControls.vue";

  import { codemirror } from 'vue-codemirror'
  import 'codemirror/lib/codemirror.css'
  import 'codemirror/lib/codemirror.css'
  import 'codemirror/theme/rubyblue.css'
  import 'codemirror/mode/python/python.js'

  export default {
    name: "ThreeTest",
    components: {
      codemirror,
      EditorControls,
    },
    data() {
      return {
        project: "example_scenes",
        code: "",
        sceneChoices: [],
        chosenScene: "",
      };
    },
    created() {
      this.fps = 15;
      this.aspectRatio = 16 / 9;
      this.rendererHeight = 480; // Set to 720 for 720p
      this.sceneHeight = 8;
      this.cameraNear = 1; // z = 2
      this.cameraFar = 5;  // z = -2
      this.cameraZPosition = 3;

      this.scene = null;
      this.camera = null;
      this.renderer = null;

      this.frameData = [];
      this.twoScene = null;

      // Maps Mobject IDs from Python to their respective Mobjects in
      // Javascript.
      this.mobjectDict = {};
    },
    mounted() {
      // Pyodide
      window.languagePluginLoader.then(() => {
        window.pyodide.loadPackage("manimlib").then(() => {
          window.pyodide.runPython("import manimlib");
          window.pyodide.runPython("import numpy");
        }).then(() => {
          this.loadCode().then(() => {
            this.refreshSceneChoices();
          }).catch(error => {
            // eslint-disable-next-line
            console.error(error);
          });
        });
      });

      // A global function for generating tex from python.
      this.twoScene = new Scene({
        width: this.sceneWidth,
        height: this.sceneHeight,
      });
      window.tex_to_points = tex => SingleStringTexMobject.texToPoints(
        tex,
        this.twoScene,
        /*dumpToFile=*/false,
        /*includeCommands=*/true,
      );

      // Scene
      this.scene = new THREE.Scene();

      // Camera
      this.camera = new THREE.OrthographicCamera(
        /*left=*/-this.sceneWidth / 2,
        /*right=*/this.sceneWidth / 2,
        /*top=*/this.sceneHeight / 2,
        /*bottom=*/-this.sceneHeight / 2,
        /*near=*/this.cameraNear,
        /*far=*/this.cameraFar,
      );
      this.camera.position.z = this.cameraZPosition;

      // Renderer
      this.renderer = new THREE.WebGLRenderer({
        canvas: this.$refs.renderer,
        antialias: true,
      });
      this.renderer.setSize(
        this.rendererHeight * this.aspectRatio,
        this.rendererHeight,
        false,
      );
    },
    computed: {
      sceneWidth() { return this.sceneHeight * this.aspectRatio; },
      rendererWidth() { return this.rendererHeight * this.aspectRatio; },
      fpsInterval() { return consts.MS_PER_SECOND / this.fps; }
    },
    methods: {
      loadCode() {
        let codePath = path.join(
          consts.SCENE_DATA_DIR,
          this.$route.params.project || this.project,
          consts.CODE_NAME,
        );
        return axios.get(codePath).then(response => {
          this.code = response.data;
        }).catch(error => {
          // eslint-disable-next-line
          console.error(error);
        });
      },
      refreshSceneChoices() {
        let manimlib = window.pyodide.pyimport("manimlib")
        this.sceneChoices = manimlib.get_scene_choices(this.code);
        if (this.chosenScene.length === 0) {
          this.chosenScene = this.sceneChoices[0];
        }
        manimlib.destroy();
      },
      runManim() {
        let manimlib = window.pyodide.pyimport("manimlib");
        let scene = manimlib.get_scene(this.code, [this.chosenScene]);
        scene.render();
        this.frameData = scene.camera.frame_data;
        this.animateFrameData();
        manimlib.destroy();
      },
      animateFrameData() {
        let lastFrameTimestamp = window.performance.now();
        let currentFrame = 0;
        let animate = () => {
          if (currentFrame !== this.frameData.length) {
            requestAnimationFrame(animate);

            // Throttle FPS (https://stackoverflow.com/a/19772220/3753494).
            let now = window.performance.now();
            let elapsed = now - lastFrameTimestamp;
            if (elapsed <= this.fpsInterval) return;
            lastFrameTimestamp = now - (elapsed % this.fpsInterval);

            let frameData = this.frameData[currentFrame];
            // Add each Mobject in the frame.
            let currentFrameMobjectIds = new Set();
            for (let mobjectData of frameData) {
              let {
                id,
                points,
                style,
                needsRedraw,
                needsTriangulation,
              } = mobjectData;
              currentFrameMobjectIds.add(id);
              if (id in this.mobjectDict) {
                this.mobjectDict[id].update(
                  points,
                  style,
                  needsRedraw,
                  needsTriangulation,
                );
              } else {
                this.mobjectDict[id] = new Mobject(id, points, style);
              }
              // As long as all Mobjects are direct children of the Scene
              // double-adding them has no effect.
              this.scene.add(this.mobjectDict[id]);
            }

            // Remove each Mobject that isn't in the frame.
            for (let i = this.scene.children.length - 1; i >= 0; i--) {
              let child = this.scene.children[i];
              if (!(currentFrameMobjectIds.has(child.mobjectId))) {
                this.scene.remove(child);
              }
            }

            this.renderer.render(this.scene, this.camera);
            currentFrame += 1;
          } else {
            // Clear the Scene.
            for (let i = this.scene.children.length - 1; i >= 0; i--) {
              this.scene.remove(this.scene.children[i]);
            }
            // Dispose the Mobjects.
            for (let mobject of Object.values(this.mobjectDict)) {
              mobject.dispose();
            }
            this.frameData.length = 0;
          }
        }
        animate();
      }
    },
  }
</script>

<style>
/* Copied from https://discuss.codemirror.net/t/size-inside-flexbox/1359/5 to
 * size CodeMirror correctly within a flexbox element.
 */
.vue-codemirror {
  flex: 1 1 auto;
  margin-top: 0;
  height: 100%;
  position: relative;
}
.CodeMirror {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  height: 100%;
}
.renderer-element {
  width: 480px;
  height: 270px;
}
</style>
