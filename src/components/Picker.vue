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
    'disabled': Boolean,
  },
  data() {
    return {
      picker: null,
    }
  },
  mounted() {
    this.picker = Pickr.create({
      el: '#picker',
      default: this.default,
      theme: 'nano',
      disabled: this.disabled,
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
    }).on('change', (color, instance) => {
      instance.setHSVA(color.h, color.s, color.v, color.a);
      this.$emit('change', this.attr, color);
    });
  },
  watch : {
    disabled: function(newDisabled) {
      if (!this.picker) {
        return;
      }
      if (newDisabled) {
        this.picker.disable();
      } else {
        this.picker.enable();
      }
    }
  }
}
</script>

<style>
.pickr {
  border: 1px solid gray;
}
</style>
