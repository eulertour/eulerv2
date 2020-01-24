<template>
  <div>
    <div class="mb-5" v-for="mobjectName in Object.keys(diff)" v-bind:key="mobjectName">
      <v-chip>
        <v-avatar v-if="'added' in diff[mobjectName] && diff[mobjectName]['added'][1]" left color="red">
          <v-icon color="white">mdi-plus</v-icon>
        </v-avatar>
        <v-avatar v-else-if="'added' in diff[mobjectName] && !diff[mobjectName]['added'][1]" left color="blue">
          <v-icon color="white">mdi-minus</v-icon>
        </v-avatar>
        <v-avatar v-else left color="purple">
          <v-icon color="white">mdi-tilde</v-icon>
        </v-avatar>
        <span class="subtitle-1">{{ mobjectName }}</span>
      </v-chip>
      <div
        v-for="attr in Object.keys(diff[mobjectName])"
        v-bind:key="mobjectName + attr"
        class="headline ml-3"
      >
        {{ attr }}: {{ diff[mobjectName][attr][0] }}
        <v-icon>mdi-arrow-right</v-icon>
        {{ diff[mobjectName][attr][1] }}
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Diff',
  props: {
    diff: Object,
  },
}
</script>

<style scoped>
</style>
