<template>
  <v-app class="d-flex flex-column">
    <v-app-bar app>
      <v-app-bar-nav-icon v-on:click="navigationDrawer = !navigationDrawer">
      </v-app-bar-nav-icon>
      <router-link class="no-link-style" to="/" exact>
        <v-toolbar-title class="d-flex align-center pl-0">
          <v-img
            height="45px"
            width="45px"
            src="/eulertour_logo_transparent.png">
          </v-img>
          <div>
            <span class="mr-1 display-1">EulerTour</span>
            <span class="font-weight-light">v2</span>
          </div>
        </v-toolbar-title>
      </router-link>
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

    <v-navigation-drawer
      v-model="navigationDrawer"
      app
      temporary
      width="300px"
    >
      <v-list-item class="pl-1 grey lighten-4">
        <v-list-item-avatar class="mr-0" width="48px" height="48px">
          <v-app-bar-nav-icon
            width="100%"
            height="100%"
            v-on:click="navigationDrawer = !navigationDrawer"
          ></v-app-bar-nav-icon>
        </v-list-item-avatar>

        <v-list-item-content>
          <router-link class="no-link-style" to="/" exact>
            <div class="d-flex align-center">
              <v-img
                height="45px"
                max-width="45px"
                src="eulertour_logo_transparent.png"
                contain
                >
              </v-img>
              <div>
                <span class="mr-1 display-1">EulerTour</span>
                <span class="font-weight-light">v2</span>
              </div>
            </div>
          </router-link>
        </v-list-item-content>
      </v-list-item>

      <v-divider></v-divider>

      <router-link class="no-link-style" to="/gallery" exact>
        <v-list-item key="first" link>
          <v-list-item-icon>
            <v-icon class="headline">mdi-image</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title class="subtitle-1">Gallery</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </router-link>

      <router-link class="no-link-style" to="/docs" exact>
        <v-list-item key="first" link>
          <v-list-item-icon>
            <v-icon class="headline">mdi-book-open</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title class="subtitle-1">Documentation</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </router-link>
    </v-navigation-drawer>
  </v-app>
</template>

<script>
export default {
  name: 'App',
  data() {
    return {
      navigationDrawer: false
    };
  },
};
</script>

<style>
.v-application { height: 100vh; }
.v-content { height: 100%; }
.v-content__wrap {
  display: flex;
  height: 100%;
}
.v-application a.no-link-style {
  color: inherit;
  text-decoration: inherit;
}
</style>
