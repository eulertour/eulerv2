<template>
  <div class="d-flex" style="height: 100%">
    <div class="documentation-text-container">
      <div class="display-1 my-4">Learning by Example</div>
      <div class="title my-4">SquareToCircle</div>
      <div>
        <p>
          <span class="mono">example_scenes.py</span> contains simple examples
          that we can use to learn about manim. Go ahead and try out the
          <span class="mono">SquareToCircle</span> scene by running it with
          <span class="mono">manim example_scenes.py SquareToCircle -p</span>.
        </p>

        <div class="note">
          <div class="title font-weight-bold">Note</div>
          The flag -p plays the rendered video with default video player. Other
          frequently used flags are:<br>
          <ul list-style="none">
            <li><span class="mono">-l</span> for rendering video in lower resolution</li>
            <li>(for faster rendering)</li>
            <li><span class="mono">-s</span> to show the last frame of the video</li>
            <li><span class="mono">-h</span> to show all the available flags</li>
          </ul>
        </div>

        <p>
          Let's step through each line of
          <span class="mono">SquareToCircle</span>.
        </p>

        <p>
          <Prism language="python" code=
"from manimlib.imports import *"
          />
          This line imports a smorgasbord of
          <span class="mono">Mobject</span>s,
          <span class="mono">Animation</span>s, utility functions, and parts
          of the standard library that you'll likely end up using with manim.
        </p>

        <p>
          <Prism language="python" code=
"class SquareToCircle(Scene):"
          />
          You create videos in manim by writing
          <span class="mono">Scene</span>s. Each
          <span class="mono">Scene</span> in manim is self-contained, so
          anything you create under one <span class="mono">Scene</span> will not
          exist outside the class.
        </p>

        <p>
          <Prism language="python" code=
"def construct(self):"
          />
          <span class="mono">Scene.construct()</span> specifies what is
          displayed on the screen when the <span class="mono">Scene</span> is
          rendered to video.
        </p>

        <p>
          <Prism language="python" code=
"circle = Circle()
 square = Square()"
          />
          <span class="mono">Circle()</span> and
          <span class="mono">Square()</span> create
          <span class="mono">circle</span> and <span class="mono">square</span>.
          Both of these are instances of <span class="mono">Mobject</span>
          subclasses, the base class for objects in manim.
        </p>

        <div class="note">
          <div class="title font-weight-bold">Note</div>
          Instantiating a <span class="mono">Mobject</span> does not add it to
          the <span class="mono">Scene</span>, so you wouldn't see anything if
          you were to render the <span class="mono">Scene</span> at this point.
        </div>

        <p>
          <Prism language="python" code=
"square.flip(RIGHT)
 square.rotate(-3 * TAU / 8)
 circle.set_fill(PINK, opacity=0.5)"
          />
          <span class="mono">flip()</span>, <span class="mono">rotate()</span>,
          and <span class="mono">set_fill()</span> apply various modifications
          to the <span class="mono">Mobject</span>s before animating them:
          <ul>
            <li>
              The call to <span class="mono">flip()</span> flips the
              <span class="mono">Square</span> across the
              <span class="mono">RIGHT</span> vector. This is equivalent to a
              refection across the x-axis.
            </li>

            <li>
              The call to <span class="mono">rotate()</span> rotates the
              <span class="mono">Square</span> 3/8ths of a rotation
              counterclockwise.
            </li>

            <li>
              The call to <span class="mono">set_fill()</span> sets the
              fill color for the <span class="mono">Circle</span> to pink, and
              its fill opacity to 0.5.
            </li>
          </ul>
        </p>

        <p>
          <Prism language="python" code=
