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
        v-on:run-manim="runManim"
      />
    </div>
    <div class="renderer-container" ref="rendererContainer"/>
  </div>
</template>

<script>
  /* eslint-disable */
  import * as THREE from "three";
  import * as consts from "../constants.js";
  import axios from "axios";
  import path from "path";
  // import Stats from "../../node_modules/three/examples/jsm/libs/stats.module.js";
  import { Mobject } from  "../Mobject.js";
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
      this.scene = null;
      this.camera = null;
      this.renderer = null;
      this.frameData = [];
    },
    mounted() {
      window.capture_mobjects = this.captureMobjects;
      window.dump_frames = this.dumpFrames;

      window.languagePluginLoader.then(() => {
        window.pyodide.loadPackage("manimlib").then(() => {
          window.pyodide.runPython("import manimlib");
          window.pyodide.runPython("import numpy");
          // window.texToPoints = tex => Manim.SingleStringTexMobject.texToPoints(tex, this.scene);
        }).then(() => {
          this.loadCode().then(() => {
            this.refreshSceneChoices();
          }).catch(error => {
            // eslint-disable-next-line
            console.error(error);
          });
        });
      });

      let scene = new THREE.Scene();
      scene.background = new THREE.Color(0x000000);
      this.scene = scene;

      let aspectRatio = 16 / 9;
      let rendererWidth = 480;
      let verticalFOVDeg = 45;
      let verticalFOVRad = THREE.Math.degToRad(verticalFOVDeg);
      let zDist = 4 / Math.tan(verticalFOVRad / 2);
      let camera = new THREE.PerspectiveCamera(
        verticalFOVDeg, aspectRatio, 1, 10,
      );
      camera.position.z = zDist;
      this.camera = camera;

      // let height = 2 * Math.tan( verticalFOVRad / 2 ) * zDist;
      // let width = height * camera.aspect;
      // console.log(`camera.fov = ${camera.fov}`);
      // console.log(`camera.position.z = ${camera.position.z}`);
      // console.log(`visible width = ${width}`);
      // console.log(`visible height = ${height}`);

      let renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setSize(rendererWidth, rendererWidth / aspectRatio);
      this.$refs.rendererContainer.appendChild(renderer.domElement);
      this.renderer = renderer;

      // function init() {
      //   let heartPoints = [
      //     [0.4053477928657103,0.4053477928657103,0],
      //     [0.4053477928657103,0.4053477928657103,0],
      //     [0.32427823429256825,0,0],
      //     [0,0,0],
      //     [0,0,0],
      //     [-0.4864173514388524,0,0],
      //     [-0.4864173514388524,0.5674869100119945,0],
      //     [-0.4864173514388524,0.5674869100119945,0],
      //     [-0.4864173514388524,0.5674869100119945,0],
      //     [-0.4864173514388524,0.8917651443045627,0],
      //     [-0.16213911714628412,1.2484712020263877,0],
      //     [0.4053477928657103,1.5403216128896993,0],
      //     [0.4053477928657103,1.5403216128896993,0],
      //     [0.9728347028777048,1.2484712020263877,0],
      //     [1.297112937170273,0.8917651443045627,0],
      //     [1.297112937170273,0.5674869100119945,0],
      //     [1.297112937170273,0.5674869100119945,0],
      //     [1.297112937170273,0.5674869100119945,0],
      //     [1.297112937170273,0,0],
      //     [0.8106955857314206,0,0],
      //     [0.8106955857314206,0,0],
      //     [0.5674869100119945,0,0],
      //     [0.4053477928657103,0.4053477928657103,0],
      //     [0.4053477928657103,0.4053477928657103,0],
      //   ];

      //   let heart = new Mobject(
      //     heartPoints, {
      //       strokeColor: 0xffffff,
      //       strokeOpacity: 1,
      //       fillColor: 0xf00000,
      //       fillOpacity: 1,
      //       strokeWidth: 4,
      //     }
      //   );
      //   scene.add(heart.mesh);
      // }

      // let stats = new Stats();
      // rendererContainer.appendChild(stats.dom);
			// function animate() {
			// 	requestAnimationFrame( animate );
			// 	render();
			// 	stats.update();
			// }

      // init();
			// animate();
      // renderer.render(scene, camera);
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
        this.frameData.length = 0;
        let manimlib = window.pyodide.pyimport("manimlib");
        let scene = manimlib.get_scene(this.code, [this.chosenScene]);
        scene.run();
        manimlib.destroy();
      },
      dumpFrames(frames) {
        this.frameData = frames;
        this.animateFrameData();
      },
      captureMobjects(mobjectData) {
        // for (let data of this.frameData) {
        //   console.log(data[0].points[11]);
        // }
        // this.frameData.push(mobjectData);
        // let mobjects = [];
        // for (let data of mobjectData) {
        //   let mobject = new Mobject(data.points, data.style);
        //   mobjects.push(mobject);
        //   this.scene.add(mobject.mesh);
        // }
        // this.renderer.render(this.scene, this.camera);
      },
      animateFrameData() {
        let currentFrame = 0;

        let animate = () => {
          if (currentFrame !== this.frameData.length - 1) {
            requestAnimationFrame(animate);
          }
          let frameData = this.frameData[currentFrame];

          let meshes = [];
          for (let mobjectData of frameData) {
            let mesh = new Mobject(mobjectData.points, mobjectData.style).mesh;
            meshes.push(mesh);
            this.scene.add(mesh);
          }
          this.renderer.render(this.scene, this.camera);
          for (let mesh of meshes) {
            this.scene.remove(mesh);
          }
          currentFrame += 1;
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
</style>
