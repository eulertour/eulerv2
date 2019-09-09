<template>
  <div class="pa-0">
    <MobjectPanel
      v-bind:mobject-classes="mobjectClasses"
      v-bind:mobject-data="mobjectData[animationData.args[0]]"
      v-bind:scene="scene"
      label="Start Mobject"
      v-on:class-change="handleClassChange"
      v-on:position-change="handlePositionChange"
      v-on:picker-change="handlePickerChange"
      v-on:picker-hide="handlePickerHide"
      v-on:picker-save="handlePickerSave"
      v-on:width-change="handleWidthChange"
    />
    <v-divider class="my-6"/>
    <MobjectPanel
      v-bind:mobject-classes="mobjectClasses"
      v-bind:mobject-data="mobjectData[animationData.args[1]]"
      v-bind:scene="scene"
      label="End Mobject"
      v-on:class-change="handleClassChange"
      v-on:position-change="handlePositionChange"
      v-on:picker-change="handlePickerChange"
      v-on:picker-hide="handlePickerHide"
      v-on:picker-save="handlePickerSave"
      v-on:width-change="handleWidthChange"
    />
    <v-divider class="my-6"/>
  </div>
</template>

<script>
import MobjectPanel from './MobjectPanel.vue'

export default {
  name: 'TransformPanel',
  components: {
    MobjectPanel,
  },
  props: {
    animationData: Object,
    mobjectData: Object,
    mobjectClasses: Array,
    scene: Object,
  },
  methods: {
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
