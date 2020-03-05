<template>
  <div class="documentation-container d-flex">
    <div class="text-container">
      <div class="display-1 my-4">Learning by Example</div>
      <div class="title my-4">SquareToCircle</div>
      <div>
        <span class="mono">example_scenes.py</span> contains simple
        examples that we can use to learn about manim. Go ahead and try out the
        <span class="mono">SquareToCircle</span> scene by running it with
        <span class="mono">manim example_scenes.py SquareToCircle -p</span>.

        <div class="note">
          <div class="title">Note</div> The flag -p plays the rendered video
            with default video player. Other frequently used flags are:<br>
          <span class="mono">-l</span> for rendering video in lower resolution
            (for faster rendering)<br>
          <span class="mono">-s</span> to show the last frame of the video<br>
          <span class="mono">-h</span> all the available flags<br>
        </div>

        Let's step through each line of
        <span class="mono">SquareToCircle</span>. You create videos in manim by
        writing <span class="mono">Scene</span> classes. Each
        <span class="mono">Scene</span> in manim is self-contained. That means
        everything you created under this <span class="mono">Scene</span> does
        not exist outside the class.

        <span class="mono">Scene.construct()</span> specifies what is displayed
        on the screen when the <span class="mono">Scene</span> is rendered to
        video.

        <span class="mono">Circle()</span> and
        <span class="mono">Square()</span> create
        <span class="mono">Circle</span> and <span class="mono">Square</span>.

        Both of these are instances of <span class="mono">Mobject</span>
        subclasses, the base class for objects in manim. Note that instantiating
        a <span class="mono">Mobject</span> does not add it to the
        <span class="mono">Scene</span>, so you wouldn't see anything if you
        were to render the <span class="mono">Scene</span> at this point.

        <span class="mono">flip()</span>, <span class="mono">rotate()</span>,
        and <span class="mono">set_fill()</span> apply various modifications to
        the <span class="mono">Mobject</span>s before animating them. The call
        to <span class="mono">Mobject.flip()</span> flips the
        <span class="mono">Square</span> across the
        <span class="mono">RIGHT</span> vector. This is equivalent to a
        refection across the x-axis.

        The call to <span class="mono">Mobject.rotate()</span> rotates the
        <span class="mono">Square</span> 3/8ths of a rotation counterclockwise.

        The call to <span class="mono">Mobject.set_fill()</span> sets the fill
        color for the <span class="mono">Circle</span> to pink, and its fill
        opacity to 0.5.

        Instances of <span class="mono">Animation</span> are used to generate
        animations. Each <span class="mono">Animation</span> takes one or more
        <span class="mono">Mobject</span>s as arguments and animates them when
        passed to <span class="mono">Scene.play()</span>. This is how video is
        typically created in manim.

        <span class="mono">Mobject</span>s are automatically added to the
        <span class="mono">Scene</span> when they are animated. You can add a
        <span class="mono">Mobject</span> to the <span class="mono">Scene</span>
        manually by passing it as an argument to
        <span class="mono">Scene.add()</span>.

        <span class="mono">ShowCreation</span> draws a
        <span class="mono">Mobject</span> to the screen.

        <span class="mono">ReplacementTransform</span> morphs one
        <span class="mono">Mobject</span> into another and replaces the former
        <span class="mono">Mobject</span> with the latter in the
        <span class="mono">Scene</span>.

        <span class="mono">FadeOut</span> fades a
        <span class="mono">Mobject</span> out of the
        <span class="mono">Scene</span>.

        <div class="note">
          <div class="title">Note</div> The flag -p plays the rendered video
          The first argument to <span class="mono">ReplacementTransform</span>
          is still modified, even though it is removed from the
          <span class="mono">Scene</span>.
          <span class="mono">ReplacementTransform</span> changes the appearance
          of this <span class="mono">Mobject</span>, but not the underlying
          properties.

          After the <span class="mono">ReplacementTransform</span> is rendered
          <span class="mono">square</span> is still a
          <span class="mono">Square</span> instance but with the shape of a
          <span class="mono">Circle</span>.
        </div>
      </div>
    </div>
    <div class="lab-container px-3">
      <MobjectLabContainer project="example_scenes" v-bind:vertical="VERTICAL"/>
    </div>
  </div>
</template>

<script>
import MobjectLabContainer from '../MobjectLabContainer.vue';
import * as consts from '../../constants.js';
export default {
  name: 'ExampleScene',
  components: {
    MobjectLabContainer,
  },
  computed: {
    VERTICAL() {
      return consts.MobjectLabContainerLayout.VERTICAL;
    },
    HORIZONTAL() {
      return consts.MobjectLabContainerLayout.HORIZONTAL;
    },
  }
}
</script>

<style lang="scss">
$color-pack: false;
@import '~vuetify/src/styles/main.sass';
.documentation-container { height: 100%; }
.text-container { overflow-y: auto; }
.lab-container {
  overflow-y: auto;
  flex-shrink: 0;
}
.mono {
  font-family: monospace;
}
.note {
  background-color: map-get($yellow, "lighten-2");
  border: 3px solid map-get($yellow, "base");
  padding: 12px;
  margin: 12px 0;
}
</style>
