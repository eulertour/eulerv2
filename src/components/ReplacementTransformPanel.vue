<template>
  <div class="pa-0">
    <!--
    <v-select
      label="Start Mobject"
      v-bind:items="startMobjectChoices"
      v-bind:readonly="animating"
      v-model="currentStartMobject"
      v-bind:error-messages="startError"
      class="mb-5"
      v-bind:hide-details="startError.length === 0"
    >
      <template v-slot:selection="{ item, index }">
        <v-chip>{{ item }}</v-chip>
      </template>
    </v-select>
    <v-select
      label="End Mobject"
      v-bind:items="endMobjectChoices"
      v-bind:readonly="animating"
      v-model="currentEndMobject"
      v-bind:error-messages="endError"
      v-bind:hide-details="endError.length === 0"
      class="mb-5"
    >
      <template v-slot:selection="{ item, index }">
        <v-chip>{{ item }}</v-chip>
      </template>
    </v-select>
    -->
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
    animationDiff: Object,
    postSetupMobjects: Array,
  },
  computed: {
    startMobjectChoices() {
      return this.postSetupMobjects;
    },
    endMobjectChoices() {
      return _.difference(
        Object.keys(this.mobjectData),
        this.postSetupMobjects,
      );
    },
    startError() {
      if (!this.startMobjectChoices.includes(this.currentStartMobject)) {
        return ["Start Mobject is required"];
      } else {
        return [];
      }
    },
    endError() {
      if (!this.endMobjectChoices.includes(this.currentEndMobject)) {
        return ["End Mobject is required"];
      } else {
        return [];
      }
    },
    isValid() {
      return this.startError.length === 0 && this.endError.length === 0;
    }
  },
  data() {
    return {
      currentStartMobject: null,
      currentEndMobject: null,
    }
  },
  mounted() {
    this.currentStartMobject = this.animationData.args[0];
    this.currentEndMobject = this.animationData.config.targetMobject;
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
        this.$emit('config-change', 'targetMobject', newMobject);
      }
    },
  },
  methods: {

  },
}
</script>
