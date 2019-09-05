<template>
  <div class="d-flex justify-center align-top mt-7">
    <template v-if="sceneLoaded">
    <v-expansion-panels id="info-panels" class="mr-4">
    <v-expansion-panel class="info-panel">
    <v-expansion-panel-header>Animation</v-expansion-panel-header>
    <v-expansion-panel-content>
      <AnimationPanel
        v-bind:animation-data="currentAnimation"
        v-bind:mobject-classes="mobjectChoices"
        v-bind:scene="scene"
        v-bind:animation-offset="animationOffset"
        v-on:class-change="handleClassChange"
        v-on:position-change="handlePositionChange"
        v-on:picker-change="handlePickerChange"
        v-on:picker-hide="handlePickerHide"
        v-on:picker-save="handlePickerSave"
        v-on:width-change="handleWidthChange"
        v-on:jump-to-start="jumpToAnimationStart"
        v-on:jump-to-end="jumpToAnimationEnd"
        v-on:pause="pause"
        v-on:play="(e)=>play(e, /*currentOnly=*/true)"
        v-on:replay="(e)=>replay(e, /*currentOnly=*/true)"
      />
    </v-expansion-panel-content>
    </v-expansion-panel>
    </v-expansion-panels>
    </template>
    <v-card v-else
      class="d-flex justify-center align-center mr-4"
      id="spinner-container"
    >
      <v-progress-circular indeterminate/>
    </v-card>
    <div id="visualization-placeholder">
      <div id="visualization">
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
          v-on:play="play($event, /*currentOnly=*/false)"
          v-on:replay="replay"
          v-on:pause="pause"
          v-on:step-backward="stepBackward"
          v-on:step-forward="stepForward"
          v-bind:scene="scene"
          v-bind:finished="animationIndex === animations.length - 1 && animationOffset === 1"
        />
      </div>
    </div>
  </div>
</template>

<script>
import * as _ from 'lodash';
import * as Manim from '../manim.js';
import AnimationPanel from './AnimationPanel.vue'
import Timeline from './Timeline.vue'
import VideoControls from './VideoControls.vue'
import { AnimationPosition } from '../constants.js';

export default {
  name: 'MobjectLab',
  components: {
    Timeline,
    VideoControls,
    AnimationPanel,
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
    pause: function() {
      this.scene.pause();
    },
    buildCurrentAnimation() {
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
      return new Manim[this.currentAnimation.className](...args);
    },
    chainNextAnimation() {
      if (this.animationIndex === this.animations.length - 1) {
        return;
      }
      this.clearAndDrawScene(this.animationIndex + 1, AnimationPosition.START);
      this.scene.playAnimation(
        this.buildCurrentAnimation(),
        /*onStep=*/this.onAnimationStep,
        this.chainNextAnimation,
      );
    },
    play: function(e, currentOnly=true) {
      if (this.animationOffset !== 0 && this.animationOffset !== 1) {
        this.scene.onNextAnimation = (currentOnly
            ? null
            : this.chainNextAnimation);
        this.scene.play()
        return;
      } else if (this.animationOffset === 1) {
        this.clearAndDrawScene(
          this.animationIndex + (currentOnly ? 0 : 1),
          AnimationPosition.START,
        );
      }
      this.scene.playAnimation(
        this.buildCurrentAnimation(),
        /*onStep=*/this.onAnimationStep,
        /*onNextAnimation=*/currentOnly ? null: this.chainNextAnimation,
      );
    },
    replay: function(e, currentOnly=true) {
      this.clearAndDrawScene(
        currentOnly ? this.animationIndex : 0,
        AnimationPosition.START,
      );
      this.play(e, currentOnly);
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
      if (this.animationOffset != 0) {
        this.jumpToAnimationStart();
        return;
      }
      if (this.animationIndex > 0) {
        this.clearAndDrawScene(this.animationIndex - 1, AnimationPosition.START);
      } else {
        this.jumpToAnimationStart();
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
      let newAnimationMobjects = {};
      let lastAnimation = this.animations[this.animations.length - 1];
      for (let key of lastAnimation.endMobjects) {
        newAnimationMobjects[key] = _.cloneDeep(lastAnimation.mobjects[key]);
      }
      this.animations.push({
        className: "Wait",
        description: "Hold a still frame",
        durationSeconds: 1,
        args: [],
        argDescriptions: [],
        startMobjects: _.cloneDeep(lastAnimation.endMobjects),
        endMobjects: _.cloneDeep(lastAnimation.endMobjects),
        mobjects: newAnimationMobjects,
      });
      this.animationIndex = 0;
      this.clearAndDrawScene(this.animations.length - 1, AnimationPosition.START);
      /* FIX clearAndDrawScene(index, location) */
    }
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
#info-panels {
  width: 400px;
}
#spinner-container {
  height: 575px;
  width: 400px;
}
#visualization-placeholder {
  width: 640px;
  height: 575px;
}
#visualization {
  position: fixed;
}
.picker-offset {
  position: absolute;
  left: 98px;
}
.info-panel {
  height: fit-content;
}
</style>
