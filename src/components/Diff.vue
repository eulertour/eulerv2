<template>
  <div>
    <div class="mb-2" v-for="mobjectName in Object.keys(mobjectDiff)" v-bind:key="mobjectName">
      <v-chip>
        <v-avatar v-if="'added' in mobjectDiff[mobjectName] && mobjectDiff[mobjectName]['added'][1]" left color="red">
          <v-icon color="white">mdi-plus</v-icon>
        </v-avatar>
        <v-avatar v-else-if="'added' in mobjectDiff[mobjectName] && !mobjectDiff[mobjectName]['added'][1]" left color="blue">
          <v-icon color="white">mdi-minus</v-icon>
        </v-avatar>
        <v-avatar v-else left color="purple">
          <v-icon color="white">mdi-tilde</v-icon>
        </v-avatar>
        <span class="subtitle-1">{{ mobjectName }}</span>
      </v-chip>
      <div
        v-for="attr in Object.keys(mobjectDiff[mobjectName])"
        v-bind:key="mobjectName + attr"
        class="headline ml-3"
      >
        <div v-if="attr === 'style'">
          <div class="d-flex align-center mt-1" v-for="[styleAttr, styleDiff] in Object.entries(mobjectDiff[mobjectName].style)" v-bind:key="mobjectName + styleAttr">
            <v-chip>
              <span class="subtitle-1">{{ styleAttr }}</span>
            </v-chip>
            <span class="ml-2">
              {{ styleDiff[0] }}
              <v-icon>mdi-arrow-right</v-icon>
              {{ styleDiff[1] }}
            </span>
          </div>
        </div>
        <div v-else-if="attr === 'added'" class="mt-1">
          <v-chip>
            <span class="subtitle-1">{{ attr }}</span>
          </v-chip>
          <span class="ml-2">
            {{ mobjectDiff[mobjectName][attr][0] }}
            <v-icon>mdi-arrow-right</v-icon>
            {{ mobjectDiff[mobjectName][attr][1] }}
          </span>
        </div>
        <div v-else>
          Style a diff for {{ attr }}
        </div>
      </div>
    </div>
    <TransformDiff v-bind:transformations="diff.transformations" />
  </div>
</template>

<script>
import TransformDiff from "./TransformDiff.vue"

export default {
  name: 'Diff',
  props: {
    diff: Object,
  },
  components: {
    TransformDiff,
  },
  computed: {
    mobjectDiff() {
      return this.diff.mobjects || {};
    },
    transformations() {
      return this.diff.transformations;
    }
  },
}
</script>

<style scoped>
</style>
