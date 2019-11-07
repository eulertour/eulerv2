<template>
  <div id="debug-container" class="title mt-5 pa-4" v-if="visible">
    <div class="headline">Prior Scene</div>
    <div id="prior-scene-container" class="mb-4"/>

    <div class="headline">
      Scene Diff
      <v-icon v-if="!$store.getters.sceneIsValid" color="red">
        mdi-alert-circle
      </v-icon>
    </div>
    <div id="scene-diff-container" class="mb-4"/>

    <div class="headline">
      Animation Diff
      <v-icon v-if="!$store.getters.animationIsValid" color="red">
        mdi-alert-circle
      </v-icon>
    </div>
    <div id="animation-diff-container"/>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import JSONFormatter from 'json-formatter-js'

export default {
  name: 'DebugPanel',
  props: {
    visible: Boolean, 
  },
  data() {
    return {
      needsJsonUpdate: false,
    }
  },
  computed: mapState({
    priorScene: 'priorScene',
    sceneDiff: 'sceneDiff',
    sceneIsValid: 'sceneIsValid',
    animationDiff: 'animationDiff',
    animationIsValid: 'animationIsValid',
  }),
  mounted() {
    this.updateJson("prior-scene-container", this.priorScene);
    this.updateJson("scene-diff-container", this.sceneDiff);
    this.updateJson("animation-diff-container", this.animationDiff);
  },
  watch: {
    priorScene(newPriorScene) {
      this.updateJson("prior-scene-container", newPriorScene);
    }, 
    sceneDiff(newSceneDiff) {
      this.updateJson("scene-diff-container", newSceneDiff);
    },
    animationDiff(newAnimationDiff) {
      this.updateJson("animation-diff-container", newAnimationDiff);
    },
    visible(newlyVisible) {
      this.needsJsonUpdate = newlyVisible;
    }
  },
  updated() {
    if (this.needsJsonUpdate) {
      this.updateJson("prior-scene-container", this.priorScene);
      this.updateJson("scene-diff-container", this.sceneDiff);
      this.updateJson("animation-diff-container", this.animationDiff);
      this.needsJsonUpdate = false;
    }
  },
  methods: {
    updateJson(containerId, json) {
      let container = document.getElementById(containerId);
      if (container.childNodes.length !== 0) {
        container.childNodes[0].remove();
      }
      container.appendChild(new JSONFormatter(json).render());
    }
  }
}
</script>

<style>
#debug-container {
  width: 100%;
  border: 1px solid black;
}
</style>
