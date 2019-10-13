<template>
  <div class="d-flex align-center timeline">
    <v-card
      v-for="(animation, index) in animations"
      v-bind:key="index"
      class="d-flex flex-column justify-center keyframe"
    >
    <v-card-title class="d-flex justify-center headline px-2">
      <div style="text-overflow:ellipsis">
        {{ animation.shortName || animation.className }}
      </div>
    </v-card-title>
    </v-card>
    <v-card class="keyframe d-flex align-center justify-center">
      <v-btn v-on:click="$emit('new-animation')" height="100%" width="100%">
        <v-icon class="display-2">mdi-plus</v-icon>
      </v-btn>
    </v-card>
    <div id="position-indicator" v-bind:style="timelineOffset"/>
  </div>
</template>

<script>
export default {
  name: 'Timeline',
  components: {

  },
  props: {
    animations: Array,
    index: Number,
    offset: Number,
  },
  computed: {
    timelineOffset() {
      return {
        'left': 145 * (this.index + this.offset) + 'px',
      }
    }
  },
  data() {
    return {

    }
  },
  methods: {

  },
  mounted() {

  },
}
</script>

<style scoped>
.keyframe {
  height: 145px;
  width: 145px;
}
.timeline {
  position: relative;
  border: 1px solid black;
}
#position-indicator {
  background-color: black;
  height: 100%;
  width: 5px;
  position: absolute;
}
</style>
