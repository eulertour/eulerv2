<template>
  <v-container
    fluid
    v-bind:style="{
      display: horizontalEmbedLayout ? 'flex' : 'block',
      height: height,
    }"
  >
    <v-row v-bind:class="{
      'column-container': horizontalLayout,
      'column-container-vertical': verticalLayout,
      'column-container-horizontal-embed': horizontalEmbedLayout,
    }">
      <v-col
        v-if="debug"
        v-bind:id="parentUid + 'debug'"
        class="title half-width"
      />
      <v-col
        class="d-flex flex-column"
        v-bind:class="{
          'ui-column': horizontalLayout,
          'ui-column-vertical': verticalLayout,
          'ui-column-horizontal-embed': horizontalEmbedLayout,
        }"
        v-bind:cols="horizontalEmbedLayout ? 'auto' : undefined"
      >
        <div
          class="d-flex flex-column"
          v-bind:class="{
            'ui-panels': horizontalLayout,
            'ui-panels-vertical': verticalLayout,
            'ui-panels-horizontal-embed': horizontalEmbedLayout,
            'code-width': uiScreen === CODE,
            'panels-width': sceneLoaded && uiScreen === PANELS && horizontalLayout,
            'panels-width-vertical': sceneLoaded && uiScreen === PANELS && verticalLayout,
            'panels-width-horizontal-embed': sceneLoaded && uiScreen === PANELS && horizontalEmbedLayout,
          }"
        >
        <v-toolbar
          elevation="5"
          max-height="64px"
          class="mb-2"
        >
          <v-toolbar-title>{{ project }}</v-toolbar-title>
          <v-spacer></v-spacer>
          <div v-if="animations.length > 0">
            <div v-for="screen in uiScreens" v-bind:key="screen">
              <v-btn fab text
                v-if="uiScreen !== screen"
                v-on:click="(code)=>$emit('switch-ui-screen', screen)"
              >
                <v-icon class="headline black--text">
                  {{ uiIcon(screen) }}
                </v-icon>
              </v-btn>
            </div>
          </div>
        </v-toolbar>
        <!-- Scrolling seems to only work if ancestors of this tag have
        height: 100% and display: flex -->
        <v-sheet
          v-if="sceneLoaded && uiScreen === PANELS"
          elevation="5"
          style="overflow-y: auto"
        >
          <Panels
            v-bind:unknown-animation="unknownAnimation"
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
        </v-sheet>
        <div
          v-else-if="sceneLoaded && uiScreen === CODE"
          class="d-flex flex-column flex-grow-1"
        >
          <CodeMirror
            v-bind:code="code"
            v-bind:parentUid="parentUid"
            v-on:update-code="(code)=>$emit('update-code', code)"
          />
          <div class="d-flex justify-space-between mt-4">
            <div style="width: 60%">
              <v-select
                v-bind:items="sceneChoices"
                v-model="chosenScene"
                label="Scene"
                solo
              />
            </div>
            <div v-if="$vuetify.breakpoint.smAndUp && !collapseEditorButtons">
              <v-btn
                class="mr-2"
                large
                min-height="48"
                v-on:click="$emit('refresh-scene-choices')"
              >
                <v-icon class="headline black--text">mdi-replay</v-icon>
              </v-btn>
              <v-btn
                large
                min-height="48"
                v-on:click="$emit('run-manim')"
              >
                <v-icon class="headline black--text mr-2">mdi-cube-outline</v-icon>
                <span class="title">Run</span>
              </v-btn>
            </div>
            <div v-else class="d-flex flex-grow-1 justify-center">
              <v-speed-dial v-model="dialOpen" style="z-index:10">
                <template v-slot:activator>
                  <v-btn fab v-model="dialOpen" height="48" width="48">
                    <v-icon v-if="dialOpen">mdi-close</v-icon>
                    <v-icon v-else>mdi-gesture-tap</v-icon>
                  </v-btn>
                </template>
                <v-btn v-on:click="$emit('refresh-scene-choices')" fab small>
                  <v-icon>mdi-replay</v-icon>
                </v-btn>
                <v-btn v-on:click="$emit('run-manim')" fab small>
                  <v-icon>mdi-cube-outline</v-icon>
                </v-btn>
              </v-speed-dial>
            </div>
          </div>
        </div>
        <v-card v-else class="d-flex justify-center align-center flex-grow-1">
          <v-progress-circular indeterminate/>
        </v-card>
        </div>
      </v-col>
      <v-col
        cols="auto"
        v-bind:class="{
          'manim-column': horizontalLayout,
          'manim-column-vertical': verticalLayout,
        }"
        class="d-flex flex-column"
      >
        <div v-bind:style="{width: canvasWidth + 'px'}">
          <div
            v-bind:id="parentUid + 'manim-background'"
            v-bind:style="{ position: 'relative' }"
            v-on:mouseover="$emit('display-canvas-menu', true)"
            v-on:mouseleave="$emit('display-canvas-menu', false)"
          >
            <div
              id="canvas-menu"
              class="grey lighten-2 flex-row-reverse"
              v-bind:style="{ display: displayCanvasMenu ? 'flex' : 'none' }"
            >
              <v-btn
                height="100%"
                class="canvas-menu-button"
                v-on:click="$emit('snapshot-canvas')"
              >
                <v-icon>mdi-camera</v-icon>
              </v-btn>
            </div>
          </div>
          <Timeline
            class="mt-2"
            v-bind:animations="animations"
            v-bind:index="animationIndex"
            v-bind:offset="animationOffset"
            v-bind:canvas-width="canvasWidth"
            v-bind:canvas-height="canvasHeight"
            v-on:new-animation="$emit('handle-new-animation')"
          />
          <VideoControls
            class="mt-2"
            v-if="sceneLoaded"
            v-on:play="(e)=>$emit('play', e, /*singleAnimationOnly=*/false)"
            v-on:replay="(e)=>$emit('replay', e, /*singleAnimationOnly=*/false)"
            v-on:pause="$emit('pause')"
            v-on:step-backward="$emit('step-backward')"
            v-on:step-forward="$emit('step-forward')"
            v-on:jump-post-animation="$emit('jump-post-animation')"
            v-on:jump-post-setup="(val)=>this.$emit('jump-post-setup', val)"
            v-bind:scene="scene"
            v-bind:finished="animationIndex === animations.length - 1 && animationOffset === 1"
          />
        </div>
      </v-col>
    </v-row>
    <div id="corner-button-container">
      <v-btn
        v-if="displayClose"
        class="display-1"
        v-on:click="$emit('close')"
        fab
      >
        <v-icon>mdi-close</v-icon>
      </v-btn>
      <!-- For testing different layout modes.
      <v-btn class="display-1 mr-4" v-on:click="$emit('vertical-toggle')" fab large>
        V
      </v-btn>
      <v-btn class="display-1 mr-4" v-on:click="$emit('horizontal-toggle')" fab large>
        H
      </v-btn>
      -->
      <!-- For displaying info and serialization
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
      -->
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
    inputHeight: Number,
    displayClose: Boolean,
    collapseEditorButtons: Boolean,
    parentUid: Number,
    layoutMode: String,
    unknownAnimation: Boolean,
    displayCanvasMenu: Boolean,
    animating: Boolean,
    animationHeaderStyle: Object,
    animationIndex: Number,
    animationIsValid: Boolean,
    animationOffset: Number,
    animations: Array,
    canvasWidth: Number,
    canvasHeight: Number,
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
    project: String,
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
  data() {
    return {
      dialOpen: false,
    }
  },
  components: {
    Timeline,
    VideoControls,
    CodeMirror,
    Panels,
  },
  computed: {
    verticalLayout() { return this.layoutMode === consts.MobjectLabContainerLayout.VERTICAL; },
    horizontalLayout() { return this.layoutMode === consts.MobjectLabContainerLayout.HORIZONTAL; },
    horizontalEmbedLayout() { return this.layoutMode === consts.MobjectLabContainerLayout.HORIZONTAL_EMBED; },
    height() {
      if (this.horizontalEmbedLayout) {
        if (this.inputHeight !== undefined) {
          return this.inputHeight;
        } else {
          return '630px';
        }
      } else {
        return 'auto';
      }
    },
    // For referencing screens from the template.
    CODE() { return consts.uiScreens.CODE; },
    DEBUG() { return consts.uiScreens.DEBUG; },
    PANELS() { return consts.uiScreens.PANELS; },
    uiScreens() { return Object.values(consts.uiScreens); },
    displayingPanels() { return this.uiScreen === consts.uiScreens.PANELS; },
    displayingCode() { return this.uiScreen === consts.uiScreens.CODE; },
    debugText() { return JSON.stringify(this.debugInfo, null, 4); },
    chosenScene: {
      get() { return this.chosenSceneProp; },
      set(val) { this.$emit('chosen-scene-update', val); }
    },
    releaseNotesDialog: {
      get() { return this.releaseNotesDialogProp; },
      set(val) { this.$emit('release-notes-dialog-update', val); }
    },
  },
  mounted() {
    this.$nextTick(function() {
      this.$emit('attach-two-to-scene');
    });
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
  },
  watch: {
    debug(debugging) {
      if (debugging) {
        this.$nextTick(function() {
          let container = document.getElementById(this.parentUid + "debug");
          if (container.childNodes.length !== 0) {
            container.childNodes[0].remove();
          }
          container.appendChild(new JSONFormatter(this.debugInfo).render());
        });
      }
    },
    debugInfo() {
      if (this.debug) {
        let container = document.getElementById(this.parentUid + "debug");
        if (container.childNodes.length !== 0) {
            container.childNodes[0].remove();
            container.appendChild(new JSONFormatter(this.debugInfo).render());
        }
      }
    }
  }
};
</script>

<style>
.column-container { height: 100%; }
.ui-column {
  align-items: flex-end;
  height: 100%;
}
.manim-column { align-items: start; }
#canvas-menu {
  position: absolute;
  height: 25px;
  right: 0;
}
.v-btn.canvas-menu-button {
  padding: 0 8px;
  min-width: 0;
}
#corner-button-container {
  position: fixed;
  right: 5px;
  bottom: 5px;
}
.ui-panels { height: 100%; }
.code-width { width: 100%; }
.panels-width { width: 500px; }

/* Overrides for vertical layout. */
.column-container-vertical { flex-direction: column; }
.ui-column-vertical {
  align-items: center;
  height: 610px;
}
.ui-panels-vertical {
  min-width: 0;
  height: 600px;
}
.panels-width-vertical { width: 640px; }
.manim-column-vertical { align-items: center; }

/* Overrides for horizontal embed layout. */
.column-container-horizontal-embed {
  height: auto;
  align-items: stretch;
  justify-content: center;
}
.ui-panels-horizontal-embed { height: 100%; }
.panels-width-horizontal-embed { width: 500px; }
</style>
