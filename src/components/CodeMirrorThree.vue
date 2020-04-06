<template>
  <div ref="codeMirrorContainer"/>
</template>

<script>
/* eslint-disable */
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
      codeMirrorBackgroundColor: {
        backgroundColor: "",
      },
    }
  },
  methods: {
    updateCode(cm) {
      console.trace();
      this.$emit('update-code', cm.getValue());
    }
  },
  mounted() {
    console.log('starting mount');
    this.codeMirror = CodeMirror(
      this.$refs.codeMirrorContainer, {
        value: this.code,
        theme: "rubyblue",
        mode: "python",
      });
    this.codeMirror.on('change', this.updateCode);
      this.$emit('update-code', "hi");
    console.log('attached handler');
  },
  watch: {
    code(newCode, oldCode) {
      console.trace(newCode);
      console.log(this.codeMirror);
    }
  }
}
</script>

<style>
.CodeMirror {
  width: 480px;
  height: 270px;
}
</style>
