<template>
  <div>
    <div class="mb-2" v-for="(transformation, transformationIndex) in transformations" v-bind:key="transformationKey(transformation)">
      <v-chip>
        <v-avatar left color="orange">
          <v-icon color="white">mdi-function</v-icon>
        </v-avatar>
        <span class="subtitle-1">{{ transformation[1] + "." + transformation[2] }}</span>
      </v-chip>
      <div
        v-for="(pair, index) in Object.entries(serializedTransformations[transformationIndex])"
        v-bind:key="transformationKey(transformation) + transformationIndex + '-' + index"
      >
        <div class="ml-5">{{ pair[0] }}: {{ pair[1] }}</div>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'TransformDiff',
    props: {
      transformations: Array,
    },
    computed: {
      serializedTransformations() {
        return this.transformations.map(t => this.objectify(t));
      }
    },
    mounted() {

    },
    methods: {
      transformationKey(transformation) {
        let transformIndex = transformation[0];
        let mobjectName = transformation[1];
        let transformationType = transformation[2];
        return `${transformIndex}-${mobjectName}-${transformationType}`;
      },
      objectify(transformation) {
        let transformationType = transformation[2];
        let transformationArgs = transformation.slice(3);
        switch(transformationType) {
          case 'rotate':
            return this.rotationObj(transformationArgs);
          case 'shift':
            return this.shiftObj(transformationArgs);
          case 'scale':
            return this.scaleObj(transformationArgs);
          default: {
            // eslint-disable-next-line
            console.error(`objectify() has no implementation for ${transformationType}.`);
          }
        }
      },
      rotationObj(rotationArgs) {
        return {
          angle: rotationArgs[0].toFixed(5),
          axis: `[${rotationArgs[1]}]`,
        };
      },
      shiftObj(shiftArgs) {
        return {
          vector: `[${shiftArgs[0].map(x => x.toFixed(3))}]`,
        };
      },
      scaleObj(scaleArgs) {
        return {
          factor: scaleArgs[0].toFixed(5),
        };
      }
    }
  }
</script>

<style>
</style>