"self.play(ShowCreation(square))
 self.play(ReplacementTransform(square, circle))
 self.play(FadeOut(circle))"
          />
          Each of these 3 calls to <span class="mono">Scene.play()</span> is
          passed an instance of a subclass of
          <span class="mono">Animation</span>, which in turn is passed a number
          of <span class="mono">Mobject</span>s.
          <span class="mono">Scene.play()</span> causes each
          <span class="mono">Animation</span> to animate its input
          <span class="mono">Mobject</span>s and append the resulting animation
          to the current render. This is how video is typically created in
          manim.
        </p>

        <div class="note">
          <div class="title font-weight-bold">Note</div>
          <span class="mono">Mobject</span>s are automatically added to the
          <span class="mono">Scene</span> when they are animated. You can add a
          <span class="mono">Mobject</span> to the
          <span class="mono">Scene</span> manually by passing it as an argument
          to <span class="mono">Scene.add()</span>.
        </div>

        <p>
          The three calls to <span class="mono">Scene.play()</span> generate the
          following animations:
          <ul>
            <li>
              <span class="mono">ShowCreation</span> draws a
              <span class="mono">Mobject</span> on the screen.
            </li>

            <li>
              <span class="mono">ReplacementTransform</span> morphs one
              <span class="mono">Mobject</span> into another and replaces the
              former <span class="mono">Mobject</span> with the latter in the
              <span class="mono">Scene</span>.
            </li>

            <li>
              <span class="mono">FadeOut</span> fades a
              <span class="mono">Mobject</span> out of the
              <span class="mono">Scene</span>.
            </li>
          </ul>
        </p>


        <div class="note">
          <div class="title font-weight-bold">Note</div>
          The first argument to <span class="mono">ReplacementTransform</span>
          is still modified, even though it is removed from the
          <span class="mono">Scene</span>.
          <span class="mono">ReplacementTransform</span> changes the appearance
          of this <span class="mono">Mobject</span>, but not the underlying
          properties.

          After the <span class="mono">ReplacementTransform</span> is played
          <span class="mono">square</span> is still a
          <span class="mono">Square</span> instance but with the shape of a
          <span class="mono">Circle</span>.
        </div>
      </div>
    </div>
    <div class="lab-container pl-3">
      <v-navigation-drawer
        right
        permanent
        v-bind:width="fullWidthManim ? 'auto' : '60px'"
      >
        <MobjectLabContainer
          v-if="fullWidthManim"
          collapse-editor-buttons
          v-bind:display-close="$vuetify.breakpoint.smAndDown"
          v-bind:input-layout="VERTICAL"
          v-on:close="expandManim=!expandManim"
          project="learning_by_example"
          v-bind:canvas-width="450"
        />
        <v-btn
          v-else
          icon
          class="menu-button mx-3 mb-1"
          v-on:click="expandManim=!expandManim"
        >
          <v-icon>{{ expandManim ? 'mdi-close' : 'mdi-code-braces' }}</v-icon>
        </v-btn>
      </v-navigation-drawer>
    </div>
  </div>
</template>

<script>
import MobjectLabContainer from '../MobjectLabContainer.vue';
import * as consts from '../../constants.js';
import Prism from 'vue-prism-component'

export default {
  name: 'ExampleScene',
  components: {
    MobjectLabContainer,
    Prism,
  },
  data() {
    return {
      expandManim: false,
    }
  },
  computed: {
    VERTICAL() { return consts.MobjectLabContainerLayout.VERTICAL; },
    HORIZONTAL_EMBED() { return consts.MobjectLabContainerLayout.HORIZONTAL_EMBED; },
    fullWidthManim() {
      return this.$vuetify.breakpoint.mdAndUp || this.expandManim;
    }
  }
}
</script>

<style lang="scss">
.documentation-container { height: 100%; }
.documentation-text-container {
  height: 100%;
  max-width: 70%;
  overflow-y: auto;
  color: map-get($grey, "darken-3");
}
.documentation-text-container li {
  display: block;
}
.documentation-text-container li:before {
  content: "⏵ ";
}
.lab-container {
  overflow-y: auto;
  flex: 1 0 600px;
  display: relative;
}
</style>
