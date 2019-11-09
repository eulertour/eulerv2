<template>
  <div class="d-flex justify-center align-top mt-7 mb-5">
    <div
      class="left-side d-flex flex-column justify-start align-center mr-4"
      v-bind:class="{ 'code-width': displayCode, 'panel-width': !displayCode }"
    >
      <v-toolbar width="100%" max-height="64px" class="mb-2">
        <v-toolbar-title>example_scenes.py</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn fab text v-on:click="toggleCode">
          <v-icon class="headline black--text">
            {{"mdi-" + (displayCode ? "view-agenda" : "code-braces")}}
          </v-icon>
        </v-btn>
      </v-toolbar>
      <div v-if="sceneLoaded && !displayCode" class="expansion-panel-container">
        <v-expansion-panels
          v-model="expandedPanel"
          multiple
        >
          <v-expansion-panel>
            <v-expansion-panel-header>
              <span v-bind:style="sceneHeaderStyle">Scene</span>
            </v-expansion-panel-header>
            <v-expansion-panel-content>
              <SetupPanel
                v-bind:setup="currentSceneDiff"
                v-bind:animationData="currentAnimation"
                v-bind:mobjects="mobjects"
                v-bind:scene="scene"
                v-bind:animating="animating"
                v-on:update-setup="(action, newSelection)=>updateSetup(action, newSelection)"
              />
            </v-expansion-panel-content>
          </v-expansion-panel>
          <v-expansion-panel>
            <v-expansion-panel-header>
              <span v-bind:style="animationHeaderStyle">Animation</span>
            </v-expansion-panel-header>
            <v-expansion-panel-content>
              <AnimationPanel
                v-bind:animation-data="currentAnimation"
                v-bind:mobject-data="mobjects"
                v-bind:scene="scene"
                v-bind:animation-offset="animationOffset"
                v-bind:animating="animating"
                v-bind:setup="currentSceneDiff"
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
      <CodeMirror
        v-else-if="sceneLoaded && displayCode"
        v-bind:code="code"
        v-on:update-code="updateCode"
      />
      <v-card v-else
        class="d-flex justify-center align-center"
        height="500px"
        width="100%"
      >
        <v-progress-circular indeterminate/>
      </v-card>
      <div class="d-flex justify-space-between mt-4" style="width:100%">
        <div style="width:70%">
          <v-select
            v-bind:items="sceneChoices"
            v-model="chosenScene"
            label="Scene"
            solo
          ></v-select>
        </div>
        <v-btn large v-if="displayCode" v-on:click="runManim">
          <v-icon class="headline black--text mr-2">mdi-cube-outline</v-icon>
          <span class="title">Render</span>
        </v-btn>
      </div>
      <DebugPanel v-bind:visible="debug" v-bind:mobjects="mobjects"/>
    </div>
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
    <div class="corner-button-container">
      <v-btn class="mr-4" v-on:click="()=>{debug = !debug}" fab large>
        <v-icon large>mdi-bug</v-icon>
      </v-btn>
      <v-dialog v-model="releaseNotesDialog" width="500px">
        <template v-slot:activator="{ on }">
          <v-btn v-on="on" fab large>
            <v-icon large>mdi-information</v-icon>
          </v-btn>
        </template>
        <v-card>
          <v-card-title class="headline grey lighten-2 mb-3" primary-title>
            Release Notes
          </v-card-title>
          <v-card-text class="title">
            <span v-html="releaseNotes"></span>
          </v-card-text>
          <v-divider></v-divider>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="primary" text v-on:click="dialog = false">
              Got it
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>
  </div>
</template>

<script>
import * as _ from 'lodash'
import * as consts from '../constants.js'
import * as Manim from '../manim.js'
import AnimationPanel from './AnimationPanel.vue'
import MobjectPanel from './MobjectPanel.vue'
import SetupPanel from './SetupPanel.vue'
import Timeline from './Timeline.vue'
import VideoControls from './VideoControls.vue'
import CodeMirror from './CodeMirror.vue'
import chroma from 'chroma-js'
import DebugPanel from './DebugPanel.vue'

