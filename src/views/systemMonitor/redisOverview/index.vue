<script setup lang="ts">
import * as echarts from 'echarts'
import { ElLoading } from 'element-plus'
import { getRedisOverviewAPI } from '@/api/systemMonitor/cache-api.ts'
import type { RedisOverview } from '@/types/systemMonitor/cache'

defineOptions({ name: 'RedisOverviewPage' })

const pageRef = useTemplateRef<HTMLElement>('pageRef')
const commandChartRef = useTemplateRef<HTMLElement>('commandChartRef')
const memoryChartRef = useTemplateRef<HTMLElement>('memoryChartRef')
const overview = ref<RedisOverview>()
let commandChart: echarts.ECharts | undefined
let memoryChart: echarts.ECharts | undefined

const formatCpu = (value: number | string) => {
  const cpu = Number.parseFloat(String(value))
  return Number.isNaN(cpu) ? '-' : cpu.toFixed(2)
}

const formatNumber = (value: number | string) => String(value ?? '-')

const parseMemoryToMb = (value: string) => {
  const match = value.trim().match(/^([\d.]+)\s*([kmgt]?b?)?$/i)
  if (!match) return 0

  const unit = (match[2] ?? 'B').toUpperCase()
  const unitFactors: Record<string, number> = {
    B: 1 / 1024 / 1024,
    K: 1 / 1024,
    KB: 1 / 1024,
    M: 1,
    MB: 1,
    G: 1024,
    GB: 1024,
    T: 1024 * 1024,
    TB: 1024 * 1024
  }
  const factor = unitFactors[unit] ?? 1
  return Number.parseFloat(match[1]) * factor
}

const memoryGauge = computed(() => {
  const value = overview.value
    ? parseMemoryToMb(overview.value.info.used_memory_human)
    : 0
  return {
    value: Number.isFinite(value) ? Number(value.toFixed(2)) : 0,
    max: Math.max(1000, Math.ceil(value / 100) * 100)
  }
})

const infoItems = computed(() => {
  if (!overview.value) return []

  const { info, dbSize } = overview.value
  return [
    { label: 'Redis 版本', value: info.redis_version },
    {
      label: '运行模式',
      value: info.redis_mode === 'standalone' ? '单机' : '集群'
    },
    { label: '端口', value: info.tcp_port },
    { label: '客户端数', value: info.connected_clients },
    { label: '运行天数', value: info.uptime_in_days },
    { label: '已用内存', value: info.used_memory_human },
    { label: 'CPU 使用率', value: formatCpu(info.used_cpu_user_children) },
    { label: '内存配置', value: info.maxmemory_human },
    { label: 'AOF 状态', value: info.aof_enabled === '0' ? '否' : '是' },
    { label: 'RDB 状态', value: info.rdb_last_bgsave_status },
    { label: 'Key 数量', value: dbSize },
    {
      label: '网络输入/输出',
      value: `${formatNumber(info.instantaneous_input_kbps)} / ${formatNumber(info.instantaneous_output_kbps)} kbps`
    }
  ]
})

const renderCharts = () => {
  if (!overview.value || !commandChartRef.value || !memoryChartRef.value) return

  commandChart?.dispose()
  memoryChart?.dispose()
  commandChart = echarts.init(commandChartRef.value)
  memoryChart = echarts.init(memoryChartRef.value)

  commandChart.setOption({
    tooltip: { trigger: 'item' },
    legend: { bottom: 0 },
    series: [
      {
        type: 'pie',
        radius: ['25%', '70%'],
        roseType: 'area',
        data: overview.value.commandStats
      }
    ]
  })

  memoryChart.setOption({
    series: [
      {
        type: 'gauge',
        min: 0,
        max: memoryGauge.value.max,
        progress: { show: true },
        detail: { formatter: '{value} MB' },
        data: [
          { value: memoryGauge.value.value, name: '已用内存' }
        ]
      }
    ]
  })
}

const resizeCharts = () => {
  commandChart?.resize()
  memoryChart?.resize()
}

const fetchOverview = async () => {
  const loading = pageRef.value
    ? ElLoading.service({
        target: pageRef.value,
        fullscreen: false,
        text: '正在加载 Redis 监控数据，请稍候'
      })
    : undefined

  try {
    const response = await getRedisOverviewAPI()
    overview.value = response.data
    await nextTick()
    renderCharts()
  } finally {
    loading?.close()
  }
}

onMounted(() => {
  fetchOverview()
  window.addEventListener('resize', resizeCharts)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', resizeCharts)
  commandChart?.dispose()
  memoryChart?.dispose()
})
</script>

<template>
  <div ref="pageRef" class="redis-overview-page page-card">
    <template v-if="overview">
      <div class="info-grid">
        <div v-for="item in infoItems" :key="item.label" class="info-item">
          <span>{{ item.label }}</span>
          <strong>{{ item.value }}</strong>
        </div>
      </div>
      <div class="chart-grid">
        <section class="chart-card">
          <h3>命令统计</h3>
          <div ref="commandChartRef" class="chart" />
        </section>
        <section class="chart-card">
          <h3>内存使用</h3>
          <div ref="memoryChartRef" class="chart" />
        </section>
      </div>
    </template>
  </div>
</template>

<style scoped lang="scss">
.redis-overview-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.info-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
}
.info-item,
.chart-card {
  padding: 16px;
  border: 1px solid var(--el-border-color-light);
  border-radius: 8px;
  background: var(--el-bg-color);
}
.info-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
  color: var(--el-text-color-secondary);
}
.info-item strong {
  color: var(--el-text-color-primary);
}
.chart-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}
.chart-card h3 {
  margin: 0;
  font-size: 16px;
}
.chart {
  height: 320px;
}
@media (max-width: 1000px) {
  .info-grid,
  .chart-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
@media (max-width: 600px) {
  .info-grid,
  .chart-grid {
    grid-template-columns: 1fr;
  }
}
</style>
