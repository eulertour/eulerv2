<template>
  <router-link class="thumbnail-link" v-bind:to="labUrl" exact>
    <v-card outlined>
      <v-img
        v-bind:src="imagePath"
        class="white--text align-end"
        contain
        width="350px"
      >
        <v-card-title class="pb-1 pl-3">{{ project }}</v-card-title>
      </v-img>
      <v-card-text>Basic scenes to test functionality.</v-card-text>
    </v-card>
  </router-link>
</template>

<script>
import * as consts from '../constants.js';
import * as path from 'path';

export default {
  name: 'Thumbnail',
  components: {},
  props: { project: String },
  computed: {
    imagePath() {
      return path.join(
        consts.SCENE_DATA_DIR,
        this.project,
        consts.THUMBNAIL_NAME,
      );
    },
    labUrl() {
      return path.join(consts.BASE_LAB_URL, this.project);
    },
  },
};
</script>

<style>
.thumbnail-link {
  color: inherit;
  text-decoration: inherit;
}
</style>
