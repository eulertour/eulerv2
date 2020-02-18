<template>
  <v-app class="d-flex flex-column">
    <v-app-bar app>
      <v-app-bar-nav-icon></v-app-bar-nav-icon>
      <v-toolbar-title class="d-flex align-center pl-0">
        <router-link to="/" exact>
          <v-img
            height="45px"
            width="45px"
            src="eulertour_logo_transparent.png">
          </v-img>
        </router-link>
        <div>
          <span class="mr-1 display-1">EulerTour</span>
          <span class="font-weight-light">v2</span>
        </div>
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
      <router-view></router-view>
    </v-content>
  </v-app>
</template>

<script>
export default { name: 'App' };
</script>

<style>
.v-application { height: 100vh; }
.v-content { height: 100%; }
.v-content__wrap {
  display: flex;
  height: 100%;
}
</style>
