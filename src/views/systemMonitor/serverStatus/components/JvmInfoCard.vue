<script setup lang="ts">
import type {
  JvmInfo,
  SystemInfo
} from '@/types/systemMonitor/serverStatus'
import StatusCard from './StatusCard.vue'
import { Monitor } from '@element-plus/icons-vue'

defineProps<{
  data: JvmInfo
  system: SystemInfo
}>()

const formatInputArgs = (inputArgs?: string[]) =>
  inputArgs?.length ? inputArgs.join(' ') : '--'
</script>

<template>
  <StatusCard title="Java 虚拟机信息">
    <template #icon><Monitor /></template>
    <div class="status-list">
      <div class="status-item">
        <span>名称</span>
        <strong>{{ data.name }}</strong>
      </div>
      <div class="status-item">
        <span>版本</span>
        <strong>{{ data.version }}</strong>
      </div>
      <div class="status-item">
        <span>启动时间</span>
        <strong>{{ data.startTime }}</strong>
      </div>
      <div class="status-item">
        <span>运行时长</span>
        <strong>{{ data.runTime }}</strong>
      </div>
      <div class="status-item status-item--wide">
        <span>安装路径</span>
        <strong>{{ data.home }}</strong>
      </div>
      <div class="status-item status-item--wide">
        <span>项目路径</span>
        <strong>{{ system.userDir }}</strong>
      </div>
      <div class="status-item status-item--wide">
        <span>运行参数</span>
        <strong>{{ formatInputArgs(data.inputArgs) }}</strong>
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

.status-item--wide {
  grid-column: 1 / -1;
}

@media (max-width: 600px) {
  .status-list {
    grid-template-columns: 1fr;
  }

  .status-item--wide {
    grid-column: auto;
  }
}
</style>
