<template>
  <div class="d-flex justify-center align-top mt-7 mb-5">
    <div v-if="sceneLoaded">
      <v-expansion-panels
        id="info-panels"
        class="mr-4"
        v-model="expandedPanel"
        multiple
      >
        <v-expansion-panel>
        <v-expansion-panel-header>Animation</v-expansion-panel-header>
        <v-expansion-panel-content>
          <SetupPanel v-bind:setup="currentSetup" v-bind:mobjects="mobjects"/>
          <AnimationPanel
            v-bind:animation-data="currentAnimation"
            v-bind:mobject-data="mobjects"
            v-bind:scene="scene"
            v-bind:animation-offset="animationOffset"
            v-on:jump-to-start="jumpToAnimationStart"
            v-on:jump-to-end="jumpToAnimationEnd"
            v-on:pause="pause"
            v-on:play="(e)=>play(e)"
            v-on:replay="(e)=>replay(e)"
            v-on:arg-change="handleArgChange"
          />
        </v-expansion-panel-content>
        </v-expansion-panel>
        <v-expansion-panel>
        <v-expansion-panel-header>Mobjects</v-expansion-panel-header>
        <v-expansion-panel-content>
          <v-expansion-panels class="d-flex flex-column" multiple>
            <v-expansion-panel v-for="(data, name) in mobjects" v-bind:key="name">
              <v-expansion-panel-header>
                {{ name }}
                <span class="text--secondary ml-2">
                  {{ !animating && scene.contains(data.mobject)
                     ? "(in scene)" : "" }}
                </span>
              </v-expansion-panel-header>
              <v-expansion-panel-content>
                <MobjectPanel
                  v-bind:mobject-classes="mobjectChoices"
                  v-bind:mobject-name="name"
                  v-bind:mobject-data="data"
                  v-bind:disabled="animating || !scene.contains(data.mobject)"
                  v-bind:scene="scene"
                  v-on:mobject-update="(mobjectName, attr, val)=>handleMobjectUpdate(mobjectName, attr, val)"
                />
              </v-expansion-panel-content>
            </v-expansion-panel>
          </v-expansion-panels>
          <div class="d-flex justify-space-around mt-4">
            <v-btn fab v-on:click="newMobject">
              <v-icon color="black" x-large>mdi-plus</v-icon>
            </v-btn>
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
          v-on:play="e=>play(e, /*singleAnimationOnly=*/false)"
          v-on:replay="e=>replay(e, /*singleAnimationOnly=*/false)"
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
import * as Manim from '../manim.js'
import AnimationPanel from './AnimationPanel.vue'
import MobjectPanel from './MobjectPanel.vue'
import SetupPanel from './SetupPanel.vue'
import Timeline from './Timeline.vue'
import VideoControls from './VideoControls.vue'

