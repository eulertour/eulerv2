<template>
  <div id="debug-container" class="title d-flex align-self-end mt-5 pa-4" v-if="visible">
    <div class="mr-8">
      <div class="headline">Prior Scene</div>
      <div id="prior-scene-container" class="mb-4"/>

      <div class="headline">
        Scene Diff
        <v-icon v-if="!sceneIsValid" color="red">
          mdi-alert-circle
        </v-icon>
      </div>
      <div id="scene-diff-container" class="mb-4"/>

      <div class="headline">
        Animation Diff
        <v-icon v-if="!animationIsValid" color="red">
          mdi-alert-circle
        </v-icon>
      </div>
      <div id="animation-diff-container"/>
    </div>
    <div>
      <div class="headline">
        Mobjects
      </div>
      <div id="mobject-container"/>
    </div>
  </div>
</template>

<script>
import JSONFormatter from 'json-formatter-js'

export default {
  name: 'DebugPanel',
  props: {
    visible: Boolean, 
    mobjects: Object,
    sceneIsValid: Boolean,
    animationIsValid: Boolean,
    priorScene: Array,
    sceneDiff: Object,
    animationDiff: Object,
  },
  data() {
    return {
      needsJsonUpdate: false,
    }
  },
  computed: {

  },
  mounted() {
    this.updateJson("prior-scene-container", this.priorScene);
    this.updateJson("scene-diff-container", this.sceneDiff);
    this.updateJson("animation-diff-container", this.animationDiff);
    this.updateJson("mobject-container", this.mobjects);
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
    mobjects(newMobjects) {
      this.updateJson("mobject-container", newMobjects);
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
      this.updateJson("mobject-container", this.mobjects);
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
  width: 700px;
  border: 1px solid black;
}
</style>
