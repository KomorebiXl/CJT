<script setup lang="ts">
import type {
  ContractContactLibrarySearchParams,
  ContractContactLibraryData,
  ContractContactLibraryFormData
} from '@/types/contractManagement/contractContactLibrary'
import {
  createContractContactLibraryAPI,
  deleteContractContactLibraryAPI,
  getContractContactLibraryDataAPI,
  getContractContactLibraryDetailAPI,
  updateContractContactLibraryAPI
} from '@/api/contractManagement/contractContactLibrary-api.ts'
import { defineFormItems } from '@/utils/form.ts'
import { useDialogForm } from '@/hooks/useDialogForm.ts'
import { useDeleteAction } from '@/hooks/useDeleteAction.ts'
import { useUploadDialog } from '@/hooks/useUploadDialog.ts'

const searchbarItems = reactive<
  SearchbarItems<ContractContactLibrarySearchParams>
>([{ label: '联系人姓名', prop: 'name', type: 'input' }])

const tableColumns = reactive<TableColumns>([
  { label: '联系人名称', prop: 'name' },
  { label: '手机号码', prop: 'phone' },
  { label: '分机号', prop: 'extensionNumber' },
  { label: '备注', prop: 'remark' }
])

const pageConfig: PageConfig<ContractContactLibraryData> = {
  searchConfig: { searchbarItems },
  operateConfig: {
    defaultButtonsConfig: {
      add: { permission: 'business:contractLinkman:add' },
      import: { permission: 'business:contractLinkman:add' }
    }
  },
  tableConfig: {
    tableColumns,
    defaultButtonsConfig: {
      delete: { permission: 'business:contractLinkman:remove' }
    }
  },
  fetchData: getContractContactLibraryDataAPI
}

const exportConfig: ExportConfig = {
  exportUrl: '/asset/business/contractLinkman/export',
  fileName: '合同联系人库'
}

const dialogFormData = reactive<ContractContactLibraryFormData>({
  name: '',
  phone: '',
  extensionNumber: '',
  remark: ''
})

const formItems = defineFormItems<ContractContactLibraryFormData>([
  {
    label: '联系人名称',
    prop: 'name',
    type: 'input',
    rules: [{ required: true, message: '请输入联系人名称', trigger: 'blur' }]
  },
  {
    label: '手机号码',
    prop: 'phone',
    type: 'input',
    rules: [
      { required: true, message: '请输入手机号码', trigger: 'blur' },
      {
        pattern: /^1[3-9]\d{9}$/,
        message: '请输入正确的手机号码',
        trigger: 'blur'
      }
    ]
  },
  {
    label: '分机号',
    prop: 'extensionNumber',
    type: 'input'
  },
  {
    label: '备注',
    prop: 'remark',
    type: 'input',
    componentProps: { type: 'textarea' },
    colSpan: 2
  }
])

const scResourcePageRef = useTemplateRef<PageInstance>('scResourcePageRef')

const handlePageClick = (
  row: ContractContactLibraryData | undefined = undefined
) => open(row)

const { handleDelete } = useDeleteAction<ContractContactLibraryData>(
  ids => deleteContractContactLibraryAPI({ ids }),
  {
    message: '确定删除该合同联系人吗？删除后不可恢复。',
    onSuccess: () => scResourcePageRef.value?.refresh()
  }
)

const { visible, formData, confirmLoading, open, handleConfirm, dialogTitle } =
  useDialogForm<ContractContactLibraryFormData>({
    defaultFormData: dialogFormData,
    title: '合同联系人库',
    fetchDetail: id => getContractContactLibraryDetailAPI(id),
    onCreate: data => createContractContactLibraryAPI(data),
    onUpdate: data => updateContractContactLibraryAPI(data),
    onSuccess: () => scResourcePageRef.value?.refresh()
  })

const pageDialogConfig = computed<DialogFormConfig>(() => ({
  formItems,
  title: dialogTitle.value,
  columns: 2
}))

const uploadConfig: UploadConfig = {
  uploadUrl: '/asset/business/contractLinkman/import',
  accept: ['.xls', '.xlsx']
}

const templateConfig: TemplateConfig = {
  templateUrl: '/asset/business/contractLinkman/template',
  requestMethod: 'POST',
  showTemplateDownload: true
}

const { open: importOpen } = useUploadDialog({
  uploadConfig,
  templateConfig,
  title: '合同联系人库导入',
  onSuccess: () => scResourcePageRef.value?.refresh()
})
</script>

<template>
  <div class="page-card">
    <ScResourcePage
      ref="scResourcePageRef"
      :page-config="pageConfig"
      :export-config="exportConfig"
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
