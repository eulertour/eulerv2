<template>
  <v-expansion-panels v-model="expandedPanel" multiple accordion>
    <v-expansion-panel>
      <v-expansion-panel-header>
        <span v-bind:style="sceneHeaderStyle">Setup</span>
      </v-expansion-panel-header>
      <v-expansion-panel-content>
        <SetupPanel
          v-bind:setup="currentSceneDiff"
          v-bind:animationData="currentAnimation"
          v-bind:mobjects="mobjects"
          v-bind:scene="scene"
          v-bind:animating="animating"
          v-bind:pre-setup="preSetup"
          v-bind:post-setup="postSetup"
          v-bind:pre-setup-mobjects="preSetupMobjects"
          v-bind:post-setup-mobjects="postSetupMobjects"
          v-bind:post-animation-mobjects="postAnimationMobjects"
          v-on:jump-pre-setup="$emit('jump-pre-setup')"
          v-on:jump-post-setup="$emit('jump-post-setup')"
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
          v-bind:unknown-animation="unknownAnimation"
          v-bind:animating="animating"
          v-bind:animation-data="currentAnimation"
          v-bind:animation-offset="animationOffset"
          v-bind:mobject-data="mobjects"
          v-bind:scene="scene"
          v-bind:setup="currentSceneDiff"
          v-bind:post-setup="postSetup"
          v-bind:post-animation="postAnimation"
          v-bind:animation-diff="currentAnimationDiff"
          v-bind:post-setup-mobjects="postSetupMobjects"
          v-bind:post-animation-mobjects="postAnimationMobjects"
          v-on:arg-change="(argNum, arg)=>$emit('arg-change', argNum, arg)"
          v-on:config-change="(key, val)=>$emit('config-change', key, val)"
          v-on:jump-post-animation="$emit('jump-post-animation')"
          v-on:jump-post-setup="$emit('jump-post-setup')"
          v-on:pause="(e)=>$emit('pause')"
          v-on:play="(e)=>$emit('play')"
          v-on:replay="(e)=>$emit('replay')"
        />
      </v-expansion-panel-content>
    </v-expansion-panel>
  </v-expansion-panels>
</template>

<script>
import AnimationPanel from "./AnimationPanel.vue";
import SetupPanel from "./SetupPanel.vue";

export default {
  name: "Panels",
  components: {
    AnimationPanel,
    SetupPanel,
  },
  props: {
    unknownAnimation: Boolean,
    expandedPanelProp: Array,
    currentSceneDiff: Object,
    sceneHeaderStyle: Object,
    currentAnimation: Object,
    mobjects: Object,
    scene: Object,
    animationOffset: Number,
    postAnimation: Boolean,
    currentAnimationDiff: Object,
    animating: Boolean,
    mobjectChoices: Array,
    postAnimationMobjects: Array,
    preSetup: Boolean,
    postSetup: Boolean,
    preSetupMobjects: Array,
    animationHeaderStyle: Object,
    postSetupMobjects: Array,
  },
  computed: {
    expandedPanel: {
      get() { return this.expandedPanelProp; },
      set(val) { this.$emit('expanded-panel-update', val); }
    },
  }
}
</script>

<style>
</style>
