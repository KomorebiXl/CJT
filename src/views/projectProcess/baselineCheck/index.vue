<script setup lang="ts">
import type {
  BaselineCheckData,
  BaselineCheckFormData
} from '@/types/projectProcess/baselineCheck'
import {
  createBaselineCheckAPI,
  deleteBaselineCheckAPI,
  generateSubjectLogAPI,
  getBaselineCheckDataAPI,
  getBaselineCheckDetailAPI,
  updateBaselineCheckAPI
} from '@/api/projectProcess/baselineCheck-api.ts'
import { Document } from '@element-plus/icons-vue'
import { objectToFormData } from '@/utils/file.ts'
import { ScMessage } from '@/utils/ElUtils'
import { useScConfirm } from '@/hooks/useScConfirmDialog.ts'
import { useDialogForm } from '@/hooks/useDialogForm.ts'
import { useDeleteAction } from '@/hooks/useDeleteAction.ts'
import { findFormItem } from '@/utils/formItemUtils.ts'
import { useUploadDialog } from '@/hooks/useUploadDialog.ts'
import { getAssetSystemOptionsAPI } from '@/api/projectProcess/assetAssignment-api.ts'
import FileReferenceInput from '@/components/FileReferenceInput/index.vue'
import {
  searchbarItems,
  createBaselineCheckTableColumns,
  createBaselineCheckFormData,
  createBaselineCheckCommonFormItems,
  createFirstTestFormItems,
  createRegressionFormItems
} from './baselineCheck.config.ts'

const route = useRoute()

/** step：'1' 首次测评，'2' 回归测评；stateGrid：国网安全形态（路由 query stateGrid=1） */
let step: '1' | '2' = route.query.step === '2' ? '2' : '1'
const stateGrid = route.query.stateGrid === '1'

const scResourcePageRef = useTemplateRef<PageInstance>('scResourcePageRef')

const dialogFormData = createBaselineCheckFormData(step, stateGrid)

const formItems = [
  ...createBaselineCheckCommonFormItems(stateGrid),
  ...(step === '1'
    ? createFirstTestFormItems(stateGrid)
    : createRegressionFormItems(stateGrid))
]

const handlePageClick = (row: BaselineCheckData | undefined = undefined) =>
  open(row)

const { visible, formData, confirmLoading, open, handleConfirm, dialogTitle } =
  useDialogForm<BaselineCheckFormData, 'id', string, FormData>({
    defaultFormData: dialogFormData,
    title: '基线核查',
    transformRequest: data => {
      const stripped =
        step === '1'
          ? {
              ...data,
              regressionDescription: undefined,
              regressionDescription_files: undefined,
              regressionCheckResult: undefined,
              regressionResult: undefined,
              regressionSuggestion: undefined
            }
          : {
              ...data,
              resultDescription: undefined,
              resultDescription_files: undefined,
              checkResult: undefined,
              result: undefined,
              suggestion: undefined
            }
      // 国网形态按源契约附带 step 且不含 attribute；常规形态保持原有提交字段不变
      const payload = stateGrid
        ? { ...stripped, step, attribute: undefined }
        : stripped
      return objectToFormData(payload)
    },
    fetchDetail: id => getBaselineCheckDetailAPI(id),
    onCreate: data => createBaselineCheckAPI(data),
    onUpdate: data => updateBaselineCheckAPI(data),
    onSuccess: () => scResourcePageRef.value?.refresh()
  })

const { handleDelete } = useDeleteAction<BaselineCheckData>(
  ids => deleteBaselineCheckAPI({ ids }),
  {
    message: '确定删除该基线核查吗？删除后不可恢复。',
    onSuccess: () => scResourcePageRef.value?.refresh()
  }
)

/** 加载资产系统选项（assetId 下拉） */
const loadAssetOptions = async () => {
  const { data } = await getAssetSystemOptionsAPI()
  const assetItem = findFormItem(formItems, 'assetId', 'select')
  if (assetItem?.componentProps) {
    assetItem.componentProps.options = (data ?? []).map(item => ({
      label: item.ipAddress
        ? `${item.assetName} ${item.ipAddress}`
        : item.assetName,
      value: item.id
    }))
  }
}

onMounted(() => loadAssetOptions())

const { scConfirm } = useScConfirm()

/** 生成测试日志 */
const handleGenerateLog = async () => {
  await scConfirm({
    message: '确定生成测试日志吗？',
    confirmText: '确定生成'
  })
  await generateSubjectLogAPI({ step, type: '4' })
  ScMessage.success('生成成功')
  await scResourcePageRef.value?.refresh()
}

