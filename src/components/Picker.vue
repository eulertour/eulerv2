<template>
  <div id="picker"/>
</template>

<script>
import '@simonwep/pickr/dist/themes/nano.min.css';
import Pickr from '@simonwep/pickr';

export default {
  name: 'Pickr',
  props: {
    'mobjectData': Object,
    'default': String,
    'attr': String,
  },
  mounted() {
    Pickr.create({
      el: '#picker',
      default: this.default,
      theme: 'nano',
      components: {
        // Main components
        preview: true,
        opacity: true,
        hue: true,
        // Input / output Options
        interaction: {
          hex: true,
          rgba: true,
          input: true,
          save: true
        }
      }
    }).on('change', (color, /*instance*/) => {
      this.$emit('change', this.attr, color, this.mobjectData);
    }).on('hide', (/*instance*/) => {
      this.$emit('hide', this.mobjectData);
    }).on('save', (color, /*instance*/) => {
      this.$emit('save', this.attr, color, this.mobjectData);
    });
  },
}
</script>

<style>
</style>
