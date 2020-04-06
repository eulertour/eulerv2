<template>
  <v-sheet
    id="codemirror-padding-container"
    v-bind:style="codeMirrorBackgroundColor"
    elevation="4"
  >
    <div
      v-bind:id="parentUid + 'codemirror-container'"
      v-bind:style="{
        flex: '1 1 auto',
        marginTop: 0,
        height: '100%',
        position: 'relative',
      }"
    />
  </v-sheet>
</template>

<script>
import CodeMirror from 'codemirror'
import 'codemirror/lib/codemirror.css'
import 'codemirror/theme/rubyblue.css'
import 'codemirror/mode/python/python.js'

export default {
  name: 'CodeMirror',
  props: {
    code: String,
    parentUid: Number,
  },
  data() {
    return {
      codeMirror: null,
      backgroundColor: "",
      codeMirrorBackgroundColor: {
        backgroundColor: "",
      }
    }
  },
  methods: {
    updateCode(cm) {
      this.$emit('update-code', cm.getValue());
    }
  },
  mounted() {
    this.codeMirror = CodeMirror(
      document.getElementById(this.parentUid + 'codemirror-container'), {
        value: this.code,
        theme: "rubyblue",
        mode: "python",
      });
    this.codeMirror.on('change', this.updateCode);
    let cm = document.getElementsByClassName("CodeMirror")[0];
    this.codeMirrorBackgroundColor.backgroundColor = getComputedStyle(cm)['background-color'];
  },
}
</script>

<style>
/* Adapted from https://discuss.codemirror.net/t/size-inside-flexbox/1359/5 to
 * size CodeMirror correctly within a flexbox element and
 * https://stackoverflow.com/a/30826028 to make an absolutely positioned element
 * respect its parent's padding.
 */
#codemirror-padding-container {
  border-radius: 10px;
  padding: 15px;
  flex-grow: 1;
}
#codemirror-padding-container .CodeMirror {
  font-size: 1em;
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  height: 100%;
}
</style>
