<template>
  <div>
  <div class="mb-5">
    <div
      class="headline lighten-4 rounded px-2"
      v-bind:class="{ blue: postSetup }"
    >
      Post-Setup Mobjects:
    </div>
    <v-chip-group v-if="postSetupMobjects.length > 0">
      <v-chip v-for="mobjectName in postSetupMobjects" v-bind:key="'postSetup' + mobjectName">
        {{ mobjectName }}
      </v-chip>
    </v-chip-group>
    <div v-else>
      None
    </div>
  </div>

  <div class="pa-0">
    <div class="display-1">{{ animationData.className }}</div>
  </div>
  <div class="subtitle-1 mb-2">{{ animationDescription }}</div>
  <component
    v-bind:animating="animating"
    v-bind:animation-data="animationData"
    v-bind:animation-diff="animationDiff"
    v-bind:animation-offset="animationOffset"
    v-bind:is="animationComponent"
    v-bind:mobject-classes="mobjectClasses"
    v-bind:mobject-data="mobjectData"
    v-bind:post-setup-mobjects="postSetupMobjects"
    v-bind:post-animation-mobjects="postAnimationMobjects"
    v-bind:scene="scene"
    v-bind:setup="setup"
    v-on:arg-change="(argNum, arg)=>$emit('arg-change', argNum, arg)"
    v-on:config-change="(key, val)=>$emit('config-change', key, val)"
  />

  <div class="headline my-9">
    Animation Diff
    <Diff v-bind:diff="animationDiff"/>
  </div>

  <div class="d-flex justify-center pa-0 mb-7">
    <v-btn fab v-on:click="$emit('jump-post-setup')" class="mx-2">
      <v-icon color="black" x-large>mdi-skip-previous</v-icon>
    </v-btn>
    <v-btn fab v-if="this.scene.playing" v-on:click="$emit('pause')" class="mx-4">
      <v-icon color="black" x-large>mdi-pause</v-icon>
    </v-btn>
    <v-btn
      fab
      v-else-if="animationOffset === 1"
      v-on:click="$emit('replay', $event)"
      class="mx-4"
    >
      <v-icon color="black" x-large>mdi-replay</v-icon>
    </v-btn>
    <v-btn
      fab
      v-else
      v-on:click="$emit('play', $event)"
      class="mx-4"
    >
      <v-icon color="black" x-large>mdi-play</v-icon>
    </v-btn>
    <v-btn fab v-on:click="$emit('jump-post-animation')" class="mx-2">
      <v-icon color="black" x-large>mdi-skip-next</v-icon>
    </v-btn>
  </div>

  <div>
    <div
      class="headline lighten-4 rounded px-2"
      v-bind:class="{ blue: postAnimation }"
    >
      Post-Animation Mobjects:
    </div>
    <v-chip-group v-if="postAnimationMobjects.length > 0">
      <v-chip v-for="mobjectName in postAnimationMobjects" v-bind:key="'postAnimation' + mobjectName">
        {{ mobjectName }}
      </v-chip>
    </v-chip-group>
    <div v-else>
      None
    </div>
  </div>
  </div>
</template>

<script>
import ReplacementTransformPanel from './ReplacementTransformPanel.vue'
import WaitPanel from './WaitPanel.vue'
import BlankPanel from './BlankPanel.vue'
import FadeInPanel from './FadeInPanel.vue'
import FadeOutPanel from './FadeOutPanel.vue'
import Diff from './Diff.vue'
import * as Manim from '../manim.js'

export default {
  name: 'AnimationPanel',
  components: {
    ReplacementTransformPanel,
    FadeInPanel,
    FadeOutPanel,
    WaitPanel,
    BlankPanel,
    Diff,
  },
  props: {
    unknownAnimation: Boolean,
    animationData: Object,
    animationOffset: Number,
    mobjectClasses: Array,
    mobjectData: Object,
    scene: Object,
    animating: Boolean,
    postSetup: Boolean,
    postAnimation: Boolean,
    setup: Object,
    animationDiff: Object,
    postSetupMobjects: Array,
    postAnimationMobjects: Array,
  },
  computed: {
    animationComponent: function() {
      if (this.unknownAnimation) {
        return "BlankPanel";
      }
      let panelName = this.animationData.className + "Panel";
      if (panelName in this.$options.components) {
         return panelName;
      } else {
        return "BlankPanel";
      }
    },
    animationDescription: function() {
      if (this.unknownAnimation) {
        return "";
      }
      return Manim[this.animationData.className].getDescription();
    }
  },
}
</script>

<style scoped>
  .rounded {
    border-radius: 8px;
  }
  .v-expansion-panel-header {
    padding-left: 0;
    padding-right: 0;
  }
  .v-expansion-panel-content >>> .v-expansion-panel-content__wrap {
    padding-left: 0;
    padding-right: 0;
  }
</style>
