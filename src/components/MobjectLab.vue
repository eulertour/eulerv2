<template>
  <div class="align-items-center justify-content-center mt-7">
    <v-card class="mr-7 pa-6" min-height="360px" min-width="400px">
      <div v-if="sceneLoaded">
        <v-card-title class="pa-0">
          <div class="display-1">Transform</div>
        </v-card-title>
        <div class="subtitle-1">Morph one Mobject into another</div>
        <v-divider class="my-6"/>
        <v-card-text class="pa-0">
          <MobjectPanel
            v-bind:mobject-data="mobject1"
            v-bind:mobject-classes="mobjects"
            v-bind:default-class="mobject1.className"
            v-bind:scene-element="this.scene.renderer.domElement"
            label="Start Mobject"

            v-on:class-change="handleClassChange"
            v-on:position-change="handlePositionChange"
            v-on:picker-change="handlePickerChange"
            v-on:picker-hide="handlePickerHide"
            v-on:picker-save="handlePickerSave"
            v-on:width-change="handleWidthChange"
          />
          <v-divider class="my-6"/>
          <MobjectPanel
            v-bind:mobject-data="mobject2"
            v-bind:mobject-classes="mobjects"
            v-bind:default-class="mobject2.className"
            v-bind:scene-element="this.scene.renderer.domElement"
            label="End Mobject"

            v-on:class-change="handleClassChange"
            v-on:position-change="handlePositionChange"
            v-on:picker-change="handlePickerChange"
            v-on:picker-hide="handlePickerHide"
            v-on:picker-save="handlePickerSave"
            v-on:width-change="handleWidthChange"
          />
        </v-card-text>
        <v-divider class="my-6"/>
        <v-card-actions class="pa-0">
          <v-btn v-on:click="play" class="mr-3">Play</v-btn>
          <v-btn v-on:click="jumpToStart">Start</v-btn>
          <v-btn v-on:click="jumpToEnd">End</v-btn>
        </v-card-actions>
      </div>
      <div v-else class="spinner-container align-items-center justify-content-center">
        <v-progress-circular indeterminate/>
      </div>
    </v-card>
    <div id="manim-background"/>
  </div>
</template>

<script>
import * as Manim from '../manim.js';
import MobjectPanel from './MobjectPanel.vue'

