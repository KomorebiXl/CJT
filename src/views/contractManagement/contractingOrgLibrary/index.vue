<script setup lang="ts">
import type {
  ContractingOrgLibrarySearchParams,
  ContractingOrgLibraryData,
  ContractingOrgLibraryFormData
} from '@/types/contractManagement/contractingOrgLibrary'
import {
  createContractingOrgLibraryAPI,
  deleteContractingOrgLibraryAPI,
  getContractingOrgLibraryDataAPI,
  getContractingOrgLibraryDetailAPI,
  updateContractingOrgLibraryAPI
} from '@/api/contractManagement/contractingOrgLibrary-api.ts'
import { defineFormItems } from '@/utils/form.ts'
import { useDialogForm } from '@/hooks/useDialogForm.ts'
import { useDeleteAction } from '@/hooks/useDeleteAction.ts'
import { useUploadDialog } from '@/hooks/useUploadDialog.ts'

const searchbarItems = reactive<
  SearchbarItems<ContractingOrgLibrarySearchParams>
>([{ label: '公司名称', prop: 'companyName', type: 'input' }])

const tableColumns = reactive<TableColumns>([
  { label: '公司名称', prop: 'companyName' },
  { label: '邮寄地址', prop: 'address' },
  { label: '开户名称', prop: 'accountName' },
  { label: '开户银行', prop: 'depositBank' },
  { label: '银行账号', prop: 'accountNumber' },
  { label: '联行号', prop: 'clearingNumber' },
  { label: '备注', prop: 'remark' }
])

const pageConfig: PageConfig<ContractingOrgLibraryData> = {
  searchConfig: { searchbarItems },
  operateConfig: {
    defaultButtonsConfig: {
      add: { permission: 'business:contractingUnit:add' },
      import: { permission: 'business:contractingUnit:add' }
    }
  },
  tableConfig: {
    tableColumns,
    defaultButtonsConfig: {
      delete: { permission: 'business:contractingUnit:remove' }
    }
  },
  fetchData: getContractingOrgLibraryDataAPI
}

const exportConfig: ExportConfig = {
  exportUrl: '/asset/business/contractingUnit/export',
  fileName: '签约单位库'
}

const dialogFormData = reactive<ContractingOrgLibraryFormData>({
  companyName: '',
  address: '',
  accountName: '',
  depositBank: '',
  accountNumber: '',
  clearingNumber: '',
  remark: ''
})

const formItems = defineFormItems<ContractingOrgLibraryFormData>([
  {
    label: '公司名称',
    prop: 'companyName',
    type: 'input',
    rules: [{ required: true, message: '请输入公司名称', trigger: 'blur' }]
  },
  {
    label: '邮寄地址',
    prop: 'address',
    type: 'input',
    rules: [{ required: true, message: '请输入邮寄地址', trigger: 'blur' }]
  },
  {
    label: '开户名称',
    prop: 'accountName',
    type: 'input',
    rules: [{ required: true, message: '请输入开户名称', trigger: 'blur' }]
  },
  {
    label: '开户银行',
    prop: 'depositBank',
    type: 'input',
    rules: [{ required: true, message: '请输入开户银行', trigger: 'blur' }]
  },
  {
    label: '银行账号',
    prop: 'accountNumber',
    type: 'input',
    rules: [{ required: true, message: '请输入银行账号', trigger: 'blur' }]
  },
  {
    label: '联行号',
    prop: 'clearingNumber',
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
  row: ContractingOrgLibraryData | undefined = undefined
) => open(row)

const { handleDelete } = useDeleteAction<ContractingOrgLibraryData>(
  ids => deleteContractingOrgLibraryAPI({ ids }),
  {
    message: '确定删除该签约单位库吗？删除后不可恢复。',
    onSuccess: () => scResourcePageRef.value?.refresh()
  }
)

const { visible, formData, confirmLoading, open, handleConfirm, dialogTitle } =
  useDialogForm<ContractingOrgLibraryFormData>({
    defaultFormData: dialogFormData,
    title: '签约单位库',
    fetchDetail: id => getContractingOrgLibraryDetailAPI(id),
    onCreate: data => createContractingOrgLibraryAPI(data),
    onUpdate: data => updateContractingOrgLibraryAPI(data),
    onSuccess: () => scResourcePageRef.value?.refresh()
  })

const pageDialogConfig = computed<DialogFormConfig>(() => ({
  formItems,
  title: dialogTitle.value,
  columns: 2
}))

const uploadConfig: UploadConfig = {
  uploadUrl: '/asset/business/contractingUnit/import',
  accept: ['.xls', '.xlsx']
}

const templateConfig: TemplateConfig = {
  templateUrl: '/asset/business/contractingUnit/template',
  requestMethod: 'POST',
  showTemplateDownload: true
}

const { open: importOpen } = useUploadDialog({
  uploadConfig,
  templateConfig,
  title: '签约单位库导入',
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
