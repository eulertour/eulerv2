<template>
  <div>
    <div class="title">Add</div>
    <v-combobox
      v-model="setup['add']"
      v-bind:items="Object.keys(mobjects)"
      multiple
      chips
      deletable-chips
      hide-selected
      label="Add Mobjects to the Scene"
    ></v-combobox>
    <div class="title">
      Remove
    </div>
    <div v-for="(mobjectName, index) in setup['remove']" v-bind:key="index">
      {{ mobjectName }}
    </div>
    <!-- figure out modify -->
    <v-divider v-if="setupIsEmpty" class="my-6"/>
  </div>
</template>

<script>
import * as _ from 'lodash'

export default {
  name: 'SetupPanel',
  props: {
    setup: Object,
    mobjects: Object,
  },
  computed: {
    setupIsEmpty() {
      return !_.isEmpty(this.setup);
    },
    addChoices() {
      // mobjects - scene - added by animation
      return null;
    },
    removeChoices() {
      // scene - removed by animation
      return null;
    }
  },
  mounted() {
  }
}
</script>

<style>
</style>
