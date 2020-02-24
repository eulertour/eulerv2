<template>
  <div>
    <!--
    <v-select
      label="Start Mobject"
      v-bind:items="postSetupMobjects"
      v-bind:readonly="animating"
      v-model="currentStartMobject"
      class="mb-5"
      hide-details
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
    -->
  </div>
</template>

<script>
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
    postSetupMobjects: Array,
    postAnimationMobjects: Array,
    animationDiff: Object,
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
    mobjectIsRemoved(mobjectName) {
      return this.postSetupMobjects.includes(mobjectName) &&
        !this.postAnimationMobjects.includes(mobjectName);
    }
  },
}
</script>
