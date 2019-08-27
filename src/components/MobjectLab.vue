<template>
  <div id="lab-container" class="mt-7">
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
          <div class="position-select">
            <div class="subtitle-1">
              ({{ mobject1.position[0].toFixed(1) || 0 }},
               {{ mobject1.position[1].toFixed(1) || 0 }})
            </div>
            <v-btn v-on:click="position(mobject1.mobject)" class="ml-3">
              {{ selectingPosition ? "Click the Scene" : "Set position" }}
            </v-btn>
          </div>
          <div class="title">Style</div>
          <div class="stroke-select">
            <div class="subtitle-1">stroke</div>
            <div class="ml-2">
              <div id="stroke-picker"/>
            </div>
          </div>
          <div class="subtitle-1">fill color</div>
          <div class="subtitle-1">fill opacity</div>
          <div class="subtitle-1">stroke width</div>
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
      <div v-else class="spinner-container">
        <v-progress-circular indeterminate></v-progress-circular>
      </div>
    </v-card>
    <div id="manim-background"/>
  </div>
</template>

<script>
import Vue from 'vue';
import '@simonwep/pickr/dist/themes/nano.min.css';
import Pickr from '@simonwep/pickr';
import * as Manim from '../manim.js';
import { VCard, VCardText, VCardTitle } from 'vuetify/lib'
import 'vuetify/dist/vuetify.min.css'

export default {
  name: 'MobjectLab',
  components: {
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
      }).then(() => {
        const pickr = Pickr.create({
          el: '#stroke-picker',
          default: this.mobject1.style.strokeColor,
          theme: 'nano',
          swatches: [
            'rgba(255, 235, 59, 0.95)',
            'rgba(255, 193, 7, 1)'
          ],
          components: {
            // Main components
            preview: true,
            opacity: true,
            hue: true,
            // Input / output Options
            interaction: {
              hex: true,
              rgba: true,
              input: true,
              save: true
            }
          }
        }).on('change', (color, instance) => {
          if (!this.finished) {
            this.mobject1.mobject.stroke = color.toHEXA().toString();
          } else {
            // draw initial scene
            this.scene.clear();
            let c = new Manim[this.mobject1.className]();
            c.translateMobject(this.mobject1.position);
            c.applyStyle(this.mobject1.style);

            c.stroke = color.toRGBA().toString();

            this.mobject1.mobject = c;
            this.scene.add(c);
          }
          this.scene.update();
        }).on('hide', instance => {
          this.mobject1.mobject.applyStyle(this.mobject1.style);
          this.scene.update();
        }).on('save', (color, instance) => {
          let hexa = color.toHEXA();
          this.mobject1.style.strokeColor = hexa.toString().slice(0, 7);
          this.mobject1.style.strokeOpacity = color.a;
        });
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
          }
          this.scene.update();
          this.finished = false;
        }
        document.removeEventListener('click', handlePositionClick);
        this.selectingPosition = false;
      };
      document.addEventListener('click', handlePositionClick);
    }
  },
  watch: {}
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
#lab-container {
  display: flex;
  align-items: center;
  justify-content: center;
}
.scene-info {
  margin-right: 30px;
  min-height: 360px;
  width: 400px;
}
.spinner-container {
  height: 360px;
  display: flex;
  justify-content: center;
  align-items: center;
}
#manim-background {
  width: 640px;
  height: 360px;
  background-color: black;
}
.position-select {
  display: flex;
  align-items: center;
}
.stroke-select {
  display: flex;
  align-items: center;
}
</style>
