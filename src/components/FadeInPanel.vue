<template>
  <div class="pa-0">
    <!--
    <v-select
      label="Mobject"
      v-bind:items="mobjectChoices"
      v-bind:readonly="animating"
      v-model="chosenMobject"
      v-bind:error-messages="error"
      v-bind:hide-details="error.length === 0"
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
    -->
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
    animationDiff: Object,
    postAnimationMobjects: Array,
    postSetupMobjects: Array,
  },
  computed: {
    mobjectChoices() {
      return _.difference(
        Object.keys(this.mobjectData),
        this.postSetupMobjects,
      );
    },
    error() {
      if (this.postSetupMobjects.includes(this.chosenMobject)) {
        return ["Mobject must not be in the scene."];
      } else {
        return [];
      }
    },
    valid() {
      return this.endError.length === 0;
    }
  },
  data() {
    return {
      chosenMobject: null,
    }
  },
  mounted() {
    this.chosenMobject = this.animationData.args[0];
  },
  watch: {
    chosenMobject: function(newMobject, oldMobject) {
      // ignore the initial mount
      if (oldMobject !== null) {
        this.$emit('arg-change', 0, newMobject);
      }
    },
  },
  methods: {
    mobjectIsAdded(mobjectName) {
      let diff = this.animationDiff;
      return mobjectName in Object.keys(diff)
        && 'added' in diff[mobjectName]
        && diff[mobjectName]['added'][1];
    },
    mobjectIsRemoved(mobjectName) {
      let diff = this.animationDiff;
      return mobjectName in Object.keys(diff)
        && 'added' in diff[mobjectName]
        && !diff[mobjectName]['added'][1];
    }
  },
}
</script>
