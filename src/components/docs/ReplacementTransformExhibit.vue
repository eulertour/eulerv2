<template>
  <div>
    <div class="docs-lab-container">
      <div class="display-1 my-4">ReplacementTransform</div>

      <p>
        Transforms one Mobject into another, replacing the initial Mobject with
        the target one in the Scene.
      </p>

      <MobjectLabContainer
        project="replacement_transform_exhibit"
        v-bind:input-layout="HORIZONTAL_EMBED"
        v-bind:canvas-height="250"
        v-bind:height="300"
      />
    </div>
  </div>
</template>

<script>
import MobjectLabContainer from '../MobjectLabContainer.vue';
import * as consts from '../../constants.js';

export default {
  name: 'About',
  components: {
    MobjectLabContainer,
  },
  data() {
    return {
      HORIZONTAL_EMBED: consts.MobjectLabContainerLayout.HORIZONTAL_EMBED,
    }
  }
}
</script>

<style>
.docs-lab-container {
  max-width: 1400px;
}
</style>
