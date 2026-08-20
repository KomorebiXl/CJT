<script setup lang="ts">
import type {
  WebScanData,
  WebScanDetail,
  WebScanFormData,
  WebScanSearchParams
} from '@/types/projectProcess/webScan'
import {
  createWebScanAPI,
  deleteWebScanAPI,
  generateSubjectLogAPI,
  getWebScanDataAPI,
  getWebScanDetailAPI,
  updateWebScanAPI
} from '@/api/projectProcess/webScan-api.ts'
import { Document } from '@element-plus/icons-vue'
import { ScMessage } from '@/utils/ElUtils'
import { useScConfirm } from '@/hooks/useScConfirmDialog.ts'
import { defineFormItems } from '@/utils/form.ts'
import { useDialogForm } from '@/hooks/useDialogForm.ts'
import { useDeleteAction } from '@/hooks/useDeleteAction.ts'
import { findFormItem } from '@/utils/formItemUtils.ts'
import { useUploadDialog } from '@/hooks/useUploadDialog.ts'
import { getAssetSystemOptionsAPI } from '@/api/projectProcess/assetAssignment-api.ts'
import type { DynamicFormListItem } from '@/components/DynamicFormList/dynamicFormList.ts'

const route = useRoute()

let step: '1' | '2' = route.query.step === '2' ? '2' : '1'

const DEFAULT_DETAILS: Omit<WebScanDetail, 'levelLabel' | 'statusLabel'> = {
  loopholeAddress: '',
  level: '',
  status: '',
  step
}

const searchbarItems = reactive<SearchbarItems<WebScanSearchParams>>([
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
  { label: '资产名称', prop: 'assetName' },
  { label: '漏洞名称', prop: 'loopholeName' },
  { label: '漏洞详情', prop: 'loopholes', slot: 'loopholes' },
  { label: '漏洞数量', prop: 'loopholeNum' }
])

const scResourcePageRef = useTemplateRef<PageInstance>('scResourcePageRef')

const dialogFormData = reactive<WebScanFormData>({
  assetId: '',
  loopholeName: '',
  description: '',
  suggestion: '',
  details: [DEFAULT_DETAILS],
  step
})

const formItems = defineFormItems<WebScanFormData>([
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
    label: '漏洞名称',
    prop: 'loopholeName',
    type: 'input',
    componentProps: { type: 'textarea' },
    rules: [{ required: true, message: '请输入漏洞名称', trigger: 'blur' }],
    colSpan: 2
  },
  {
    label: '详细描述',
    prop: 'description',
    type: 'input',
    componentProps: { type: 'textarea' },
    rules: [{ required: true, message: '请输入详细描述', trigger: 'blur' }],
    colSpan: 2
  },
  {
    label: '解决办法',
    prop: 'suggestion',
    type: 'input',
    componentProps: { type: 'textarea' },
    rules: [{ required: true, message: '请输入解决办法', trigger: 'blur' }],
    colSpan: 2
  },
  {
    label: '漏洞详情',
    prop: 'details',
    customSlot: 'details',
    colSpan: 2,
    rules: [{ required: true, message: '请添加漏洞详情', trigger: 'blur' }]
  }
])

const dynamicFormItems = reactive<
  Array<DynamicFormListItem<Omit<WebScanDetail, 'levelLabel' | 'statusLabel'>>>
>([
  { type: 'input', prop: 'loopholeAddress', placeholder: '请输入漏洞地址' },
  {
    type: 'select',
    prop: 'level',
    dictField: 'background_loophole_level',
    placeholder: '请选择漏洞等级'
  },
  {
    type: 'select',
    prop: 'status',
    dictField: 'background_code_status',
    placeholder: '请选择地址状态'
  }
])

const handlePageClick = (row: WebScanData | undefined = undefined) => open(row)

const { visible, formData, confirmLoading, open, handleConfirm, dialogTitle } =
  useDialogForm<WebScanFormData>({
    defaultFormData: dialogFormData,
    title: 'web扫描',
    beforeOpen: async data => {
      if (!data.details || !data.details.length) {
        data.details = [DEFAULT_DETAILS]
      }
    },
    fetchDetail: id => getWebScanDetailAPI(id),
    onCreate: data => createWebScanAPI(data),
    onUpdate: data => updateWebScanAPI(data),
    onSuccess: () => scResourcePageRef.value?.refresh()
  })

const { handleDelete } = useDeleteAction<WebScanData>(
  ids => deleteWebScanAPI({ ids }),
  {
    message: '确定删除该web扫描吗？删除后不可恢复。',
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
  await scConfirm({
    message: '确定生成测试日志吗？',
    confirmText: '确定生成'
  })
  await generateSubjectLogAPI({ step, type: '2' })
  ScMessage.success('生成成功')
  await scResourcePageRef.value?.refresh()
}

const uploadConfig: UploadConfig = {
  uploadUrl: '/asset/web/import',
  accept: ['.xlsx', '.zip']
}

const templateConfig: TemplateConfig = {
  templateUrl: '/asset/web/template',
  requestMethod: 'POST',
  showTemplateDownload: true
}

const { open: importOpen } = useUploadDialog({
  uploadConfig,
  templateConfig,
  title: 'web扫描导入',
  extraParams: { step },
  onSuccess: () => scResourcePageRef.value?.refresh()
})

const pageConfig: PageConfig<WebScanData> = {
  searchConfig: { searchbarItems },
  pageExtraParams: { step },
  operateConfig: {
    defaultButtons: ['add', 'import'],
    defaultButtonsConfig: {
      add: { permission: 'asset:web:add' },
      import: { permission: 'asset:web:import' }
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
      edit: { permission: 'asset:web:edit' },
      delete: { permission: 'asset:web:remove' }
    }
  },
  fetchData: getWebScanDataAPI
}

const pageDialogConfig = computed<DialogFormConfig>(() => ({
  formItems,
  title: dialogTitle.value,
  columns: 2
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
      <template #column-loopholes="{ row }">
        <div
          v-for="(detail, index) in (row as WebScanData).details"
          :key="index"
          class="detail-cell"
        >
          {{ detail.loopholeAddress }}（{{ detail.levelLabel }}/{{
            detail.statusLabel
          }}）
        </div>
      </template>
    </ScResourcePage>
    <ScDialogForm
      v-model="visible"
      :form-data="formData"
      :config="pageDialogConfig"
      :confirm-loading="confirmLoading"
      @confirm="handleConfirm"
    >
      <template #custom-details="{ data }">
        <DynamicFormList v-model="data.details" :items="dynamicFormItems" />
      </template>
    </ScDialogForm>
  </div>
</template>
