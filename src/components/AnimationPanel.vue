<template>
  <div>
  <div class="pa-0">
    <div class="display-1">{{ animationData.className }}</div>
  </div>
  <div class="subtitle-1 mb-6">{{ animationData.description }}</div>
  <component
    v-bind:is="animationComponent"
    v-bind:animation-data="animationData"
    v-bind:animation-offset="animationOffset"
    v-bind:mobject-data="mobjectData"
    v-bind:mobject-classes="mobjectClasses"
    v-bind:scene="scene"
    v-on:class-change="(className, mobjectData)=>$emit('class-change', className, mobjectData)"
    v-on:position-change="(scenePoint, mobjectData)=>$emit('position-change', scenePoint, mobjectData)"
    v-on:picker-change="(attr, color, mobjectData)=>$emit('picker-change', attr, color, mobjectData)"
    v-on:picker-hide="(mobjectData)=>$emit('picker-hide', mobjectData)"
    v-on:picker-save="(attr, color, mobjectData)=>$emit('picker-save', attr, color, mobjectData)"
    v-on:width-change="(newWidth, mobjectData)=>$emit('width-change', newWidth, mobjectData)"
    v-on:arg-change="(argNum, arg)=>$emit('arg-change', argNum, arg)"
  />
  <div class="d-flex justify-center pa-0 mt-7">
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

export default {
  name: 'AnimationPanel',
  components: {
    ReplacementTransformPanel,
    WaitPanel,
  },
  props: {
    animationData: Object,
    animationOffset: Number,
    mobjectClasses: Array,
    mobjectData: Object,
    scene: Object,
  },
  computed: {
    animationComponent: function() {
      return this.animationData.className + "Panel";
    }
  },
}
</script>

<style scoped>
</style>
