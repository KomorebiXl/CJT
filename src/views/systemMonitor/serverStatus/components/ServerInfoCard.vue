<script setup lang="ts">
import type { SystemInfo } from '@/types/systemMonitor/serverStatus'
import StatusCard from './StatusCard.vue'
import { Platform } from '@element-plus/icons-vue'

defineProps<{
  data: SystemInfo
}>()
</script>

<template>
  <StatusCard title="服务器信息">
    <template #icon><Platform /></template>
    <div class="status-list">
      <div class="status-item">
        <span>服务器名称</span>
        <strong>{{ data.computerName }}</strong>
      </div>
      <div class="status-item">
        <span>操作系统</span>
        <strong>{{ data.osName }}</strong>
      </div>
      <div class="status-item">
        <span>服务器 IP</span>
        <strong>{{ data.computerIp }}</strong>
      </div>
      <div class="status-item">
        <span>系统架构</span>
        <strong>{{ data.osArch }}</strong>
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
    overflow-wrap: anywhere;
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
