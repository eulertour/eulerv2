<template>
  <div class="align-items-center justify-content-center mt-7">
    <v-card class="mr-7 pa-6" min-height="360px" min-width="400px">
      <div v-if="sceneLoaded">
        <v-card-title class="pa-0 mb-2">
          <div class="display-1">Transform</div>
        </v-card-title>

        <v-card-text class="pa-0">
          Morph one Mobject into another.
          <v-select
            :items="mobjects"
            label="Start Mobject"
            v-model="mobject1.className">
          </v-select>
          <div class="title">Position</div>
          <div class="align-items-center">
            <div class="subtitle-1">
              ({{ mobject1.position[0].toFixed(1) || 0 }},
               {{ mobject1.position[1].toFixed(1) || 0 }})
            </div>
            <v-btn v-on:click="position(mobject1.mobject)" class="ml-3">
              {{ selectingPosition ? "Click the Scene" : "Set position" }}
            </v-btn>
          </div>
          <div class="title">Style</div>
          <div class="align-items-center position-relative">
            <div class="subtitle-1">stroke</div>
            <div class="ml-2 picker-offset">
              <Picker
                attr="stroke"
                v-bind:mobject-data="mobject1"
                v-bind:default="mobject1.style.strokeColor"
                v-on:change="handlePickerChange"
                v-on:hide="handlePickerHide"
                v-on:save="handlePickerSave"
              />
            </div>
          </div>
          <div class="align-items-center position-relative">
            <div class="subtitle-1">fill</div>
            <div class="ml-2 picker-offset">
              <Picker
                attr="fill"
                v-bind:mobject-data="mobject1"
                v-bind:default="mobject1.style.fillColor"
                v-on:change="handlePickerChange"
                v-on:hide="handlePickerHide"
                v-on:save="handlePickerSave"
              />
            </div>
          </div>
          <div class="align-items-center justify-content-center">
            <v-slider
              v-model="mobject1.style.strokeWidth"
              label="stroke width"
              v-bind:hide-details="true"
              v-bind:min="1"
              v-bind:max="15"
            />
          </div>
          <v-select
            :items="mobjects"
            label="End Mobject"
            v-model="mobject2.className">
          </v-select>
        </v-card-text>

        <v-card-actions class="pa-0">
          <v-btn v-on:click="play" class="mr-3">Play</v-btn>
          <v-btn>Reset</v-btn>
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
import { VCard, VCardText, VCardTitle } from 'vuetify/lib'
import 'vuetify/dist/vuetify.min.css'
import Picker from './Picker.vue'

export default {
  name: 'MobjectLab',
  components: {
    Picker,
    VCard,
    VCardText,
    VCardTitle,
  },
  props: {
    msg: String
  },
  data() {
    return {
      scene: null,
      sceneLoaded: false,
      selectingPosition: false,
      finished: false,
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
      if (this.finished) {
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

      let anim = new Manim.Transform(this.mobject1.mobject, s);
      this.scene.playAnimation(anim);
      this.finished = true;
    },
    handlePickerSave(attr, color, mobjectData) {
      let hexa = color.toHEXA();
      mobjectData.style[attr + 'Color'] = hexa.toString().slice(0, 7);
      mobjectData.style[attr + 'Opacity'] = color.a;
    },
    handlePickerChange(attr, color, mobjectData) {
      if (!this.finished) {
        mobjectData.mobject[attr] = color.toHEXA().toString();
      } else {
        // draw initial scene
        this.scene.clear();
        let c = new Manim[mobjectData.className]();
        c.translateMobject(mobjectData.position);
        c.applyStyle(mobjectData.style);

        c[attr] = color.toRGBA().toString();

        this.mobject1.mobject = c;
        this.scene.add(c);
        this.finished = false;
      }
      this.scene.update();
    },
    handlePickerHide(mobjectData) {
      mobjectData.mobject.applyStyle(mobjectData.style);
      this.scene.update();
    },
    position(mobject) {
      this.selectingPosition = true;
      let sceneElement = this.scene.renderer.domElement;
      let firstClick = true;

      let handlePositionClick = () => {
        // this function is triggered once when it is first added, but this
        // should be ignored
        if (firstClick) {
          firstClick = false;
          return;
        }
        let clickedInsideScene = event.target.closest("#manim-scene") !== null;
        if (clickedInsideScene) {
          let scenePoint = this.scene.normalizePoint([
            event.clientX - sceneElement.getBoundingClientRect().left,
            event.clientY - sceneElement.getBoundingClientRect().top,
          ]);
          this.mobject1.position = scenePoint;


          if (!this.finished) {
            mobject.moveTo(scenePoint);
          } else {
            // draw initial scene
            this.scene.clear();
            let c = new Manim[this.mobject1.className]();
            c.translateMobject(this.mobject1.position);
            c.applyStyle(this.mobject1.style);

            c.moveTo(this.mobject1.position);

            this.mobject1.mobject = c;
            this.scene.add(c);
            this.finished = false;
          }
          this.scene.update();
        }
        document.removeEventListener('click', handlePositionClick);
        this.selectingPosition = false;
      };
      document.addEventListener('click', handlePositionClick);
    }
  },
  watch: {
    'mobject1.style.strokeWidth': function(width) {
      if (!this.finished) {
        this.mobject1.mobject.linewidth = width / 100;
      } else {
        // draw initial scene
        this.scene.clear();
        let c = new Manim[this.mobject1.className]();
        c.translateMobject(this.mobject1.position);
        c.applyStyle(this.mobject1.style);
        this.mobject1.mobject = c;
        this.scene.add(c);
        this.finished = false;
      }
      this.scene.update();
    }
  }
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
.align-items-center {
  display: flex;
  align-items: center;
}
.justify-content-center {
  display: flex;
  justify-content: center;
}
.position-relative {
  position: relative;
}
.picker-offset {
  position: absolute;
  left: 50px;
}
</style>

<style>
.v-input__slider .v-input__slot .v-label {
  color: black;
}
</style>

