<template>
  <div class="d-flex align-center timeline">
    <v-card class="keyframe">
      <v-card-text>Transform</v-card-text>
    </v-card>
    <v-card class="keyframe d-flex align-center justify-center">
      <v-icon color="black" class="display-2">mdi-plus</v-icon>
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
        'left': this.offset * 120 + 'px',
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
  watch: {
    offset: function() {
      // console.log(this.offset);
    }
  }
}
</script>

<style scoped>
.keyframe {
  height: 120px;
  width: 120px;
}
.timeline {
  position: relative;
}
#position-indicator {
  background-color: black;
  height: 100%;
  width: 5px;
  position: absolute;
}
</style>
