<template>
  <div>
    <div class="title mb-5">
      <div
        class="lighten-4 rounded px-2"
        v-bind:class="{ blue: preScene }"
      >
        Pre-Scene Mobjects:
      </div>
      <v-chip-group v-if="preSceneMobjects.length > 0">
        <v-chip v-for="mobjectName in preSceneMobjects" v-bind:key="'preScene' + mobjectName">
          {{ mobjectName }}
        </v-chip>
      </v-chip-group>
      <div v-else>
        None
      </div>
    </div>

    <div class="mb-5" v-for="mobjectName in Object.keys(setup)" v-bind:key="mobjectName">
      <v-chip>
        <v-avatar v-if="'added' in setup[mobjectName] && setup[mobjectName]['added'][1]" left color="red">
          <v-icon color="white">mdi-plus</v-icon>
        </v-avatar>
        <v-avatar v-else-if="'added' in setup[mobjectName] && !setup[mobjectName]['added'][1]" left color="blue">
          <v-icon color="white">mdi-minus</v-icon>
        </v-avatar>
        <v-avatar v-else left color="purple">
          <v-icon color="white">mdi-tilde</v-icon>
        </v-avatar>
        <span class="subtitle-1">{{ mobjectName }}</span>
      </v-chip>
      <div
        v-for="attr in Object.keys(setup[mobjectName])"
        v-bind:key="mobjectName + attr"
        class="title ml-3"
      >
        {{ attr }}: {{ setup[mobjectName][attr][0] }}
        <v-icon>mdi-arrow-right</v-icon>
        {{ setup[mobjectName][attr][1] }}
      </div>
    </div>

    <div class="d-flex justify-center pa-0 mb-7">
      <v-btn fab v-on:click="$emit('jump-to-start')" class="mx-2">
        <v-icon color="black" x-large>mdi-skip-previous</v-icon>
      </v-btn>
      <v-btn fab v-on:click="$emit('jump-to-end')" class="mx-2">
        <v-icon color="black" x-large>mdi-skip-next</v-icon>
      </v-btn>
    </div>

    <div class="title">
      <div
        class="lighten-4 rounded px-2"
        v-bind:class="{ blue: !preScene }"
      >
        Post-Scene Mobjects:
      </div>
      <v-chip-group v-if="postSceneMobjects.length > 0">
        <v-chip v-for="mobjectName in postSceneMobjects" v-bind:key="'postScene' + mobjectName">
          {{ mobjectName }}
        </v-chip>
      </v-chip-group>
      <div v-else>
        None
      </div>
    </div>
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
    preScene: Boolean,
    preSceneMobjects: Array,
    postSceneMobjects: Array,
    postAnimationMobjects: Array,
  },
  data() {
    return {
      test: [1,2,3],
    }
  },
  mounted() {
    // console.log(this.preSceneMobjects);
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
  .rounded {
    border-radius: 8px;
  }
</style>
