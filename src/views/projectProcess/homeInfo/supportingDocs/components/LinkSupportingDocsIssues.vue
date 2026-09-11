<!--支持性文件问题关联 -->
<script setup lang="ts">
import type { DictOption } from '@/types/system/dict'
import type {
  SupportingDocsQuestionData,
  SupportingDocsQuestionSearchParams
} from '@/types/projectProcess/homeInfo/supportingDocs'
import {
  getSubsystemOptionsAPI,
  getSupportingDocsQuestionListAPI,
  getSupportingDocsRelatedQuestionsAPI,
  saveSupportingDocsRelationAPI
} from '@/api/projectProcess/homeInfo/supportingDocs.ts'
import { getDictOptionsMap } from '@/utils/dict.ts'
import { safeRequest } from '@/utils/safeRequest.ts'
import { ScMessage } from '@/utils/ElUtils'

const visible = defineModel<boolean>('visible', { required: true })

const props = defineProps<{
  dataId: string
}>()

const emit = defineEmits<{
  'update-data': []
}>()

const scResourcePageRef = useTemplateRef<PageInstance>('scResourcePageRef')

/* 已关联行随列表在每次取数时一并拉取（列表接口不含它们、已关联接口不支持搜索），始终保持最新 */
const relatedRows = ref<Array<SupportingDocsQuestionData>>([])

/* 各字典 value -> label 映射，用于本地过滤已关联行（下拉值为 code、行数据为文案） */
const dictLabelMaps = reactive<Record<string, Map<string, string>>>({})

const loadDictLabelMaps = async () => {
  const map = await getDictOptionsMap(['parent_property', 'sub_property'])
  const toMap = (items: DictOption[]) =>
    new Map(items.map(dict => [String(dict.value), dict.label]))
  dictLabelMaps.parent_property = toMap(map.parent_property ?? [])
  dictLabelMaps.sub_property = toMap(map.sub_property ?? [])
}

/* 已关联行仅由前端持有，按当前搜索条件在本地过滤 */
const RELATED_MATCHERS: Array<{
  prop: keyof SupportingDocsQuestionSearchParams
  match: (row: SupportingDocsQuestionData, value: string) => boolean
}> = [
  {
    prop: 'item',
    match: (row, value) => String(row.item ?? '').includes(value.trim())
  },
  {
    prop: 'serialNumber',
    match: (row, value) =>
      String(row.serialNumber ?? '').includes(value.trim())
  },
  {
    prop: 'subsystemName',
    match: (row, value) => row.subsystemName === value
  },
  {
    prop: 'feature',
    match: (row, value) =>
      row.featureLabel === dictLabelMaps.parent_property?.get(String(value))
  },
  {
    prop: 'subFeature',
    match: (row, value) =>
      row.subFeatureLabel === dictLabelMaps.sub_property?.get(String(value))
  }
]

const matchRelatedRow = (
  row: SupportingDocsQuestionData,
  params: Record<string, any>
) =>
  RELATED_MATCHERS.every(({ prop, match }) => {
    const value = params[prop]
    return value == null || value === '' || match(row, value)
  })

const searchbarItems = reactive<SearchbarItems<SupportingDocsQuestionSearchParams>>(
  [
    { label: '序号', prop: 'serialNumber', type: 'input' },
    { label: '测试项', prop: 'item', type: 'input' },
    {
      label: '特性',
      prop: 'feature',
      type: 'select',
      dictField: 'parent_property'
    },
    {
      label: '子特性',
      prop: 'subFeature',
      type: 'select',
      dictField: 'sub_property'
    },
    { label: '子系统名称', prop: 'subsystemName', type: 'select', options: [] }
  ]
)

const tableColumns: TableColumns = [
  { label: '序号', prop: 'serialNumber' },
  { label: '测试项', prop: 'item' },
  { label: '特性', prop: 'featureLabel' },
  { label: '子特性', prop: 'subFeatureLabel' },
  { label: '子系统名称', prop: 'subsystemName' },
  { label: '首次问题描述', prop: 'firstProblem', showOverflowTooltip: true }
]

/* 合并结果镜像，供打开时定位需勾选的已关联行 */
const mergedRows = ref<Array<SupportingDocsQuestionData>>([])

/* 打开后的首次取数要把已关联行全量勾选，之后搜索/翻页由 reserveSelection 自动保选 */
let pendingInitSelection = false

watch(visible, val => {
  if (val) pendingInitSelection = true
})

watch(mergedRows, async () => {
  if (!pendingInitSelection) return
  pendingInitSelection = false
  await nextTick()
  const relatedIdSet = new Set(relatedRows.value.map(row => row.id))
  mergedRows.value.forEach(row => {
    if (relatedIdSet.has(row.id)) {
      scResourcePageRef.value?.toggleRowSelection(row, true)
    }
  })
})

const fetchQuestionData = async (
  params: ListQuery<SupportingDocsQuestionSearchParams>
) => {
  const [[listErr, listRes], [relatedErr, relatedRes]] = await Promise.all([
    safeRequest(getSupportingDocsQuestionListAPI(params), {
      showError: false
    }),
    safeRequest(getSupportingDocsRelatedQuestionsAPI(props.dataId), {
      showError: false
    })
  ])
  // 列表失败抛出走 ScResourcePage 内部兜底（保留旧数据）；已关联失败按空处理
  if (listErr || !listRes) throw listErr
  relatedRows.value = relatedErr || !relatedRes ? [] : (relatedRes.data ?? [])
  const listRows = listRes.rows ?? []
  const matchedRows = relatedRows.value.filter(row =>
    matchRelatedRow(row, params)
  )
  mergedRows.value = [...listRows, ...matchedRows]
  return { rows: mergedRows.value, total: listRes.total + matchedRows.length }
}

const pageConfig: PageConfig<SupportingDocsQuestionData> = {
  searchConfig: { searchbarItems },
  operateConfig: { defaultButtons: [] },
  tableConfig: {
    tableColumns,
    showSelection: true,
    reserveSelection: true,
    showActionColumn: false
  },
  fetchData: fetchQuestionData
}

const handleSubmit = async () => {
  const assetAcceptanceResultIds = (
    scResourcePageRef.value?.getSelectedRows() ?? []
  ).map(item => (item as SupportingDocsQuestionData).id)
  const [err] = await safeRequest(
    saveSupportingDocsRelationAPI({
      assetAcceptanceResultIds,
      fileId: props.dataId
    }),
    { message: '关联问题失败' }
  )
  if (err) return
  ScMessage.success('关联问题成功！')
  emit('update-data')
  visible.value = false
}

const handleGetSubSystemOptions = async () => {
  const [err, res] = await safeRequest(getSubsystemOptionsAPI(), {
    showError: false
  })
  if (err || !res) return
  const subsystemItem = searchbarItems.find(
    item => item.prop === 'subsystemName'
  )
  if (subsystemItem && subsystemItem.type === 'select') {
    subsystemItem.options = (res.data ?? []).map(item => ({
      label: item.name,
      value: item.name
    }))
  }
}

onMounted(() => {
  handleGetSubSystemOptions()
  loadDictLabelMaps()
})
</script>

<template>
  <ScDialog
    v-model="visible"
    title="支持性文件问题关联"
    dialog-width="70%"
    @confirm="handleSubmit"
  >
    <div class="issues-table-content">
      <ScResourcePage
        v-if="visible"
        ref="scResourcePageRef"
        :page-config="pageConfig"
      />
    </div>
  </ScDialog>
</template>

<style lang="scss" scoped>
.issues-table-content {
  height: 500px;

  :deep(.sc-page-container) {
    height: 100%;
  }
}
</style>
