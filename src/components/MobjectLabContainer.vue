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
    v-bind:ui-screen="uiScreen"
    v-bind:expanded-panel="expandedPanel"
    v-bind:mobject-choices="mobjectChoices"
    v-bind:mobjects="mobjects"
    v-bind:pre-setup="preSetup"
    v-bind:post-setup="postSetup"
    v-bind:post-animation="postAnimation"
    v-bind:pre-setup-mobjects="preSetupMobjects"
    v-bind:post-setup-mobjects="postSetupMobjects"
    v-bind:post-animation-mobjects="postAnimationMobjects"
    v-bind:release-notes-dialog-prop="releaseNotesDialog"
    v-bind:release-notes="releaseNotes"
    v-bind:scene-choices="sceneChoices"
    v-bind:scene-header-style="sceneHeaderStyle"
    v-bind:scene-is-valid="sceneIsValid"
    v-bind:scene-loaded="sceneLoaded"
    v-bind:scene="scene"
    v-bind:display-canvas-menu="displayCanvasMenu"
    v-on:snapshot-canvas="snapshotCanvas"
    v-on:display-canvas-menu="(display)=>{displayCanvasMenu=display}"
    v-on:chosen-scene-update="(val)=>{chosenScene=val}"
    v-on:switch-ui-screen="switchUiScreen"
    v-on:debug-toggle="debug = !debug"
    v-on:expanded-panel-update="(val)=>{expandedPanel=val}"
    v-on:handle-arg-change="handleArgChange"
    v-on:config-change="handleConfigChange"
    v-on:handle-mobject-update="handleMobjectUpdate"
    v-on:handle-new-animation="handleNewAnimation"
    v-on:jump-pre-setup="jumpPreSetup"
    v-on:jump-post-setup="jumpPostSetup"
    v-on:jump-post-animation="jumpPostAnimation"
    v-on:new-mobject="newMobject"
    v-on:pause="pause"
    v-on:play="play"
    v-on:release-notes-dialog-update="(val)=>{releaseNotesDialog=val}"
    v-on:replay="replay"
    v-on:run-manim="runManim"
    v-on:step-backward="stepBackward"
    v-on:step-forward="stepForward"
    v-on:update-code="(val)=>{code=val}"
    v-on:update-setup="updateSetup"
    v-on:refresh-scene-choices="refreshSceneChoices"
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

