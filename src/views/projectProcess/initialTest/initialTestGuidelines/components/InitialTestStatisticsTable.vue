<script setup lang="ts">
import type { ScTableColumn } from '@/components/ScBaseComponents'
import type { InitialTestStatisticsData } from '@/types/projectProcess/initialTest'
import { getInitialTestStatisticsAPI } from '@/api/projectProcess/initialTest-api.ts'
import { getDictOptions } from '@/utils/dict.ts'
import { safeRequest } from '@/utils/safeRequest.ts'

type DictItem = { label: string; value: string }

type FeatureStat = {
  total: number
  unFinish: number
  conformity: number
  unconformity: number
  supportive: number
  envNoDo: number
}

const rows = ref<Array<Record<string, string | number>>>([])
const columns = ref<TableColumns>([])
const dictData = ref<DictItem[]>([])

const toNum = (val: unknown) => {
  const n = Number(val)
  return isNaN(n) ? 0 : n
}
const pct = (num: number, den: number) =>
  den > 0 ? `${Math.round((num / den) * 100)}%` : '0%'

const transformToTableData = (list: InitialTestStatisticsData[]) => {
  columns.value = [
    { prop: 'rowLabel', label: '', align: 'center', width: 150 },
    ...dictData.value.map((item): ScTableColumn => ({
      prop: `feature_${item.value}`,
      label: item.label,
      align: 'center'
    })),
    { prop: 'total', label: '合计', align: 'center' }
  ]

  const listMap = new Map(list.map(item => [item.feature, item]))
  const statMap = new Map<string, FeatureStat>()
  const sum: FeatureStat = {
    total: 0,
    unFinish: 0,
    conformity: 0,
    unconformity: 0,
    supportive: 0,
    envNoDo: 0
  }

  dictData.value.forEach(({ value }) => {
    const item = listMap.get(value)
    const stat: FeatureStat = {
      total: toNum(item?.total),
      unFinish: toNum(item?.unFinish),
      conformity: toNum(item?.conformity),
      unconformity: toNum(item?.unconformity),
      supportive: toNum(item?.supportiveClosingQuestions),
      envNoDo: toNum(item?.envNoDo)
    }
    statMap.set(value, stat)
    ;(Object.keys(sum) as Array<keyof FeatureStat>).forEach(
      k => (sum[k] += stat[k])
    )
  })

  const rowDefs: Array<{
    label: string
    getValue: (s: FeatureStat) => string | number
  }> = [
    { label: '总量', getValue: s => s.total },
    { label: '未完成', getValue: s => s.unFinish },
    { label: '符合', getValue: s => s.conformity },
    { label: '不符合', getValue: s => s.unconformity },
    { label: '支持性文件问题数', getValue: s => s.supportive },
    { label: '环境不具备', getValue: s => s.envNoDo },
    { label: '完成率', getValue: s => pct(s.total - s.unFinish, s.total) },
    {
      label: '通过率',
      getValue: s => pct(s.conformity + s.supportive, s.total)
    },
    {
      label: '未通过率',
      getValue: s => pct(s.total - s.conformity - s.supportive, s.total)
    }
  ]

  rows.value = rowDefs.map(({ label, getValue }) => {
    const row: Record<string, string | number> = { rowLabel: label }
    dictData.value.forEach(({ value }) => {
      row[`feature_${value}`] = getValue(statMap.get(value)!)
    })
    row.total = getValue(sum)
    return row
  })
}

const fetchStatistics = async () => {
  const [err, res] = await safeRequest(getInitialTestStatisticsAPI())
  if (err || !res) return
  transformToTableData(res.data)
}

const getDictData = async () => {
  const [err, options] = await safeRequest(getDictOptions('parent_property'))
  if (err || !options) return
  dictData.value = options
}

onMounted(async () => {
  await getDictData()
  await fetchStatistics()
})
</script>

<template>
  <ScTable
    :data="rows"
    :table-columns="columns"
    :show-action="false"
    :show-pagination="false"
  />
</template>

<style lang="scss" scoped></style>
