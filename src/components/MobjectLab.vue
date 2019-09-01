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
        <v-card-actions class="d-flex justify-center pa-0">
          <v-btn fab v-on:click="jumpToAnimationStart" class="mx-2">
            <v-icon color="black" x-large>mdi-skip-previous</v-icon>
          </v-btn>
          <v-btn fab v-if="this.scene.playing" v-on:click="scene.pause" class="mx-4">
            <v-icon color="black" x-large>mdi-pause</v-icon>
          </v-btn>
          <v-btn fab v-else v-on:click="play" class="mx-4">
            <v-icon color="black" x-large>mdi-play</v-icon>
          </v-btn>
          <v-btn fab v-on:click="jumpToAnimationEnd" class="mx-2">
            <v-icon color="black" x-large>mdi-skip-next</v-icon>
          </v-btn>
        </v-card-actions>
      </div>
      <div v-else class="d-flex align-stretch justify-center">
        <v-progress-circular indeterminate/>
      </div>
    </v-card>
    <div id="video-controls">
      <div id="manim-background"/>
      <Timeline
        class="mt-2"
        v-bind:animations="animations"
        v-bind:index="animationIndex"
        v-bind:offset="animationOffset"
        v-on:new-animation="handleNewAnimation"
      />
      <VideoControls
        v-if="sceneLoaded"
        v-on:play="play"
        v-on:pause="scene.pause"
        v-on:step-backward="stepBackward"
        v-on:step-forward="stepForward"
        v-bind:scene="scene"
      />
    </div>
  </div>
</template>

<script>
import * as Manim from '../manim.js';
import MobjectPanel from './MobjectPanel.vue'
import Timeline from './Timeline.vue'
import VideoControls from './VideoControls.vue'
import { AnimationPosition } from '../constants.js';

