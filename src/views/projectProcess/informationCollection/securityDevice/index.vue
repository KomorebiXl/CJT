<script setup lang="ts">
import type {
  SecurityDeviceSearchParams,
  SecurityDeviceData,
  SecurityDeviceFormData
} from '@/types/projectProcess/informationCollection/securityDevice'
import {
  createSecurityDeviceAPI,
  deleteSecurityDeviceAPI,
  getSecurityDeviceDataAPI,
  getSecurityDeviceDetailAPI,
  updateSecurityDeviceAPI
} from '@/api/projectProcess/informationCollection/securityDevice-api.ts'
import { defineFormItems } from '@/utils/form.ts'
import { useDialogForm } from '@/hooks/useDialogForm.ts'
import { useDeleteAction } from '@/hooks/useDeleteAction.ts'
import { useUploadDialog } from '@/hooks/useUploadDialog.ts'
import type { ScSwitchProps } from '@/components/ScBaseFormItems/ScSwitch'

const COMMON_EXTRA_PARAMS = {
  assetType: '4',
  assetSecondType: '42',
  assetThirdType: '3'
}

const SC_SWITCH_PROPS: Omit<ScSwitchProps, 'modelValue'> = {
  activeValue: 1,
  inactiveValue: 0
}

const searchbarItems = reactive<SearchbarItems<SecurityDeviceSearchParams>>([
  {
    label: '系统资产名称',
    prop: 'assetName',
    type: 'input',
    placeholder: '请输入系统资产名称'
  },
  {
    label: 'ip',
    prop: 'ipAddress',
    type: 'input',
    placeholder: '请输入ip'
  }
])

const tableColumns = reactive<TableColumns>([
  { label: '系统名称', prop: 'assetName' },
  { label: '型号', prop: 'brandModel' },
  { label: '物理位置', prop: 'assetAddress' },
  { label: '所属网络区域', prop: 'storageDevice' },
  { label: 'ip地址', prop: 'ipAddress' },
  { label: '系统及运行平台', prop: 'belongingSystemAssetName' },
  { label: '测试账号密码', prop: 'highAccount' },
  { label: '是否热备', prop: 'highAvailableLabel' },
  { label: '备注', prop: 'remark', showOverflowTooltip: true }
])

const pageConfig: PageConfig<SecurityDeviceData> = {
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
  fetchData: getSecurityDeviceDataAPI
}

const defaultFormData = reactive<SecurityDeviceFormData>({
  assetName: '',
  brandModel: '',
  assetAddress: '',
  storageDevice: '',
  ipAddress: '',
  belongingSystemAssetName: '',
  highAccount: '',
  highAvailable: '',
  remark: '',
  baseline: 1,
  scan: 1,
  penetrate: 1,
  ...COMMON_EXTRA_PARAMS
})

const formItems = defineFormItems<SecurityDeviceFormData>([
  {
    label: '系统名称',
    prop: 'assetName',
    type: 'input',
    rules: [{ required: true, message: '系统名称不能为空', trigger: 'blur' }]
  },
  {
    label: '型号',
    prop: 'brandModel',
    type: 'input'
  },
  {
    label: '物理位置',
    prop: 'assetAddress',
    type: 'input'
  },
  {
    label: '所属网络区域',
    prop: 'storageDevice',
    type: 'input'
  },
  {
    label: 'IP 地址',
    prop: 'ipAddress',
    type: 'input'
  },
  {
    label: '系统及运行平台',
    prop: 'belongingSystemAssetName',
    type: 'input'
  },
  {
    label: '测试账号密码',
    prop: 'highAccount',
    type: 'input'
  },
  {
    label: '是否热备',
    prop: 'highAvailable',
    type: 'select',
    componentProps: { dictField: 'background_high_available' }
  },
  {
    label: '备注',
    prop: 'remark',
    type: 'input'
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
  }
])

const scResourcePageRef = useTemplateRef<PageInstance>('scResourcePageRef')

const handlePageClick = (row: SecurityDeviceData | undefined = undefined) =>
  open(row)

const { handleDelete } = useDeleteAction<SecurityDeviceData>(
  ids => deleteSecurityDeviceAPI({ ids }),
  {
    message: '确定删除该安全设备吗？删除后不可恢复。',
    onSuccess: () => scResourcePageRef.value?.refresh()
  }
)

const { visible, formData, confirmLoading, open, handleConfirm, dialogTitle } =
  useDialogForm<SecurityDeviceFormData>({
    defaultFormData,
    title: '安全设备',
    fetchDetail: id => getSecurityDeviceDetailAPI(id),
    onCreate: data => createSecurityDeviceAPI(data),
    onUpdate: data => updateSecurityDeviceAPI(data),
    onSuccess: () => scResourcePageRef.value?.refresh()
  })

const pageDialogConfig = computed<DialogFormConfig>(() => ({
  formItems,
  title: dialogTitle.value,
  columns: 2
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
  title: '安全设备导入',
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
