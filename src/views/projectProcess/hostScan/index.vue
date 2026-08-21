<script setup lang="ts">
import type {
  HostScanData,
  HostScanFormData,
  HostScanSearchParams
} from '@/types/projectProcess/hostScan'
import {
  createHostScanAPI,
  deleteHostScanAPI,
  generateSubjectLogAPI,
  getHostScanDataAPI,
  getHostScanDetailAPI,
  updateHostScanAPI
} from '@/api/projectProcess/hostScan-api.ts'
import { Document } from '@element-plus/icons-vue'
import { ScMessage } from '@/utils/ElUtils'
import { useScConfirm } from '@/hooks/useScConfirmDialog.ts'
import { defineFormItems } from '@/utils/form.ts'
import { useDialogForm } from '@/hooks/useDialogForm.ts'
import { findFormItem } from '@/utils/formItemUtils.ts'
import { mapSelectOptions } from '@/utils/optionUtils.ts'
import { useUploadDialog } from '@/hooks/useUploadDialog.ts'
import { getAssetSystemOptionsAPI } from '@/api/projectProcess/assetAssignment-api.ts'
import { useDeleteAction } from '@/hooks/useDeleteAction.ts'

const route = useRoute()

let step: '1' | '2' = route.query.step === '2' ? '2' : '1'

const searchbarItems = reactive<SearchbarItems<HostScanSearchParams>>([
  {
    label: '漏洞名称',
    prop: 'loopholeName',
    type: 'input',
    placeholder: '请输入漏洞名称'
  },
  {
    label: '资产名称',
    prop: 'assetName',
    type: 'input',
    placeholder: '请输入资产名称'
  },
  {
    label: '漏洞等级',
    prop: 'level',
    type: 'select',
    dictField: 'background_loophole_level'
  }
])

const tableColumns = reactive<TableColumns>([
  { label: '资产名称', prop: 'assetName', slot: 'assetName' },
  { label: '端口', prop: 'loopholeAddress' },
  { label: '协议', prop: 'agreement' },
  { label: '漏洞名称', prop: 'loopholeName' },
  { label: '漏洞等级', prop: 'levelLabel' },
  { label: '状态', prop: 'statusLabel' },
  { label: '详细描述', prop: 'reason' },
  { label: '解决办法', prop: 'suggestion' }
])

const scResourcePageRef = useTemplateRef<PageInstance>('scResourcePageRef')

const dialogFormData = reactive<HostScanFormData>({
  assetId: '',
  loopholeAddress: '',
  agreement: '',
  loopholeName: '',
  level: '',
  reason: '',
  suggestion: '',
  status: '',
  step
})

const formItems = defineFormItems<HostScanFormData>([
  {
    label: '资产名称',
    prop: 'assetId',
    type: 'select',
    componentProps: { options: [] },
    rules: [
      { required: step === '2', message: '未填写资产名称', trigger: 'blur' }
    ]
  },
  {
    label: '端口',
    prop: 'loopholeAddress',
    type: 'input',
    rules: [
      { required: step === '2', message: '未填写端口号', trigger: 'blur' }
    ]
  },
  {
    label: '协议',
    prop: 'agreement',
    type: 'input'
  },
  {
    label: '状态',
    prop: 'status',
    type: 'select',
    componentProps: {
      dictField: 'background_code_status'
    }
  },
  {
    label: '漏洞等级',
    prop: 'level',
    type: 'select',
    componentProps: { dictField: 'background_loophole_level' },
    rules: [
      { required: step === '2', message: '未选择漏洞等级', trigger: 'blur' }
    ]
  },
  {
    label: '漏洞名称',
    prop: 'loopholeName',
    type: 'input',
    componentProps: { type: 'textarea', rows: 3 },
    colSpan: 2
  },
  {
    label: '详细描述',
    prop: 'reason',
    type: 'input',
    componentProps: { type: 'textarea', rows: 3 },
    colSpan: 2,
    rules: [{ required: step === '2', message: '未填写描述', trigger: 'blur' }]
  },
  {
    label: '解决方案',
    prop: 'suggestion',
    type: 'input',
    componentProps: { type: 'textarea', rows: 3 },
    colSpan: 2,
    rules: [
      { required: step === '2', message: '未填写解决方案', trigger: 'blur' }
    ]
  }
])

const handlePageClick = (row: HostScanData | undefined = undefined) => open(row)

const { visible, formData, confirmLoading, open, handleConfirm, dialogTitle } =
  useDialogForm<HostScanFormData>({
    defaultFormData: dialogFormData,
    title: '主机扫描',
    fetchDetail: id => getHostScanDetailAPI(id),
    onCreate: data => createHostScanAPI(data),
    onUpdate: data => updateHostScanAPI(data),
    onSuccess: () => scResourcePageRef.value?.refresh()
  })

/** 加载资产系统选项 */
const loadAssetOptions = async () => {
  const { data } = await getAssetSystemOptionsAPI()
  const assetItem = findFormItem(formItems, 'assetId', 'select')
  if (assetItem?.componentProps) {
    assetItem.componentProps.options = mapSelectOptions(data, {
      label: ['assetName', 'ipAddress'],
      value: 'id'
    })
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
  await generateSubjectLogAPI({ step, type: '3' })
  ScMessage.success('生成成功')
  await scResourcePageRef.value?.refresh()
}

const uploadConfig: UploadConfig = {
  uploadUrl: '/asset/host/import',
  accept: ['.xlsx', '.zip']
}

const templateConfig: TemplateConfig = {
  templateUrl: '/asset/host/template',
  requestMethod: 'POST',
  showTemplateDownload: true
}

const { open: importOpen } = useUploadDialog({
  uploadConfig,
  templateConfig,
  title: '主机扫描导入',
  extraParams: { step },
  onSuccess: () => scResourcePageRef.value?.refresh()
})

/** 资产名称：assetName 拼接非空 ipAddress */
const formatAssetName = (row: HostScanData) => {
  let text = row.assetName ?? ''
  if (row.ipAddress) {
    text += ` ${row.ipAddress}`
  }
  return text
}

const pageConfig: PageConfig<HostScanData> = {
  searchConfig: { searchbarItems },
  pageExtraParams: { step },
  operateConfig: {
    defaultButtons: ['add', 'import'],
    defaultButtonsConfig: {
      add: { permission: 'asset:host:add' },
      import: { permission: 'asset:host:import' }
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
      edit: { permission: 'asset:host:edit' },
      delete: { show: () => step === '2' }
    }
  },
  fetchData: getHostScanDataAPI
}

const pageDialogConfig = computed<DialogFormConfig>(() => ({
  formItems,
  title: dialogTitle.value,
  columns: 2
}))

const { handleDelete } = useDeleteAction<HostScanData>(
  ids => deleteHostScanAPI({ ids }),
  {
    onSuccess: () => scResourcePageRef.value?.refresh()
  }
)
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
        {{ formatAssetName(row as HostScanData) }}
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
