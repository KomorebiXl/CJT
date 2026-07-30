<script setup lang="ts">
import type { JvmInfo, MemoryInfo } from '@/types/systemMonitor/serverStatus'
import StatusCard from './StatusCard.vue'
import { Coin } from '@element-plus/icons-vue'

defineProps<{
  data: MemoryInfo
  jvm: JvmInfo
}>()

const isDangerUsage = (value: number) => value > 80

const formatPercent = (value: number | undefined) =>
  value === undefined ? '--' : `${value}%`
</script>

<template>
  <StatusCard title="内存/JVM">
    <template #icon><Coin /></template>
    <div class="memory-overview">
      <div>
        <h3>物理内存</h3>
        <div class="status-list">
          <div class="status-item">
            <span>总内存</span>
            <strong>{{ data.total }} GB</strong>
          </div>
          <div class="status-item">
            <span>已用内存</span>
            <strong>{{ data.used }} GB</strong>
          </div>
          <div class="status-item">
            <span>剩余内存</span>
            <strong>{{ data.free }} GB</strong>
          </div>
          <div class="status-item">
            <span>使用率</span>
            <strong :class="{ 'is-danger': isDangerUsage(data.usage) }">
              {{ formatPercent(data.usage) }}
            </strong>
          </div>
        </div>
      </div>
      <div>
        <h3>JVM 内存</h3>
        <div class="status-list">
          <div class="status-item">
            <span>总内存</span>
            <strong>{{ jvm.total }} MB</strong>
          </div>
          <div class="status-item">
            <span>已用内存</span>
            <strong>{{ jvm.used }} MB</strong>
          </div>
          <div class="status-item">
            <span>剩余内存</span>
            <strong>{{ jvm.free }} MB</strong>
          </div>
          <div class="status-item">
            <span>使用率</span>
            <strong :class="{ 'is-danger': isDangerUsage(jvm.usage) }">
              {{ formatPercent(jvm.usage) }}
            </strong>
          </div>
        </div>
      </div>
    </div>
  </StatusCard>
</template>

<style scoped lang="scss">
.memory-overview {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 24px;

  h3 {
    margin: 0 0 14px;
    color: var(--el-text-color-primary);
    font-size: 14px;
  }
}

.status-list {
  display: grid;
  gap: 14px;
}

.status-item {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  color: var(--el-text-color-secondary);

  strong {
    color: var(--el-text-color-primary);
    text-align: right;
  }
}

.is-danger {
  color: var(--el-color-danger) !important;
}

@media (max-width: 600px) {
  .memory-overview {
    grid-template-columns: 1fr;
  }
}
</style>
