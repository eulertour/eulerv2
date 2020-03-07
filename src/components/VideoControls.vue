<template>
  <div class="d-flex justify-center">
    <v-btn fab v-on:click="$emit('step-backward')" class="mx-2">
      <v-icon color="black" x-large>mdi-step-backward</v-icon>
    </v-btn>
		<!--
    <v-btn fab v-on:click="$emit('jump-post-setup')" class="mx-2">
      <v-icon color="black" x-large>mdi-skip-previous</v-icon>
    </v-btn>
		-->
    <v-btn fab v-if="playing" v-on:click="$emit('pause')" class="mx-4">
      <v-icon color="black" x-large>mdi-pause</v-icon>
    </v-btn>
    <v-btn fab v-else-if="finished" v-on:click="$emit('replay', $event)" class="mx-4">
      <v-icon color="black" x-large>mdi-replay</v-icon>
    </v-btn>
    <v-btn fab v-else v-on:click="$emit('play', $event)" class="mx-4">
      <v-icon color="black" x-large>mdi-play</v-icon>
    </v-btn>
		<!--
    <v-btn fab v-on:click="$emit('jump-post-animation')" class="mx-2">
      <v-icon color="black" x-large>mdi-skip-next</v-icon>
    </v-btn>
		-->
    <v-btn fab v-on:click="$emit('step-forward')" class="mx-2">
      <v-icon color="black" x-large>mdi-step-forward</v-icon>
    </v-btn>
  </div>
</template>

<script>
export default {
  name: 'VideoControls',
  components: {

  },
  props: {
    scene: Object,
    finished: Boolean,
  },
  computed: {
    playing: function() {
      return this.scene !== null && this.scene.playing;
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

  }
}
</script>

<style scoped>
</style>
