<template>
  <div class="d-flex justify-center align-top mt-7">
    <div v-if="sceneLoaded">
      <v-expansion-panels id="info-panels" class="mr-4" accordion>
        <v-expansion-panel>
        <v-expansion-panel-header>Animation</v-expansion-panel-header>
        <v-expansion-panel-content>
          <AnimationPanel
            v-bind:animation-data="currentAnimation"
            v-bind:mobject-data="mobjects"
            v-bind:mobject-classes="mobjectChoices"
            v-bind:scene="scene"
            v-bind:animation-offset="animationOffset"
            v-on:jump-to-start="jumpToAnimationStart"
            v-on:jump-to-end="jumpToAnimationEnd"
            v-on:pause="pause"
            v-on:play="(e)=>play(e, /*currentOnly=*/true)"
            v-on:replay="(e)=>replay(e, /*currentOnly=*/true)"
          />
        </v-expansion-panel-content>
        </v-expansion-panel>
        <v-expansion-panel>
        <v-expansion-panel-header>Mobjects</v-expansion-panel-header>
        <v-expansion-panel-content>
          <v-divider/>
          <div
            v-for="(mob, i) in mobjects"
            v-bind:key="i"
          >
            <MobjectPanel
              v-bind:mobject-classes="mobjectChoices"
              v-bind:mobject-data="mob"
              v-bind:scene="scene"
              v-on:mobject-update="handleMobjectUpdate"
            />
            <v-divider class="my-6"/>
          </div>
        </v-expansion-panel-content>
        </v-expansion-panel>
      </v-expansion-panels>
    </div>
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
import * as _ from 'lodash'
import * as Manim from '../manim.js';
import AnimationPanel from './AnimationPanel.vue'
import MobjectPanel from './MobjectPanel.vue'
import Timeline from './Timeline.vue'
import VideoControls from './VideoControls.vue'
import { AnimationPosition } from '../constants.js'