const uploadConfig: UploadConfig = {
  uploadUrl: '/asset/baseline/import',
  accept:
    stateGrid && step === '2'
      ? ['.xls', '.xlsx', '.doc', '.docx']
      : ['.xlsx', '.docx', '.zip']
}

const templateConfig: TemplateConfig = {
  templateUrl: '/asset/baseline/template',
  requestMethod: 'POST',
  showTemplateDownload: true,
  templates: [
    {
      label: 'Excel模板',
      fileName: '基线核查Excel模板',
      extraParams: { type: '1' }
    },
    {
      label: 'Word模板',
      fileName: '基线核查Word模板',
      extraParams: { type: '2' }
    }
  ]
}

const { open: importOpen } = useUploadDialog({
  uploadConfig,
  templateConfig,
  title: '基线核查导入',
  extraParams: { step, ...(stateGrid ? { stateGrid: '1' } : {}) },
  onSuccess: () => scResourcePageRef.value?.refresh()
})

/** 资产三级类型为指定值 */
const isAssetThirdType = (
  row: BaselineCheckData,
  ...types: Array<string | number>
) => types.some(t => String(row.assetThirdType) === String(t))

/** 资产名称：国网形态为 assetName + ipAddress；常规形态下三级类型 6/7 时拼接 brandModel，再拼接非空 ipAddress */
const formatAssetName = (row: BaselineCheckData) => {
  if (stateGrid) {
    return row.ipAddress ? `${row.assetName} ${row.ipAddress}` : row.assetName
  }
  let text = row.assetName ?? ''
  if (isAssetThirdType(row, '6', '7') && row.brandModel) {
    text += ` ${row.brandModel}`
  }
  if (row.ipAddress) {
    text += ` ${row.ipAddress}`
  }
  return text
}

/** 测评指标：attribute、level 均存在时追加 (attribute level) */
const formatPoint = (row: BaselineCheckData) => {
  let text = row.point ?? ''
  if (row.attribute && row.level) {
    text += `(${row.attribute}${row.level})`
  }
  return text
}

/** 结果内容输入占位：国网形态统一「测试结果内容」，常规形态区分检查/复测结果 */
const resultPlaceholder = stateGrid
  ? '请输入测试结果内容'
  : step === '1'
    ? '请输入检查结果'
    : '请输入复测结果'

const pageConfig: PageConfig<BaselineCheckData> = {
  searchConfig: { searchbarItems },
  pageExtraParams: {
    step,
    ...(stateGrid ? { stateGrid: '1', queryType: 1 } : {})
  },
  operateConfig: {
    defaultButtons: ['add', 'import'],
    defaultButtonsConfig: {
      add: { permission: 'asset:baseline:add' },
      import: { permission: 'asset:baseline:import' }
    },
    customButtons: [
      {
        id: 'generateLog',
        name: '生成测试日志',
        type: 'success',
        icon: Document,
        permission: 'subject:log:add',
        onClick: handleGenerateLog
      }
    ]
  },
  tableConfig: {
    tableColumns: createBaselineCheckTableColumns(step, stateGrid),
    defaultButtonsConfig: {
      edit: { permission: 'asset:baseline:edit' },
      delete: { permission: 'asset:baseline:remove' }
    }
  },
  fetchData: getBaselineCheckDataAPI
}

const pageDialogConfig = computed<DialogFormConfig>(() => ({
  formItems,
  title: dialogTitle.value,
  columns: 1
}))
</script>

<template>
  <div class="page-card">
    <ScResourcePage
      ref="scResourcePageRef"
      :page-config="pageConfig"
      @add="handlePageClick"
      @edit="handlePageClick"
      @import="importOpen()"
      @delete="handleDelete"
    >
      <template #column-assetName="{ row }">
        {{ formatAssetName(row as BaselineCheckData) }}
      </template>
      <template #column-point="{ row }">
        {{ formatPoint(row as BaselineCheckData) }}
      </template>
    </ScResourcePage>
    <ScDialogForm
      v-model="visible"
      :form-data="formData"
      :config="pageDialogConfig"
      :confirm-loading="confirmLoading"
      @confirm="handleConfirm"
    >
      <template #custom-resultDescription="{ data }">
        <FileReferenceInput
          v-model="data.resultDescription"
          v-model:file-list="data.resultDescription_files"
          :rows="5"
          :placeholder="resultPlaceholder"
        />
      </template>
      <template #custom-regressionDescription="{ data }">
        <FileReferenceInput
          v-model="data.regressionDescription"
          v-model:file-list="data.regressionDescription_files"
          :rows="5"
          :placeholder="resultPlaceholder"
        />
      </template>
    </ScDialogForm>
  </div>
</template>
