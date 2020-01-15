<template>
  <div>
  <div class="title mb-5">
    Post-Scene Mobjects:
    <v-chip-group v-if="postSceneMobjects.length > 0">
      <v-chip v-for="mobjectName in postSceneMobjects" v-bind:key="'postScene' + mobjectName">
        {{ mobjectName }}
      </v-chip>
    </v-chip-group>
    <div v-else>
      None
    </div>
  </div>

  <div class="pa-0">
    <div class="display-1">{{ animationData.className }}</div>
  </div>
  <div class="subtitle-1 mb-2">{{ animationData.description }}</div>
  <component
    v-bind:animating="animating"
    v-bind:animation-data="animationData"
    v-bind:animation-diff="animationDiff"
    v-bind:animation-offset="animationOffset"
    v-bind:is="animationComponent"
    v-bind:mobject-classes="mobjectClasses"
    v-bind:mobject-data="mobjectData"
    v-bind:scene-before-animation="sceneBeforeAnimation"
    v-bind:post-scene-mobjects="postSceneMobjects"
    v-bind:scene="scene"
    v-bind:setup="setup"
    v-on:arg-change="(argNum, arg)=>$emit('arg-change', argNum, arg)"
  />
  <div class="mb-10"></div>
  <div class="d-flex justify-center pa-0">
    <v-btn fab v-on:click="$emit('jump-to-start')" class="mx-2">
      <v-icon color="black" x-large>mdi-skip-previous</v-icon>
    </v-btn>
    <v-btn fab v-if="this.scene.playing" v-on:click="$emit('pause')" class="mx-4">
      <v-icon color="black" x-large>mdi-pause</v-icon>
    </v-btn>
    <v-btn
      fab
      v-else-if="animationOffset === 1"
      v-on:click="$emit('replay', $event)"
      class="mx-4"
    >
      <v-icon color="black" x-large>mdi-replay</v-icon>
    </v-btn>
    <v-btn
      fab
      v-else
      v-on:click="$emit('play', $event)"
      class="mx-4"
    >
      <v-icon color="black" x-large>mdi-play</v-icon>
    </v-btn>
    <v-btn fab v-on:click="$emit('jump-to-end')" class="mx-2">
      <v-icon color="black" x-large>mdi-skip-next</v-icon>
    </v-btn>
  </div>
  </div>
</template>

<script>
import ReplacementTransformPanel from './ReplacementTransformPanel.vue'
import WaitPanel from './WaitPanel.vue'
import BlankPanel from './BlankPanel.vue'
import FadeInPanel from './FadeInPanel.vue'
import FadeOutPanel from './FadeOutPanel.vue'
import * as Manim from '../manim.js'

export default {
  name: 'AnimationPanel',
  components: {
    ReplacementTransformPanel,
    FadeInPanel,
    FadeOutPanel,
    WaitPanel,
    BlankPanel,
  },
  props: {
    animationData: Object,
    animationOffset: Number,
    mobjectClasses: Array,
    mobjectData: Object,
    scene: Object,
    animating: Boolean,
    setup: Object,
    sceneBeforeAnimation: Array,
    animationDiff: Object,
    postSceneMobjects: Array,
  },
  computed: {
    animationComponent: function() {
      let panelName = this.animationData.className + "Panel";
      if (panelName in this.$options.components) {
         return panelName;
      } else {
        return "BlankPanel";
      }
    },
    addedByAnimation() {
      return Manim[this.animationData.className].getDiff(
        ...this.animationData.args
      )['add'];
    },
    removedByAnimation() {
      return Manim[this.animationData.className].getDiff(
        ...this.animationData.args
      )['remove'];
    },
  },
}
</script>

<style scoped>
</style>
