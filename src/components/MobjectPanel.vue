<template>
  <div>
    <v-select
      v-bind:label="label"
      v-bind:items="mobjectClasses"
      v-model="chosenClass"
      hide-details
      class="mb-2">
    </v-select>
    <div class="title">Position</div>
    <div class="d-flex align-center">
      <div class="subtitle-1">
        ({{ mobjectData.position[0].toFixed(1) || 0 }},
         {{ mobjectData.position[1].toFixed(1) || 0 }})
      </div>
      <v-btn v-on:click="positionChange()" class="ml-3">
        {{ selectingPosition ? "Click the Scene" : "Set position" }}
      </v-btn>
    </div>
    <div class="title">Style</div>
    <div class="d-flex align-center position-relative mb-2">
      <div class="subtitle-1">stroke color</div>
      <div class="ml-2 picker-offset">
        <Picker
          attr="stroke"
          v-bind:mobject-data="mobjectData"
          v-bind:default="mobjectData.style.strokeColor"
          v-on:change="handlePickerChange"
        />
      </div>
    </div>
    <div class="d-flex align-center position-relative mb-2">
      <div class="subtitle-1">fill color</div>
      <div class="ml-2 picker-offset">
        <Picker
          attr="fill"
          v-bind:mobject-data="mobjectData"
          v-bind:default="mobjectData.style.fillColor"
          v-on:change="handlePickerChange"
        />
      </div>
    </div>
    <div class="d-flex align-center justify-center">
      <v-slider
        v-model="currentStrokeWidth"
        label="stroke width"
        v-bind:hide-details="true"
        v-bind:min="0"
        v-bind:max="15"
        v-bind:thumb-label="true"
      />
    </div>
  </div>
</template>

<script>
import Picker from './Picker.vue'
import * as _ from 'lodash'

export default {
  name: 'MobjectPanel',
  components: {
    Picker,
  },
  props: {
    mobjectData: Object,
    mobjectClasses: Array,
    scene: Object,
    label: String,
  },
  data() {
    return {
      selectingPosition: false,
      chosenClass: null,
      currentStrokeWidth: null,
    }
  },
  methods: {
    handlePickerChange(attr, color) {
      let data = _.cloneDeep(this.mobjectData);
      data.style[attr + "Color"] = color.toHEXA().toString();
      this.$emit('mobject-update', data);
    },
    positionChange() {
      this.selectingPosition = true;
      let firstClick = true;

      let handlePositionClick = (e) => {
        // this function is triggered once when it is first added, but this
        // should be ignored
        if (firstClick) {
          firstClick = false;
          return;
        }
        let sceneElement = this.scene.renderer.domElement;
        let clickedInsideScene = e.target.closest('#' + sceneElement.id) !== null;
        if (clickedInsideScene) {
          let scenePoint = this.scene.normalizePoint([
            e.clientX - sceneElement.getBoundingClientRect().left,
            e.clientY - sceneElement.getBoundingClientRect().top,
          ]);
          let data = _.cloneDeep(this.mobjectData);
          data.position = scenePoint;
          this.$emit('mobject-update', data);
        }
        this.selectingPosition = false;
        document.removeEventListener('click', handlePositionClick);
      };

      document.addEventListener('click', handlePositionClick);
    }
  },
  mounted() {
    this.chosenClass = this.mobjectData.className;
    this.currentStrokeWidth = this.mobjectData.style.strokeWidth;
  },
  watch: {
    chosenClass: function(newClassName, oldClassName) {
      // ignore the initial mount
      if (oldClassName !== null) {
        let data = _.cloneDeep(this.mobjectData);
        data.className = newClassName;
        this.$emit('mobject-update', data);
      }
    },
    currentStrokeWidth: function(newWidth, oldWidth) {
      // ignore the initial mount
      if (oldWidth !== null) {
        let data = _.cloneDeep(this.mobjectData);
        data.style.strokeWidth = newWidth;
        this.$emit('mobject-update', data);
      }
    }
  }
}
</script>

<style scoped>
.picker-offset {
  position: absolute;
  left: 98px;
}
</style>

<style>
.v-input__slider .v-input__slot .v-label {
  color: black;
}
</style>

