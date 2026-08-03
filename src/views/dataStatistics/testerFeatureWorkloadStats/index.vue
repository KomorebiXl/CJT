<script setup lang="ts">
import type { ScTableColumn } from '@/components/ScBaseComponents'
import { getTesterFeatureWorkloadStatsData } from '@/api/dataStatistics/testerFeatureWorkloadStats-api.ts'
import type {
  TesterFeatureWorkloadStatsRawRow,
  TesterFeatureWorkloadStatsSearchParams
} from '@/types/dataStatistics/testerFeatureWorkloadStats'

const statisticProps = [
  '功能性',
  '信息安全性',
  '兼容性',
  '可靠性',
  '易用性',
  '可移植性',
  '维护性',
  '用户文档集',
  '性能效率',
  '总测试项条数'
] as const

const searchForm = reactive<TesterFeatureWorkloadStatsSearchParams>({
  dateRangeValue: []
})
const tableData = ref<TesterFeatureWorkloadStatsRawRow[]>([])
const loading = ref(false)

const tableColumns: ScTableColumn[] = [
  { label: '姓名', prop: '测试人员' },
  ...statisticProps.map(prop => ({ label: prop, prop }))
]

const fetchStatistics = async (dateRange?: [string, string]) => {
  loading.value = true
  try {
    const { data } = await getTesterFeatureWorkloadStatsData(dateRange)
    tableData.value = data
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  const dateRange = searchForm.dateRangeValue
  fetchStatistics(dateRange.length === 2 ? dateRange : undefined)
}

const handleReset = () => fetchStatistics()

const searchbarItems = reactive<
  SearchbarItems<TesterFeatureWorkloadStatsSearchParams>
>([
  {
    label: '日期范围',
    prop: 'dateRangeValue',
    type: 'dateRange',
    valueFormat: 'YYYY-MM-DD'
  }
])

onMounted(() => fetchStatistics())

const getSummaries = ({ columns, data }: { columns: any[]; data: any[] }) => {
  return columns.map((column, index) => {
    if (index === 0) return '合计'
    const values = data.map(item => Number(item[column.property]))
    if (values.every(v => !Number.isNaN(v))) {
      return values.reduce((sum, cur) => sum + cur, 0).toFixed(0)
    }
    return ''
  })
}
</script>

<template>
  <div class="page-card tester-feature-workload-stats-page">
    <ScSearchbar
      v-model="searchForm"
      :searchbar-items="searchbarItems"
      :loading="loading"
      @search="handleSearch"
      @reset="handleReset"
    />
    <ScTable
      class="statistics-table"
      show-index
      show-summary
      :data="tableData"
      :table-columns="tableColumns"
      :loading="loading"
      :show-action="false"
      :show-pagination="false"
      :summary-method="getSummaries"
    />
  </div>
</template>

<style scoped lang="scss">
.tester-feature-workload-stats-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.statistics-table {
  min-height: 0;
}
</style>
