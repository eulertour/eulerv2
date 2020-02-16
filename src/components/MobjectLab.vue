<template>
  <v-container class="mt-7 mb-5">
    <v-row
      justify="center"
    >
      <v-col id="debug" class="headline mx-2" />
      <v-col cols="6" class="d-flex flex-column">
        <v-toolbar width="100%" max-height="64px" class="mb-2">
          <v-toolbar-title>example_scenes.py</v-toolbar-title>
          <v-spacer></v-spacer>
          <div v-for="screen in uiScreens" v-bind:key="screen">
            <v-btn v-if="uiScreen !== screen" fab text v-on:click="(code)=>$emit('switch-ui-screen', screen)">
              <v-icon
                class="headline black--text"
              >{{ uiIcon(screen) }}</v-icon>
            </v-btn>
          </div>
        </v-toolbar>
        <div v-if="sceneLoaded && uiScreen === PANELS">
          <Panels
            v-bind:animating="animating"
            v-bind:animation-header-style="animationHeaderStyle"
            v-bind:animation-offset="animationOffset"
            v-bind:current-animation-diff="currentAnimationDiff"
            v-bind:current-animation="currentAnimation"
            v-bind:current-scene-diff="currentSceneDiff"
            v-bind:expanded-panel-prop="expandedPanel"
            v-bind:mobject-choices="mobjectChoices"
            v-bind:mobjects="mobjects"
            v-bind:post-animation-mobjects="postAnimationMobjects"
            v-bind:post-animation="postAnimation"
            v-bind:post-setup-mobjects="postSetupMobjects"
            v-bind:post-setup="postSetup"
            v-bind:pre-setup-mobjects="preSetupMobjects"
            v-bind:pre-setup="preSetup"
            v-bind:scene-header-style="sceneHeaderStyle"
            v-bind:scene="scene"
            v-on:arg-change="(argNum, arg)=>$emit('arg-change', argNum, arg)"
            v-on:config-change="(key, val)=>$emit('config-change', key, val)"
            v-on:expanded-panel-update="(val)=>this.$emit('expanded-panel-update', val)"
            v-on:jump-post-animation="$emit('jump-post-animation')"
            v-on:jump-post-setup="(val)=>this.$emit('jump-post-setup', val)"
            v-on:jump-pre-setup="(val)=>this.$emit('jump-pre-setup', val)"
            v-on:mobject-update="(mobjectName, attr, val)=>$emit('mobject-update', mobjectName, attr, val)"
            v-on:pause="(e)=>$emit('pause')"
            v-on:play="(e)=>$emit('play')"
            v-on:replay="(e)=>$emit('replay')"
            v-on:update-setup="(action, newSelection)=>$emit('update-setup', action, newSelection)"
          />
        </div>
        <CodeMirror
          v-else-if="sceneLoaded && uiScreen === CODE"
          v-bind:code="code"
          v-on:update-code="(code)=>$emit('update-code', code)"
        />
        <v-card v-else class="d-flex justify-center align-center" height="500px" width="100%">
          <v-progress-circular indeterminate />
        </v-card>
        <div v-if="uiScreen === CODE" class="d-flex justify-space-between mt-4" style="width:100%">
          <div style="width:60%">
            <v-select v-bind:items="sceneChoices" v-model="chosenScene" label="Scene" solo></v-select>
          </div>
          <div>
            <v-btn class="mr-2" large v-on:click="$emit('refresh-scene-choices')">
              <v-icon class="headline black--text">mdi-replay</v-icon>
            </v-btn>
            <v-btn large v-on:click="$emit('run-manim')">
              <v-icon class="headline black--text mr-2">mdi-cube-outline</v-icon>
              <span class="title">Render</span>
            </v-btn>
          </div>
        </div>
      </v-col>
      <v-col>
        <div id="manim-background" />
        <Timeline
          class="mt-2"
          v-bind:animations="animations"
          v-bind:index="animationIndex"
          v-bind:offset="animationOffset"
          v-on:new-animation="$emit('handle-new-animation')"
        />
        <VideoControls
          v-if="sceneLoaded"
          v-on:play="(e)=>$emit('play', e, /*singleAnimationOnly=*/false)"
          v-on:replay="(e)=>$emit('replay', e, /*singleAnimationOnly=*/false)"
          v-on:pause="$emit('pause')"
          v-on:step-backward="$emit('step-backward')"
          v-on:step-forward="$emit('step-forward')"
          v-bind:scene="scene"
          v-bind:finished="animationIndex === animations.length - 1 && animationOffset === 1"
        />
      </v-col>
    </v-row>
    <div class="corner-button-container">
      <v-btn class="mr-4" v-on:click="$emit('debug-toggle')" fab large>
        <v-icon large>mdi-bug</v-icon>
      </v-btn>
      <v-dialog v-model="releaseNotesDialog" width="500px">
        <template v-slot:activator="{ on }">
          <v-btn v-on="on" fab large>
            <v-icon large>mdi-information</v-icon>
          </v-btn>
        </template>
        <v-card>
          <v-card-title class="headline grey lighten-2 mb-3" primary-title>Release Notes</v-card-title>
          <v-card-text class="title">
            <span v-html="releaseNotes"></span>
          </v-card-text>
          <v-divider></v-divider>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="primary" text v-on:click="$emit('release-notes-dialog-update', false)">Got it</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>
  </v-container>
