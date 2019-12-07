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
    v-bind:current-scene-diff="currentSceneDiff"
    v-bind:debug="debug"
    v-bind:display-code="displayCode"
    v-bind:expanded-panel-prop="expandedPanel"
    v-bind:mobject-choices="mobjectChoices"
    v-bind:mobjects="mobjects"
    v-bind:prior-scene="priorScene"
    v-bind:release-notes-dialog-prop="releaseNotesDialog"
    v-bind:release-notes="releaseNotes"
    v-bind:scene-before-animation="sceneBeforeAnimation"
    v-bind:scene-choices="sceneChoices"
    v-bind:scene-header-style="sceneHeaderStyle"
    v-bind:scene-is-valid="sceneIsValid"
    v-bind:scene-loaded="sceneLoaded"
    v-bind:scene="scene"
    v-on:chosen-scene-update="(val)=>{chosenScene=val}"
    v-on:code-change="toggleCode"
    v-on:debug-toggle="debug = !debug"
    v-on:expanded-panel-update="(val)=>{expandedPanel=val}"
    v-on:handle-arg-change="handleArgChange"
    v-on:handle-mobject-update="handleMobjectUpdate"
    v-on:handle-new-animation="handleNewAnimation"
    v-on:jump-to-animation-end="jumpToAnimationEnd"
    v-on:jump-to-animation-start="jumpToAnimationStart"
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
import chroma from "chroma-js";

import MobjectLab from "./MobjectLab.vue";

