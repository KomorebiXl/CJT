<!--主页信息-软件被测对象 -->
<script setup lang="ts">
import type {
  SoftwareTestObjectData,
  SoftwareTestObjectFormData,
  SoftwareTestObjectSearchParams
} from '@/types/projectProcess/homeInfo/softwareTestObject'
import {
  addSoftwareTestObjectAPI,
  deleteSoftwareTestObjectAPI,
  getSoftwareTestObjectDetailAPI,
  getSoftwareTestObjectListAPI,
  updateSoftwareTestObjectAPI
} from '@/api/projectProcess/homeInfo/softwareTestObject-api.ts'
import { defineFormItems } from '@/utils/form.ts'
import { useDialogForm } from '@/hooks/useDialogForm.ts'
import { useDeleteAction } from '@/hooks/useDeleteAction.ts'
import { useUploadDialog } from '@/hooks/useUploadDialog.ts'

const searchbarItems = reactive<SearchbarItems<SoftwareTestObjectSearchParams>>(
  [
    {
      prop: 'belongingSystemAssetName',
      type: 'input',
      placeholder: '请输入承建单位'
    },
    { prop: 'assetName', type: 'input', placeholder: '请输入被测对象名称' }
  ]
)

const tableColumns = reactive<TableColumns>([
  { label: '被测对象名称', prop: 'assetName', align: 'left' },
  { label: '版本', prop: 'belongingSystemAssetNo' },
  { label: '承建单位', prop: 'belongingSystemAssetName' },
  { label: '部署环境', prop: 'assetAddress' }
])

const pageConfig: PageConfig<SoftwareTestObjectData> = {
  searchConfig: { searchbarItems },
  operateConfig: {
    defaultButtons: ['add', 'import'],
    defaultButtonsConfig: { add: { permission: 'asset:system:add' } }
  },
  tableConfig: {
    tableColumns,
    defaultButtonsConfig: {
      edit: { permission: 'asset:system:edit' },
      delete: { permission: 'asset:system:remove' }
    }
  },
  fetchData: getSoftwareTestObjectListAPI
}

const dialogFormData = reactive<SoftwareTestObjectFormData>({
  assetName: '',
  belongingSystemAssetNo: '',
  belongingSystemAssetName: '',
  assetAddress: ''
})

const formItems = defineFormItems<SoftwareTestObjectFormData>([
  {
    label: '被测对象名称',
    prop: 'assetName',
    type: 'input',
    rules: [{ required: true, message: '被测对象名称不能为空', trigger: 'blur' }]
  },
  {
    label: '版本',
    prop: 'belongingSystemAssetNo',
    type: 'input',
    rules: [{ required: true, message: '版本不能为空', trigger: 'blur' }]
  },
  {
    label: '承建单位',
    prop: 'belongingSystemAssetName',
    type: 'input',
    rules: [{ required: true, message: '承建单位不能为空', trigger: 'blur' }]
  },
  {
    label: '部署环境',
    prop: 'assetAddress',
    type: 'input',
    rules: [{ required: true, message: '部署环境不能为空', trigger: 'blur' }]
  }
])

const scResourcePageRef = useTemplateRef<PageInstance>('scResourcePageRef')

const handlePageClick = (row: SoftwareTestObjectData | undefined = undefined) =>
  open(row)

const { handleDelete } = useDeleteAction<SoftwareTestObjectData>(
  ids => deleteSoftwareTestObjectAPI({ ids }),
  {
    message: '是否删除当前数据',
    onSuccess: () => scResourcePageRef.value?.refresh()
  }
)

const { open: importOpen } = useUploadDialog({
  uploadConfig: {
    uploadUrl: '/asset/system/acceptance/import',
    accept: ['.xls', '.xlsx']
  },
  templateConfig: {
    templateUrl: '/asset/system/acceptance/template',
    requestMethod: 'POST',
    showTemplateDownload: true,
    templates: [
      { label: '下载模板', fileName: `软件被测对象模板_${Date.now()}` }
    ]
  },
  onSuccess: () => scResourcePageRef.value?.refresh()
})

const { visible, formData, confirmLoading, open, handleConfirm, dialogTitle } =
  useDialogForm<SoftwareTestObjectFormData>({
    defaultFormData: dialogFormData,
    title: '',
    fetchDetail: id => getSoftwareTestObjectDetailAPI(id),
    onCreate: data => addSoftwareTestObjectAPI(data),
    onUpdate: data => updateSoftwareTestObjectAPI(data),
    onSuccess: () => scResourcePageRef.value?.refresh()
  })

const pageDialogConfig = computed<DialogFormConfig>(() => ({
  formItems,
  title: dialogTitle.value
}))
</script>

<template>
  <div class="page-card">
    <ScResourcePage
      ref="scResourcePageRef"
      :page-config="pageConfig"
      @add="handlePageClick()"
      @edit="handlePageClick"
      @delete="handleDelete"
      @import="importOpen()"
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
