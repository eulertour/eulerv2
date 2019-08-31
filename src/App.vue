<template>
  <v-app>
    <v-app-bar app>
      <v-toolbar-title class="headline">
        <span class="mr-1 display-1">EulerTour</span>
        <span class="font-weight-light">v2</span>
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn
        text
        height="100%"
        href="https://github.com/eulertour/eulerv2"
        target="_blank"
      >
        <font-awesome-icon class="display-2" v-bind:icon="['fab', 'github']"/>
      </v-btn>
    </v-app-bar>

    <v-content>
      <MobjectLab />
    </v-content>
  </v-app>
</template>

<script>
import MobjectLab from './components/MobjectLab.vue';

export default {
  name: 'App',
  components: {
    MobjectLab,
  },
  data: () => ({
    //
  }),
};
</script>

<style>
.align-items-center {
  display: flex;
  align-items: center;
}
.justify-content-center {
  display: flex;
  justify-content: center;
}
.position-relative {
  position: relative;
}
</style>
