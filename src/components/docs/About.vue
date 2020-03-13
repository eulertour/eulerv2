<template>
  <div>
    <div class="display-1 my-4">About</div>
    <p>
      <i>
        tl;dr: I'm working on making manim web-compatible. It's a lot of work,
        but it's long overdue.
      </i>
    </p>

    <p>
      <a href="https://github.com/3b1b/manim" target="_blank">Manim</a> is an
      animation engine for explanatory math videos. It was written by Grant
      Sanderson and popularized by his YouTube channel,
      <a href="https://www.youtube.com/3blue1brown" target="_blank">
      3Blue1Brown</a>.
    </p>

    <p>
      Animating technical concepts is traditionally pretty tedious since it can
      be difficult to make the animations precise enough to convey them
      accurately. Manim uses Python to generate animations programmatically,
      which makes it possible to specify exactly how each one should look.
    </p>

    <p>
      However, <a target="_blank" href="https://github.com/3b1b/manim/issues">
      manim is notoriously difficult to use</a>. This site is part of an ongoing
      effort to build a frontend to manim with all of the features that are
      expected of a modern web app. In addition to making manim much easier to
      use, this will also make it more efficient, accessible, and eventually
      interactive.
    </p>

    <p>
      The goal is for the web editor to eventually be compatible with any code
      written for manim. However, this requires writing web implementations for
      all of the existing base Mobjects and Animations. The Mobjects and
      Animations that currently have web implementations are listed under the
      <b>Mobjects</b> and <b>Animations</b> sections, respectively.
    </p>

    <p>
      This is still very much a work in progress and any collaboration would be
      a huge help. Feel free to get in touch with me on the
      <a target="_blank" href="https://discord.gg/mMRrZQW">manim discord</a> if
      you're interested in contributing, or just to learn more about manim.
    </p>
  </div>
</template>

<script>export default { name: 'About' }</script>