export default {
  name: "MobjectLabContainer",
  components: {
    MobjectLab,
  },
  data() {
    return {
      displayCanvasMenu: false,
      debugInfo: {
        initialMobjectSerializations: {},
        sceneDiffs: [],
        animationDiffs: [],
        animationInfoList: [],
      },
      savedPreAnimationMobject: null,
      savedPreAnimationMobjectInScene: null,
      preSetupMobjects: [],
      expandedPanel: [0, 1],
      releaseNotes: consts.RELEASE_NOTES,
      releaseNotesDialog: false,
      debug: false,
      code: consts.EXAMPLE_CODE,
      uiScreen: consts.uiScreens.CODE,
      playingSingleAnimation: null,
      sceneChoices: [],
      chosenScene: "SquareToCircle",
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
        {
          className: "ReplacementTransform",
          args: ["Square1"],
          config: { targetMobject: "Circle1" },
          animation: null,
        },
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
      initialMobjects: {
        Circle1: {
          className: "Circle",
          config: {},
          position: [-1, 0],
          transformations: [],
          style: {
            strokeColor: "#fc6255ff",
            fillColor: "#00000000",
            strokeWidth: 4,
          },
          mobject: null,
        },
        Square1: {
          className: "Square",
          config: {},
          position: [1, 0],
          transformations: [],
          style: {
            strokeColor: "#ffffffff",
            fillColor: "#00000000",
            strokeWidth: 4,
          },
          mobject: null,
        },
        Square2: {
          className: "Square",
          config: {},
          position: [1, 0],
          transformations: [],
          style: {
            strokeColor: "#00ff00ff",
            fillColor: "#00000000",
            strokeWidth: 4,
          },
          mobject: null,
        },
      },
    };
  },
  computed: {
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
    animating() {
      return this.savedPreAnimationMobject !== null;
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
      if (this.sceneIsValid && !this.animationIsValid) {
        ret["color"] = "red";
      }
      return ret;
    },
    sceneIsValid() {
      if (!this.sceneLoaded) {
        return false;
      }
      return this.diffIsValidForScene(this.currentSetupDiff, this.preSetupMobjects);
    },
    animationIsValid() {
      if (!this.sceneLoaded) {
        return false;
      }
      return this.diffIsValidForScene(
        this.currentAnimationDiff,
        this.postSetupMobjects,
      );
    },
    postSetup() {
      return !this.preSetup && this.animationOffset === 0 && this.savedPreAnimationMobject === null;
    },
    postAnimation() {
      return !this.preSetup && this.animationOffset === 1 && this.savedPreAnimationMobject === null;
    },
    postSetupMobjects() {
      if (!this.sceneLoaded) {
        return [];
      }
      return this.updateMobjectListWithDiff(this.preSetupMobjects, this.currentSetupDiff.mobjects);
    },
    postAnimationMobjects() {
      if (!this.sceneLoaded) {
        return [];
      }
      return this.updateMobjectListWithDiff(this.postSetupMobjects, this.currentAnimationDiff.mobjects);
    },
    mobjectsInScene() {
      return Object.keys(this.mobjects).filter(mobjectName => this.mobjects[mobjectName].added);
    }
  },
  mounted() {
    console.log(this.$route.params);
    this.scene = new Manim.Scene({ width: 640, height: 360 });
    this.scene.appendTo(document.getElementById("manim-background"));
    this.scene.update();
    this.scene.renderer.domElement.id = "manim-scene";
    window.languagePluginLoader.then(() => {
      window.pyodide.loadPackage("manimlib").then(() => {
        window.pyodide.runPython("import manimlib");
        window.pyodide.runPython("import numpy");
        window.texToPoints = tex => Manim.SingleStringTexMobject.texToPoints(tex, this.scene);
        // Initialize Mobjects, Animations, and scene diffs
        for (let mobjectName of Object.keys(this.initialMobjects)) {
          let data = _.cloneDeep(this.initialMobjects[mobjectName]);
          this.buildAndSetMobject(data);
          this.$set(this.mobjects, mobjectName, data);
        }
        this.currentAnimation.animation = this.buildCurrentAnimation();
        this.sceneDiffs = [{
          mobjects: {
            'Square1': {'added': [false, true]}
          },
        }];
        this.currentAnimationDiff = Manim[
          this.currentAnimation.className
        ].getDiff(
          ...this.currentAnimation.args,
          this.currentAnimation.config,
          ['Square1'],
          this.mobjects,
        );
        this.jumpPostSetup();
        this.refreshSceneChoices();
        this.sceneLoaded = true;
      });
    });
  },
  methods: {
    runManim: function() {
      let manimlib = window.pyodide.pyimport("manimlib");
      let scene = manimlib.get_scene(this.code, [this.chosenScene]);
      scene.render();

      let debugInfo = {};
      debugInfo.initialMobjectSerializations = scene.initial_mobject_serializations;
      debugInfo.sceneDiffs = scene.scene_diffs;
      debugInfo.animationDiffs = scene.animation_diffs;
      debugInfo.animationInfoList = scene.animation_info_list;
      this.debugInfo = debugInfo;

      // Initialize Mobjects.
      let newMobjects = {};
      for (let mobjectName of Object.keys(scene.initial_mobject_serializations)) {
        const pythonData = scene.initial_mobject_serializations[mobjectName];
        let mobjectData = {};
        mobjectData.className = pythonData.className;
        mobjectData.args = pythonData.args.slice();
        mobjectData.config = utils.renameSnakeKeys(Object.assign({}, pythonData.config));
        mobjectData.submobjects = 'submobjects' in pythonData ? pythonData.submobjects.slice() : [];
        if ('style' in pythonData) {
          mobjectData.style = Object.assign({}, pythonData.style);
        }
        this.buildAndSetMobject(mobjectData);
        newMobjects[mobjectName] = mobjectData;
      }

      // Initialize submobjects.
      for (let mobjectName of Object.keys(newMobjects)) {
        let parentMob = newMobjects[mobjectName].mobject;
        for (let submobjectName of newMobjects[mobjectName].submobjects) {
          parentMob.add(newMobjects[submobjectName].mobject);
        }
      }

      // Initialize Animations.
      let newAnimations = [];
      for (let animationData of scene.animation_info_list) {
        let newData = {};
        newData.className = animationData.className;
        newData.args = animationData.args;
        newData.config = utils.renameSnakeKeys(animationData.config);
        newAnimations.push(newData);
      }

      this.mobjects = newMobjects;
      this.animations = newAnimations;
      this.animationDiffs = scene.animation_diffs;
      this.sceneDiffs = scene.scene_diffs;
      this.animationIndex = 0;
      this.animationOffset = 0;
      this.scene.clear();
      this.scene.clearAnimation();
      this.currentAnimation.animation = this.buildCurrentAnimation();
      this.scene.update();
      this.preSetupMobjects = [];
      this.applyDiff(
        scene.scene_diffs[0],
        /*reverse=*/ false,
        /*moveCursor=*/ false,
      );
      this.switchUiScreen(consts.uiScreens.PANELS);
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
    },
    buildMobject: function(mobjectData) {
      if (utils.isTexData(mobjectData)) {
        let m = new Manim[mobjectData.className](
          mobjectData.args,
          mobjectData.config,
          this.scene,
        );
        return m;
      } else if (!utils.isGroupData(mobjectData)) {
        let m = new Manim[mobjectData.className](mobjectData.config);
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
      return new Manim[className](
        ...replaceMobjectNamesArgs(args),
        replaceMobjectNamesConfig(config),
      );
    },
    saveMobjectPreAnimation(mobject) {
      if (mobject !== null) {
        this.savedPreAnimationMobject = mobject.clone();
        this.savedPreAnimationMobjectParent = mobject.parent;
      } else {
        // Must not be null in order for this.animating to compute correctly.
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
        let currentAnimationMobject = this.currentAnimation.animation.mobject;
        if (currentAnimationMobject !== null) {
          this.saveMobjectPreAnimation(this.currentAnimation.animation.mobject);
        } else {
          // Must not be null in order for this.animating to compute correctly.
          this.savedPreAnimationMobject = undefined;
        }
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
    applyAddDiff: function(mobjectName, addDiff, reverse) {
      let presentBefore, presentAfter;
      if (!reverse) {
        [presentBefore, presentAfter] = addDiff;
      } else {
        [presentAfter, presentBefore] = addDiff;
      }
      let mobjectData = this.mobjects[mobjectName];
      if (presentBefore && !presentAfter) {
        let mobject = mobjectData.mobject;
        // eslint-disable-next-line
        console.assert(this.scene.contains(mobject));
        this.scene.remove(mobject);
      } else if (!presentBefore && presentAfter) {
        // eslint-disable-next-line
        console.assert(!this.scene.contains(mobjectData.mobject));
        this.scene.add(mobjectData.mobject);
      } else {
        // eslint-disable-next-line
        console.error(
          "Invalid add parameters",
          mobjectName,
          presentBefore,
          presentAfter,
        );
      }
      this.scene.update();
    },
    applyStyleDiff: function(mobjectName, styleDiff, reverse) {
      let style = {};
      for (let styleAttr of Object.keys(styleDiff)) {
        if (!reverse) {
          style[styleAttr] = styleDiff[styleAttr][1];
        } else {
          style[styleAttr] = styleDiff[styleAttr][0];
        }
        this.mobjects[mobjectName].mobject.applyStyle(style);
      }
    },
    applySubmobjectDiff: function(mobjectName, submobjectDiff, reverse) {
      let startMobjects, endMobjects;
      if (!reverse) {
        startMobjects = submobjectDiff[0];
        endMobjects  = submobjectDiff[1];
      } else {
        startMobjects = submobjectDiff[1];
        endMobjects  = submobjectDiff[0];
      }
      if (endMobjects.includes(consts.UNKNOWN_MOBJECT)) {
        // This is likely a ReplacementTransform that had to split the
        // submobjects. Ignore the change.
        // eslint-disable-next-line
        console.assert(!reverse);
        return;
      }
      if (startMobjects.includes(consts.UNKNOWN_MOBJECT)) {
        // This change was ignored while going forware, so there's nothing to do
        // now.
        // eslint-disable-next-line
        console.assert(reverse);
        return;
      }
      let parentMob = this.mobjects[mobjectName].mobject;
      parentMob.remove(parentMob.submobjects());
      for (let mobjectName of endMobjects) {
        parentMob.add(this.mobjects[mobjectName].mobject);
      }
    },
    /*  Updates the mobjects in this.scene according to the diff. Diffs have the
     *  form:
     *  {
     *    mobject1: {
     *      added: [false, true],
     *      style: {
     *        fillColor: [x, y],
     *        fillOpacity: [x, y],
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
      if ('mobjects' in diff) {
        for (let mobjectName of Object.keys(diff.mobjects)) {
          let mobjectDiff = diff['mobjects'][mobjectName];
          for (let attr of Object.keys(mobjectDiff)) {
            switch(attr) {
              case "added":
                this.applyAddDiff(mobjectName, mobjectDiff.added, reverse);
                break;
              case "style":
                this.applyStyleDiff(mobjectName, mobjectDiff.style, reverse);
                break;
              case "submobjects":
                this.applySubmobjectDiff(mobjectName, mobjectDiff.submobjects, reverse);
                break;
              default:
                // eslint-disable-next-line
                console.error(`Ignoring unknown Mobject diff attribute ${attr}`);
            }
          }
        }
      }
      if ('transformations' in diff) {
        for (let i = 0; i < diff.transformations.length; i++) {
          let transformation;
          if (!reverse) {
            transformation = diff.transformations[i];
          } else {
            transformation = diff.transformations[diff.transformations.length - i - 1];
          }
          let mobjectName = transformation[1];
          let transformationType = transformation[2];
          let transformationArgs = transformation.slice(3);
          switch (transformationType) {
            case 'rotate':
              this.mobjects[mobjectName].mobject.handleRotate(...transformationArgs, reverse);
              break;
            case 'shift':
              this.mobjects[mobjectName].mobject.handleShift(...transformationArgs, reverse);
              break;
            case 'scale':
              this.mobjects[mobjectName].mobject.handleScale(...transformationArgs, reverse);
              break;
            default: {
              // eslint-disable-next-line
              console.error(`Ignoring unknown transformation ${transformationType}`);
            }
          }
        }
      }
      this.scene.update();
    },
    updateDataReferences(mobjectName, mobject) {
      this.mobjects[mobjectName].mobject = mobject;
      if (!('submobjects' in this.mobjects[mobjectName])) {
        return;
      }
      for (let i = 0; i < this.mobjects[mobjectName].submobjects.length; i++) {
        let submobjectName = this.mobjects[mobjectName].submobjects[i];
        this.updateDataReferences(submobjectName, mobject.submobjects()[i]);
      }
    },
    jumpPostSetupFromAnimating: function() {
      // eslint-disable-next-line
      console.assert(this.animating);
      this.scene.clearAnimation();
      if (this.savedPreAnimationMobject !== undefined) {
        this.scene.remove(this.currentAnimation.animation.mobject);
        if (this.savedPreAnimationMobjectParent !== undefined) {
          this.savedPreAnimationMobjectParent.add(this.savedPreAnimationMobject);
        }
        // TODO: Is there no better way to do this? Possibly binding the Mobject
        // name to each Mobject?
        let savedPreAnimationMobjectName = this.currentAnimation.animation.mobjectNameFromArgs(
          this.currentAnimation.args
        );
        this.updateDataReferences(savedPreAnimationMobjectName, this.savedPreAnimationMobject);
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
        // A Mobject can be added if none of the Mobjects in its heirarchy are
        // in the scene.
        let namesInHeirarchy = this.getNamesInHeirarchy(mobjectName);
        for (let submobName of namesInHeirarchy) {
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
        ret = ret.concat(this.getNamesInHeirarchy(mobjectName));
      }
      return ret;
    },
    getNamesInHeirarchy: function(mobjectName) {
      if (this.mobjects[mobjectName] === undefined) {
        return [];
      }
      let ret = [mobjectName];
      let data = this.mobjects[mobjectName];
      if ("submobjects" in data) {
        for (let submobName of data.submobjects) {
          ret = _.concat(ret, this.getNamesInHeirarchy(submobName));
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
        html2canvas(document.getElementById('manim-background'))
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
