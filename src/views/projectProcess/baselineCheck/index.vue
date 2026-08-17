<script setup lang="ts">
import type {
  BaselineCheckData,
  BaselineCheckFormData,
  BaselineCheckSearchParams
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
import { defineFormItems } from '@/utils/form.ts'
import { useDialogForm } from '@/hooks/useDialogForm.ts'
import { useDeleteAction } from '@/hooks/useDeleteAction.ts'
import { findFormItem } from '@/utils/formItemUtils.ts'
import { useUploadDialog } from '@/hooks/useUploadDialog.ts'
import { getAssetSystemOptionsAPI } from '@/api/projectProcess/assetAssignment-api.ts'
import FileReferenceInput from '@/components/FileReferenceInput/index.vue'

let step: string = '1'

const searchbarItems = reactive<SearchbarItems<BaselineCheckSearchParams>>([
  {
    label: '资产名称',
    prop: 'assetName',
    type: 'input',
    placeholder: '请输入资产名称'
  },
  {
    label: '测评指标',
    prop: 'point',
    type: 'input',
    placeholder: '请输入测评指标'
  },
  {
    label: '测评项',
    prop: 'item',
    type: 'input',
    placeholder: '请输入测评项'
  }
])

const tableColumns = reactive<TableColumns>([
  { label: '资产名称', prop: 'assetName', slot: 'assetName' },
  { label: '测评指标', prop: 'point', slot: 'point' },
  {
    label: '测评项',
    prop: 'item'
  },
  {
    label: '检查结果',
    prop: 'resultDescription'
  },
  {
    label: '是否符合规范',
    prop: 'resultLabel'
  },
  {
    label: '整改建议',
    prop: 'suggestion'
  }
])

const scResourcePageRef = useTemplateRef<PageInstance>('scResourcePageRef')

const dialogFormData = reactive<BaselineCheckFormData>({
  assetId: '',
  attribute: '',
  level: '',
  point: '',
  item: '',
  resultDescription: '',
  resultDescription_files: [],
  result: '',
  suggestion: ''
})

const formItems = defineFormItems<BaselineCheckFormData>([
  {
    label: '资产名称',
    prop: 'assetId',
    type: 'select',
    rules: [{ required: true, message: '请选择资产名称', trigger: 'blur' }],
    componentProps: {
      options: []
    }
  },
  {
    label: '属性',
    prop: 'attribute',
    type: 'select',
    componentProps: {
      dictField: 'background_attribute'
    }
  },
  {
    label: '等级',
    prop: 'level',
    type: 'select',
    componentProps: {
      dictField: 'background_point_grade'
    }
  },
  {
    label: '测评指标',
    prop: 'point',
    type: 'input',
    rules: [{ required: true, message: '请输入测评指标', trigger: 'blur' }]
  },
  {
    label: '测评项',
    prop: 'item',
    type: 'input',
    rules: [{ required: true, message: '请输入测评项', trigger: 'blur' }]
  },
  {
    label: '检查结果',
    prop: 'resultDescription',
    customSlot: 'resultDescription',
    rules: [{ required: true, message: '请输入检查结果', trigger: 'blur' }]
  },
  {
    label: '是否符合规范',
    prop: 'result',
    type: 'select',
    rules: [{ required: true, message: '请选择是否符合规范', trigger: 'blur' }],
    componentProps: {
      dictField: 'background_point_result'
    }
  },
  {
    label: '整改建议',
    prop: 'suggestion',
    type: 'input',
    componentProps: {
      type: 'textarea',
      rows: 3
    }
  }
])

const handlePageClick = (row: BaselineCheckData | undefined = undefined) =>
  open(row)

const { visible, formData, confirmLoading, open, handleConfirm, dialogTitle } =
  useDialogForm<BaselineCheckFormData, 'id', string, FormData>({
    defaultFormData: dialogFormData,
    title: '基线核查',
    transformRequest: data => objectToFormData(data),
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
  accept: ['.xlsx', '.docx', '.zip']
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
  extraParams: { step },
  onSuccess: () => scResourcePageRef.value?.refresh()
})

/** 资产三级类型为指定值 */
const isAssetThirdType = (
  row: BaselineCheckData,
  ...types: Array<string | number>
) => types.some(t => String(row.assetThirdType) === String(t))

/** 资产名称：assetName 为主体，三级类型为 6/7 时拼接 brandModel，再拼接非空 ipAddress */
const formatAssetName = (row: BaselineCheckData) => {
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

const pageConfig: PageConfig<BaselineCheckData> = {
  searchConfig: { searchbarItems },
  pageExtraParams: { step },
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
    tableColumns,
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
          placeholder="请输入检查结果"
        />
      </template>
    </ScDialogForm>
  </div>
</template>

<style scoped lang="scss"></style>