export default {
  name: 'MobjectLab',
  components: {
    MobjectPanel,
    Timeline,
    VideoControls,
  },
  computed: {
    currentAnimation() {
      return this.animations[this.animationIndex];
    },
  },
  data() {
    return {
      scene: null,
      sceneLoaded: false,
      mobjectChoices: ["Circle", "Square"],
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
    this.scene = new Manim.Scene({ width: 640, height: 360 });
    this.scene.appendTo(document.getElementById("manim-background"));
    this.scene.update();
    this.scene.renderer.domElement.id = "manim-scene";
    window.languagePluginLoader.then(() => {
      window.pyodide.loadPackage("numpy").then(() => {
        window.pyodide.runPython("import numpy");
        this.clearAndDrawScene(0, AnimationPosition.START, /*forceDraw=*/true);
        this.sceneLoaded = true;
      });
    });
  },
  methods: {
    // TODO: the argument should be an integer denoting the timestamp
    clearAndDrawScene: function(index, position, forceDraw=false) {
      let offsetFromPostion = (position === AnimationPosition.START ? 0 : 1);
      if (!forceDraw &&
          this.animationIndex === index &&
          this.animationOffset === offsetFromPostion) {
          return;
      }
      if (this.animationOffset !== 0 && this.animationOffset !== 1) {
        this.scene.clearAnimation();
      }
      let positionString = (position === AnimationPosition.START
                              ? 'start'
                              : 'end');
      this.scene.clear();
      let targetAnimation = this.animations[index];
      for (let key of targetAnimation[positionString + "Mobjects"]) {
        let data = targetAnimation.mobjects[key];
        let mob = new Manim[data.className]();
        mob.translateMobject(data.position);
        mob.applyStyle(data.style);
        data.mobject = mob;
        this.scene.add(mob);
      }
      this.scene.update();
      this.animationIndex = index;
      this.animationOffset = offsetFromPostion;
    },
    play: function() {
      if (this.animationOffset !== 0 && this.animationOffset !== 1) {
        this.scene.play()
        return;
      }
      if (this.animationOffset !== 0) {
        this.clearAndDrawScene(this.animationIndex, AnimationPosition.START);
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
      this.scene.playAnimation(anim, /*onStep=*/this.onAnimationStep);
    },
    jumpToAnimationStart: function() {
      this.clearAndDrawScene(this.animationIndex, AnimationPosition.START);
    },
    jumpToAnimationEnd: function() {
      this.clearAndDrawScene(this.animationIndex, AnimationPosition.END);
    },
    stepForward: function() {
      if (this.animationIndex < this.animations.length - 1) {
        this.clearAndDrawScene(this.animationIndex + 1, AnimationPosition.START);
      } else {
        this.clearAndDrawScene(this.animationIndex, AnimationPosition.END);
      }
    },
    stepBackward: function() {
      if (this.animationIndex > 0) {
        this.clearAndDrawScene(this.animationIndex - 1, AnimationPosition.START);
      } else {
        this.clearAndDrawScene(this.animationIndex, AnimationPosition.START);
      }
    },
    onAnimationStep: function(elapsedSeconds) {
      this.animationOffset = elapsedSeconds;
    },
    handleWidthChange(width, mobjectData) {
      mobjectData.style.strokeWidth = width;
      if (
        (mobjectData.isAtStart && this.animationOffset === 0) ||
        (!mobjectData.isAtStart && this.animationOffset === 1)
      ) {
        mobjectData.mobject.linewidth = width / 100;
        this.scene.update();
      } else {
        this.clearAndDrawScene(this.animationIndex, mobjectData.isAtStart ? AnimationPosition.START : AnimationPosition.END);
      }
    },
    handleClassChange(className, mobjectData) {
      mobjectData.className = className;
      if (
        (mobjectData.isAtStart && this.animationOffset === 0) ||
        (!mobjectData.isAtStart && this.animationOffset === 1)
      ) {
        // redraw mobject
        this.scene.remove(mobjectData.mobject);
        let c = new Manim[mobjectData.className]();
        c.translateMobject(mobjectData.position);
        c.applyStyle(mobjectData.style);
        mobjectData.mobject = c;
        this.scene.add(c);
        this.scene.update();
      } else {
        this.clearAndDrawScene(this.animationIndex, mobjectData.isAtStart ? AnimationPosition.START : AnimationPosition.END);
      }
    },
    handlePickerSave(attr, color, mobjectData) {
      let hexa = color.toHEXA();
      mobjectData.style[attr + 'Color'] = hexa.toString();
    },
    handlePickerChange(attr, color, mobjectData) {
      if (
        !(mobjectData.isAtStart && this.animationOffset === 0) ||
         (!mobjectData.isAtStart && this.animationOffset === 1)
      ) {
        this.clearAndDrawScene(this.animationIndex, mobjectData.isAtStart ? AnimationPosition.START : AnimationPosition.END);
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
      if (
        (mobjectData.isAtStart && this.animationOffset === 0) ||
        (!mobjectData.isAtStart && this.animationOffset === 1)
      ) {
        mobjectData.mobject.moveTo(position);
        this.scene.update();
      } else {
        this.clearAndDrawScene(this.animationIndex, mobjectData.isAtStart ? AnimationPosition.START : AnimationPosition.END);
      }
    },
    handleNewAnimation() {
      this.animations.push({
        className: "Wait",
        description: "Hold a still frame",
        durationSeconds: 1,
        args: [],
        argDescriptions: [],
        startMobjects: ["mobject1"],
        endMobjects: ["mobject1"],
        mobjects: {
          mobject1: {
            className: "Square",
            params: {},
            position: [1, 0],
            style: {
              strokeColor: "#ffffffff",
              fillColor: "#00000000",
              strokeWidth: 4,
            },
            mobject: null,
            isAtStart: true,
          },
        }
      });
      this.animationIndex = this.animations.length - 1;
      this.animationIndex = 0;
      this.clearAndDrawScene(this.animationIndex, AnimationPosition.START);
      /* FIX clearAndDrawScene(index, location) */
    }
  },
  watch: {
    animations: function() {
      // eslint-disable-next-line
      console.log(this.animations);
    }
  }
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
