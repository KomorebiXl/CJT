<script setup lang="ts">
import type { SystemFileInfo } from '@/types/systemMonitor/serverStatus'
import StatusCard from './StatusCard.vue'
import { Files } from '@element-plus/icons-vue'

defineProps<{
  files: SystemFileInfo[]
}>()

const isDangerUsage = (value: number) => value > 80

const formatPercent = (value: number | undefined) =>
  value === undefined ? '--' : `${value}%`
</script>

<template>
  <StatusCard title="磁盘状态">
    <template #icon><Files /></template>
    <div class="disk-list">
      <div v-for="file in files" :key="file.dirName" class="disk-item">
        <div class="disk-item__header">
          <strong>{{ file.dirName }}</strong>
          <strong :class="{ 'is-danger': isDangerUsage(file.usage) }">
            {{ formatPercent(file.usage) }}
          </strong>
        </div>
        <div class="disk-item__details">
          <span>文件系统：{{ file.sysTypeName }}</span>
          <span>盘符类型：{{ file.typeName }}</span>
          <span>总大小：{{ file.total }} GB</span>
          <span>可用大小：{{ file.free }} GB</span>
          <span>已用大小：{{ file.used }} GB</span>
        </div>
      </div>
    </div>
  </StatusCard>
</template>

<style scoped lang="scss">
.disk-list {
  display: grid;
  gap: 16px;
}

.disk-item {
  padding: 14px 16px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 4px;
}

.disk-item__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  color: var(--el-text-color-primary);
}

.disk-item__details {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 12px;
  color: var(--el-text-color-secondary);
  font-size: 13px;
}

.is-danger {
  color: var(--el-color-danger) !important;
}

@media (max-width: 900px) {
  .disk-item__details {
    grid-template-columns: 1fr;
  }
}
</style>
