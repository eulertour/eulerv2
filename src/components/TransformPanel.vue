<template>
  <div class="pa-0">
    <!--
    <MobjectPanel
      v-bind:mobject-classes="mobjectClasses"
      v-bind:mobject-data="getArgData(0)"
      v-bind:scene="scene"
      label="Start Mobject"
      v-on:class-change="handleClassChange"
      v-on:position-change="handlePositionChange"
      v-on:picker-change="handlePickerChange"
      v-on:picker-hide="handlePickerHide"
      v-on:picker-save="handlePickerSave"
      v-on:width-change="handleWidthChange"
    />
    <MobjectPanel
      v-bind:mobject-classes="mobjectClasses"
      v-bind:mobject-data="getArgData(1)"
      v-bind:scene="scene"
      label="End Mobject"
      v-on:class-change="handleClassChange"
      v-on:position-change="handlePositionChange"
      v-on:picker-change="handlePickerChange"
      v-on:picker-hide="handlePickerHide"
      v-on:picker-save="handlePickerSave"
      v-on:width-change="handleWidthChange"
    />
    -->
    <v-select
      label="Start Mobject"
      v-bind:items="Object.keys(mobjectData)"
      v-model="currentStartMobject"
      hide-details
      class="mb-2">
    </v-select>
    <v-select
      label="End Mobject"
      v-bind:items="Object.keys(mobjectData)"
      v-model="currentEndMobject"
      hide-details
      class="mb-2">
    </v-select>
  </div>
</template>

<script>
import * as _ from 'lodash'

export default {
  name: 'TransformPanel',
  components: {
  },
  props: {
    animationData: Object,
    mobjectData: Object,
    mobjectClasses: Array,
    scene: Object,
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
    getArgData(argNum) {
      return _.find(this.mobjectData, (o) => {return o.name === this.animationData.args[argNum]});
    },
    handleClassChange(className, mobjectData) {
      this.$emit('class-change', className, mobjectData);
    },
    handlePositionChange(scenePoint, mobjectData) {
      this.$emit('position-change', scenePoint, mobjectData);
    },
    handlePickerChange(attr, color, mobjectData) {
      this.$emit('picker-change', attr, color, mobjectData);
    },
    handlePickerHide(mobjectData) {
      this.$emit('picker-hide', mobjectData);
    },
    handlePickerSave(attr, color, mobjectData) {
      this.$emit('picker-save', attr, color, mobjectData);
    },
    handleWidthChange(newWidth, mobjectData) {
      this.$emit('width-change', newWidth, mobjectData);
    },
  },
}
</script>
