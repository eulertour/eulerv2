<template>
  <MobjectLab
    v-bind:animating="animating"
    v-bind:animation-header-style="animationHeaderStyle"
    v-bind:animation-index="animationIndex"
    v-bind:animation-is-valid="animationIsValid"
    v-bind:animation-offset="animationOffset"
    v-bind:animations="animations"
    v-bind:chosen-scene-prop="chosenScene"
    v-bind:chosen-scene="chosenScene"
    v-bind:code="code"
    v-bind:current-animation-diff="currentAnimationDiff"
    v-bind:current-animation="currentAnimation"
    v-bind:current-scene-diff="currentSetupDiff"
    v-bind:debug-info="debugInfo"
    v-bind:debug="debug"
    v-bind:display-canvas-menu="displayCanvasMenu"
    v-bind:expanded-panel="expandedPanel"
    v-bind:layout-mode="manualLayout ? manualLayout : defaultLayout"
    v-bind:mobject-choices="mobjectChoices"
    v-bind:mobjects="mobjects"
    v-bind:post-animation-mobjects="postAnimationMobjects"
    v-bind:post-animation="postAnimation"
    v-bind:post-setup-mobjects="postSetupMobjects"
    v-bind:post-setup="postSetup"
    v-bind:pre-setup-mobjects="preSetupMobjects"
    v-bind:pre-setup="preSetup"
    v-bind:project="$route.params.project || this.project"
    v-bind:release-notes-dialog-prop="releaseNotesDialog"
    v-bind:release-notes="releaseNotes"
    v-bind:scene-choices="sceneChoices"
    v-bind:scene-header-style="sceneHeaderStyle"
    v-bind:scene-is-valid="sceneIsValid"
    v-bind:scene-loaded="sceneLoaded"
    v-bind:scene="scene"
    v-bind:ui-screen="uiScreen"
    v-bind:unknown-animation="unknownAnimation"
    v-bind:parent-uid="_uid"
    v-bind:canvas-height="computedCanvasHeight"
    v-bind:canvas-width="computedCanvasWidth"
    v-bind:input-height="height"
    v-bind:collapse-editor-buttons="collapseEditorButtons"
    v-bind:display-close="displayClose"
    v-on:chosen-scene-update="(val)=>{chosenScene=val}"
    v-on:config-change="handleConfigChange"
    v-on:debug-toggle="debug=!debug"
    v-on:display-canvas-menu="(display)=>{displayCanvasMenu=display}"
    v-on:expanded-panel-update="(val)=>{expandedPanel=val}"
    v-on:handle-arg-change="handleArgChange"
    v-on:handle-mobject-update="handleMobjectUpdate"
    v-on:handle-new-animation="handleNewAnimation"
    v-on:jump-post-animation="jumpPostAnimation"
    v-on:jump-post-setup="jumpPostSetup"
    v-on:jump-pre-setup="jumpPreSetup"
    v-on:new-mobject="newMobject"
    v-on:pause="pause"
    v-on:play="play"
    v-on:refresh-scene-choices="refreshSceneChoices"
    v-on:release-notes-dialog-update="(val)=>{releaseNotesDialog=val}"
    v-on:replay="replay"
    v-on:run-manim="runManim"
    v-on:snapshot-canvas="snapshotCanvas"
    v-on:step-backward="stepBackward"
    v-on:step-forward="stepForward"
    v-on:switch-ui-screen="switchUiScreen"
    v-on:update-code="(val)=>{code=val}"
    v-on:update-setup="updateSetup"
    v-on:attach-two-to-scene="attachTwo"
    v-on:horizontal-toggle="manualLayout=HORIZONTAL_EMBED"
    v-on:vertical-toggle="manualLayout=VERTICAL"
    v-on:close="$emit('close')"
  />
</template>

<script>
/*
 * A Scene is uniquely defined by its Mobjets, Animations, and scene diffs.
 */
import * as _ from "lodash";
import * as consts from "../constants.js";
import * as Manim from "../manim.js";
import * as utils from "../utils.js";
import MobjectLab from "./MobjectLab.vue";
import html2canvas from "html2canvas";
import path from "path";
import axios from "axios";

