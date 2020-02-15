<template>
  <div>
    <div
      class="headline lighten-4 rounded px-2"
      v-bind:class="{ blue: preSetup }"
    >
      Pre-Setup Mobjects:
    </div>
    <div class="subtitle-1">
      <v-chip-group v-if="preSetupMobjects.length > 0">
        <v-chip v-for="mobjectName in preSetupMobjects" v-bind:key="'preSetup' + mobjectName">
          {{ mobjectName }}
        </v-chip>
      </v-chip-group>
      <div v-else>
        None
      </div>
    </div>

    <div class="headline my-6">
      Setup Diff
      <Diff v-bind:diff="setup"/>
    </div>

    <div class="d-flex justify-center pa-0 mb-7">
      <v-btn fab v-on:click="$emit('jump-pre-setup')" class="mr-9">
        <v-icon color="black" x-large>mdi-skip-previous</v-icon>
      </v-btn>
      <v-btn fab v-on:click="$emit('jump-post-setup')">
        <v-icon color="black" x-large>mdi-skip-next</v-icon>
      </v-btn>
    </div>

    <div
      class="headline lighten-4 rounded px-2"
      v-bind:class="{ blue: postSetup }"
    >
      Post-Setup Mobjects:
    </div>
    <v-chip-group v-if="postSetupMobjects.length > 0">
      <v-chip v-for="mobjectName in postSetupMobjects" v-bind:key="'postSetup' + mobjectName">
        {{ mobjectName }}
      </v-chip>
    </v-chip-group>
    <div v-else>
      None
    </div>
  </div>
</template>

<script>
import * as _ from 'lodash'
import Diff from "./Diff.vue";

export default {
  name: 'SetupPanel',
  props: {
    setup: Object,
    animationData: Object,
    mobjects: Object,
    scene: Object,
    animating: Boolean,
    preSetup: Boolean,
    postSetup: Boolean,
    preSetupMobjects: Array,
    postSetupMobjects: Array,
    postAnimationMobjects: Array,
  },
  components: {
    Diff,
  },
  data() {
    return {
      test: [1,2,3],
    }
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
}
</script>

<style scoped>
  .rounded {
    border-radius: 8px;
  }
</style>
