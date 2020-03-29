<template>
  <div class="d-flex" style="width: 100%">
    <v-navigation-drawer
      permanent
      v-bind:width="fullWidthMenu ? '200px' : '60px'"
      class="mr-3 flex-shrink-0"
      style="position: relative"
    >
      <v-list v-if="fullWidthMenu" dense>
        <div v-for="item in navigationDrawerData" v-bind:key="item.title">
          <v-list-group
            v-if="'items' in item"
            v-model="item.active"
            no-action
          >
            <template v-slot:activator>
              <v-list-item-content>
                <v-list-item-title v-text="item.title"></v-list-item-title>
              </v-list-item-content>
            </template>

            <v-list-item
              v-for="subItem in item.items"
              v-bind:key="subItem.title"
              v-on:click="selectDocumentationComponent(subItem.component)"
            >
              <v-list-item-content>
                <v-list-item-title v-text="subItem.title"></v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </v-list-group>
          <v-list-item v-else v-bind:key="item.title" v-on:click="selectDocumentationComponent(item.component)">
            <v-list-item-content>
              <v-list-item-title v-text="item.title"></v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </div>
      </v-list>
      <v-btn
        v-if="$vuetify.breakpoint.smAndDown"
        icon
        class="menu-button mx-3 mb-1"
        v-on:click="expandMiniMenu=!expandMiniMenu"
      >
        <v-icon>{{ expandMiniMenu ? 'mdi-close' : 'mdi-book' }}</v-icon>
      </v-btn>
    </v-navigation-drawer>
    <div class="documentation-container">
      <component v-bind:is="selectedComponent"/>
    </div>
  </div>
</template>

<script>
import About from './docs/About.vue'
import ExampleScene from './docs/ExampleScene.vue'
import LinuxInstall from './docs/LinuxInstall.vue'
import WindowsInstall from './docs/WindowsInstall.vue'
import GeometryExhibit from './docs/GeometryExhibit.vue'
import TexExhibit from './docs/TexExhibit.vue'
import ReplacementTransformExhibit from './docs/ReplacementTransformExhibit.vue'
import WriteExhibit from './docs/WriteExhibit.vue'

export default {
  name: 'Documentation',
  components: {
    About,
    ExampleScene,
    LinuxInstall,
    WindowsInstall,
    GeometryExhibit,
    TexExhibit,
    ReplacementTransformExhibit,
    WriteExhibit,
  },
  methods: {
    selectDocumentationComponent(componentName) {
      this.selectedComponent = componentName;
    }
  },
  computed: {
    fullWidthMenu() {
      return this.$vuetify.breakpoint.mdAndUp || this.expandMiniMenu;
    }
  },
  data() {
    return {
      expandMiniMenu: false,
      selectedComponent: "About",
      navigationDrawerData: [
        { title: 'About', component: 'About' },
        {
          title: 'Installation',
          items: [
            { title: 'Linux', component: 'LinuxInstall' },
            { title: 'Windows', component: 'WindowsInstall' },
          ],
        },
        {
          title: 'Getting Started',
          items: [
            { title: 'Learning by Example', component: 'ExampleScene' },
          ],
        },
        {
          title: 'Mobjects',
          items: [
            { title: 'Geometry', component: 'GeometryExhibit' },
            { title: 'Tex', component: 'TexExhibit' },
          ],
        },
        {
          title: 'Animations',
          items: [
            { title: 'ReplacementTransform', component: 'ReplacementTransformExhibit' },
            { title: 'Write', component: 'WriteExhibit' },
          ],
        },
      ],
    };
  },
};
</script>

<style lang="scss">
/* NavBar edits. */
/* Reduce padding on nested list entries. */
.v-application--is-ltr
.v-list-group--no-action >
.v-list-group__items >
.v-list-item {
  padding-left: 30px;
}
/* Remove min-width on expansion icon container. */
.v-list-group
.v-list-group__header
.v-list-item__icon.v-list-group__header__append-icon {
  min-width: 0;
}
/* Reduce height of list items. */
.v-list-item--dense,
.v-list--dense
.v-list-item {
  min-height: 30px;
}
/* NavBar edits. */

$color-pack: false;
@import '~vuetify/src/styles/main.sass';
.mono {
  font-family: monospace;
}
.warning {
  background-color: map-get($yellow, "lighten-3");
  border: 3px solid map-get($yellow, "base");
  padding: 12px;
  margin: 12px 0;
}
.documentation-container {
  height: 100%;
  overflow-y: auto;
  flex-grow: 1;
}
.documentation-container .documentation-text-container .note {
  background-color: map-get($blue, "lighten-4") !important;
  border: 3px solid map-get($blue, "base") !important;
  padding: 12px;
  margin: 12px 0;
}
code { box-shadow: none !important; }
p { margin-bottom: 28px !important; }
.menu-button {
  position: absolute;
  bottom: 5px;
}
</style>
