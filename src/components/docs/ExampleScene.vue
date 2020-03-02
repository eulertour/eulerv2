<template>
  <v-row>
    <v-col>
      <div class="headline my-4">Learning by Example</div>
      <div>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean vestibulum, nibh vitae euismod fringilla, sem dolor venenatis elit, mattis pulvinar urna ex in eros. Aenean accumsan eros ac sagittis ullamcorper. Sed finibus tellus nibh. Mauris scelerisque lacus ac nisl maximus, in egestas nibh gravida. Donec nulla erat, lacinia porta sagittis vel, sagittis consequat tellus. Vivamus dignissim ex euismod massa vulputate dignissim. Curabitur ligula dui, dictum in libero vel, vestibulum pellentesque mauris. Suspendisse sed fermentum magna.
        Aliquam vitae augue vitae ex fermentum aliquam. Sed tortor purus, tincidunt at facilisis id, hendrerit quis metus. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Phasellus condimentum tristique est, et varius lacus eleifend sed. Sed sed dolor eu tortor tristique dictum vitae sit amet orci. In rhoncus erat quis mollis elementum. Mauris a varius nisl, nec ornare ipsum. Proin tempor ex ac felis ornare gravida. Vivamus porttitor nunc nisi, nec convallis mauris hendrerit at. Pellentesque sed ipsum ultrices, cursus massa eget, finibus elit. Ut porttitor sem massa, at laoreet sem gravida eget. Vivamus vehicula dapibus diam. Cras vel feugiat est. Nullam a dapibus risus.
        Vivamus congue at tellus sit amet fringilla. Vestibulum egestas pellentesque leo non mollis. Pellentesque imperdiet ac ipsum eu pellentesque. Vestibulum facilisis, sem vitae condimentum gravida, neque metus aliquam nisl, a vulputate orci arcu vitae tortor. Suspendisse dapibus pellentesque nulla non mollis. Cras euismod et erat nec consequat. Mauris malesuada, erat sed iaculis finibus, mi nunc aliquet risus, quis sollicitudin massa sem id odio. Proin euismod mauris id placerat ullamcorper. Curabitur pretium turpis velit, euismod malesuada lorem imperdiet sed. Etiam vestibulum leo ut arcu tristique, ac rhoncus risus interdum. Morbi tempus, augue in dictum interdum, odio felis imperdiet urna, ac commodo elit est in tellus. Quisque posuere justo ut est gravida malesuada. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque faucibus interdum ex, vehicula dignissim risus ultricies at. Aenean vitae blandit nulla, a sodales lectus. Lorem ipsum dolor sit amet, consectetur adipiscing elit.
        Nullam varius imperdiet justo nec maximus. Etiam mattis elit lorem, at consectetur sapien convallis blandit. Integer vitae suscipit augue, nec euismod nulla. Ut commodo, justo sed lacinia blandit, risus nulla bibendum nulla, sit amet varius nunc libero vel neque. Quisque eget erat tincidunt, sagittis turpis non, eleifend magna. Morbi in commodo erat, sit amet cursus libero. Etiam imperdiet turpis eu fringilla porttitor. Phasellus suscipit sed velit eu tempus. Donec nec aliquet ligula, ut semper sapien. Cras viverra massa vel felis ullamcorper, vel fermentum massa convallis. Praesent vel sem non ante dictum porttitor in vitae est. Integer sagittis ante et viverra pulvinar. Morbi tincidunt et tortor porttitor hendrerit. Donec tempor a dui vel aliquam.
        Duis aliquam condimentum cursus. Vivamus tincidunt risus id eleifend porta. Curabitur ac nulla sit amet turpis dapibus consequat. Aenean varius enim sit amet libero maximus, a dignissim turpis ultricies. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Mauris vel orci dignissim, hendrerit mi non, gravida tellus. Suspendisse mattis erat augue, et viverra felis accumsan sed. In sodales diam eu tincidunt convallis. Praesent rhoncus blandit sem non laoreet. Maecenas et nulla urna. Nunc sollicitudin elit eu consectetur rutrum.
      </div>
    </v-col>
    <v-col>
      <MobjectLabContainer project="example_scenes" v-bind:vertical="true"/>
    </v-col>
  </v-row>
</template>

<script>
import MobjectLabContainer from '../MobjectLabContainer.vue'
export default {
  name: 'ExampleScene',
  components: {
    MobjectLabContainer,
  },
}
</script>

<style scoped>

</style>
