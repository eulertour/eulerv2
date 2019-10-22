<template>
  <div class="pa-0">
    <v-select
      label="Start Mobject"
      v-bind:items="startMobjectChoices"
      v-bind:readonly="animating"
      v-model="currentStartMobject"
      hide-details
      class="mb-5">
    </v-select>
    <v-select
      label="End Mobject"
      v-bind:items="endMobjectChoices"
      v-bind:readonly="animating"
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
    animating: Boolean,
    setup: Object,
  },
  computed: {
    firstArg() {
      return this.animationData.args[0];
    },
    secondArg() {
      return this.animationData.args[1];
    },
    startMobjectChoices() {
      // Every mobject in the scene or added in setup can be animated.
      let choices = Object.keys(this.mobjectData).filter(
        name => this.scene.contains(this.mobjectData[name].mobject)
      );
      choices = _.concat(choices, this.setup['add'] || []);
      choices.filter((item, index) => choices.indexOf(item) === index);
      return choices;
    },
    endMobjectChoices() {
      // Every mobject which isn't in the scene or was removed in setup can be
      // transformed into.
      let choices = Object.keys(this.mobjectData).filter(
        name => !this.scene.contains(this.mobjectData[name].mobject)
      );
      _.concat(choices, this.setup['remove'] || []);
      return choices;
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
