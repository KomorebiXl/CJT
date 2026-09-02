<script setup lang="ts">
import type { ScBaseFormItem } from '@/components/ScBaseForm/types/formItem.ts'
import type { DictOption } from '@/types/system/dict'
import type { DynamicFileColumn } from '@/types/projectProcess/projectProcessCommon'
import type {
  FeatureReviewFormData,
  FeatureReviewResult,
  FeatureReviewSearchParams
} from '@/types/projectProcess/testPlanReview'
import {
  addFeatureReviewAPI,
  deleteSystemDetailAPI,
  getFeatureReviewListAPI,
  getSystemDetailDetailAPI,
  updateFeatureReviewAPI
} from '@/api/projectProcess/testPlanReview-api.ts'
import { getDictOptions } from '@/utils/dict.ts'
import { findFormItem } from '@/utils/formItemUtils.ts'
import { useDeleteAction } from '@/hooks/useDeleteAction.ts'
import { useUploadDialog } from '@/hooks/useUploadDialog.ts'
import { useScConfirm } from '@/hooks/useScConfirmDialog.ts'
import { useDialogForm } from '@/hooks/useDialogForm.ts'
import { useIfUsePlanStealer } from '@/hooks/useProcessProjectFlags.ts'
import {
  DICT_FILTER_MAP,
  FEATURE_CONFIG,
  FEATURE_IMPORT_URL,
  FEATURE_TEMPLATE_URL
} from './testPlanReviewFeature.config'
import type { FeatureKey } from './testPlanReviewFeature.config'

const route = useRoute()

const scResourcePageRef = useTemplateRef<PageInstance>('scResourcePageRef')

const ifUsePlanStealer = useIfUsePlanStealer()

const feature = computed<FeatureKey | null>(() => {
  const f = route.query.feature
  return typeof f === 'string' && f in FEATURE_CONFIG ? (f as FeatureKey) : null
})

const cfg = computed(() =>
  feature.value ? FEATURE_CONFIG[feature.value] : null
)

const searchbarItems = reactive<SearchbarItems<FeatureReviewSearchParams>>([
  { prop: 'serialNumber', type: 'input', placeholder: '请输入序号' },
  { prop: 'item', type: 'input', placeholder: '请输入测试项' },
  { prop: 'subFeature', type: 'select', placeholder: '请选择子特性' }
])

const subFeatureOptions = ref<Array<DictOption>>([])

/** sub_property 字典按 feature 过滤后注入搜索项与编辑弹窗 */
const loadSubFeatureOptions = async () => {
  if (!feature.value) return
  const allowed = DICT_FILTER_MAP[feature.value] ?? []
  const options = await getDictOptions('sub_property')
  subFeatureOptions.value = options.filter(item =>
    allowed.includes(String(item.value))
  )
  const searchItem = searchbarItems.find(item => item.prop === 'subFeature')
  if (searchItem && searchItem.type === 'select')
    searchItem.options = subFeatureOptions.value
}

const dynamicData = ref<Array<DynamicFileColumn>>([])

// 基础列 + 动态文件列尾部追加；
// 方案未启用且配置 hideDescription（仅兼容性）时隐藏「测试项说明」
const columns = computed<TableColumns>(() => {
  const base = cfg.value?.columns ?? []
  const list =
    ifUsePlanStealer.value && cfg.value?.hideDescription
      ? base.filter(col => col.prop !== 'itemDescription')
      : [...base]
  return [
    ...list,
    ...dynamicData.value.map(item => ({
      label: item.name,
      prop: item.field
    }))
  ]
})

const pageConfig = computed<PageConfig<FeatureReviewResult>>(() => ({
  searchConfig: { searchbarItems },
  operateConfig: {
    defaultButtons: ['add', 'import', 'export'],
    defaultButtonsConfig: {
      add: { permission: 'asset:plan:add' },
      import: { permission: 'asset:plan:software:import' },
      export: { permission: cfg.value?.exportPermission ?? '' }
    }
  },
  tableConfig: {
    get tableColumns() {
      return columns.value
    },
    defaultButtonsConfig: {
      edit: { permission: 'asset:plan:edit' },
      delete: { permission: 'asset:plan:remove' }
    }
  },
  fetchData: async params => {
    const res = await getFeatureReviewListAPI({
      ...params,
      feature: feature.value ?? ''
    })
    dynamicData.value = res.data?.files ?? []
    return {
      rows: res.data?.result?.rows ?? [],
      total: res.data?.result?.total ?? 0
    }
  }
}))

const { scConfirm } = useScConfirm()

