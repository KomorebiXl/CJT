<script setup lang="ts">
import type {
  PortTestData,
  PortTestFormData
} from '@/types/projectProcess/portTest'
import {
  createPortTestAPI,
  deletePortTestAPI,
  generateSubjectLogAPI,
  getPortTestDataAPI,
  getPortTestDetailAPI,
  updatePortTestAPI
} from '@/api/projectProcess/portTest-api.ts'
import { Document } from '@element-plus/icons-vue'
import { objectToFormData } from '@/utils/file.ts'
import { ScMessage } from '@/utils/ElUtils'
import { useScConfirm } from '@/hooks/useScConfirmDialog.ts'
import { useDialogForm } from '@/hooks/useDialogForm.ts'
import { useDeleteAction } from '@/hooks/useDeleteAction.ts'
import { findFormItem } from '@/utils/formItemUtils.ts'
import { safeRequest } from '@/utils/safeRequest.ts'
import { useUploadDialog } from '@/hooks/useUploadDialog.ts'
import { getAssetSystemOptionsAPI } from '@/api/projectProcess/assetAssignment-api.ts'
import FileReferenceInput from '@/components/FileReferenceInput/index.vue'
import {
  createPortTestFormData,
  createPortTestFormItems,
  createPortTestTableColumns,
  searchbarItems
} from './portTest-config.ts'

const route = useRoute()

/** step：'1' 首次测试，'2' 回归测试 */
let step: '1' | '2' = route.query.step === '2' ? '2' : '1'

const scResourcePageRef = useTemplateRef<PageInstance>('scResourcePageRef')

const dialogFormData = createPortTestFormData(step)

const formItems = createPortTestFormItems(step)

const handlePageClick = (row: PortTestData | undefined = undefined) => open(row)

const { visible, formData, confirmLoading, open, handleConfirm, dialogTitle } =
  useDialogForm<PortTestFormData, 'id', string, FormData>({
    defaultFormData: dialogFormData,
    title: '端口测试',
    transformRequest: data => {
      const stripped =
        step === '1'
          ? {
              ...data,
              regressionDescription: undefined,
              regressionDescription_files: undefined,
              regressionCheckResult: undefined,
              regressionResult: undefined
            }
          : {
              ...data,
              resultDescription: undefined,
              resultDescription_files: undefined,
              checkResult: undefined,
              result: undefined
            }
      return objectToFormData({ ...stripped, step })
    },
    fetchDetail: id => getPortTestDetailAPI(id),
    onCreate: data => createPortTestAPI(data),
    onUpdate: data => updatePortTestAPI(data),
    onSuccess: () => scResourcePageRef.value?.refresh()
  })

const { handleDelete } = useDeleteAction<PortTestData>(
  ids => deletePortTestAPI({ ids }),
  {
    message: '确定删除该端口测试吗？删除后不可恢复。',
    onSuccess: () => scResourcePageRef.value?.refresh()
  }
)

/** 加载资产系统选项 */
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
  ScMessage.warning('正在生成测试日志，请等待...')
  const [err] = await safeRequest<BaseResponse, BaseResponse>(
    generateSubjectLogAPI({ step, type: '4' }),
    { showError: false }
  )
  if (!err) {
    ScMessage.success('测试日志生成成功！')
    return
  }
  const { code, msg } = err
  if (code === 500) return
  if (code !== 200 && msg) {
    await scConfirm({
      title: '警告',
      message: `${msg}?`,
      cancelText: '取消'
    }).catch(() => {})
  }
}

const uploadConfig: UploadConfig = {
  uploadUrl: '/asset/baseline/import',
  accept:
    step === '2'
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
      fileName: '端口测试Excel模板',
      extraParams: { type: '1' }
    },
    {
      label: 'Word模板',
      fileName: '端口测试Word模板',
      extraParams: { type: '2' }
    }
  ]
}

const { open: importOpen } = useUploadDialog({
  uploadConfig,
  templateConfig,
  title: '端口测试导入',
  extraParams: { step, stateGrid: '1' },
  onSuccess: () => scResourcePageRef.value?.refresh()
})

const formatAssetName = (row: PortTestData) =>
  row.ipAddress ? `${row.assetName} ${row.ipAddress}` : row.assetName

const formatPoint = (row: PortTestData) => {
  let text = row.point ?? ''
  if (row.attribute && row.level) {
    text += `(${row.attribute}${row.level})`
  }
  return text
}

const pageConfig: PageConfig<PortTestData> = {
  searchConfig: { searchbarItems },
  pageExtraParams: { step, stateGrid: '1', queryType: 2 },
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
    tableColumns: createPortTestTableColumns(step),
    defaultButtonsConfig: {
      edit: { permission: 'asset:baseline:edit' },
      delete: { permission: 'asset:baseline:remove' }
    }
  },
  fetchData: getPortTestDataAPI
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
        {{ formatAssetName(row as PortTestData) }}
      </template>
      <template #column-point="{ row }">
        {{ formatPoint(row as PortTestData) }}
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
          placeholder="请输入测试结果内容"
        />
      </template>
      <template #custom-regressionDescription="{ data }">
        <FileReferenceInput
          v-model="data.regressionDescription"
          v-model:file-list="data.regressionDescription_files"
          :rows="5"
          placeholder="请输入测试结果内容"
        />
      </template>
    </ScDialogForm>
  </div>
</template>
