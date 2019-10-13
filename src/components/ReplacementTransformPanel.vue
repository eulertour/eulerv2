<template>
  <div class="pa-0">
    <v-select
      label="Start Mobject"
      v-bind:items="startMobjectChoices"
      v-model="currentStartMobject"
      hide-details
      class="mb-5">
    </v-select>
    <v-select
      label="End Mobject"
      v-bind:items="endMobjectChoices"
      v-model="currentEndMobject"
      hide-details
      class="mb-5">
    </v-select>
  </div>
</template>

<script>
import * as _ from 'lodash'

export default {
  name: 'ReplacementTransformPanel',
  components: {
  },
  props: {
    animationData: Object,
    animationOffset: Number,
    mobjectData: Object,
    startMobjects: Array,
    endMobjects: Array,
    mobjectClasses: Array,
    scene: Object,
  },
  computed: {
    firstArg() {
      return this.animationData.args[0];
    },
    secondArg() {
      return this.animationData.args[1];
    },
    startMobjectChoices() {
      if (this.animationOffset < 1) {
        // everything in the scene
        return Object.keys(this.mobjectData).filter(
          name => this.scene.contains(this.mobjectData[name].mobject)
        );
      } else {
        // everything in the scene including the first arg
        // excluding the second arg
        let choices = Object.keys(this.mobjectData).filter(
          name => this.scene.contains(this.mobjectData[name].mobject)
        );
        choices = _.concat(choices, this.firstArg);
        _.remove(choices, name => name === this.secondArg);
        return choices;
      }
    },
    endMobjectChoices() {
      if (this.animationOffset < 1) {
        // everything not in the scene
        return Object.keys(this.mobjectData).filter(
          name => !this.scene.contains(this.mobjectData[name].mobject)
        );
      } else {
        // everything not in the scene including the second arg
        // excluding the first arg
        let choices = Object.keys(this.mobjectData).filter(
          name => !this.scene.contains(this.mobjectData[name].mobject)
        );
        choices = _.concat(choices, this.secondArg);
        _.remove(choices, name => name === this.firstArg);
        return choices;
      }
    },
  },
  data() {
    return {
      currentStartMobject: null,
      currentEndMobject: null,
    }
  },
  mounted() {
    this.currentStartMobject = this.animationData.args[0];
    this.currentEndMobject = this.animationData.args[1];
  },
  watch: {
    currentStartMobject: function(newMobject, oldMobject) {
      // ignore the initial mount
      if (oldMobject !== null) {
        this.$emit('arg-change', 0, newMobject);
      }
    },
    currentEndMobject: function(newMobject, oldMobject) {
      // ignore the initial mount
      if (oldMobject !== null) {
        this.$emit('arg-change', 1, newMobject);
      }
    }
  },
  methods: {
  },
}
</script>
