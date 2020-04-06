<template>
  <div class="d-flex">
    <v-select
      class="mr-2"
      v-bind:items="sceneChoices"
      v-model="chosenScene"
      label="Scene"
      solo
    />
    <v-btn
      class="mr-2"
      large
      min-height="48"
      v-on:click="$emit('refresh-scene-choices')"
    >
      <v-icon class="headline black--text">mdi-replay</v-icon>
    </v-btn>
    <v-btn
      large
      min-height="48"
      v-on:click="$emit('run-manim')"
    >
      <v-icon class="headline black--text mr-2">mdi-cube-outline</v-icon>
      <span class="title">Run</span>
    </v-btn>
  </div>
</template>

<script>
  export default {
    name: "EditorControls",
    props: {
      sceneChoices: Array,
      chosenSceneProp: String,
    },
    computed: {
      chosenScene: {
        get() { return this.chosenSceneProp; },
        set(val) { this.$emit('chosen-scene-update', val); }
      },
    }
  }
</script>

<style lang="scss" scoped>

</style>
