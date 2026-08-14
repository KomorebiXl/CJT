<script setup lang="ts">
import type {
  MiddlewareSearchParams,
  MiddlewareData,
  MiddlewareFormData
} from '@/types/projectProcess/informationCollection/middleware'
import {
  createMiddlewareAPI,
  deleteMiddlewareAPI,
  getMiddlewareDataAPI,
  getMiddlewareDetailAPI,
  updateMiddlewareAPI
} from '@/api/projectProcess/informationCollection/middleware-api.ts'
import { defineFormItems } from '@/utils/form.ts'
import { useDialogForm } from '@/hooks/useDialogForm.ts'
import { useDeleteAction } from '@/hooks/useDeleteAction.ts'
import { useUploadDialog } from '@/hooks/useUploadDialog.ts'
import type { ScSwitchProps } from '@/components/ScBaseFormItems/ScSwitch'

const COMMON_EXTRA_PARAMS = {
  assetType: '4',
  assetSecondType: '42',
  assetThirdType: '7'
}

const SC_SWITCH_PROPS: Omit<ScSwitchProps, 'modelValue'> = {
  activeValue: 1,
  inactiveValue: 0
}

const searchbarItems = reactive<SearchbarItems<MiddlewareSearchParams>>([
  {
    label: '中间件类型',
    prop: 'assetName',
    type: 'input',
    placeholder: '请输入中间件类型'
  },
  {
    label: 'ip',
    prop: 'ipAddress',
    type: 'input',
    placeholder: '请输入ip'
  }
])

const tableColumns = reactive<TableColumns>([
  { label: '中间件类型', prop: 'assetName' },
  { label: '版本号', prop: 'brandModel' },
  { label: 'IP 地址', prop: 'ipAddress' },
  { label: '所属业务应用系统/平台', prop: 'belongingSystemAssetName' }
])

const pageConfig: PageConfig<MiddlewareData> = {
  searchConfig: { searchbarItems },
  pageExtraParams: COMMON_EXTRA_PARAMS,
  operateConfig: {
    defaultButtons: ['add', 'import'],
    defaultButtonsConfig: {
      add: { permission: 'asset:system:add' },
      import: { permission: 'asset:system:import' }
    }
  },
  tableConfig: {
    tableColumns,
    defaultButtonsConfig: {
      edit: { permission: 'asset:system:edit' },
      delete: { permission: 'asset:system:remove' }
    }
  },
  fetchData: getMiddlewareDataAPI
}

const defaultFormData = reactive<MiddlewareFormData>({
  assetName: '',
  brandModel: '',
  ipAddress: '',
  belongingSystemAssetName: '',
  baseline: 1,
  scan: 1,
  penetrate: 1,
  ...COMMON_EXTRA_PARAMS
})

const formItems = defineFormItems<MiddlewareFormData>([
  {
    label: '中间件类型',
    prop: 'assetName',
    type: 'input',
    rules: [{ required: true, message: '系统名称不能为空', trigger: 'blur' }]
  },
  {
    label: '版本号',
    prop: 'brandModel',
    type: 'input'
  },
  {
    label: 'IP 地址',
    prop: 'ipAddress',
    type: 'input',
    rules: [{ required: true, message: 'ip地址不能为空', trigger: 'blur' }]
  },
  {
    label: '是否基线检查',
    prop: 'baseline',
    type: 'switch',
    componentProps: SC_SWITCH_PROPS
  },
  {
    label: '是否漏洞扫描',
    prop: 'scan',
    type: 'switch',
    componentProps: SC_SWITCH_PROPS
  },
  {
    label: '是否渗透测试',
    prop: 'penetrate',
    type: 'switch',
    componentProps: SC_SWITCH_PROPS
  },
  {
    label: '所属业务应用系统/平台',
    prop: 'belongingSystemAssetName',
    type: 'input',
    colSpan: 2
  }
])

const scResourcePageRef = useTemplateRef<PageInstance>('scResourcePageRef')

const handlePageClick = (row: MiddlewareData | undefined = undefined) =>
  open(row)

const { handleDelete } = useDeleteAction<MiddlewareData>(
  ids => deleteMiddlewareAPI({ ids }),
  {
    message: '确定删除该中间件吗？删除后不可恢复。',
    onSuccess: () => scResourcePageRef.value?.refresh()
  }
)

const { visible, formData, confirmLoading, open, handleConfirm, dialogTitle } =
  useDialogForm<MiddlewareFormData>({
    defaultFormData,
    title: '中间件',
    fetchDetail: id => getMiddlewareDetailAPI(id),
    onCreate: data => createMiddlewareAPI(data),
    onUpdate: data => updateMiddlewareAPI(data),
    onSuccess: () => scResourcePageRef.value?.refresh()
  })

const pageDialogConfig = computed<DialogFormConfig>(() => ({
  formItems,
  title: dialogTitle.value,
  labelWidth: '140px'
}))

const uploadConfig: UploadConfig = {
  uploadUrl: '/asset/system/import',
  accept: ['.docx']
}

const templateConfig: TemplateConfig = {
  templateUrl: '/asset/system/template',
  requestMethod: 'POST',
  showTemplateDownload: true
}

const { open: importOpen } = useUploadDialog({
  uploadConfig,
  templateConfig,
  title: '中间件导入',
  extraParams: { scene: '3' },
  onSuccess: () => scResourcePageRef.value?.refresh()
})
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
    />
    <ScDialogForm
      v-model="visible"
      :form-data="formData"
      :config="pageDialogConfig"
      :confirm-loading="confirmLoading"
      @confirm="handleConfirm"
    />
  </div>
</template>

<style scoped lang="scss"></style>
