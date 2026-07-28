<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    name: string
    size?: string
  }>(),
  {
    size: '1em'
  }
)
</script>

<template>
  <svg
    class="svg-icon"
    :style="{ width: props.size, height: props.size }"
    aria-hidden="true"
  >
    <use :href="`#icon-${props.name}`" />
  </svg>
</template>

<style lang="scss" scoped>
.svg-icon {
  display: inline-block;
  overflow: hidden;
  fill: currentColor;
  vertical-align: -0.15em;
  flex-shrink: 0;
}
</style>
