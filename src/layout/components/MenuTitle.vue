<script setup lang="ts">
defineProps<{
  title?: string
}>()

const titleRef = ref<HTMLElement | null>(null)
const isOverflow = ref(false)

const checkOverflow = () => {
  const el = titleRef.value
  if (el) {
    isOverflow.value = el.scrollWidth > el.clientWidth
  }
}

let observer: ResizeObserver | null = null

onMounted(() => {
  if (titleRef.value) {
    observer = new ResizeObserver(checkOverflow)
    observer.observe(titleRef.value)
  }
})

onBeforeUnmount(() => {
  observer?.disconnect()
})
</script>

<template>
  <el-tooltip :content="title" placement="right" :disabled="!isOverflow">
    <span ref="titleRef" class="menu-title-text">{{ title }}</span>
  </el-tooltip>
</template>

<style lang="scss" scoped>
.menu-title-text {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
