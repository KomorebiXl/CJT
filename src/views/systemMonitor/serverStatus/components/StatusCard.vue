<script setup lang="ts">
defineProps<{
  title: string
}>()
</script>

<template>
  <section class="status-card">
    <div class="status-card__header">
      <div class="status-card__title">
        <slot name="icon" />
        <span>{{ title }}</span>
      </div>
    </div>
    <div class="status-card__body">
      <slot />
    </div>
  </section>
</template>

<style scoped lang="scss">
.status-card {
  min-width: 0;
  padding: 18px;
  border: 1px solid var(--el-border-color-light);
  border-radius: 4px;
  background: var(--el-bg-color);
}

.status-card__header {
  padding-bottom: 14px;
  border-bottom: 1px solid var(--el-border-color-lighter);
  margin-bottom: 18px;
}

.status-card__title {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 8px;
  color: var(--el-color-primary);
  font-weight: 600;

  :deep(svg) {
    width: 16px;
    height: 16px;
    flex: 0 0 16px;
  }
}
</style>
