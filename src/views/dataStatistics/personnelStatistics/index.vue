<script setup lang="ts">
import type { ScTableColumn } from '@/components/ScBaseComponents'
import { getPersonnelStatisticsAPI } from '@/api/dataStatistics/personnelStatistics-api.ts'
import type {
  PersonnelStatisticsRawRow,
  PersonnelStatisticsRow,
  PersonnelStatisticsSearchParams
} from '@/types/dataStatistics/personnelStatistics'

const SUMMARY_ROW_NAME = '合计'

const currentYear = String(new Date().getFullYear())
const searchForm = reactive<PersonnelStatisticsSearchParams>({
  year: currentYear
})
const searchYear = ref(currentYear)
const rawStatisticsRows = ref<PersonnelStatisticsRawRow[]>([])
const loading = ref(false)

const monthColumns = computed<ScTableColumn[]>(() =>
  Array.from({ length: 12 }, (_, index) => {
    const month = String(index + 1).padStart(2, '0')
    const prop = `${searchYear.value}-${month}`
    return { label: prop, prop }
  })
)

const tableColumns = computed<ScTableColumn[]>(() => [
  { label: '姓名', prop: 'name', fixed: 'left' },
  ...monthColumns.value,
  { label: '合计', prop: 'total', fixed: 'right' }
])

const normalizeRawRow = (row: PersonnelStatisticsRawRow) => {
  const { 测试人员: name, ...rest } = row
  return { ...rest, name }
}

// 统一的按列求和工具,行合计、列合计共用同一套口径
const sumByColumns = (
  record: Record<string, unknown>,
  columns: ScTableColumn[]
): number =>
  columns.reduce((sum, column) => sum + (Number(record[column.prop]) || 0), 0)

const tableData = computed<PersonnelStatisticsRow[]>(() => {
  const rows = rawStatisticsRows.value.map(row => {
    const normalizedRow: PersonnelStatisticsRow = {
      ...normalizeRawRow(row),
      total: 0
    }
    // 统一把月份字段转成数字,避免后端偶尔返回字符串或空值时求和出错
    monthColumns.value.forEach(column => {
      normalizedRow[column.prop] = Number(normalizedRow[column.prop]) || 0
    })
    normalizedRow.total = sumByColumns(normalizedRow, monthColumns.value)
    return normalizedRow
  })
  if (rows.length === 0) return []
  const summaryRow: PersonnelStatisticsRow = {
    name: SUMMARY_ROW_NAME,
    total: 0
  }

  monthColumns.value.forEach(column => {
    summaryRow[column.prop] = rows.reduce(
      (sum, row) => sum + (row[column.prop] as number),
      0
    )
  })
  summaryRow.total = sumByColumns(summaryRow, monthColumns.value)

  return [...rows, summaryRow]
})

const fetchStatistics = async (year: string) => {
  loading.value = true
  try {
    const { data } = await getPersonnelStatisticsAPI(year)
    searchYear.value = year
    rawStatisticsRows.value = data
  } finally {
    loading.value = false
  }
}

const handleSearch = () => fetchStatistics(searchForm.year)

const handleReset = () => (searchForm.year = String(new Date().getFullYear()))

const searchbarItems = reactive<
  SearchbarItems<PersonnelStatisticsSearchParams>
>([
  {
    label: '统计年份',
    prop: 'year',
    type: 'date',
    clearable: false,
    dateType: 'year',
    format: 'YYYY',
    valueFormat: 'YYYY'
  }
])

onMounted(() => fetchStatistics(searchForm.year))
</script>

<template>
  <div class="page-card personnel-statistics-page">
    <ScSearchbar
      v-model="searchForm"
      :searchbar-items="searchbarItems"
      :loading="loading"
      @search="handleSearch"
      @reset="handleReset"
    />
    <ScTable
      class="statistics-table"
      :data="tableData"
      :table-columns="tableColumns"
      :loading="loading"
      :show-action="false"
      :show-pagination="false"
      :row-class-name="({ row }) => (row.name === '合计' ? 'summary-row' : '')"
    />
  </div>
</template>

<style scoped lang="scss">
.personnel-statistics-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.statistics-table {
  min-height: 0;
}
</style>
