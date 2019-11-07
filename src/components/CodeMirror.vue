<template>
  <v-sheet
    id="editor-container"
    v-bind:style="containerStyle"
    elevation="4"
    max-height="700px"
  >
    <div id="editor" />
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
  },
  data() {
    return {
      codeMirror: null,
      backgroundColor: "",
      containerStyle: {
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
      document.getElementById('editor'), {
        value: this.code,
        theme: "rubyblue", mode: "python",
      });
    this.codeMirror.on('change', this.updateCode);
    let cm = document.getElementsByClassName("CodeMirror")[0];
    this.containerStyle.backgroundColor = getComputedStyle(cm)['background-color'];
  },
}
</script>

<style>
#editor-container {
  border-radius: 8px;
  height: calc(100% - 46px);
  width: 100%;
}
#editor {
  padding: 15px;
  border-radius: 0;
  box-sizing: border-box;
  height: 100%;
  width: 100%;
}
.CodeMirror {
  height: 100%;
  font-size: 1.25em;
}
</style>
