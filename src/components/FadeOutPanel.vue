<template>
  <div>
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
        <v-chip>
          <v-avatar left color="blue" v-if="mobjectIsRemoved(item)">
            <v-icon color="white">mdi-minus</v-icon>
          </v-avatar>
          {{ item }}
        </v-chip>
      </template>
    </v-select>
  </div>
</template>

<script>
import * as _ from 'lodash'

export default {
  name: 'FadeOutPanel',
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
    sceneBeforeAnimation: Array,
    animationDiff: Object,
  },
  computed: {
    startMobjectChoices() {
      return this.sceneBeforeAnimation;
    },
    endMobjectChoices() {
      return _.difference(
        Object.keys(this.mobjectData),
        this.sceneBeforeAnimation,
      );
    },
    startError() {
      if (!this.startMobjectChoices.includes(this.currentStartMobject)) {
        return ["Start Mobject is required"];
      } else {
        return [];
      }
    },
    isValid() {
      return this.startError.length === 0;
    }
  },
  data() {
    return {
      currentStartMobject: null,
    }
  },
  mounted() {
    this.currentStartMobject = this.animationData.args[0];
  },
  watch: {
    currentStartMobject: function(newMobject, oldMobject) {
      // ignore the initial mount
      if (oldMobject !== null) {
        this.$emit('arg-change', 0, newMobject);
      }
    },
  },
  methods: {
    mobjectIsAdded(mobjectName) {
      let diff = this.animationDiff;
      return _.indexOf(diff['add'], mobjectName) !== -1;
    },
    mobjectIsRemoved(mobjectName) {
      let diff = this.animationDiff;
      return _.indexOf(diff['remove'], mobjectName) !== -1;
    }
  },
}
</script>