export default {
  name: 'MobjectLab',
  components: {
    MobjectPanel,
  },
  data() {
    return {
      scene: null,
      sceneLoaded: false,
      selectingPosition: false,
      isAtStart: true,
      mobjects: ["Circle", "Square"],
      mobject1: {
        className: "Circle",
        params: {},
        position: [-1, 0],
        style: {
          strokeColor: "#fc6255",
          strokeOpacity: 1,
          fillColor: "#000000",
          fillOpacity: 0,
          strokeWidth: 4,
        },
        mobject: null,
        isAtStart: true,
      },
      mobject2: {
        className: "Square",
        params: {},
        position: [1, 0],
        style: {
          strokeColor: "#ffffff",
          strokeOpacity: 1,
          fillColor: "#000000",
          fillOpacity: 0,
          strokeWidth: 4,
        },
        mobject: null,
        isAtStart: false,
      },
    }
  },
  mounted() {
    let scene = new Manim.Scene({
      width: 640,
      height: 360,
    });
    scene.appendTo(document.getElementById("manim-background"));
    scene.update();
    scene.renderer.domElement.id = "manim-scene";
    this.scene = scene;

    window.languagePluginLoader.then(() => {
      window.pyodide.loadPackage("numpy").then(() => {
        window.pyodide.runPython("import numpy");
        // setup default scene
        let c = new Manim[this.mobject1.className]();
        c.translateMobject(this.mobject1.position);
        this.mobject1.mobject = c;
        scene.add(c);
        scene.update();
        this.sceneLoaded = true;
      });
    });
  },
  methods: {
    play: function() {
      if (!this.isAtStart) {
        // draw initial scene
        this.scene.clear();
        let c = new Manim[this.mobject1.className]();
        c.translateMobject(this.mobject1.position);
        c.applyStyle(this.mobject1.style);
        this.mobject1.mobject = c;
        this.scene.add(c);
      }
      let s = new Manim[this.mobject2.className]();
      s.translateMobject(this.mobject2.position);
      s.applyStyle(this.mobject2.style);
      this.mobject2.mobject = s;

      let anim = new Manim.Transform(this.mobject1.mobject, s);
      this.scene.playAnimation(anim);
      this.isAtStart = false;
    },
    jumpToStart: function() {
      if (this.isAtStart) {
        return;
      }
      // draw initial scene
      this.scene.clear();
      let c = new Manim[this.mobject1.className]();
      c.translateMobject(this.mobject1.position);
      c.applyStyle(this.mobject1.style);
      this.mobject1.mobject = c;
      this.scene.add(c);
      this.scene.update();
      this.isAtStart = true;
    },
    jumpToEnd: function() {
      if (!this.isAtStart) {
        return;
      }
      // draw final scene
      this.scene.clear();
      let c = new Manim[this.mobject2.className]();
      c.translateMobject(this.mobject2.position);
      c.applyStyle(this.mobject2.style);
      this.mobject2.mobject = c;
      this.scene.add(c);
      this.scene.update();
      this.isAtStart = false;
    },
    handleWidthChange(width, mobjectData) {
      mobjectData.style.strokeWidth = width;
      if (this.isAtStart === mobjectData.isAtStart) {
        mobjectData.mobject.linewidth = width / 100;
      } else {
        // draw scene
        this.scene.clear();
        let c = new Manim[mobjectData.className]();
        c.translateMobject(mobjectData.position);
        c.applyStyle(mobjectData.style);
        mobjectData.mobject = c;
        this.scene.add(c);
        this.isAtStart = mobjectData.isAtStart;
      }
      this.scene.update();
      this.isAtStart = mobjectData.isAtStart;
    },
    handleClassChange(className, mobjectData) {
      mobjectData.className = className;
      if (this.isAtStart === mobjectData.isAtStart) {
        // redraw mobject
        this.scene.remove(mobjectData.mobject);
        let c = new Manim[mobjectData.className]();
        c.translateMobject(mobjectData.position);
        c.applyStyle(mobjectData.style);
        mobjectData.mobject = c;
        this.scene.add(c);
      } else {
        // draw initial scene
        this.scene.clear();
        let c = new Manim[mobjectData.className]();
        c.translateMobject(mobjectData.position);
        c.applyStyle(mobjectData.style);
        mobjectData.mobject = c;
        this.scene.add(c);
      }
      this.scene.update();
      this.isAtStart = mobjectData.isAtStart;
    },
    handlePickerSave(attr, color, mobjectData) {
      let hexa = color.toHEXA();
      mobjectData.style[attr + 'Color'] = hexa.toString().slice(0, 7);
      mobjectData.style[attr + 'Opacity'] = color.a;
    },
    handlePickerChange(attr, color, mobjectData) {
      if (this.isAtStart === mobjectData.isAtStart) {
        mobjectData.mobject[attr] = color.toHEXA().toString();
      } else {
        // draw initial scene
        this.scene.clear();
        let c = new Manim[mobjectData.className]();
        c.translateMobject(mobjectData.position);
        c.applyStyle(mobjectData.style);

        c[attr] = color.toRGBA().toString();

        mobjectData.mobject = c;
        this.scene.add(c);
        this.isAtStart = true;
      }
      this.scene.update();
      this.isAtStart = mobjectData.isAtStart;
    },
    handlePickerHide(mobjectData) {
      mobjectData.mobject.applyStyle(mobjectData.style);
      this.scene.update();
    },
    handlePositionChange(e, sceneElement, mobjectData) {
      let clickedInsideScene = e.target.closest("#manim-scene") !== null;
      if (clickedInsideScene) {
        let scenePoint = this.scene.normalizePoint([
          e.clientX - sceneElement.getBoundingClientRect().left,
          e.clientY - sceneElement.getBoundingClientRect().top,
        ]);
        mobjectData.position = scenePoint;

        if (this.isAtStart === mobjectData.isAtStart) {
          mobjectData.mobject.moveTo(scenePoint);
        } else {
          // draw initial scene
          this.scene.clear();
          let c = new Manim[mobjectData.className]();
          c.translateMobject(mobjectData.position);
          c.applyStyle(mobjectData.style);

          c.moveTo(mobjectData.position);

          mobjectData.mobject = c;
          this.scene.add(c);
          this.isAtStart = true;
        }
        this.scene.update();
        this.isAtStart = mobjectData.isAtStart;
      }
    },
  },
  watch: {}
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.scene-info {
  margin-right: 30px;
  min-height: 360px;
  width: 400px;
}
.spinner-container {
  height: 360px;
}
#manim-background {
  width: 640px;
  height: 360px;
  background-color: black;
}
.picker-offset {
  position: absolute;
  left: 98px;
}
</style>