export default {
  name: 'MobjectLab',
  components: {
    AnimationPanel,
    MobjectPanel,
    SetupPanel,
    Timeline,
    VideoControls,
  },
  computed: {
    currentAnimation() {
      return this.animations[this.animationIndex];
    },
    currentSetup() {
      return this.setupDiffs[this.animationIndex];
    },
    animating() {
      return this.animationOffset !== 0 && this.animationOffset !== 1;
    },
  },
  data() {
    return {
      expandedPanel: [0],
      playingSingleAnimation: null,
      scene: null,
      sceneLoaded: false,
      mobjectChoices: ["Circle", "Square"],
      animationIndex: 0,
      animationOffset: 0,
      animations: [{
        className: "ReplacementTransform",
        shortName: "RTransform",
        description: "Morph one Mobject into another",
        args: ["mobject1", "mobject2"],
        argDescriptions: ["Start Mobject", "End Mobject"],
        durationSeconds: 1,
        animation: null,
      }],
      setupDiffs: [
        // diffs are of the form:
        // {
        //   'add':    [mobject11, ...],
        //   'remove': [mobject21, ...],
        //   'modify': [[mobject31, forwardFunc, backwardFunc], ...],
        // }
        {'add': ['mobject1']},
      ],
      mobjects: {},
      initialMobjects: {
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
        },
      },
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
        // TODO: method to add mobjects for initial scene
        for (let mobjectName of Object.keys(this.initialMobjects)) {
          let data = _.cloneDeep(this.initialMobjects[mobjectName]);
          this.setMobjectField(data);
          this.mobjects[mobjectName] = data;
        }
        this.scene.add(this.mobjects["mobject1"].mobject);
        this.scene.update();
        this.currentAnimation.animation = this.buildCurrentAnimation();
        this.sceneLoaded = true;
      });
    });
  },
  methods: {
    setMobjectField: function(mobjectData) {
      let s = new Manim[mobjectData.className]();
      s.translateMobject(mobjectData.position);
      s.applyStyle(mobjectData.style);
      mobjectData.mobject = s;
      return s;
    },
    pause: function() {
      this.scene.pause();
    },
    buildCurrentAnimation: function() {
      let args = [];
      for (let mobjectName of this.currentAnimation.args) {
        let data = this.mobjects[mobjectName];
        // eslint-disable-next-line
        console.assert(data !== undefined, {name: mobjectName});
        // eslint-disable-next-line
        console.assert(data.mobject !== null, {name: mobjectName, mobjects: this.mobjects});
        args.push(data.mobject);
      }
      return new Manim[this.currentAnimation.className](...args);
    },
    chainNextAnimation: function() {
      if (this.animationIndex === this.animations.length - 1) {
        return;
      }
      this.animationIndex += 1;
      this.animationOffset = 0;
      this.currentAnimation.animation = this.buildCurrentAnimation();
      this.scene.playAnimation(
        this.currentAnimation.animation,
        /*onStep=*/this.onAnimationStep,
        this.chainNextAnimation,
      );
    },
    replay: function(e, singleAnimationOnly=true) {
      if (singleAnimationOnly) {
        this.jumpToAnimationStart();
      } else {
        while (this.animationIndex > 0 || this.animationOffset > 0) {
          this.stepBackward();
        }
      }
      this.play(e, singleAnimationOnly);
    },
    play: function(e, singleAnimationOnly=true) {
      this.playingSingleAnimation = singleAnimationOnly;
      if (this.animating) {
        this.scene.play()
        return;
      }
      if (this.animationOffset === 1) {
        // eslint-disable-next-line
        console.assert(
          singleAnimationOnly === false &&
          this.animationIndex !== this.animations.length - 1
        );
        this.stepForward();
      }
      this.currentAnimation.animation = this.buildCurrentAnimation();
      this.scene.playAnimation(
        this.currentAnimation.animation,
        /*onStep=*/this.onAnimationStep,
        /*onAnimationFinished=*/() => {
          this.applyDiff(this.currentAnimation.animation.getDiff(...this.currentAnimation.args));
          if (!this.playingSingleAnimation) {
            this.chainNextAnimation();
          }
        },
      );
    },
    /*  Updates the mobjects in this.scene according to the diff. Diffs are of
     *  the form:
     *  {
     *    'add':    [mobject11, ...],
     *    'remove': [mobject21, ...],
     *    'modify': [[mobject31, forwardFunc, backwardFunc], ...],
     *  }
     */
    applyDiff: function(diff, reverse=false) {
      if (_.isEmpty(diff)) {
        return;
      }
      let diffCopy = _.cloneDeep(diff);
      diffCopy['add'] = diff['add'] || [];
      diffCopy['remove'] = diff['remove'] || [];
      diffCopy['modify'] = diff['modify'] || [];
      if (reverse) {
        diffCopy['add'] = diff['remove'] || [];
        diffCopy['remove'] = diff['add'] || [];
        diffCopy['modify'].forEach((newList, index) => {
          let oldList = diff['modify'][index];
          newList[1] = oldList[2];
          newList[2] = oldList[1];
        });
      }
      for (let mobjectName of diffCopy['add']) {
        let mobjectData = this.mobjects[mobjectName];
        this.setMobjectField(mobjectData);
        this.scene.add(mobjectData.mobject);
      }
      for (let mobjectName of diffCopy['remove']) {
        let mobjectData = this.mobjects[mobjectName];
        this.scene.remove(mobjectData.mobject);
        this.setMobjectField(mobjectData);
      }
      for (let [mobjectName, modifyFunc] of diffCopy['modify']) {
        let mobjectData = this.mobjects[mobjectName];
        // eslint-disable-next-line
        console.assert(mobjectData.mobject &&
          this.scene.contains(mobjectData.mobject));
        modifyFunc(mobjectData.mobject);
      }
      this.scene.update();
      this.animationOffset = reverse ? 0 : 1;
    },
    jumpToAnimationStart: function() {
      if (this.animationOffset === 0) {
        return;
      } else if (this.animationOffset < 1) {
        this.scene.clearAnimation();
        // Any changes to the animated mobject must be reverted.
        let diff = this.currentAnimation.animation.getDiff(...this.currentAnimation.args);
        if (diff !== null) {
          let mobjectToRevertName;
          if (diff[0] === null) {
            // This diff adds or removes mobjects.
            mobjectToRevertName = diff[1];
          } else {
            // This diff changes a mobject's attribute.
            // eslint-disable-next-line
            console.assert(false, "not yet implemented for attribute diffs");
          }
          let mobjectToRevertData = this.mobjects[mobjectToRevertName];
          this.scene.remove(mobjectToRevertData.mobject);
          this.setMobjectField(mobjectToRevertData);
          this.scene.add(mobjectToRevertData.mobject);
          this.scene.update();
        }
      } else {
        this.applyDiff(this.currentAnimation.animation.getDiff(...this.currentAnimation.args), /*reverse=*/true);
      }
      this.animationOffset = 0;
    },
    jumpToAnimationEnd: function() {
      if (this.animationOffset === 1) {
        return;
      } else {
        this.jumpToAnimationStart();
      }
      this.applyDiff(this.currentAnimation.animation.getDiff(...this.currentAnimation.args));
    },
    stepForward: function() {
      this.jumpToAnimationEnd();
      if (this.animationIndex < this.animations.length - 1) {
        this.animationIndex++;
        this.animationOffset = 0;
        this.currentAnimation.animation = this.buildCurrentAnimation();
      }
    },
    stepBackward: function() {
      if (this.animationOffset !== 0) {
        this.jumpToAnimationStart();
      } else if (this.animationIndex !== 0) {
        this.animationIndex--;
        this.animationOffset = 1;
        this.currentAnimation.animation = this.buildCurrentAnimation();
        this.jumpToAnimationStart();
      }
    },
    onAnimationStep: function(elapsedSeconds) {
      this.animationOffset = elapsedSeconds;
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
    handleMobjectUpdate(mobjectName, attr, val) {
      // how to jump to mobject location? get it from the animation panel?
      // eslint-disable-next-line
      console.assert(
        this.scene.contains(this.mobjects[mobjectName].mobject),
        "modified mobject that isn't in the scene",
      );
      this.scene.remove(this.mobjects[mobjectName].mobject);
      let split = attr.split('.');
      if (split[0] === "style") {
        this.$set(this.mobjects[mobjectName].style, split[1], val);
      } else {
        this.$set(this.mobjects[mobjectName], attr, val);
      }
      this.setMobjectField(this.mobjects[mobjectName]);
      this.scene.add(this.mobjects[mobjectName].mobject);
      this.scene.update();
    },
    handleNewAnimation() {
      while (this.animationIndex < this.animations.length - 1 || this.animationOffset < 1) {
        this.stepForward();
      }
      this.animations.push({
        className: "Wait",
        description: "Hold a still frame",
        durationSeconds: 1,
        args: [],
        argDescriptions: [],
      });
      this.setupDiffs.push({});
      this.stepForward();
    },
    handleArgChange(argNum, arg) {
      this.currentAnimation.args[argNum] = arg;
    },
    newMobject() {
      let newMobjectData = {
        className: "Circle",
        params: {},
        position: [-1, 0],
        style: {
          strokeColor: "#fc6255ff",
          fillColor: "#00000000",
          strokeWidth: 4,
        },
        mobject: null,
      };
      this.setMobjectField(newMobjectData);
      this.$set(
        this.mobjects,
        'mobject' + (Object.keys(this.mobjects).length + 1),
        newMobjectData,
      );
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
#info-panels {
  width: 410px;
}
#spinner-container {
  height: 575px;
  width: 410px;
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