export default {
  name: 'MobjectLab',
  components: {
    Timeline,
    VideoControls,
    AnimationPanel,
    MobjectPanel,
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
        diff: [null, "mobject1", "mobject2"],
      }],
      currentMobjects: [],
      mobjects: [
        {
          name: "mobject1",
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
        {
          name: "mobject2",
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
      ],
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
        let name = this.currentAnimation.args[0];
        let data = _.cloneDeep(_.find(this.mobjects, (o) => {return o.name === name}));
        let s = new Manim[data.className]();
        s.translateMobject(data.position);
        s.applyStyle(data.style);
        data.mobject = s;
        this.currentMobjects.push(data);
        this.clearAndDrawScene();
        this.sceneLoaded = true;
      });
    });
  },
  methods: {
    clearAndDrawScene: function() {
      if (this.animationOffset !== 0 && this.animationOffset !== 1) {
        this.scene.clearAnimation();
      }
      this.scene.clear();

      for (let data of this.currentMobjects) {
        let mob = new Manim[data.className]();
        mob.translateMobject(data.position);
        mob.applyStyle(data.style);
        data.mobject = mob;
        this.scene.add(mob);
      }
      this.scene.update();
    },
    pause: function() {
      this.scene.pause();
    },
    buildCurrentAnimation: function() {
      let args = [];
      for (let key of this.currentAnimation.args) {
        let data = _.find(this.currentMobjects, (o) => {return o.name === key});
        if (data === undefined) {
          data = _.cloneDeep(_.find(this.mobjects, (o) => {return o.name === key}));
          let s = new Manim[data.className]();
          s.translateMobject(data.position);
          s.applyStyle(data.style);
          data.mobject = s;
          this.currentMobjects.push(data);
        }
        args.push(data.mobject);
      }
      return new Manim[this.currentAnimation.className](...args);
    },
    chainNextAnimation: function() {
      if (this.animationIndex === this.animations.length - 1) {
        return;
      }
      this.animationIndex++;
      this.animationOffset = 0;
      this.clearAndDrawScene();
      this.scene.playAnimation(
        this.buildCurrentAnimation(),
        /*onStep=*/this.onAnimationStep,
        this.chainNextAnimation,
      );
    },
    applyAnimationDiff(reverse=false) {
      this.applyDiff(this.currentAnimation.diff, reverse);
    },
    play: function(e, currentOnly=true) {
      if (this.animationOffset !== 0 && this.animationOffset !== 1) {
        this.scene.onNextAnimation = (currentOnly
            ? this.applyAnimationDiff
            : this.chainNextAnimation);
        this.scene.play()
        return;
      } else if (this.animationOffset === 1) {
        this.jumpToAnimationStart();
        this.clearAndDrawScene();
      }
      this.scene.playAnimation(
        this.buildCurrentAnimation(),
        /*onStep=*/this.onAnimationStep,
        /*onNextAnimation=*/currentOnly ? this.applyAnimationDiff : this.chainNextAnimation,
        /*onNextAnimation=*/()=>{
          this.applyAnimationDiff();
          if (currentOnly) {
            this.chainNextAnimation();
          }
        },
      );
    },
    replay: function(e, currentOnly=true) {
      if (currentOnly) {
        this.jumpToAnimationStart();
      } else {
        // eslint-disable-next-line
        console.log('didn\'t implement global replay');
      }
      this.play(e, currentOnly);
    },
    applyDiff: function(diff, reverse=false) {
      let diffCopy = _.cloneDeep(diff);
      if (reverse) {
        diffCopy[1] = diff[2];
        diffCopy[2] = diff[1];
      }
      let attr = diff[0]
      if (attr === null) {
        // replace mobject
        let startName = diffCopy[1];
        let endName = diffCopy[2];
        let startIndex = _.findIndex(this.currentMobjects, function(data) {
          return data.name === startName;
        });
        if (startIndex === -1) {
          // eslint-disable-next-line
          console.log('something\'s wrong');
          // eslint-disable-next-line
          console.log(startName);
          // eslint-disable-next-line
          console.log(endName);
        } else {
          // TODO: all animation args other than the end mobjects should be removed
          _.remove(this.currentMobjects, (o) => {
            return o.name === endName;
          });
          let endData = _.find(this.mobjects, (o) => {return o.name === endName});
          this.currentMobjects[startIndex] = endData;
        }
      } else {
        // update property
      }
      this.animationOffset = reverse ? 0 : 1;
    },
    jumpToAnimationStart: function(forceDraw=false) {
      if (this.animationOffset === 0 && forceDraw) {
        if (forceDraw) {
          this.clearAndDrawScene();
        }
        return;
      }
      this.applyDiff(this.currentAnimation.diff, /*reverse=*/true);
      this.clearAndDrawScene();
    },
    jumpToAnimationEnd: function(forceDraw=false) {
      if (this.animationOffset === 1) {
        if (forceDraw) {
          this.clearAndDrawScene();
        } else {
          return;
        }
      }
      this.applyDiff(this.currentAnimation.diff);
      this.clearAndDrawScene();
    },
    stepForward: function() {
      this.jumpToAnimationEnd();
      if (this.animationIndex < this.animations.length - 1) {
        this.animationIndex++;
        this.animationOffset = 0;
      }
      this.clearAndDrawScene();
    },
    // THIS DOESN'T WORK AFTER PLAYING
    stepBackward: function() {
      this.jumpToAnimationStart();
      if (this.animationIndex > 0) {
        this.animationIndex--;
        this.animationOffset = 1;
        this.jumpToAnimationStart();
      }
      this.clearAndDrawScene();
    },
    onAnimationStep: function(elapsedSeconds) {
      this.animationOffset = elapsedSeconds;
    },
    // MOVE THIS INTO MOBJECTPANEL
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
    jumpToMobjectLocation(mobjectData) {
      let mobjectIsAtStart;
      let diff = this.currentAnimation.diff;
      let attr = diff[0];
      if (attr === null) {
        mobjectIsAtStart = (diff[1] === mobjectData.name);
      } else {
        mobjectIsAtStart = (_.split(diff[1], '.')[0] === mobjectData.name);
      }
      if (mobjectIsAtStart) {
        this.jumpToAnimationStart(/*forceDraw=*/true);
      } else {
        this.jumpToAnimationEnd(/*forceDraw=*/true);
      }
    },
    handleMobjectUpdate(data) {
      let index = _.findIndex(this.mobjects, (o) => {return o.name === data.name});
      this.$set(this.mobjects, index, data);
      index = _.findIndex(this.currentMobjects, (o) => {return o.name === data.name});
      if (index !== -1) {
        this.currentMobjects[index] = data;
      }
      this.jumpToMobjectLocation(data);
    },
    handleNewAnimation() {
      let lastAnimation = this.animations[this.animations.length - 1];
      this.animations.push({
        className: "Wait",
        description: "Hold a still frame",
        durationSeconds: 1,
        args: [],
        argDescriptions: [],
        startMobjects: _.cloneDeep(lastAnimation.endMobjects),
        endMobjects: _.cloneDeep(lastAnimation.endMobjects),
      });
      this.animationIndex = 0;
      this.clearAndDrawScene(this.animations.length - 1, AnimationPosition.START);
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
