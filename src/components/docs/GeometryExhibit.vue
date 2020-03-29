<template>
  <div>
    <div class="docs-lab-container">
      <div class="display-1 my-4">Geometry</div>

      <p>Simple geometric shapes.</p>

      <div class="headline my-4">Rectangle</div>
      <MobjectLabContainer
        project="rectangle_exhibit"
        v-bind:input-layout="HORIZONTAL_EMBED"
        v-bind:canvas-height="250"
        v-bind:height="300"
      />

      <div class="headline my-4">Square</div>
      <MobjectLabContainer
        project="square_exhibit"
        v-bind:input-layout="HORIZONTAL_EMBED"
        v-bind:canvas-height="250"
        v-bind:height="300"
      />

      <div class="headline my-4">Circle</div>
      <MobjectLabContainer
        project="circle_exhibit"
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