export default {
  name: "MobjectLabContainer",
  components: {
    MobjectLab,
  },
  props: {
    inputLayout: String,
    project: String,
    height: Number,
    canvasHeight: Number,
    canvasWidth: Number,
    collapseEditorButtons: Boolean,
    displayClose: Boolean,
  },
  data() {
    return {
      computedCanvasWidth: 640,
      computedCanvasHeight: 360,
      manualLayout: "",
      animating: false,
      unknownAnimation: false,
      displayCanvasMenu: false,
      debugInfo: {
        initialMobjectSerializations: {},
        sceneDiffs: [],
        animationDiffs: [],
        animationInfoList: [],
      },
      preSetupMobjects: [],
      expandedPanel: [0, 1],
      releaseNotes: consts.RELEASE_NOTES,
      releaseNotesDialog: false,
      debug: false,
      code: "",
      uiScreen: consts.uiScreens.CODE,
      playingSingleAnimation: null,
      sceneChoices: [],
      chosenScene: "",
      scene: null,
      sceneLoaded: false,
      mobjectChoices: [
        "Circle",
        "Square",
        "Triangle",
        "Pentagon",
        "Star",
        "Hexagon",
        "StarOfDavid",
        "Octagon",
      ],
      /* Specifies when the Scene is representing the state prior to performing
       * the current Animation's setup (as opposed to after).
       */
      preSetup: true,
      animationIndex: 0,
      animationOffset: 0,
      animations: [
        // {
        //   className: "ReplacementTransform",
        //   args: ["Square1"],
        //   config: { targetMobject: "Circle1" },
        //   animation: null,
        // },
      ],
      sceneDiffs: [
        // diffs are of the form:
        // {
        //   Square1: {
        //    'added': (false, true),
        //    'transformations': ([], [('rotate', angle, vector, config)]),
        //    'submobjects': ([], ['Circle1'],
        //    ...
        //   },
        //   Circle1: {
        //    ...
        //   }
        // }
      ],
      animationDiffs: [],
      mobjects: {},
    };
  },
  computed: {
    VERTICAL() { return consts.MobjectLabContainerLayout.VERTICAL; },
    HORIZONTAL_EMBED() { return consts.MobjectLabContainerLayout.HORIZONTAL_EMBED; },
    defaultLayout() {
      return this.$vuetify.breakpoint.mdAndDown
        ? consts.MobjectLabContainerLayout.VERTICAL
        : consts.MobjectLabContainerLayout.HORIZONTAL;
    },
    currentAnimation() {
      return this.animations[this.animationIndex];
    },
    currentSetupDiff: {
      get() {
        return this.sceneDiffs[this.animationIndex];
      },
      set(diff) {
        let newDiffs = _.cloneDeep(this.sceneDiffs);
        newDiffs[this.animationIndex] = diff;
        this.sceneDiffs = newDiffs;
      },
    },
    currentAnimationDiff: {
      get() {
        return this.animationDiffs[this.animationIndex];
      },
      set(diff) {
        let newDiffs = _.cloneDeep(this.animationDiffs);
        newDiffs[this.animationIndex] = diff;
        this.animationDiffs = newDiffs;
      },
    },
    sceneHeaderStyle() {
      let ret = {};
      if (!this.sceneIsValid) {
        ret["color"] = "red";
      }
      return ret;
    },
    animationHeaderStyle() {
      let ret = {};
      // if (this.sceneIsValid && !this.animationIsValid) {
      //   ret["color"] = "red";
      // }
      return ret;
    },
    sceneIsValid() {
      if (!this.sceneLoaded || this.currentSetupDiff === undefined) {
        return false;
      }
      return this.diffIsValidForScene(this.currentSetupDiff, this.preSetupMobjects);
    },
    animationIsValid() {
      if (!this.sceneLoaded ||
          this.currentAnimationDiff === undefined ||
          this.unknownAnimation) {
        return false;
      }
      return this.diffIsValidForScene(
        this.currentAnimationDiff,
        this.postSetupMobjects,
      );
    },
    postSetup() {
      return !this.preSetup && this.animationOffset === 0 && !this.animating;
    },
    postAnimation() {
      return !this.preSetup && this.animationOffset === 1 && !this.animating;
    },
    postSetupMobjects() {
      if (!this.sceneLoaded || this.currentSetupDiff === undefined) {
        return [];
      }
      return this.updateMobjectListWithDiff(this.preSetupMobjects, this.currentSetupDiff.mobjects);
    },
    postAnimationMobjects() {
      if (!this.sceneLoaded || this.currentAnimationDiff === undefined) {
        return [];
      }
      return this.updateMobjectListWithDiff(this.postSetupMobjects, this.currentAnimationDiff.mobjects);
    },
    mobjectsInScene() {
      return Object.keys(this.mobjects).filter(mobjectName => this.mobjects[mobjectName].added);
    }
  },
  created() {
    // Attach these to the instance here so that they won't be watched and slow
    // Animation setup.
    this.savedPreAnimationMobject = null;
    this.savedPreAnimationMobjectParent = null;
    this.cachedBackground = null;
  },
  mounted() {
    this.manualLayout = this.inputLayout;
    window.languagePluginLoader.then(() => {
      window.pyodide.loadPackage("manimlib").then(() => {
        window.pyodide.runPython("import manimlib");
        window.pyodide.runPython("import numpy");
        window.texToPoints = tex => Manim.SingleStringTexMobject.texToPoints(tex, this.scene);
        let codePath = path.join(
          consts.SCENE_DATA_DIR,
          this.$route.params.project || this.project,
          consts.CODE_NAME,
        );
        axios.get(codePath).then(response => {
          this.code = response.data;
          this.refreshSceneChoices();
          this.chosenScene = this.sceneChoices[0];
          this.sceneLoaded = true;
        }).catch(error => {
          // eslint-disable-next-line
          console.log(error);
        });
      });
    });
  },
  methods: {
    attachTwo() {
      if (this.canvasWidth !== undefined) {
        this.computedCanvasWidth = this.canvasWidth;
      } else if (this.canvasHeight !== undefined) {
        this.computedCanvasWidth = this.canvasHeight * 16 / 9;
      }

      if (this.canvasHeight !== undefined) {
        this.computedCanvasHeight = this.canvasHeight;
      } else if (this.canvasWidth !== undefined) {
        this.computedCanvasHeight = this.canvasWidth * 9 / 16;
      }

      this.scene = new Manim.Scene({ width: this.computedCanvasWidth, height: this.computedCanvasHeight });
      this.scene.appendTo(document.getElementById(this._uid + "manim-background"));
      this.cachedBackground = this.scene.makeRectangle(
        this.scene.width / 2,
        this.scene.height / 2,
        this.scene.width,
        this.scene.height,
      );
      this.cachedBackground.fill = '#000000';
      this.scene.update();
    },
    runManim: function() {
      let manimlib = window.pyodide.pyimport("manimlib");
      let scene = manimlib.get_scene(this.code, [this.chosenScene]);
      scene.run();

      // let debugInfo = {};
      // debugInfo.initialMobjectSerializations = scene.initial_mobject_serializations;
      // debugInfo.sceneDiffs = scene.scene_diffs;
      // debugInfo.animationDiffs = scene.animation_diffs;
      // debugInfo.animationInfoList = scene.animation_info_list;
      // this.debugInfo = debugInfo;

      // // Initialize Mobjects.
      // let newMobjects = {};

      // for (let mobjectName of Object.keys(scene.initial_mobject_serializations)) {
      //   const pythonData = scene.initial_mobject_serializations[mobjectName];
      //   let mobjectData = {};
      //   mobjectData.className = pythonData.className;
      //   mobjectData.args = pythonData.args.slice();
      //   mobjectData.config = utils.renameSnakeKeys(Object.assign({}, pythonData.config));
      //   mobjectData.submobjects = 'submobjects' in pythonData ? pythonData.submobjects.slice() : [];
      //   if ('style' in pythonData) {
      //     mobjectData.style = Object.assign({}, pythonData.style);
      //   }
      //   mobjectData.name = mobjectName;
      //   this.buildAndSetMobject(mobjectData);
      //   newMobjects[mobjectName] = mobjectData;
      // }

      // // Initialize submobjects.
      // for (let mobjectName of Object.keys(newMobjects)) {
      //   let parentMob = newMobjects[mobjectName].mobject;
      //   for (let submobjectName of newMobjects[mobjectName].submobjects) {
      //     parentMob.add(newMobjects[submobjectName].mobject);
      //   }
      // }

      // // Initialize Animations.
      // let newAnimations = [];
      // for (let animationData of scene.animation_info_list) {
      //   let newData = {};
      //   newData.className = animationData.className;
      //   newData.args = animationData.args;
      //   newData.config = utils.renameSnakeKeys(animationData.config);
      //   newData.runtime = animationData.runtime;
      //   newAnimations.push(newData);
      // }

      // this.mobjects = newMobjects;
      // this.animations = newAnimations;
      // this.animationDiffs = scene.animation_diffs;
      // this.sceneDiffs = scene.scene_diffs;
      // this.animationIndex = 0;
      // this.animationOffset = 0;
      // this.scene.clear();
      // this.scene.add(this.cachedBackground);
      // this.scene.clearAnimation();
      // this.currentAnimation.animation = this.buildCurrentAnimation();
      // this.scene.update();
      // this.preSetupMobjects = [];
      // this.applyDiff(
      //   scene.scene_diffs[0],
      //   /*reverse=*/ false,
      //   /*moveCursor=*/ false,
      // );
      // this.preSetup = false;
      // // this.switchUiScreen(consts.uiScreens.PANELS);
      // this.play(null, /*singleAnimationOnly=*/ false);
    },
    switchUiScreen: function(uiScreen) {
      this.uiScreen = uiScreen;
    },
    setMobjectField: function(mobjectData, allMobjectData = null) {
      if (mobjectData.className === "TexSymbol") {
        // eslint-disable-next-line
        console.error("TexSymbols should only be generated from a TexMobject");
        return;
      } else if (mobjectData.className === "SingleStringTexMobject") {
        // eslint-disable-next-line
        console.error("SingleStringTexMobjects should only be generated from a TexMobject");
        return;
      } else if (mobjectData.className === "TexMobject" || mobjectData.className === "TextMobject") {
        let s = new Manim[mobjectData.className](
          mobjectData.config.tex_strings,
          this.scene,
          mobjectData.config.tex_to_color_map !== undefined
            ? mobjectData.config.tex_to_color_map : {},
        );
        s.applyTransformations(mobjectData.transformations);
        s.translateMobject(mobjectData.position);
        mobjectData.mobject = s;
      } else if (!utils.isGroupData(mobjectData)) {
        let s = new Manim[mobjectData.className](mobjectData.config);
        s.applyTransformations(mobjectData.transformations);
        s.translateMobject(mobjectData.position);
        s.applyStyle(mobjectData.style);
        mobjectData.mobject = s;
        return s;
      } else {
        let mobs = mobjectData.submobjects.map(mobjectName => {
          let data;
          if (allMobjectData === null) {
            data = this.mobjects[mobjectName];
          } else {
            data = allMobjectData[mobjectName];
          }
          // Set submobjects before setting the Group
          this.setMobjectField(data, allMobjectData);
          return data.mobject;
        });
        let g = new Manim["Group"](mobs);
        mobjectData.mobject = g;
      }
    },
    buildAndSetMobject: function(mobjectData) {
      mobjectData.mobject = this.buildMobject(mobjectData);
      mobjectData.mobject.name = mobjectData.name;
    },
    buildMobject: function(mobjectData) {
      if (utils.isTexData(mobjectData)) {
        let m = new Manim[mobjectData.className](
          mobjectData.args,
          {
            ...mobjectData.config,
            sceneHeight: this.computedCanvasHeight,
            sceneWidth: this.computedCanvasWidth,
          },
          this.scene,
        );
        return m;
      } else if (!utils.isGroupData(mobjectData)) {
        // TODO: Pass Scene dimensions here.
        let m = new Manim[mobjectData.className]({
          ...mobjectData.config,
          sceneHeight: this.computedCanvasHeight,
          sceneWidth: this.computedCanvasWidth,
        });
        m.applyStyle(mobjectData.style);
        return m;
      } else {
        return new Manim.Group();
      }
    },
    buildCurrentAnimation: function() {
      const { className, args, config } = this.currentAnimation;
      let replaceMobjectNamesArgs = (args) =>
        args.map(arg => arg in this.mobjects ? this.mobjects[arg].mobject : arg);
      let replaceMobjectNamesConfig = (config) =>
        Object.fromEntries(
          Object.entries(config).map(pair =>[pair[0], pair[1] in this.mobjects ? this.mobjects[pair[1]].mobject : pair[1]])
        );
      if (className in Manim) {
        switch (className) {
          case "ApplyFunction":
            return new Manim[className](
              ...replaceMobjectNamesArgs(args),
              replaceMobjectNamesConfig(config),
              this.currentAnimationDiff,
            );
          default:
            return new Manim[className](
              ...replaceMobjectNamesArgs(args),
              replaceMobjectNamesConfig(config),
            );
        }
      } else {
        this.unknownAnimation = true;
        return null;
      }
    },
    saveMobjectPreAnimation: function(mobject) {
      if (mobject !== null) {
        this.savedPreAnimationMobject = mobject.clone();
        this.savedPreAnimationMobjectParent = mobject.parent;
      } else {
        // Must not be null in order for this.animating to behave correctly.
        this.savedPreAnimationMobject = undefined;
        this.savedPreAnimationMobjectParent = undefined;
      }
    },
    chainNextAnimation: function() {
      this.stepForward();
      if (this.animationIndex === this.animations.length - 1 && this.animationOffset === 1) {
        return;
      }
      if (this.animationIsValid && this.sceneIsValid) {
        this.saveMobjectPreAnimation(this.currentAnimation.animation.mobject);
        this.currentAnimation.animation.setStartingMobject(this.savedPreAnimationMobject);
        this.animating = true;
        this.scene.playAnimation(
          this.currentAnimation.animation,
          /*onStep=*/ this.onAnimationStep,
          /*onAnimationFinished=*/ () => {
            this.chainNextAnimation();
          },
        );
      }
    },
    play: function(e, singleAnimationOnly = true) {
      // // For testing whether Mobjects display correctly.
      // this.scene.add(this.mobjects[this.currentAnimation.args[1]].mobject);
      // this.scene.update();
      this.playingSingleAnimation = singleAnimationOnly;
      if (this.animating) {
        this.scene.play();
        return;
      }
      this.jumpPostSetup();
      if (this.animationOffset === 1) {
        // eslint-disable-next-line
        console.assert(
          singleAnimationOnly === false &&
            this.animationIndex !== this.animations.length - 1,
        );
        this.stepForward();
      }
      if (this.animationIsValid && this.sceneIsValid) {
        this.currentAnimation.animation = this.buildCurrentAnimation();
        this.saveMobjectPreAnimation(this.currentAnimation.animation.mobject);
        this.currentAnimation.animation.setStartingMobject(this.savedPreAnimationMobject);
        this.animating = true;
        this.scene.playAnimation(
          this.currentAnimation.animation,
          /*onStep=*/ this.onAnimationStep,
          /*onAnimationFinished=*/ () => {
            this.jumpPostAnimation();
            if (!this.playingSingleAnimation) {
              this.chainNextAnimation();
            }
          },
        );
      }
    },
    replay: function(e, singleAnimationOnly = true) {
      if (singleAnimationOnly) {
        this.jumpPostSetup();
      } else {
        while (this.animationIndex > 0 || this.animationOffset > 0) {
          this.stepBackward();
        }
      }
      this.play(e, singleAnimationOnly);
    },
    pause: function() {
      this.scene.pause();
    },
    /*  Updates the mobjects in this.scene according to the diff. Diffs have the
     *  form:
     *  {
     *    mobject1: {
     *      added: [false, true],
     *      style: {
     *        fillColor: ['#fff', '#f00'],
     *        fillOpacity: [0, 1],
     *      }
     *    },
     *    transformations: [
     *      (3, 'mobject1', 'scale', 2),
     *      (4, 'mobject1', 'shift', [1, 0, 0]),
     *    ]
     *  }
     */
    applyDiff: function(diff, reverse = false, moveCursor = true) {
      if (moveCursor) {
        this.animationOffset = reverse ? 0 : 1;
      }
      if (_.isEmpty(diff)) {
        return;
      }
      utils.applyDiff(diff, reverse, this.mobjects, this.scene);
    },
    updateMobjectDict(mobjectName, mobject) {
      this.mobjects[mobjectName].mobject = mobject;
      if (!('submobjects' in this.mobjects[mobjectName])) {
        return;
      }
      for (let i = 0; i < this.mobjects[mobjectName].submobjects.length; i++) {
        let submobjectName = this.mobjects[mobjectName].submobjects[i];
        this.updateMobjectDict(submobjectName, mobject.submobjects()[i]);
      }
    },
    jumpPostSetupFromAnimating: function() {
      // eslint-disable-next-line
      console.assert(this.animating);
      this.scene.clearAnimation();
      this.animating = false;
      if (this.savedPreAnimationMobject !== undefined) {
        this.scene.remove(this.currentAnimation.animation.mobject);
        if (this.savedPreAnimationMobjectParent !== undefined) {
          // TODO: Each Mobject in the hierarchy might have to be checked for
          // addition individually.
          this.savedPreAnimationMobjectParent.add(this.savedPreAnimationMobject);
        }
        // TODO: Is there no better way to do this? Possibly binding the Mobject
        // name to each Mobject? (update: this should be removed after Mobject
        // names are bound to the Mobjects).
        let savedPreAnimationMobjectName = this.currentAnimation.animation.mobjectNameFromArgs(
          this.currentAnimation.args
        );
        this.updateMobjectDict(savedPreAnimationMobjectName, this.savedPreAnimationMobject);
      }
      this.savedPreAnimationMobject = null;
      this.savedPreAnimationMobjectInScene = null;
    },
    /* Moves to the pre-setup stage of the current Animation. */
    jumpPreSetup: function() {
      if (this.preSetup) {
        return;
      } else if (this.savedPreAnimationMobject !== null) {
        this.jumpPostSetupFromAnimating();
        this.applyDiff(
          this.currentSetupDiff,
          /*reverse=*/true,
          /*moveCursor=*/false,
        );
      } else if (this.animationOffset === 0) {
        this.applyDiff(
          this.currentSetupDiff,
          /*reverse=*/true,
          /*moveCursor=*/false,
        );
      } else {
        // eslint-disable-next-line
        console.assert(this.postAnimation);
        this.applyDiff(
          this.currentAnimationDiff,
          /*reverse=*/true,
          /*moveCursor=*/false,
        );
        this.applyDiff(
          this.currentSetupDiff,
          /*reverse=*/true,
          /*moveCursor=*/false,
        );
      }
      this.scene.update();
      this.preSetup = true;
      this.animationOffset = 0;
    },
    /* Moves to the post-setup stage of the current Animation. */
    jumpPostSetup: function() {
      if (this.preSetup) {
        this.applyDiff(
          this.currentSetupDiff,
          /*reverse=*/false,
          /*moveCursor=*/false,
        );
      } else if (this.savedPreAnimationMobject !== null) {
        this.jumpPostSetupFromAnimating();
      } else if (this.animationOffset === 0) {
        // eslint-disable-next-line
        console.assert(this.postSetup);
      } else {
        this.applyDiff(
          this.currentAnimationDiff,
          /*reverse=*/true,
          /*moveCursor=*/true,
        );
      }
      this.scene.update();
      this.preSetup = false;
      this.animationOffset = 0;
    },
    jumpPostAnimation: function() {
      if (this.preSetup) {
        this.applyDiff(
          this.currentSetupDiff,
          /*reverse=*/false,
          /*moveCursor=*/false,
        );
        this.applyDiff(
          this.currentAnimationDiff,
          /*reverse=*/false,
          /*moveCursor=*/false,
        );
      } else if (this.savedPreAnimationMobject !== null) {
        this.jumpPostSetupFromAnimating();
        this.applyDiff(
          this.currentAnimationDiff,
          /*reverse=*/false,
          /*moveCursor=*/false,
        );
      } else if (this.animationOffset === 0) {
        this.applyDiff(
          this.currentAnimationDiff,
          /*reverse=*/false,
          /*moveCursor=*/false,
        );
      } else {
        // eslint-disable-next-line
        console.assert(this.postAnimation);
      }
      this.scene.update();
      this.preSetup = false;
      this.animationOffset = 1;
    },
    /* Moves to the post-setup stage of the following Animation. */
    stepForward: function() {
      if (!this.sceneIsValid || !this.animationIsValid) {
        return;
      }
      this.jumpPostAnimation();
      if (this.animationIndex === this.animations.length - 1) {
        return;
      }
      this.preSetupMobjects = this.postAnimationMobjects;
      this.animationIndex += 1;
      this.animationOffset = 0;
      this.preSetup = true;
      this.currentAnimation.animation = this.buildCurrentAnimation();
      if (this.sceneIsValid) {
        this.jumpPostSetup();
        this.preSetup = false;
      }
    },
    /* Moves to the post-setup stage of the previous Animation. */
    stepBackward: function() {
      if (
        this.animating
        || this.animationIndex === 0
        || this.animationOffset !== 0
      ) {
        this.jumpPostSetup();
        return;
      }
      let postSetupMobs = this.updateMobjectListWithDiff(
        this.preSetupMobjects,
        this.animationDiffs[this.animationIndex - 1].mobjects,
        /*reverse=*/true,
      );
      let preSetupMobs = this.updateMobjectListWithDiff(
        postSetupMobs,
        this.sceneDiffs[this.animationIndex - 1].mobjects,
        /*reverse=*/true,
      );
      this.animationIndex -= 1;
      this.animationOffset = 1;
      this.preSetupMobjects = preSetupMobs;
      this.preSetup = false;
      this.currentAnimation.animation = this.buildCurrentAnimation();
      if (this.sceneIsValid) {
        this.jumpPostSetup();
      }
    },
    onAnimationStep: function(elapsedSeconds) {
      this.animationOffset = elapsedSeconds;
    },
    handleMobjectUpdate: function(mobjectName, attr, val) {
      // eslint-disable-next-line
      console.assert(
        this.scene.contains(this.mobjects[mobjectName].mobject),
        "modified mobject that isn't in the scene",
      );
      let oldMobject = this.mobjects[mobjectName].mobject;
      let parent = oldMobject.parent;
      let oldMobjectIndex = parent.children.indexOf(oldMobject);
      parent.remove(oldMobject);
      let split = attr.split(".");
      if (split[0] === "style") {
        this.$set(this.mobjects[mobjectName].style, split[1], val);
      } else {
        this.$set(this.mobjects[mobjectName], attr, val);
      }
      this.setMobjectField(this.mobjects[mobjectName]);
      parent.children.splice(
        oldMobjectIndex,
        0,
        this.mobjects[mobjectName].mobject,
      );
      this.scene.update();
    },
    handleNewAnimation: function() {
      while (
        this.animationIndex < this.animations.length - 1 ||
        this.animationOffset < 1
      ) {
        if (this.sceneIsValid && this.animationIsValid) {
          this.stepForward();
        } else {
          return;
        }
      }
      this.animations.push({
        className: "Wait",
        args: [],
        config: {},
        animation: null,
      });
      this.sceneDiffs.push({});
      this.animationDiffs.push(Manim["Wait"].getDiff([], {}, this.mobjects));
      this.stepForward();
    },
    newMobject: function() {
      let newMobjectData = {
        className: "Circle",
        config: {},
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
        "mobject" + (Object.keys(this.mobjects).length + 1),
        newMobjectData,
      );
    },
    handleArgChange: function(argNum, arg) {
      if (this.animationOffset === 1) {
        this.applyDiff(
          this.currentAnimationDiff,
          /*reverse=*/ true,
          /*moveCursor=*/ false,
        );
      }
      let newArgs = _.cloneDeep(this.currentAnimation.args);
      newArgs[argNum] = arg;
      this.currentAnimation.args = newArgs;
      this.currentAnimationDiff = Manim[
        this.currentAnimation.className
      ].getDiff(
        ...this.currentAnimation.args,
        this.currentAnimation.config,
        this.postSetupMobjects,
        this.mobjects,
      );
      if (this.animationOffset === 1) {
        this.applyDiff(
          this.currentAnimationDiff,
          /*reverse=*/ false,
          /*moveCursor=*/ false,
        );
      }
    },
    handleConfigChange(key, val) {
      if (this.animationOffset === 1) {
        this.applyDiff(
          this.currentAnimationDiff,
          /*reverse=*/ true,
          /*moveCursor=*/ false,
        );
      }

      let newConfig = _.cloneDeep(this.currentAnimation.config);
      newConfig[key] = val;
      this.currentAnimation.config = newConfig;
      this.currentAnimationDiff = Manim[
        this.currentAnimation.className
      ].getDiff(
        ...this.currentAnimation.args,
        this.currentAnimation.config,
        this.postSetupMobjects,
        this.mobjects,
      );

      if (this.animationOffset === 1) {
        this.applyDiff(
          this.currentAnimationDiff,
          /*reverse=*/ false,
          /*moveCursor=*/ false,
        );
      }
    },
    updateSetup: function(action, newSelection) {
      if (this.animationOffset === 1) {
        this.applyDiff(
          this.currentAnimationDiff,
          /*reverse=*/ true,
          /*moveCursor=*/ false,
        );
      }
      this.applyDiff(
        this.currentSetupDiff,
        /*reverse=*/ true,
        /*moveCursor=*/ false,
      );
      let newDiff = _.cloneDeep(this.currentSetupDiff);
      newDiff[action] = newSelection;
      this.currentSetupDiff = newDiff;
      this.applyDiff(
        this.currentSetupDiff,
        /*reverse=*/ false,
        /*moveCursor=*/ false,
      );
      if (this.animationOffset === 1 && this.animationIsValid) {
        this.applyDiff(
          this.currentAnimationDiff,
          /*reverse=*/ false,
          /*moveCursor=*/ false,
        );
      }
    },
    refreshSceneChoices: function() {
      let manimlib = window.pyodide.pyimport("manimlib")
      this.sceneChoices = manimlib.get_scene_choices(this.code);
    },
    diffIsValidForScene: function(diff, scene) {
      let namesInScene = this.getNamesInScene(scene);
      for (let mobjectName of diff["add"] || []) {
        // A Mobject can be added if none of the Mobjects in its hierarchy are
        // in the scene.
        let namesInHierarchy = this.getNamesInHierarchy(mobjectName);
        for (let submobName of namesInHierarchy) {
          if (namesInScene.includes(submobName)) {
            // eslint-disable-next-line
            console.error(`can't add ${submobName}`);
            return false;
          }
        }
      }
      // A Mobject can be removed if it appears anywhere in the scene.
      for (let submobName of diff["remove"] || []) {
        if (!namesInScene.includes(submobName)) {
          // eslint-disable-next-line
          console.error(`can't remove ${submobName}`);
          return false;
        }
      }
      // A Mobject can be modified if it appears anywhere in the scene.
      for (let modification of diff["modify"] || []) {
        let submobName = modification[0];
        if (!namesInScene.includes(submobName)) {
          // eslint-disable-next-line
          console.error(`can't modify ${submobName}`);
          return false;
        }
      }
      return true;
    },
    getNamesInScene: function(scene) {
      let ret = [];
      for (let mobjectName of scene) {
        ret = ret.concat(this.getNamesInHierarchy(mobjectName));
      }
      return ret;
    },
    getNamesInHierarchy: function(mobjectName) {
      if (this.mobjects[mobjectName] === undefined) {
        return [];
      }
      let ret = [mobjectName];
      let data = this.mobjects[mobjectName];
      if ("submobjects" in data) {
        for (let submobName of data.submobjects) {
          ret = _.concat(ret, this.getNamesInHierarchy(submobName));
        }
      }
      return ret;
    },
    updateMobjectListWithDiff(mobjectList, diff, reverse=false) {
      if (diff === undefined) {
        return _.clone(mobjectList);
      }
      let addedOrRemoved = Object.keys(diff).filter(mobjectName => "added" in diff[mobjectName]);
      let added;
      if (!reverse) {
        added = addedOrRemoved.filter(mobjectName => diff[mobjectName]["added"][1]);
      } else {
        added = addedOrRemoved.filter(mobjectName => !diff[mobjectName]["added"][1]);
      }
      let removed = _.difference(addedOrRemoved, added);
      return _.concat(_.difference(mobjectList, removed), added);
    },
    snapshotCanvas() {
      this.displayCanvasMenu = false;
      this.$nextTick(function() {
        html2canvas(document.getElementById(this._uid + 'manim-background'))
          .then(function(canvas) {
            let dataUrl = canvas.toDataURL("image/png");
            let win = window.open();
            win.document.write('<img src="' + dataUrl + '"/>');
          });
      });
    },
  },
};
</script>
