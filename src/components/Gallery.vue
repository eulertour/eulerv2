<template>
  <v-container>
    <v-col>
      <v-row class="headline my-4">Gallery</v-row>
      <v-row>
        <Thumbnail project="example_scenes" />
        <Thumbnail project="what_can_we_do" />
      </v-row>
    </v-col>
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
.thumbnail:not(:last-child) { margin-right: 30px }
</style>
