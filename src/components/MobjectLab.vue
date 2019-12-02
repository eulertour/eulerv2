<template>
  <div>
    <div class="d-flex justify-center align-top mt-7 mb-5">
      <div
        class="left-side d-flex flex-column justify-start align-center mr-4"
        v-bind:class="{ 'code-width': displayCode, 'panel-width': !displayCode }"
      >
        <v-toolbar width="100%" max-height="64px" class="mb-2">
          <v-toolbar-title>example_scenes.py</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-btn fab text v-on:click="(code)=>$emit('code-change', code)">
            <v-icon
              class="headline black--text"
            >{{"mdi-" + (displayCode ? "view-agenda" : "code-braces")}}</v-icon>
          </v-btn>
        </v-toolbar>
        <div v-if="sceneLoaded && !displayCode" class="expansion-panel-container">
          <v-expansion-panels v-model="expandedPanel" multiple>
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
                  v-on:update-setup="(action, newSelection)=>$emit('update-setup', action, newSelection)"
                />
              </v-expansion-panel-content>
            </v-expansion-panel>
            <v-expansion-panel>
              <v-expansion-panel-header>
                <span v-bind:style="animationHeaderStyle">Animation</span>
              </v-expansion-panel-header>
              <v-expansion-panel-content>
                <AnimationPanel
                  v-bind:animating="animating"
                  v-bind:animation-data="currentAnimation"
                  v-bind:animation-offset="animationOffset"
                  v-bind:mobject-data="mobjects"
                  v-bind:scene="scene"
                  v-bind:setup="currentSceneDiff"
                  v-bind:animation-diff="currentAnimationDiff"
                  v-bind:scene-before-animation="sceneBeforeAnimation"
                  v-on:arg-change="(argNum, arg)=>$emit('handle-arg-change', argNum, arg)"
                  v-on:jump-to-end="$emit('jump-to-animation-end')"
                  v-on:jump-to-start="$emit('jump-to-animation-start')"
                  v-on:pause="(e)=>$emit('pause')"
                  v-on:play="(e)=>$emit('play')"
                  v-on:replay="(e)=>$emit('replay')"
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
                        v-on:mobject-update="(mobjectName, attr, val)=>$emit('handle-mobject-update', mobjectName, attr, val)"
                      />
                    </v-expansion-panel-content>
                  </v-expansion-panel>
                </v-expansion-panels>
                <div class="d-flex justify-space-around mt-4">
                  <v-btn fab v-on:click="$emit('new-mobject')">
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
          v-on:update-code="(code)=>$emit('update-code', code)"
        />
        <v-card v-else class="d-flex justify-center align-center" height="500px" width="100%">
          <v-progress-circular indeterminate />
        </v-card>
        <div v-if="displayCode" class="d-flex justify-space-between mt-4" style="width:100%">
          <div style="width:70%">
            <v-select v-bind:items="sceneChoices" v-model="chosenScene" label="Scene" solo></v-select>
          </div>
          <v-btn large v-on:click="$emit('run-manim')">
            <v-icon class="headline black--text mr-2">mdi-cube-outline</v-icon>
            <span class="title">Render</span>
          </v-btn>
        </div>
      </div>
      <div id="visualization-placeholder">
        <div id="visualization">
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
        </div>
      </div>
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
    </div>
    <div class="d-flex justify-center align-center">
      <div class="mr-7">
        <div class="d-flex justify-center">
          <div style="width:300px">
            <v-textarea v-model="tex" label="tex"></v-textarea>
          </div>
          <v-btn color="primary" v-on:click="updateLatex(tex)">Render Tex</v-btn>
        </div>
        <div id="tex-output"></div>
      </div>
      <DebugPanel
        v-bind:animation-diff="currentAnimationDiff"
        v-bind:animation-is-valid="animationIsValid"
        v-bind:mobjects="mobjects"
        v-bind:prior-scene="priorScene"
        v-bind:scene-diff="currentSceneDiff"
        v-bind:scene-is-valid="sceneIsValid"
        v-bind:visible="debug"
      />
    </div>
  </div>
</template>

<script>
import AnimationPanel from "./AnimationPanel.vue";
import MobjectPanel from "./MobjectPanel.vue";
import SetupPanel from "./SetupPanel.vue";
import Timeline from "./Timeline.vue";
import VideoControls from "./VideoControls.vue";
import CodeMirror from "./CodeMirror.vue";
import DebugPanel from "./DebugPanel.vue";

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
    displayCode: Boolean,
    expandedPanelProp: Array,
    mobjectChoices: Array,
    mobjects: Object,
    pause: Boolean,
    priorScene: Array,
    releaseNotes: String,
    releaseNotesDialogProp: Boolean,
    scene: Object,
    sceneBeforeAnimation: Array,
    sceneChoices: Array,
    sceneHeaderStyle: Object,
    sceneIsValid: Boolean,
    sceneLoaded: Boolean,
  },
  components: {
    AnimationPanel,
    MobjectPanel,
    SetupPanel,
    Timeline,
    VideoControls,
    CodeMirror,
    DebugPanel
  },
  computed: {
    expandedPanel: {
      get() { return this.expandedPanelProp; },
      set(val) { this.$emit('expanded-panel-update', val); }
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
  data() {
    return {
      tex: "x^2 + 2x + 5",
    };
  },
  mounted() {

  },
  methods: {
    updateLatex(tex) {
      let texOutput = document.getElementById("tex-output");
      let children = texOutput.childNodes;
      if (children.length > 0) {
        texOutput.removeChild(texOutput.childNodes[0]);
      }
      let html = window.MathJax.tex2svg(tex);
      texOutput.appendChild(html);
    }
  }
};
</script>

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
