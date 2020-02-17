<template>
  <v-app class="d-flex flex-column">
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
        <v-icon class="display-2">mdi-github-circle</v-icon>
      </v-btn>
    </v-app-bar>

    <v-content class=" d-flex flex-column">
      <MobjectLabContainer />
    </v-content>
  </v-app>
</template>

<script>
import MobjectLabContainer from './components/MobjectLabContainer.vue'

export default {
  name: 'App',
  components: { MobjectLabContainer },
};
</script>

<style>
.v-application { height: 100vh; }
.v-content { height: 100%; }
.v-content__wrap {
  display: flex;
  height: 100%;
}
</style>
