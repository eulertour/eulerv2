<template>
  <div>
    <div class="display-1 my-4">Geometry</div>
		<p>This group contains simple geometric shapes.</p>
		<div class="headline my-4">Square</div>
      <MobjectLabContainer
        project="learning_by_example"
        v-bind:layout="HORIZONTAL_EMBED"
      />

		<div class="headline my-4">Circle</div>
      <MobjectLabContainer
        project="example_scenes"
        v-bind:layout="HORIZONTAL_EMBED"
      />
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
