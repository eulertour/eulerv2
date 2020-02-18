<template>
  <v-container>
    <v-row class="headline my-4">Gallery</v-row>
    <v-row>
      <Thumbnail project="example_scenes.py"/>
    </v-row>
  </v-container>
</template>

<script>
import Thumbnail from './Thumbnail.vue'

export default {
  name: 'Gallery',
  components: { Thumbnail },
};
</script>

<style>
</style>
