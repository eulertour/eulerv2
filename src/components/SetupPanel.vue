<template>
  <div>
    <v-select
      v-model="addSelection"
      v-bind:items="addChoices"
      v-bind:readonly="animating"
      label="Add Mobjects"
      class="mb-2"
      multiple
      hide-details
    >
      <template v-slot:selection="{ item, index }">
        <v-chip>
          <v-avatar left color="red">
            <v-icon color="white">mdi-plus</v-icon>
          </v-avatar>
          {{ item }}
        </v-chip>
      </template>
    </v-select>
    <v-select
      v-model="removeSelection"
      v-bind:items="removeChoices"
      v-bind:readonly="animating"
      label="Remove Mobjects"
      class="mb-3"
      multiple
      hide-details
    >
      <template v-slot:selection="{ item, index }">
        <v-chip>
          <v-avatar left color="blue">
            <v-icon color="white">mdi-minus</v-icon>
          </v-avatar>
          {{ item }}
        </v-chip>
      </template>
    </v-select>
    <!-- figure out modify -->
  </div>
</template>

<script>
import * as _ from 'lodash'

export default {
  name: 'SetupPanel',
  props: {
    setup: Object,
    animationData: Object,
    mobjects: Object,
    scene: Object,
    animating: Boolean,
  },
  data() {
    return {
      test: [1,2,3],
    }
  },
  mounted() {

  },
  computed: {
    mobjectNames() {
      return Object.keys(this.mobjects);
    },
    setupIsEmpty() {
      return !_.isEmpty(this.setup);
    },
    addChoices() {
      /*    all mobjects
       *  - mobjects in scene
       *  + mobjects added in this setup
       *  - mobjects removed in this setup
       */
      let choices = Object.keys(this.mobjects).filter(
        mobjectName => !this.scene.contains(this.mobjects[mobjectName].mobject)
      );
      choices = _.concat(choices, this.setup['add'] || []);
      choices = _.difference(choices, this.setup['remove'] || [])
      return choices;
    },
    addSelection: {
      get() {
        return this.setup['add'];
      },
      set(newSelection) {
        this.$emit('update-setup', 'add', newSelection);
      }
    },
    removeChoices() {
      /*    mobjects in scene
       *  + mobjects removed in this setup
       *  - mobjects added in this setup
       */
      let choices = Object.keys(this.mobjects).filter(
        mobjectName => this.scene.contains(this.mobjects[mobjectName].mobject)
      );
      choices = _.concat(choices, this.setup['remove'] || []);
      choices = _.difference(choices, this.setup['add'] || [])
      return choices;
    },
    removeSelection: {
      get() {
        return this.setup['remove'];
      },
      set(newSelection) {
        this.$emit('update-setup', 'remove', newSelection);
      }
    },
  },
  watch: {

  },
}
</script>

<style>
</style>
