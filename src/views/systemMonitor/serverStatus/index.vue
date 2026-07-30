<script setup lang="ts">
import { ElLoading } from 'element-plus'
import { getServerStatusAPI } from '@/api/systemMonitor/serverStatus-api.ts'
import type { ServerStatus } from '@/types/systemMonitor/serverStatus'
import CpuCard from './components/CpuCard.vue'
import DiskStatusCard from './components/DiskStatusCard.vue'
import JvmInfoCard from './components/JvmInfoCard.vue'
import MemoryJvmCard from './components/MemoryJvmCard.vue'
import ServerInfoCard from './components/ServerInfoCard.vue'

defineOptions({ name: 'ServerStatusPage' })

const pageCardRef = useTemplateRef<HTMLElement>('pageCardRef')
const serverStatus = ref<ServerStatus>()

const fetchServerStatus = async () => {
  const loading = pageCardRef.value
    ? ElLoading.service({
        target: pageCardRef.value,
        fullscreen: false,
        text: '正在加载服务监控数据，请稍候'
      })
    : undefined

  try {
    const response = await getServerStatusAPI()
    serverStatus.value = response.data
  } finally {
    loading?.close()
  }
}

onMounted(fetchServerStatus)
</script>

<template>
  <div ref="pageCardRef" class="server-status-page page-card">
    <template v-if="serverStatus">
      <div class="status-grid">
        <CpuCard :data="serverStatus.cpu" />
        <MemoryJvmCard :data="serverStatus.mem" :jvm="serverStatus.jvm" />
        <ServerInfoCard :data="serverStatus.sys" />
        <JvmInfoCard :data="serverStatus.jvm" :system="serverStatus.sys" />
      </div>
      <DiskStatusCard :files="serverStatus.sysFiles ?? []" />
    </template>
  </div>
</template>

<style scoped lang="scss">
.server-status-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
  .status-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16px;
  }
}

@media (max-width: 900px) {
  .status-grid {
    grid-template-columns: 1fr;
  }
}
</style>
