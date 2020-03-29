<template>
  <v-card
    class="d-flex flex-nowrap align-center pa-1 timeline"
    color="grey lighten-3"
  >
    <v-card
      v-for="(animation, index) in animations"
      v-bind:key="index"
      flat
      class="flex-grow-0 flex-shrink-0 d-flex flex-column justify-center mr-1"
      v-bind:style="{
        overflowY: 'hidden',
        width: (animation.runtime * animationWidth) + 'px',
        height: animationWidth + 'px',
      }"
    >
      <v-card-title class="d-flex justify-center headline px-2">
				<div class="keyframe-text">{{ animation.className }}</div>
      </v-card-title>
    </v-card>
    <!--
    <v-card class="keyframe d-flex align-center justify-center">
      <v-btn v-on:click="$emit('new-animation')" height="100%" width="100%">
        <v-icon class="display-2">mdi-plus</v-icon>
      </v-btn>
    </v-card>
    -->
    <div id="position-indicator" v-bind:style="timelineOffset"/>
  </v-card>
</template>

<script>
export default {
  name: 'Timeline',
  props: {
    animations: Array,
    index: Number,
    offset: Number,
    canvasWidth: Number,
    canvasHeight: Number,
  },
  computed: {
    timelineOffset() {
      if (this.animations.length === 0) {
        return '0px';
      }
      let cursorOffset = 4;
      for (let i = 0; i < this.index; i++) {
        cursorOffset += this.animations[i].runtime * this.animationWidth + 4;
      }
      cursorOffset += this.offset * this.animations[this.index].runtime * this.animationWidth;
      return { 'left': cursorOffset + 'px' }
    }
  },
  data() {
    return { animationWidth: 145, }
  },
}
</script>

<style scoped>
.keyframe-text {
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
	font-size: 1.35rem;
}
.timeline {
  height: 155px;
  position: relative;
  overflow-x: auto;
  overflow-y: hidden;
}
#position-indicator {
  background-color: black;
  height: 100%;
  width: 3px;
  position: absolute;
}
</style>
