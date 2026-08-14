<script setup lang="ts">
import type {
  ServerDeviceSearchParams,
  ServerDeviceData,
  ServerDeviceFormData,
  ServerDeviceParentOption
} from '@/types/projectProcess/informationCollection/serverDevice'
import {
  createServerDeviceAPI,
  deleteServerDeviceAPI,
  getServerDeviceDataAPI,
  getServerDeviceDetailAPI,
  updateServerDeviceAPI
} from '@/api/projectProcess/informationCollection/serverDevice-api.ts'
import { getAssetSystemOptionsAPI } from '@/api/projectProcess/assetAssignment-api.ts'
import { defineFormItems } from '@/utils/form.ts'
import { findFormItem } from '@/utils/formItemUtils.ts'
import { useDialogForm } from '@/hooks/useDialogForm.ts'
import { useDeleteAction } from '@/hooks/useDeleteAction.ts'
import { useUploadDialog } from '@/hooks/useUploadDialog.ts'
import type { ScSwitchProps } from '@/components/ScBaseFormItems/ScSwitch'

const COMMON_EXTRA_PARAMS = {
  assetType: '4',
  assetSecondType: '42',
  assetThirdType: '1'
}

const SC_SWITCH_PROPS: Omit<ScSwitchProps, 'modelValue'> = {
  activeValue: 1,
  inactiveValue: 0
}

const searchbarItems = reactive<SearchbarItems<ServerDeviceSearchParams>>([
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
  { label: '所属业务应用系统/平台', prop: 'belongingSystemAssetName' },
  { label: '物理位置', prop: 'assetAddress' },
  { label: '服务器类型', prop: 'brandModel' },
  { label: 'ip地址', prop: 'ipAddress' },
  { label: '操作系统版本及补丁', prop: 'systemVersion' },
  { label: '安装的数据库系统', prop: 'dbSystemVersion' },
  { label: '中间件及版本', prop: 'middlewareVersion' },
  { label: '重要程度', prop: 'importanceLevelLabel' },
  { label: '访问方式', prop: 'accessMethod' },
  { label: '是否热备', prop: 'highAvailableLabel' },
  { label: '运行环境', prop: 'usagePosition' }
])

const pageConfig: PageConfig<ServerDeviceData> = {
  searchConfig: { searchbarItems },
  pageExtraParams: COMMON_EXTRA_PARAMS,
  treeConfig: {
    children: 'children',
    hasChildren: 'hasChildren',
    defaultExpandAll: true
  },
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
  fetchData: getServerDeviceDataAPI
}

const defaultFormData = reactive<ServerDeviceFormData>({
  assetName: '',
  parentId: '',
  assetAddress: '',
  brandModel: '',
  ipAddress: '',
  systemVersion: '',
  dbSystemVersion: '',
  middlewareVersion: '',
  importanceLevel: '',
  accessMethod: '',
  highAvailable: '',
  usagePosition: '',
  baseline: 1,
  scan: 1,
  penetrate: 1,
  ...COMMON_EXTRA_PARAMS
})

const formItems = defineFormItems<ServerDeviceFormData>([
  {
    label: '系统名称',
    prop: 'assetName',
    type: 'input',
    rules: [{ required: true, message: '系统名称不能为空', trigger: 'blur' }]
  },
  {
    label: '所属业务应用系统/平台',
    prop: 'parentId',
    type: 'select',
    componentProps: { options: [] }
  },
  {
    label: '物理位置',
    prop: 'assetAddress',
    type: 'input'
  },
  {
    label: '服务器类型',
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
    label: '操作系统版本及补丁',
    prop: 'systemVersion',
    type: 'input'
  },
  {
    label: '安装的数据库系统',
    prop: 'dbSystemVersion',
    type: 'input'
  },
  {
    label: '中间件及版本',
    prop: 'middlewareVersion',
    type: 'input'
  },
  {
    label: '重要程度',
    prop: 'importanceLevel',
    type: 'select',
    componentProps: { dictField: 'background_importance_level' }
  },
  {
    label: '访问方式',
    prop: 'accessMethod',
    type: 'input'
  },
  {
    label: '是否热备',
    prop: 'highAvailable',
    type: 'select',
    componentProps: { dictField: 'background_high_available' }
  },
  {
    label: '运行环境',
    prop: 'usagePosition',
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

const handlePageClick = (row: ServerDeviceData | undefined = undefined) =>
  open(row)

const { handleDelete } = useDeleteAction<ServerDeviceData>(
  ids => deleteServerDeviceAPI({ ids }),
  {
    message: '确定删除该服务器设备吗？删除后不可恢复。',
    onSuccess: () => scResourcePageRef.value?.refresh()
  }
)

/** 加载所属业务应用系统/平台选项（parentId 下拉） */
const loadParentOptions = async () => {
  const { data } = await getAssetSystemOptionsAPI({ assetType: '3' })
  const parentItem = findFormItem(formItems, 'parentId', 'select')
  if (parentItem?.componentProps) {
    const list = (data ?? []) as unknown as Array<ServerDeviceParentOption>
    parentItem.componentProps.options = list.map(item => ({
      label: `${item.assetName} ${item.ipAddress}`,
      value: item.id
    }))
  }
}

onMounted(() => loadParentOptions())

const { visible, formData, confirmLoading, open, handleConfirm, dialogTitle } =
  useDialogForm<ServerDeviceFormData>({
    defaultFormData,
    title: '服务器设备',
    fetchDetail: id => getServerDeviceDetailAPI(id),
    onCreate: data => createServerDeviceAPI(data),
    onUpdate: data => updateServerDeviceAPI(data),
    onSuccess: () => scResourcePageRef.value?.refresh()
  })

const pageDialogConfig = computed<DialogFormConfig>(() => ({
  formItems,
  title: dialogTitle.value,
  dialogWidth: '70%',
  labelWidth: '160px',
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
  title: '服务器设备导入',
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