</template>

<script>
import Timeline from "./Timeline.vue";
import VideoControls from "./VideoControls.vue";
import CodeMirror from "./CodeMirror.vue";
import Panels from "./Panels.vue";
import * as consts from "../constants.js";
import JSONFormatter from 'json-formatter-js'

export default {
  name: "MobjectLab",
  props: {
    animating: Boolean,
    animationHeaderStyle: Object,
    animationIndex: Number,
    animationIsValid: Boolean,
    animationOffset: Number,
    animations: Array,
    chosenSceneProp: String,
    code: String,
    currentAnimation: Object,
    currentAnimationDiff: Object,
    currentSceneDiff: Object,
    debug: Boolean,
    debugInfo: Object,
    uiScreen: String,
    expandedPanel: Array,
    mobjectChoices: Array,
    mobjects: Object,
    pause: Boolean,
    preSetup: Boolean,
    postSetup: Boolean,
    postAnimation: Boolean,
    preSetupMobjects: Array,
    postSetupMobjects: Array,
    postAnimationMobjects: Array,
    releaseNotes: String,
    releaseNotesDialogProp: Boolean,
    scene: Object,
    sceneChoices: Array,
    sceneHeaderStyle: Object,
    sceneIsValid: Boolean,
    sceneLoaded: Boolean,
  },
  components: {
    Timeline,
    VideoControls,
    CodeMirror,
    Panels,
  },
  computed: {
    debugText() {
      return JSON.stringify(this.debugInfo, null, 4);
    },
    CODE() { return consts.uiScreens.CODE; },
    DEBUG() { return consts.uiScreens.DEBUG; },
    PANELS() { return consts.uiScreens.PANELS; },
    uiScreens() {
      return Object.values(consts.uiScreens);
    },
    chosenScene: {
      get() { return this.chosenSceneProp; },
      set(val) { this.$emit('chosen-scene-update', val); }
    },
    releaseNotesDialog: {
      get() { return this.releaseNotesDialogProp; },
      set(val) { this.$emit('release-notes-dialog-update', val); }
    },
  },
  methods: {
    uiIcon(uiScreen) {
      switch(uiScreen) {
        case consts.uiScreens.CODE:
          return "mdi-code-braces";
        case consts.uiScreens.PANELS:
          return "mdi-view-agenda";
        case consts.uiScreens.DEBUG:
          return "mdi-bug";
        default:
          // eslint-disable-next-line
          console.error(`No icon for unknown UI screen ${uiScreen}`);
      }
    },
    updateLatex(tex) {
      let texOutput = document.getElementById("tex-output");
      let children = texOutput.childNodes;
      if (children.length > 0) {
        texOutput.removeChild(texOutput.childNodes[0]);
      }
      let html = window.MathJax.tex2svg(tex);
      texOutput.appendChild(html);
    }
  },
  watch: {
    debug(debugging) {
      let container = document.getElementById("debug");
      if (debugging) {
        container.appendChild(new JSONFormatter(this.debugInfo).render());
      } else {
        if (container.childNodes.length !== 0) {
          container.childNodes[0].remove();
        }
      }
    },
    debugInfo() {
      let container = document.getElementById("debug");
      if (container.childNodes.length !== 0) {
          container.childNodes[0].remove();
          container.appendChild(new JSONFormatter(this.debugInfo).render());
      }
    }
    // uiScreen(newUiScreen) {
    //   this.$nextTick(function() {
    //     if (newUiScreen === consts.uiScreens.DEBUG) {
    //       let container = document.getElementById("debug");
    //       container.appendChild(new JSONFormatter(this.debugInfo).render());
    //     } else {
    //       // Is this even correct?
    //       let container = document.getElementsByClassName("json-formatter-row")[0];
    //       if (container) {
    //         container.parentElement.childNodes[0].remove();
    //       }
    //     }
    //   });
    // }
  }
};
</script>

<style scoped>
#manim-background {
  width: 640px;
  height: 360px;
  background-color: black;
}
.corner-button-container {
  position: fixed;
  right: 25px;
  bottom: 25px;
}
</style>