export default {
  name: 'MobjectLab',
  components: {
    AnimationPanel,
    MobjectPanel,
    SetupPanel,
    Timeline,
    VideoControls,
    CodeMirror,
    DebugPanel,
  },
  computed: {
    currentAnimation() {
      return this.animations[this.animationIndex];
    },
    currentAnimationDiff() {
      return this.$store.state.animationDiff;
    },
    currentSceneDiff() {
      return this.$store.state.sceneDiff;
    },
    animating() {
      return this.animationOffset !== 0 && this.animationOffset !== 1;
    },
    sceneHeaderStyle() {
      let ret = {};
      if (!this.$store.getters.sceneIsValid) {
        ret['color'] = "red";
      }
      return ret;
    },
    animationHeaderStyle() {
      let ret = {};
      if (this.$store.getters.sceneIsValid
          && !this.$store.getters.animationIsValid) {
        ret['color'] = "red";
      }
      return ret;
    }
  },
  data() {
    return {
      releaseNotes: consts.RELEASE_NOTES,
      releaseNotesDialog: false,
      debug: true,
      code: consts.EXAMPLE_CODE,
      displayCode: true,
      expandedPanel: [1],
      playingSingleAnimation: null,
      sceneChoices: [],
      chosenScene: "",
      scene: null,
      sceneLoaded: false,
      mobjectChoices: ["Circle", "Square", "Triangle", "Pentagon", "Star", "Hexagon", "StarOfDavid", "Octagon"],
      animationIndex: 0,
      animationOffset: 0,
      animations: [{
        className: "ReplacementTransform",
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
        mobject3: {
          className: "Square",
          params: {},
          position: [1, 0],
          style: {
            strokeColor: "#00ff00ff",
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
      window.pyodide.loadPackage("manimlib").then(() => {
        window.pyodide.runPython("import manimlib");
        window.pyodide.runPython("import numpy");
        window.manimlib = window.pyodide.pyimport("manimlib");
        for (let mobjectName of Object.keys(this.initialMobjects)) {
          let data = _.cloneDeep(this.initialMobjects[mobjectName]);
          this.setMobjectField(data);
          this.$set(this.mobjects, mobjectName, data);
        }
        this.currentAnimation.animation = this.buildCurrentAnimation();
        this.$store.commit('updateDiffs', {
          sceneDiff: this.setupDiffs[0],
          animationDiff: Manim[this.currentAnimation.className].getDiff(
            ...this.currentAnimation.args
          ),
        });
        this.applyDiff(
          this.currentSceneDiff,
          /*reverse=*/false,
          /*moveCursor=*/false,
        );
        this.refreshSceneChoices();
        this.sceneLoaded = true;
      });
    });
  },
  methods: {
    runManim: function() {
      let scene = window.manimlib.get_scene(this.code, ["GroupExample"]);
      scene.render();

      let mobjectIdsToNames = {};
      let mobjectIds = Object.keys(scene.mobject_dict);
      for (let i = 0; i < mobjectIds.length; i++) {
        let id = mobjectIds[i];
        let mobjectData = scene.mobject_dict[id];
        if (!["Group", "Mobject"].includes(mobjectData.className)) {
          mobjectIdsToNames[id] = 'mobject' + (i + 1);
        } else {
          mobjectIdsToNames[id] = 'group' + (i + 1);
        }
      }

      // Assign human-readble names to scene list
      scene.scene_list = scene.scene_list.map(
        idList => idList.map(
          id => mobjectIdsToNames[id]
        )
      );

      //  Create animation list with human-readable names
      let newAnimationList = _.cloneDeep(scene.render_list);
      for (let i = 0; i < scene.render_list.length; i++) {
        newAnimationList[i].args = scene.render_list[i].args.map(
          id => mobjectIdsToNames[id]
        );
      }

      let updateSceneWithDiff = (scene, diff) => {
        scene = _.concat(scene, diff['add'] || []);
        scene = _.difference(scene, diff['remove'] || []);
        return scene;
      };

      let getDiffFromTwoScenes = (beforeScene, afterScene) => {
        let mobsToAdd = _.difference(afterScene, beforeScene);
        let mobsToRemove = _.difference(beforeScene, afterScene);
        let diff = {};
        if (mobsToAdd.length > 0) {
          diff['add'] = mobsToAdd.map(id => mobjectIdsToNames[id]);
        }
        if (mobsToRemove.length > 0) {
          diff['remove'] = mobsToRemove.map(id => mobjectIdsToNames[id]);
        }
        return diff;
      };

      let newSceneDiffs = [];
      let sceneAfterLastAnimation = []
      for (let i = 0; i < scene.scene_list.length; i++) {
        newSceneDiffs.push(getDiffFromTwoScenes(
          sceneAfterLastAnimation,
          scene.scene_list[i],
        ));

        sceneAfterLastAnimation = updateSceneWithDiff(
          scene.scene_list[i],
          //get the animation diff,
          Manim[scene.render_list[i].className]
            .getDiff(...scene.render_list[i].args.map(id => mobjectIdsToNames[id])),
        );
      }

      let newMobjects = {};
      for (let id of Object.keys(scene.mobject_dict)) {
        let mobjectData = scene.mobject_dict[id];
        if (!["Group", "Mobject"].includes(mobjectData.className)) {
          let strokeColor = mobjectData.style.strokeColor;
          let strokeOpacity = mobjectData.style.strokeOpacity;
          mobjectData.style.strokeColor = chroma(strokeColor).alpha(strokeOpacity).hex();
          delete mobjectData.style.strokeOpacity;

          let fillColor = mobjectData.style.fillColor;
          let fillOpacity = mobjectData.style.fillOpacity;
          mobjectData.style.fillColor = chroma(fillColor).alpha(fillOpacity).hex();
          delete mobjectData.style.fillOpacity;
        } else {
          let newSumbojects = mobjectData.submobjects.map(
            id => mobjectIdsToNames[id]
          );
          mobjectData.submobjects = newSumbojects;
        }
        newMobjects[mobjectIdsToNames[id]] = mobjectData;
      }

      this.mobjects = newMobjects;
      this.animations = newAnimationList;
      this.setupDiffs = newSceneDiffs;
      this.animationIndex = 0;
      this.animationOffset = 0;
      this.scene.clear();
      this.scene.clearAnimation();

      // Initialize mobjects
      let groupNames = [];
      for (let mobjectName of Object.keys(newMobjects)) {
        let data = newMobjects[mobjectName];
        if (!["Group", "Mobject"].includes(data.className)) {
          this.setMobjectField(data);
        } else {
          groupNames.push(mobjectName);
        }
      }

      // Initialize groups
      for (let groupName of groupNames) {
        let data = newMobjects[groupName];
        this.setMobjectField(data);
      }

      this.currentAnimation.animation = this.buildCurrentAnimation();
      this.scene.update();
      this.$store.commit('updateDiffs', {
        priorScene: [],
        sceneDiff: this.setupDiffs[0],
        animationDiff: Manim[this.currentAnimation.className].getDiff(
          ...this.currentAnimation.args
        ),
      });
      this.applyDiff(
        this.currentSceneDiff,
        /*reverse=*/false,
        /*moveCursor=*/false,
      );
      // this.play(null, /*singleAnimationOnly=*/false);
    },
    toggleCode() {
      if (this.displayCode) {
        this.displayCode = false;
      } else {
        this.displayCode = true;
      }
    },
    setMobjectField(mobjectData) {
      if (!["Group", "Mobject"].includes(mobjectData.className)) {
        let s = new Manim[mobjectData.className](mobjectData.params);
        s.translateMobject(mobjectData.position);
        s.applyStyle(mobjectData.style);
        mobjectData.mobject = s;
        return s;
      } else {
        let mobs = mobjectData.submobjects.map(
          mobjectName => this.mobjects[mobjectName].mobject
        );
        let g = new Manim["Group"](mobs);
        mobjectData.mobject = g;
      }
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
      this.stepForward();
      if (this.$store.getters.animationIsValid &&
          this.$store.getters.sceneIsValid) {
        this.scene.playAnimation(
          this.currentAnimation.animation,
          /*onStep=*/this.onAnimationStep,
          /*onAnimationFinished=*/() => {
            this.applyDiff(this.currentAnimationDiff);
            this.chainNextAnimation();
          },
        );
      }
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
      if (this.$store.getters.animationIsValid
          && this.$store.getters.sceneIsValid) {
        this.currentAnimation.animation = this.buildCurrentAnimation();
        this.scene.playAnimation(
          this.currentAnimation.animation,
          /*onStep=*/this.onAnimationStep,
          /*onAnimationFinished=*/() => {
            this.applyDiff(this.currentAnimationDiff);
            if (!this.playingSingleAnimation) {
              this.chainNextAnimation();
            }
          },
        );
      }
    },
    /*  Updates the mobjects in this.scene according to the diff. Diffs are of
     *  the form:
     *  {
     *    'add':    [mobject11, ...],
     *    'remove': [mobject21, ...],
     *    'modify': [[mobject31, forwardFunc, backwardFunc], ...],
     *  }
     */
    applyDiff: function(diff, reverse=false, moveCursor=true) {
      if (moveCursor) {
        this.animationOffset = reverse ? 0 : 1;
      }
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
    },
    jumpToAnimationStart: function() {
      if (this.animationOffset === 0) {
        return;
      } else if (this.animationOffset < 1) {
        // eslint-disable-next-line
        console.assert(this.$store.getters.animationIsValid);
        this.scene.clearAnimation();
        if (this.currentAnimation.args.length > 0) {
          let mobjectToRevertName = this.currentAnimation.args[0];
          let mobjectToRevertData = this.mobjects[mobjectToRevertName];
          this.scene.remove(mobjectToRevertData.mobject);
          this.setMobjectField(mobjectToRevertData);
          this.scene.add(mobjectToRevertData.mobject);
          this.scene.update();
        }
      } else {
        if (this.$store.getters.animationIsValid) {
          this.applyDiff(
            this.currentAnimationDiff,
            /*reverse=*/true,
            /*moveCursor=*/true,
          );
        }
      }
      this.animationOffset = 0;
    },
    jumpToAnimationEnd: function() {
      if (this.animationOffset === 1) {
        return;
      } else if (this.animationOffset < 1) {
        this.jumpToAnimationStart();
      }
      if (this.$store.getters.animationIsValid &&
          this.$store.getters.sceneIsValid) {
        this.applyDiff(this.currentAnimationDiff);
      }
    },
    // errorcheck scenediffs
    stepForward: function() {
      if (!this.$store.getters.sceneIsValid || !this.$store.getters.animationIsValid) {
        return;
      }
      this.jumpToAnimationEnd();
      if (this.animationIndex < this.animations.length - 1) {
        this.setupDiffs[this.animationIndex] = this.$store.state.sceneDiff;
        this.$store.commit('stepForward');
        this.animationIndex += 1;
        this.animationOffset = 0;
        this.currentAnimation.animation = this.buildCurrentAnimation();
        this.$store.commit('updateDiffs', {
          sceneDiff: this.setupDiffs[this.animationIndex],
          animationDiff: Manim[this.currentAnimation.className].getDiff(
            ...this.currentAnimation.args
          ),
        });
        if (this.$store.getters.sceneIsValid) {
          this.applyDiff(
            this.currentSceneDiff,
            /*reverse=*/false,
            /*moveCursor=*/false,
          );
        }
      }
    },
    stepBackward: function() {
      if (this.animationOffset !== 0) {
        this.jumpToAnimationStart();
      } else if (this.animationIndex !== 0) {
        this.applyDiff(
          this.currentSceneDiff,
          /*reverse=*/true,
          /*moveCursor=*/false,
        );
        this.setupDiffs[this.animationIndex] = this.$store.state.sceneDiff;
        this.animationIndex -= 1;
        this.animationOffset = 1;
        this.currentAnimation.animation = this.buildCurrentAnimation();
        this.$store.commit('stepBackward', {
          sceneDiff: this.setupDiffs[this.animationIndex],
          animationDiff: Manim[this.currentAnimation.className].getDiff(
            ...this.currentAnimation.args
          ),
        });
        this.$store.commit('updateDiffs', {
          sceneDiff: this.setupDiffs[this.animationIndex],
          animationDiff: Manim[this.currentAnimation.className].getDiff(
            ...this.currentAnimation.args
          ),
        });
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
      while (this.animationIndex < this.animations.length - 1
             || this.animationOffset < 1) {
        if (this.$store.getters.sceneIsValid
          && this.$store.getters.animationIsValid) {
        this.stepForward();
        } else {
          return
        }
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
    handleArgChange(argNum, arg) {
      if (this.animationOffset === 1) {
        this.applyDiff(
          this.currentAnimationDiff,
          /*reverse=*/true,
          /*moveCursor=*/false,
        );
      }
      let newArgs = _.cloneDeep(this.currentAnimation.args);
      newArgs[argNum] = arg;
      this.currentAnimation.args = newArgs;
      this.$store.commit('updateDiffs', {
        animationDiff: Manim[this.currentAnimation.className].getDiff(...newArgs)
      });
      if (this.animationOffset === 1) {
        this.applyDiff(
          this.currentAnimationDiff,
          /*reverse=*/false,
          /*moveCursor=*/false,
        );
      }
    },
    updateSetup(action, newSelection) {
      if (this.animationOffset === 1 && this.$store.getters.animationIsValid) {
        this.applyDiff(
          this.currentAnimationDiff,
          /*reverse=*/true,
          /*moveCursor=*/false,
        );
      }
      this.applyDiff(
        this.currentSceneDiff,
        /*reverse=*/true,
        /*moveCursor=*/false,
      );
      let newDiff = _.cloneDeep(this.currentSceneDiff);
      newDiff[action] = newSelection;
      this.$store.commit('updateDiffs', {sceneDiff: newDiff});
      this.applyDiff(
        this.currentSceneDiff,
        /*reverse=*/false,
        /*moveCursor=*/false,
      );
      if (this.animationOffset === 1 && this.$store.getters.animationIsValid) {
        this.applyDiff(
          this.currentAnimationDiff,
          /*reverse=*/false,
          /*moveCursor=*/false,
        );
      }
    },
    updateCode(newCode) {
      this.code = newCode;
    },
    refreshSceneChoices() {
      this.sceneChoices = window.manimlib.get_scene_choices(this.code);
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
.left-side {
  height: auto;
}
.panel-width {
  width: 410px;
}
.code-width {
  width: 720px;
}
.code-container {
  height: 100%;
  width: auto;
}
.code-box {
  overflow: scroll;
}
>>> .v-text-field__slot {
  font-size: 1.1em;
  font-family: monospace;
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
.expansion-panel-container {
  width: 100%;
}
.corner-button-container {
  position: fixed;
  right: 25px;
  bottom: 25px;
}
</style>
