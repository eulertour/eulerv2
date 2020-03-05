<template>
  <router-link class="thumbnail no-link-style" v-bind:to="labUrl" exact>
    <v-card outlined>
      <v-img
        v-if="imageAvailable"
        v-bind:src="imagePath"
        class="white--text align-end thumbnail-image-dimensions"
        contain
      >
        <v-card-title class="pb-1 pl-3">{{ project }}</v-card-title>
      </v-img>
      <div
        v-else
        class="d-flex justify-center align-center thumbnail-image-dimensions grey lighten-2"
      >
        <v-icon class="display-2 black--text">mdi-camera</v-icon>
      </div>
      <v-card-text style="font-size:0.7rem">{{ description }}</v-card-text>
    </v-card>
  </router-link>
</template>

<script>
import * as consts from '../constants.js';
import * as path from 'path';
import * as axios from 'axios';

export default {
  name: 'Thumbnail',
  components: {},
  props: { project: String },
  data: () => {
    return {
      description: "",
      imageAvailable: false,
    }
  },
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
    descriptionUrl() {
      return path.join(
        consts.SCENE_DATA_DIR,
        this.project,
        consts.DESCRIPTION_NAME,
      );
    }
  },
  mounted() {
    axios.get(this.descriptionUrl).then(response => {
      this.description = response.data;
    }).catch(() => {
      this.description = "No description available";
    });
    axios.get(this.imagePath).then(() => {
      this.imageAvailable = true;
    }).catch(()=>{});
  }
};
</script>

<style>
.thumbnail {
	font-size: 0.8rem;
}
.thumbnail-image-dimensions {
  width: 320px;
  height: 180px;
}
</style>
