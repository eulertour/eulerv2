<template>
  <div class="pa-0">
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
        <v-chip>
          <v-avatar left color="red" v-if="mobjectIsAdded(item)">
            <v-icon color="white">mdi-plus</v-icon>
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
  name: 'FadeInPanel',
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
    endError() {
      if (!this.endMobjectChoices.includes(this.currentEndMobject)) {
        return ["End Mobject is required"];
      } else {
        return [];
      }
    },
    isValid() {
      return this.endError.length === 0;
    }
  },
  data() {
    return {
      currentStartMobject: null,
      currentEndMobject: null,
    }
  },
  mounted() {
    this.currentEndMobject = this.animationData.args[0];
  },
  watch: {
    currentEndMobject: function(newMobject, oldMobject) {
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
