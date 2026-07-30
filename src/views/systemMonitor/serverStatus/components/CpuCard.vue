<script setup lang="ts">
import type { CpuInfo } from '@/types/systemMonitor/serverStatus'
import StatusCard from './StatusCard.vue'
import { Cpu } from '@element-plus/icons-vue'

defineProps<{
  data: CpuInfo
}>()

const formatPercent = (value: number | undefined) =>
  value === undefined ? '--' : `${value}%`
</script>

<template>
  <StatusCard title="CPU">
    <template #icon><Cpu /></template>
    <div class="status-list">
      <div class="status-item">
        <span>核心数</span>
        <strong>{{ data.cpuNum }}</strong>
      </div>
      <div class="status-item">
        <span>用户使用率</span>
        <strong>{{ formatPercent(data.used) }}</strong>
      </div>
      <div class="status-item">
        <span>系统使用率</span>
        <strong>{{ formatPercent(data.sys) }}</strong>
      </div>
      <div class="status-item">
        <span>当前空闲率</span>
        <strong>{{ formatPercent(data.free) }}</strong>
      </div>
    </div>
  </StatusCard>
</template>

<style scoped lang="scss">
.status-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px 24px;
}

.status-item {
  display: flex;
  min-width: 0;
  justify-content: space-between;
  gap: 16px;
  color: var(--el-text-color-secondary);

  strong {
    min-width: 0;
    color: var(--el-text-color-primary);
    text-align: right;
  }
}

@media (max-width: 600px) {
  .status-list {
    grid-template-columns: 1fr;
  }
}
</style>