const exportConfig = computed<ExportConfig>(() => ({
  exportUrl: cfg.value?.exportUrl ?? '',
  fileName: cfg.value?.buildExportFileName?.(),
  exportExtraParams: { feature: feature.value ?? '' },
  beforeExport: async () => {
    try {
      await scConfirm({
        title: '提示',
        message: '生成执行记录表将清空原有的记录表数据，是否继续？',
        confirmText: '确定',
        cancelText: '取消'
      })
      if (cfg.value?.buildExportFileName)
        exportConfig.value.fileName = cfg.value.buildExportFileName()
      return true
    } catch {
      return false
    }
  }
}))

const importExtraParams = reactive<{ feature: string }>({
  feature: feature.value ?? ''
})

const { open: importOpen } = useUploadDialog({
  uploadConfig: {
    uploadUrl: FEATURE_IMPORT_URL,
    accept: ['.xls', '.xlsx'],
    formatSuccessMessage: response =>
      typeof response?.data === 'string' && response.data.trim()
        ? response.data
        : ''
  },
  templateConfig: {
    templateUrl: FEATURE_TEMPLATE_URL,
    requestMethod: 'GET',
    showTemplateDownload: true
  },
  title: '测试方案导入',
  extraParams: importExtraParams,
  onSuccess: () => scResourcePageRef.value?.refresh()
})

const { handleDelete } = useDeleteAction<FeatureReviewResult>(
  ids => deleteSystemDetailAPI({ ids }),
  {
    message: '是否删除当前数据',
    onSuccess: () => scResourcePageRef.value?.refresh()
  }
)

const dialogFormData = reactive<FeatureReviewFormData>({
  subFeature: '',
  serialNumber: '',
  item: '',
  itemResult: '',
  relatedItem: '',
  hasTestCase: '0',
  itemDescription: '',
  remark: ''
})

const formItems = ref<Array<ScBaseFormItem>>(cfg.value?.createFormItems() ?? [])

const { visible, formData, confirmLoading, open, handleConfirm, dialogTitle } =
  useDialogForm<FeatureReviewFormData>({
    defaultFormData: dialogFormData,
    title: '',
    fetchDetail: async id => {
      const res = await getSystemDetailDetailAPI(id)
      return {
        ...res,
        data: res.data?.result
      } as unknown as DataResponse<FeatureReviewFormData>
    },
    onCreate: data =>
      addFeatureReviewAPI({ ...data, feature: feature.value ?? '' }),
    onUpdate: data =>
      updateFeatureReviewAPI({
        ...data,
        feature: feature.value ?? ''
      } as FeatureReviewFormData & { id: string }),
    beforeOpen: async (_data, row) => {
      const isEdit = !!row
      formItems.value.forEach(item => {
        if (
          'componentProps' in item &&
          item.componentProps &&
          'disabled' in item.componentProps
        ) {
          item.componentProps.disabled = isEdit
        }
      })
      const subFeatureItem = findFormItem(
        formItems.value,
        'subFeature',
        'select'
      )
      if (subFeatureItem?.componentProps) {
        subFeatureItem.componentProps.options = subFeatureOptions.value
      }
    },
    onSuccess: () => scResourcePageRef.value?.refresh()
  })

const handlePageClick = (row: FeatureReviewResult | undefined = undefined) =>
  open(row)

const pageDialogConfig = computed<DialogFormConfig>(() => ({
  formItems: formItems.value,
  title: `${dialogTitle.value}${cfg.value?.name ?? ''}`
}))

// feature 切换：表单项重建、动态列清空、字典重过滤、搜索重置并重取
watch(feature, f => {
  if (!f) return
  importExtraParams.feature = f
  formItems.value = cfg.value?.createFormItems() ?? []
  dynamicData.value = []
  loadSubFeatureOptions()
  scResourcePageRef.value?.resetSearch()
})

onMounted(() => {
  loadSubFeatureOptions()
})
</script>

<template>
  <div class="page-card">
    <ScResourcePage
      ref="scResourcePageRef"
      :page-config="pageConfig"
      :export-config="exportConfig"
      @add="handlePageClick()"
      @edit="handlePageClick"
      @delete="handleDelete"
      @import="importOpen()"
    >
      <template #column-hasTestCase="{ row }">
        {{ row.hasTestCase === '1' ? '是' : '否' }}
      </template>
    </ScResourcePage>
    <ScDialogForm
      v-model="visible"
      :form-data="formData"
      :config="pageDialogConfig"
      :confirm-loading="confirmLoading"
      @confirm="handleConfirm"
    />
  </div>
</template>
