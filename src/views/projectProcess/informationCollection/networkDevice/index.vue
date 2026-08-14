<script setup lang="ts">
import type {
  NetworkDeviceSearchParams,
  NetworkDeviceData,
  NetworkDeviceFormData
} from '@/types/projectProcess/informationCollection/networkDevice'
import {
  createNetworkDeviceAPI,
  deleteNetworkDeviceAPI,
  getNetworkDeviceDataAPI,
  getNetworkDeviceDetailAPI,
  updateNetworkDeviceAPI
} from '@/api/projectProcess/informationCollection/networkDevice-api.ts'
import { defineFormItems } from '@/utils/form.ts'
import { useDialogForm } from '@/hooks/useDialogForm.ts'
import { useDeleteAction } from '@/hooks/useDeleteAction.ts'
import { useUploadDialog } from '@/hooks/useUploadDialog.ts'
import type { ScSwitchProps } from '@/components/ScBaseFormItems/ScSwitch'

const COMMON_EXTRA_PARAMS = {
  assetType: '4',
  assetSecondType: '42',
  assetThirdType: '4'
}

const SC_SWITCH_PROPS: Omit<ScSwitchProps, 'modelValue'> = {
  activeValue: 1,
  inactiveValue: 0
}

const searchbarItems = reactive<SearchbarItems<NetworkDeviceSearchParams>>([
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
  { label: '主要用途', prop: 'usageDescription' },
  { label: '型号', prop: 'brandModel' },
  { label: '物理位置', prop: 'assetAddress' },
  { label: '所属网络区域', prop: 'storageDevice' },
  { label: 'ip地址', prop: 'ipAddress' },
  { label: '访问方式', prop: 'accessMethod' },
  { label: '测试账号密码', prop: 'highAccount' },
  { label: '是否热备', prop: 'highAvailableLabel' },
  { label: '重要程度', prop: 'importanceLevelLabel' },
  { label: '备注', prop: 'remark', showOverflowTooltip: true }
])

const pageConfig: PageConfig<NetworkDeviceData> = {
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
  fetchData: getNetworkDeviceDataAPI
}

const defaultFormData = reactive<NetworkDeviceFormData>({
  assetName: '',
  usageDescription: '',
  brandModel: '',
  assetAddress: '',
  storageDevice: '',
  ipAddress: '',
  accessMethod: '',
  highAccount: '',
  highAvailable: '',
  importanceLevel: '',
  remark: '',
  baseline: 1,
  scan: 1,
  penetrate: 1,
  ...COMMON_EXTRA_PARAMS
})

const formItems = defineFormItems<NetworkDeviceFormData>([
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
    type: 'input',
    rules: [{ required: true, message: 'ip地址不能为空', trigger: 'blur' }]
  },
  {
    label: '访问方式',
    prop: 'accessMethod',
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
    label: '重要程度',
    prop: 'importanceLevel',
    type: 'select',
    componentProps: { dictField: 'asset_importance_level' }
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
  },
  {
    label: '主要用途',
    prop: 'usageDescription',
    type: 'input',
    colSpan: 2,
    componentProps: { type: 'textarea', rows: 3 }
  }
])

const scResourcePageRef = useTemplateRef<PageInstance>('scResourcePageRef')

const handlePageClick = (row: NetworkDeviceData | undefined = undefined) =>
  open(row)

const { handleDelete } = useDeleteAction<NetworkDeviceData>(
  ids => deleteNetworkDeviceAPI({ ids }),
  {
    message: '确定删除该网络设备吗？删除后不可恢复。',
    onSuccess: () => scResourcePageRef.value?.refresh()
  }
)

const { visible, formData, confirmLoading, open, handleConfirm, dialogTitle } =
  useDialogForm<NetworkDeviceFormData>({
    defaultFormData,
    title: '网络设备',
    fetchDetail: id => getNetworkDeviceDetailAPI(id),
    onCreate: data => createNetworkDeviceAPI(data),
    onUpdate: data => updateNetworkDeviceAPI(data),
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
  title: '网络设备导入',
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
