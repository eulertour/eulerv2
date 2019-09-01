<template>
  <div class="d-flex justify-center align-center mt-7">
    <v-card class="d-flex flex-column justify-center info-card mr-7 pa-6">
      <div v-if="sceneLoaded" class="d-flex flex-column">
        <v-card-title class="pa-0">
          <div class="display-1">{{ currentAnimation.className }}</div>
        </v-card-title>
        <div class="subtitle-1">{{ currentAnimation.description }}</div>
        <v-divider class="my-6"/>
        <v-card-text class="pa-0">
          <div
            v-for="(mobject, index) in currentAnimation.args"
            v-bind:key="mobject"
          >
            <MobjectPanel
              v-bind:mobject-data="currentAnimation.mobjects[mobject]"
              v-bind:mobject-classes="mobjectChoices"
              v-bind:scene="scene"
              v-bind:label="currentAnimation.argDescriptions[index]"
              v-on:class-change="handleClassChange"
              v-on:position-change="handlePositionChange"
              v-on:picker-change="handlePickerChange"
              v-on:picker-hide="handlePickerHide"
              v-on:picker-save="handlePickerSave"
              v-on:width-change="handleWidthChange"
            />
            <v-divider class="my-6"/>
          </div>
        </v-card-text>
        <v-card-actions class="pa-0">
          <v-btn v-if="this.scene.playing" v-on:click="pause" class="mr-3">Pause</v-btn>
          <v-btn v-else v-on:click="play" class="mr-3">Play</v-btn>
          <v-btn v-on:click="drawScene('start')">Start</v-btn>
          <v-btn v-on:click="drawScene('end')">End</v-btn>
        </v-card-actions>
      </div>
      <div v-else class="d-flex align-stretch justify-center">
        <v-progress-circular indeterminate/>
      </div>
    </v-card>
    <div id="background-with-timeline">
      <div id="manim-background"/>
      <Timeline
        class="mt-2"
        v-bind:animations="animations"
        v-bind:index="animationIndex"
        v-bind:offset="animationOffset"
      />
    </div>
  </div>
</template>

<script>
import * as Manim from '../manim.js';
import MobjectPanel from './MobjectPanel.vue'
import Timeline from './Timeline.vue'

export default {
  name: 'MobjectLab',
  components: {
    MobjectPanel,
    Timeline,
  },
  computed: {
    currentAnimation() {
      return this.animations[this.animationIndex];
    }
  },
  data() {
    return {
      scene: null,
      sceneLoaded: false,
      mobjectChoices: ["Circle", "Square"],
      isAtStart: true,
      inMiddleOfAnim: false,
      animationIndex: 0,
      animationOffset: 0,
      animations: [{
        className: "Transform",
        description: "Morph one Mobject into another",
        durationSeconds: 1,
        args: ["mobject1", "mobject2"],
        argDescriptions: ["Start Mobject", "End Mobject"],
        startMobjects: ["mobject1"],
        endMobjects: ["mobject2"],
        mobjects: {
          mobject1: {
            className: "Circle",
            params: {},
            position: [-1, 0],
            style: {
              strokeColor: "#fc6255ff",
              fillColor: "#00000000",
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
              strokeColor: "#ffffffff",
              fillColor: "#00000000",
              strokeWidth: 4,
            },
            mobject: null,
            isAtStart: false,
          },
        }
      }],
    }
  },
  mounted() {
    let scene = new Manim.Scene({ width: 640, height: 360 });
    scene.appendTo(document.getElementById("manim-background"));
    scene.update();
    scene.renderer.domElement.id = "manim-scene";
    this.scene = scene;
    window.languagePluginLoader.then(() => {
      window.pyodide.loadPackage("numpy").then(() => {
        window.pyodide.runPython("import numpy");
        this.drawScene('start', /*forceDraw=*/true);
        this.sceneLoaded = true;
      });
    });
  },
  methods: {
    // TODO: the argument should be an integer denoting the timestamp
    drawScene: function(position, forceDraw=false) {
      if (position !== 'start' && position !== 'end') {
        // eslint-disable-next-line
        console.log("invalid call drawScene(" + position + ")");
      }
      if (this.inMiddleOfAnim) {
        this.scene.clearAnimation();
      } else {
        if (!forceDraw) {
          if (position === 'start' &&  this.isAtStart ||
              position === 'end'   && !this.isAtStart) {
            return;
          }
        }
      }
      this.scene.clear();
      for (let key of this.currentAnimation[position + "Mobjects"]) {
        let data = this.currentAnimation.mobjects[key];
        let mob = new Manim[data.className]();
        mob.translateMobject(data.position);
        mob.applyStyle(data.style);
        data.mobject = mob;
        this.scene.add(mob);
      }
      this.scene.update();
      this.isAtStart = position === 'start';
      this.inMiddleOfAnim = false;
    },
    onAnimationFinish: function() {
      this.inMiddleOfAnim = false;
    },
    onAnimationStep: function(elapsedSeconds) {
      this.animationOffset = elapsedSeconds;
    },
    pause: function () {
      this.scene.pause();
    },
    play: function() {
      if (this.inMiddleOfAnim) {
        this.scene.play()
        return;
      }
      if (!this.isAtStart) {
        this.drawScene('start');
      }
      let args = [];
      for (let key of this.currentAnimation.args) {
        let data = this.currentAnimation.mobjects[key];
        if (data.mobject === null) {
          let s = new Manim[data.className]();
          s.translateMobject(data.position);
          s.applyStyle(data.style);
          data.mobject = s;
        }
        args.push(data.mobject);
      }
      let anim = new Manim[this.currentAnimation.className](...args);
      this.scene.playAnimation(
        anim,
        /*onStep=*/this.onAnimationStep,
        /*onFinish=*/this.onAnimationFinish,
      );
      this.isAtStart = false;
      this.inMiddleOfAnim = true;
    },
    handleWidthChange(width, mobjectData) {
      mobjectData.style.strokeWidth = width;
      if (this.isAtStart === mobjectData.isAtStart) {
        mobjectData.mobject.linewidth = width / 100;
        this.scene.update();
      } else {
        this.drawScene(mobjectData.isAtStart ? 'start' : 'end');
      }
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
        this.scene.update();
      } else {
        this.drawScene(mobjectData.isAtStart ? 'start' : 'end');
      }
    },
    handlePickerSave(attr, color, mobjectData) {
      let hexa = color.toHEXA();
      mobjectData.style[attr + 'Color'] = hexa.toString();
    },
    handlePickerChange(attr, color, mobjectData) {
      if (this.isAtStart !== mobjectData.isAtStart) {
        this.drawScene(mobjectData.isAtStart ? 'start' : 'end');
      }
      mobjectData.mobject[attr] = color.toHEXA().toString();
      this.scene.update();
    },
    handlePickerHide(mobjectData) {
      mobjectData.mobject.applyStyle(mobjectData.style);
      this.scene.update();
    },
    handlePositionChange(position, mobjectData) {
      mobjectData.position = position;
      if (this.isAtStart === mobjectData.isAtStart) {
        mobjectData.mobject.moveTo(position);
        this.scene.update();
      } else {
        this.drawScene(mobjectData.isAtStart ? 'start' : 'end');
      }
    },
  },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
#manim-background {
  width: 640px;
  height: 360px;
  background-color: black;
}
.picker-offset {
  position: absolute;
  left: 98px;
}
.info-card {
  width: 400px;
  align-self: stretch;
}
</style>
