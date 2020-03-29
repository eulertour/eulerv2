<template>
  <div>
    <div class="docs-lab-container">
      <div class="display-1 my-4">Tex</div>

      <p>Mobjects for displaying Tex.</p>

      <div class="headline my-4">TexMobject</div>
      <MobjectLabContainer
        project="tex_exhibit"
        v-bind:input-layout="HORIZONTAL_EMBED"
        v-bind:canvas-height="250"
        v-bind:height="300"
      />

      <div class="headline my-4">TextMobject</div>
      <MobjectLabContainer
        project="text_exhibit"
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