export default {
  name: "MobjectLabContainer",
  components: {
    MobjectLab
  },
  computed: {
    currentAnimation() {
      return this.animations[this.animationIndex];
    },
    currentSceneDiff: {
      get() {
        return this.sceneDiffs[this.animationIndex];
      },
      set(diff) {
        let newDiffs = _.cloneDeep(this.sceneDiffs);
        newDiffs[this.animationIndex] = diff;
        this.sceneDiffs = newDiffs;
      }
    },
    currentAnimationDiff: {
      get() {
        return this.animationDiffs[this.animationIndex];
      },
      set(diff) {
        let newDiffs = _.cloneDeep(this.animationDiffs);
        newDiffs[this.animationIndex] = diff;
        this.animationDiffs = newDiffs;
      }
    },
    animating() {
      return this.animationOffset !== 0 && this.animationOffset !== 1;
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
      return this.diffIsValidForScene(this.currentSceneDiff, this.priorScene);
    },
    animationIsValid() {
      if (!this.sceneLoaded) {
        return false;
      }
      return this.diffIsValidForScene(
        this.currentAnimationDiff,
        this.sceneBeforeAnimation
      );
    },
    sceneBeforeAnimation() {
      if (!this.sceneLoaded) {
        return [];
      }
      return this.diffPriorScene(this.priorScene, this.currentSceneDiff);
    }
  },
  data() {
    return {
      texToPathsMap: {},
      priorScene: [],
      expandedPanel: [1],
      releaseNotes: consts.RELEASE_NOTES,
      releaseNotesDialog: false,
      debug: true, // setting to false triggers a bug
      code: consts.EXAMPLE_CODE,
      displayCode: true,
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
        "Octagon"
      ],
      animationIndex: 0,
      animationOffset: 0,
      animations: [
        {
          className: "ReplacementTransform",
          description: "Morph one Mobject into another",
          args: ["mobject1", "mobject2"],
          argDescriptions: ["Start Mobject", "End Mobject"],
          durationSeconds: 1,
          animation: null
        }
      ],
      sceneDiffs: [
        // diffs are of the form:
        // {
        //   'add':    [mobject11, ...],
        //   'remove': [mobject21, ...],
        //   'modify': [[mobject31, forwardFunc, backwardFunc], ...],
        // }
      ],
      animationDiffs: [],
      mobjects: {},
      initialMobjects: {
        mobject1: {
          className: "Circle",
          params: {},
          position: [-1, 0],
          style: {
            strokeColor: "#fc6255ff",
            fillColor: "#00000000",
            strokeWidth: 4
          },
          mobject: null
        },
        mobject2: {
          className: "Square",
          params: {},
          position: [1, 0],
          style: {
            strokeColor: "#ffffffff",
            fillColor: "#00000000",
            strokeWidth: 4
          },
          mobject: null
        },
        mobject3: {
          className: "Square",
          params: {},
          position: [1, 0],
          style: {
            strokeColor: "#00ff00ff",
            fillColor: "#00000000",
            strokeWidth: 4
          },
          mobject: null
        }
      }
    };
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
        // Initialize Mobjects, Animations, and scene diffs
        for (let mobjectName of Object.keys(this.initialMobjects)) {
          let data = _.cloneDeep(this.initialMobjects[mobjectName]);
          this.setMobjectField(data);
          this.$set(this.mobjects, mobjectName, data);
        }
        this.currentAnimation.animation = this.buildCurrentAnimation();
        this.sceneDiffs = [{ add: ["mobject1"] }];
        this.currentAnimationDiff = Manim[
          this.currentAnimation.className
        ].getDiff(...this.currentAnimation.args, this.mobjects);
        this.applyDiff(
          this.currentSceneDiff,
          /*reverse=*/ false,
          /*moveCursor=*/ false
        );
        this.refreshSceneChoices();
        this.sceneLoaded = true;
      });
    });
  },
  methods: {
    runManim: function() {
      let scene = window.manimlib.get_scene(this.code, [this.chosenScene]);
      scene.render();

      /* scene.scenes_before_animation:
       *   A list of snapshots of the Scene before each Animation
       * scene.animation_list:
       *   A list of serialized Animations
       * scene.initial_mobject_dict:
       *   A mapping of ids to Mobjects
       */

      // Create a mapping from ids to human-readable names
      let mobjectIdsToNames = {};
      let mobjectIds = Object.keys(scene.initial_mobject_dict);
      for (let i = 0; i < mobjectIds.length; i++) {
        let id = mobjectIds[i];
        let mobjectData = scene.initial_mobject_dict[id];
        if (!utils.isGroupData(mobjectData)) {
          mobjectIdsToNames[id] = "mobject" + (i + 1);
        } else {
          mobjectIdsToNames[id] = "group" + (i + 1);
        }
      }

      // Assign human-readble names to the entries of the scene list
      let renameScene = scene => {
        let newScene = [];
        for (let mobData of scene) {
          let newMobData = {};
          newMobData["name"] = mobjectIdsToNames[mobData["name"]];
          newMobData["submobjects"] = renameScene(mobData["submobjects"]);
          newScene.push(newMobData);
        }
        return newScene;
      };

      let renameSceneList = sceneList => {
        let newSceneList = [];
        for (let scene of sceneList) {
          newSceneList.push(renameScene(scene));
        }
        return newSceneList;
      };

      scene.scenes_before_animation = renameSceneList(
        scene.scenes_before_animation
      );

      // Assign human-readable names to the arguments in the animation list
      let newAnimationList = _.cloneDeep(scene.animation_list);
      for (let i = 0; i < scene.animation_list.length; i++) {
        if ("args" in scene.animation_list[i]) {
          newAnimationList[i].args = scene.animation_list[i].args.map(
            id => mobjectIdsToNames[id]
          );
        }
      }

      // Initialize Mobject data
      let newMobjects = {};
      for (let id of Object.keys(scene.initial_mobject_dict)) {
        let mobjectData = scene.initial_mobject_dict[id];
        if (!utils.isGroupData(mobjectData) && !utils.isTexData(mobjectData)) {
          // TODO: Mobjects with top-level points can still function as Groups
          let strokeColor = mobjectData.style.strokeColor;
          let strokeOpacity = mobjectData.style.strokeOpacity;
          mobjectData.style.strokeColor = chroma(strokeColor)
            .alpha(strokeOpacity)
            .hex();
          delete mobjectData.style.strokeOpacity;

          let fillColor = mobjectData.style.fillColor;
          let fillOpacity = mobjectData.style.fillOpacity;
          mobjectData.style.fillColor = chroma(fillColor)
            .alpha(fillOpacity)
            .hex();
          delete mobjectData.style.fillOpacity;
        } else {
          let newSubmobjects = mobjectData.submobjects.map(
            id => mobjectIdsToNames[id]
          );
          mobjectData.submobjects = newSubmobjects;
        }
        newMobjects[mobjectIdsToNames[id]] = mobjectData;
      }

      /* SingleStringTexMobjects are converted to Paths and cached first, so
       * that TexSymbols can read the appropriate Path upon initialization.
       * TexSymbols are identified by their tex string (for a
       * SingleStringTexMobject in initial_mobject_dict) and position in the
       * resulting latex, e.g. (x^2, 1).
       */
      for (let mobjectName of Object.keys(newMobjects)) {
        let data = newMobjects[mobjectName];
        if (data.className === "SingleStringTexMobject") {
          let svgNode = window.MathJax.tex2svg(data.params.tex_string)
            .children[0];
          let texGroup = this.scene.interpret(svgNode);
          this.scene.remove(texGroup);

          // Convert anchors to absolute coordinates
          for (let path of utils.extractPathsFromGroup(texGroup)) {
            for (let v of path.vertices) {
              v.controls.left.add(v);
              v.controls.right.add(v);
              v.relative = false;
            }
          }

          // Convert all commands to C (and M)
          for (let path of utils.extractPathsFromGroup(texGroup)) {
            let lastMove;
            if (path.vertices[0].command === "M") {
              lastMove = path.vertices[0];
            }
            for (let i = 1; i < path.vertices.length; i++) {
              let previousVertex = path.vertices[i - 1];
              let currentVertex = path.vertices[i];
              if (currentVertex.command === "C") {
                continue;
              } else if (currentVertex.command === "L") {
                previousVertex.controls.right = previousVertex
                  .clone()
                  .lerp(currentVertex, 1 / 3);
                currentVertex.controls.left = previousVertex
                  .clone()
                  .lerp(currentVertex, 2 / 3);
                currentVertex.command = "C";
              } else if (currentVertex.command === "M") {
                lastMove = currentVertex;
              } else if (currentVertex.command === "Z") {
                currentVertex.copy(lastMove);
                previousVertex.controls.right = previousVertex
                  .clone()
                  .lerp(currentVertex, 1 / 3);
                currentVertex.controls.left = previousVertex
                  .clone()
                  .lerp(currentVertex, 2 / 3);
                currentVertex.command = "C";
              } else {
                // eslint-disable-next-line
                console.error(
                  "Encountered an unknown SVG command",
                  currentVertex.command
                );
              }
            }
          }
          this.texToPathsMap[data.params.tex_string] = texGroup;

          for (let index in data.submobjects) {
            let submobjectName = data.submobjects[index];
            let submobjectData = newMobjects[submobjectName];
            submobjectData["texString"] = data.params.tex_string;
            submobjectData["texIndex"] = index;
          }
        }
      }

      // Initialize TexMobjects
      for (let mobjectName of Object.keys(newMobjects)) {
        let data = newMobjects[mobjectName];
        if (data.className === "TexMobject") {
          this.setMobjectField(data);
        }
      }

      // Initialize Mobjects
      let groupNames = [];
      for (let mobjectName of Object.keys(newMobjects)) {
        let data = newMobjects[mobjectName];
        if (!utils.isGroupData(data) && !utils.isTexData(data)) {
          this.setMobjectField(data);
        } else if (utils.isGroupData(data)) {
          groupNames.push(mobjectName);
        }
      }

      // Initialize Groups
      for (let groupName of groupNames) {
        let data = newMobjects[groupName];
        this.setMobjectField(data, /*allMobjectData=*/ newMobjects);
      }

      // Create mutable node dict for use when computing scene diffs
      let nodeDict = {};
      for (let mobjectName of Object.keys(newMobjects)) {
        nodeDict[mobjectName] = {
          name: mobjectName,
          submobjects: newMobjects[mobjectName].submobjects
        };
      }

      // Create scene diffs
      let newAnimationDiffs = [];
      let newSceneDiffs = [];
      let tempScene = [];
      for (let i = 0; i < scene.scenes_before_animation.length; i++) {
        newSceneDiffs.push(
          utils.getDiffFromTwoScenes(
            tempScene,
            scene.scenes_before_animation[i]
          )
        );

        let diff = Manim[scene.animation_list[i].className].getDiff(
          ...scene.animation_list[i].args.map(id => mobjectIdsToNames[id]),
          newMobjects
        );
        newAnimationDiffs.push(diff);
        tempScene = utils.updateSceneWithDiff(
          scene.scenes_before_animation[i],
          diff,
          nodeDict
        );
      }

      this.mobjects = newMobjects;
      this.animations = newAnimationList;
      this.animationDiffs = newAnimationDiffs;
      this.sceneDiffs = newSceneDiffs;
      this.animationIndex = 0;
      this.animationOffset = 0;
      this.scene.clear();
      this.scene.clearAnimation();
      this.currentAnimation.animation = this.buildCurrentAnimation();
      this.scene.update();
      this.priorScene = [];
      this.currentSceneDiff = this.sceneDiffs[0];
      this.applyDiff(
        this.currentSceneDiff,
        /*reverse=*/ false,
        /*moveCursor=*/ false
      );
      // this.toggleCode();
      this.play(null, /*singleAnimationOnly=*/false);
    },
    toggleCode() {
      this.displayCode = !this.displayCode;
    },
    setMobjectField(mobjectData, allMobjectData = null) {
      if (mobjectData.className === "TexSymbol") {
        // just ensure that the (string, index) -> path mapping is valid
        // console.assert(
        //   mobjectData.texString in this.texToPathsMap,
        //   mobjectData,
        //   this.texToPathsMap
        // );
        // console.assert(
        //   this.texToPathsMap[mobjectData.texString][mobjectData.texIndex] !==
        //     undefined,
        //   mobjectData,
        //   this.texToPathsMap
        // );
        return;
      } else if (mobjectData.className === "SingleStringTexMobject") {
        mobjectData.mobject = new Manim.SingleStringTexMobject(
          mobjectData.params.tex_string,
          this.texToPathsMap[mobjectData.params.tex_string]
        );
      } else if (mobjectData.className === "TexMobject") {
        mobjectData.mobject = new Manim.TexMobject(
          mobjectData.params.tex_strings,
          this.texToPathsMap
        );
      } else if (!utils.isGroupData(mobjectData)) {
        let s = new Manim[mobjectData.className](mobjectData.params);
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
    buildCurrentAnimation: function() {
      let args = [];
      for (let mobjectName of this.currentAnimation.args) {
        let data = this.mobjects[mobjectName];
        // eslint-disable-next-line
        console.assert(data !== undefined, { name: mobjectName });
        // eslint-disable-next-line
        console.assert(data.mobject !== null, {
          name: mobjectName,
          mobjects: this.mobjects
        });
        args.push(data.mobject);
      }
      return new Manim[this.currentAnimation.className](...args);
    },
    chainNextAnimation: function() {
      if (this.animationIndex === this.animations.length - 1) {
        return;
      }
      this.stepForward();
      if (this.animationIsValid && this.sceneIsValid) {
        this.scene.playAnimation(
          this.currentAnimation.animation,
          /*onStep=*/ this.onAnimationStep,
          /*onAnimationFinished=*/ () => {
            this.applyDiff(this.currentAnimationDiff);
            this.chainNextAnimation();
          }
        );
      }
    },
    play: function(e, singleAnimationOnly = true) {
      this.playingSingleAnimation = singleAnimationOnly;
      if (this.animating) {
        this.scene.play();
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
      if (this.animationIsValid && this.sceneIsValid) {
        this.currentAnimation.animation = this.buildCurrentAnimation();
        this.scene.playAnimation(
          this.currentAnimation.animation,
          /*onStep=*/ this.onAnimationStep,
          /*onAnimationFinished=*/ () => {
            this.applyDiff(this.currentAnimationDiff);
            if (!this.playingSingleAnimation) {
              this.chainNextAnimation();
            }
          }
        );
      }
    },
    replay: function(e, singleAnimationOnly = true) {
      if (singleAnimationOnly) {
        this.jumpToAnimationStart();
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
    /*  Updates the mobjects in this.scene according to the diff. Diffs are of
     *  the form:
     *  {
     *    'add':    [mobject11, ...],
     *    'remove': [mobject21, ...],
     *    'modify': [[mobject31, forwardCommand, backwardCommand], ...],
     *  }
     */
    applyDiff: function(diff, reverse = false, moveCursor = true) {
      if (moveCursor) {
        this.animationOffset = reverse ? 0 : 1;
      }
      if (_.isEmpty(diff)) {
        return;
      }
      let diffCopy = _.cloneDeep(diff);
      diffCopy["add"] = diff["add"] || [];
      diffCopy["remove"] = diff["remove"] || [];
      diffCopy["modify"] = diff["modify"] || [];
      if (reverse) {
        diffCopy = utils.getReversedDiff(diff);
      }
      for (let mobjectName of diffCopy["add"]) {
        let postponeUntilModify = utils
          .getMobjectsAddedToParent(diffCopy)
          .includes(mobjectName);
        if (!postponeUntilModify) {
          let mobjectData = this.mobjects[mobjectName];
          this.setMobjectField(mobjectData);
          this.scene.add(mobjectData.mobject);
        }
      }
      for (let mobjectName of diffCopy["remove"]) {
        let postponeUntilModify = utils
          .getMobjectsRemovedFromParent(diffCopy)
          .includes(mobjectName);
        if (!postponeUntilModify) {
          let mobjectData = this.mobjects[mobjectName];
          this.scene.remove(mobjectData.mobject);
          this.setMobjectField(mobjectData);
        }
      }
      for (let [mobjectName, modifyFunc] of diffCopy["modify"]) {
        let mobjectData = this.mobjects[mobjectName];
        // eslint-disable-next-line
        console.assert(
          mobjectData.mobject && this.scene.contains(mobjectData.mobject),
          `attempt to modify ${mobjectName} when it isn't in the scene`
        );

        // Commands have the form "add mobject1", "remove mobject1", etc.
        let removedMobjects = [];
        let [command, arg] = modifyFunc.split(" ");
        switch (command) {
          case "add":
            mobjectData.submobjects.push(arg);
            break;
          case "remove":
            _.remove(mobjectData.submobjects, name => name === arg);
            removedMobjects.push(arg);
            break;
          default:
            // eslint-disable-next-line
            console.error("Invalid modification command", modificationString);
        }
        this.scene.remove(mobjectData.mobject);
        this.setMobjectField(mobjectData);
        this.scene.add(mobjectData.mobject);
        for (let mobjectName of removedMobjects) {
          this.setMobjectField(this.mobjects[mobjectName]);
        }
      }
      this.scene.update();
    },
    jumpToAnimationStart: function() {
      if (this.animationOffset === 0) {
        return;
      } else if (this.animationOffset < 1) {
        // eslint-disable-next-line
        console.assert(this.animationIsValid);
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
        this.applyDiff(
          this.currentAnimationDiff,
          /*reverse=*/ true,
          /*moveCursor=*/ true
        );
      }
      this.animationOffset = 0;
    },
    jumpToAnimationEnd: function() {
      if (this.animationOffset === 1) {
        return;
      } else if (this.animationOffset < 1) {
        this.jumpToAnimationStart();
      }
      if (this.animationIsValid && this.sceneIsValid) {
        this.applyDiff(this.currentAnimationDiff);
      }
    },
    stepForward: function() {
      if (!this.sceneIsValid || !this.animationIsValid) {
        return;
      }
      this.jumpToAnimationEnd();
      if (this.animationIndex < this.animations.length - 1) {
        this.sceneDiffs[this.animationIndex] = this.currentSceneDiff;
        this.stepPriorSceneForward();
        this.animationIndex += 1;
        this.animationOffset = 0;
        this.currentAnimation.animation = this.buildCurrentAnimation();
        this.currentSceneDiff = this.sceneDiffs[this.animationIndex];
        if (this.sceneIsValid) {
          this.applyDiff(
            this.currentSceneDiff,
            /*reverse=*/ false,
            /*moveCursor=*/ false
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
          /*reverse=*/ true,
          /*moveCursor=*/ false
        );
        this.sceneDiffs[this.animationIndex] = this.currentSceneDiff;
        this.animationIndex -= 1;
        this.animationOffset = 1;
        this.currentAnimation.animation = this.buildCurrentAnimation();
        this.stepPriorSceneBackward();
        this.jumpToAnimationStart();
      }
    },
    onAnimationStep: function(elapsedSeconds) {
      this.animationOffset = elapsedSeconds;
    },
    handleMobjectUpdate(mobjectName, attr, val) {
      // eslint-disable-next-line
      console.assert(
        this.scene.contains(this.mobjects[mobjectName].mobject),
        "modified mobject that isn't in the scene"
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
        this.mobjects[mobjectName].mobject
      );
      this.scene.update();
    },
    handleNewAnimation() {
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
        description: "Hold a still frame",
        durationSeconds: 1,
        args: [],
        argDescriptions: []
      });
      this.sceneDiffs.push({});
      this.animationDiffs.push(Manim["Wait"].getDiff([], this.mobjects));
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
          strokeWidth: 4
        },
        mobject: null
      };
      this.setMobjectField(newMobjectData);
      this.$set(
        this.mobjects,
        "mobject" + (Object.keys(this.mobjects).length + 1),
        newMobjectData
      );
    },
    handleArgChange(argNum, arg) {
      if (this.animationOffset === 1) {
        this.applyDiff(
          this.currentAnimationDiff,
          /*reverse=*/ true,
          /*moveCursor=*/ false
        );
      }
      let newArgs = _.cloneDeep(this.currentAnimation.args);
      newArgs[argNum] = arg;
      this.currentAnimation.args = newArgs;
      this.currentAnimationDiff = Manim[
        this.currentAnimation.className
      ].getDiff(...this.currentAnimation.args, this.mobjects);
      if (this.animationOffset === 1) {
        this.applyDiff(
          this.currentAnimationDiff,
          /*reverse=*/ false,
          /*moveCursor=*/ false
        );
      }
    },
    updateSetup(action, newSelection) {
      if (this.animationOffset === 1) {
        this.applyDiff(
          this.currentAnimationDiff,
          /*reverse=*/ true,
          /*moveCursor=*/ false
        );
      }
      this.applyDiff(
        this.currentSceneDiff,
        /*reverse=*/ true,
        /*moveCursor=*/ false
      );
      let newDiff = _.cloneDeep(this.currentSceneDiff);
      newDiff[action] = newSelection;
      this.currentSceneDiff = newDiff;
      this.applyDiff(
        this.currentSceneDiff,
        /*reverse=*/ false,
        /*moveCursor=*/ false
      );
      if (this.animationOffset === 1 && this.animationIsValid) {
        this.applyDiff(
          this.currentAnimationDiff,
          /*reverse=*/ false,
          /*moveCursor=*/ false
        );
      }
    },
    refreshSceneChoices() {
      this.sceneChoices = window.manimlib.get_scene_choices(this.code);
    },
    diffIsValidForScene(diff, scene) {
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
    getNamesInScene(scene) {
      let ret = [];
      for (let mobjectName of scene) {
        ret = ret.concat(this.getNamesInHeirarchy(mobjectName));
      }
      return ret;
    },
    getNamesInHeirarchy(mobjectName) {
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
    stepPriorSceneForward() {
      let newScene = _.cloneDeep(this.priorScene);
      newScene = this.diffPriorScene(
        newScene,
        utils.getFullDiff(this.currentSceneDiff)
      );
      newScene = this.diffPriorScene(
        newScene,
        utils.getFullDiff(this.currentAnimationDiff)
      );
      this.priorScene = newScene;
    },
    stepPriorSceneBackward() {
      let newScene = _.cloneDeep(this.priorScene);
      newScene = this.diffPriorScene(
        newScene,
        utils.getReversedDiff(this.currentAnimationDiff)
      );
      newScene = this.diffPriorScene(
        newScene,
        utils.getReversedDiff(this.currentSceneDiff)
      );
      this.priorScene = newScene;
    },
    diffPriorScene(scene, diff) {
      diff = utils.getFullDiff(diff);
      scene = _.concat(
        scene,
        _.difference(diff["add"], utils.getMobjectsAddedToParent(diff))
      );
      scene = _.difference(
        scene,
        _.difference(diff["remove"], utils.getMobjectsRemovedFromParent(diff))
      );
      return scene;
    }
  }
};
</script>
