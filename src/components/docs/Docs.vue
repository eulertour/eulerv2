<template>
  <div>
    <div class="display-1 my-4">Documentation</div>
    <p>
      Manim runs by adding Mobjects to a scene, and using them to animate certain actions defined by the user. First, let's take a look at how to start a manim program.
    </p>

    <p>
      First, you need to create a new python file. Then, enter these basic components: 
      <Prism language="python" code=
"from manimlib.imports import *

Class Test(Scene):
    def construct(self):"
			/>
        You'll enter your code in the <code>construct</code> block.
    </p>
  </div>
</template>

<script>
import Prism from 'vue-prism-component'
export default {
	name: 'Docs',
	components: { Prism },
}
</script>

