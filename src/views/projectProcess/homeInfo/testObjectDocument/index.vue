<!--主页信息-测试对象文档 -->
<script setup lang="ts">
import type {
  TestObjectDocumentData,
  TestObjectDocumentFormData,
  TestObjectDocumentSearchParams
} from '@/types/projectProcess/homeInfo/testObjectDocument'
import {
  addTestObjectDocumentAPI,
  deleteTestObjectDocumentAPI,
  getTestObjectDocumentDetailAPI,
  getTestObjectDocumentListAPI,
  updateTestObjectDocumentAPI
} from '@/api/projectProcess/homeInfo/testObjectDocument-api.ts'
import { defineFormItems } from '@/utils/form.ts'
import { safeRequest } from '@/utils/safeRequest.ts'
import { useDialogForm } from '@/hooks/useDialogForm.ts'
import { useDeleteAction } from '@/hooks/useDeleteAction.ts'
import { useUploadDialog } from '@/hooks/useUploadDialog.ts'

const searchbarItems = reactive<SearchbarItems<TestObjectDocumentSearchParams>>(
  [
    { prop: 'documentName', type: 'input', placeholder: '请输入文档名称' },
    {
      prop: 'submitMethod',
      type: 'select',
      dictField: 'submission_method',
      placeholder: '请选择提交方式'
    },
    {
      prop: 'type',
      type: 'select',
      dictField: 'document_type',
      placeholder: '请选择文档类型'
    }
  ]
)

const tableColumns = reactive<TableColumns>([
  { label: '文档名称', prop: 'documentName', align: 'left' },
  { label: '递交方式', prop: 'submitMethodLabel', width: 100 },
  { label: '文档类型', prop: 'typeLabel', slot: 'typeLabel', width: 180 },
  { label: '文档排序', prop: 'sort', slot: 'sort', width: 200 }
])

const pageConfig: PageConfig<TestObjectDocumentData> = {
  searchConfig: { searchbarItems },
  operateConfig: {
    defaultButtons: ['add', 'import'],
    defaultButtonsConfig: { add: { permission: 'asset:document:add' } }
  },
  tableConfig: {
    tableColumns,
    defaultButtonsConfig: {
      edit: { permission: 'asset:document:edit' },
      delete: { permission: 'asset:document:remove' }
    }
  },
  fetchData: getTestObjectDocumentListAPI
}

const dialogFormData = reactive<TestObjectDocumentFormData>({
  documentName: '',
  sort: 0,
  submitMethod: '10',
  type: '',
  remark: ''
})

const formItems = defineFormItems<TestObjectDocumentFormData>([
  {
    label: '文档名称',
    prop: 'documentName',
    type: 'input',
    componentProps: {
      type: 'textarea',
      rows: 3,
      placeholder: '请输入文档名称'
    },
    rules: [{ required: true, message: '文档名称不能为空', trigger: 'blur' }],
    colSpan: 2
  },
  {
    label: '文档排序',
    prop: 'sort',
    type: 'input',
    componentProps: { type: 'number', placeholder: '请输入排序名称' }
  },
  {
    label: '递交方式',
    prop: 'submitMethod',
    type: 'select',
    componentProps: {
      dictField: 'submission_method',
      placeholder: '请选择提交方式'
    },
    rules: [{ required: true, message: '递交方式不能为空', trigger: 'blur' }]
  },
  {
    label: '文档类型',
    prop: 'type',
    type: 'select',
    componentProps: {
      dictField: 'document_type',
      placeholder: '请选择文档类型'
    },
    rules: [{ required: true, message: '文档类型不能为空', trigger: 'blur' }]
  },
  {
    label: '备注',
    prop: 'remark',
    type: 'input',
    componentProps: { type: 'textarea', rows: 3, placeholder: '请输入备注' },
    hide: data => data.type !== '500'
  }
])

const scResourcePageRef = useTemplateRef<PageInstance>('scResourcePageRef')

const handlePageClick = (row: TestObjectDocumentData | undefined = undefined) =>
  open(row)

const handleSortBlur = async (row: TestObjectDocumentData) => {
  const [err] = await safeRequest(updateTestObjectDocumentAPI(row), {
    showError: false
  })
  if (err) return
  await scResourcePageRef.value?.refresh()
}

const { handleDelete } = useDeleteAction<TestObjectDocumentData>(
  ids => deleteTestObjectDocumentAPI({ ids }),
  {
    message: '是否删除当前数据',
    onSuccess: () => scResourcePageRef.value?.refresh()
  }
)

const { open: importOpen } = useUploadDialog({
  uploadConfig: {
    uploadUrl: '/asset/document/acceptance/import',
    accept: ['.xls', '.xlsx']
  },
  templateConfig: {
    templateUrl: '/asset/document/acceptance/template',
    requestMethod: 'POST',
    showTemplateDownload: true,
    templates: [
      { label: '下载模板', fileName: `测试对象文档模板_${Date.now()}` }
    ]
  },
  onSuccess: () => scResourcePageRef.value?.refresh()
})

const { visible, formData, confirmLoading, open, handleConfirm, dialogTitle } =
  useDialogForm<TestObjectDocumentFormData>({
    defaultFormData: dialogFormData,
    title: '',
    fetchDetail: id => getTestObjectDocumentDetailAPI(id),
    onCreate: data => addTestObjectDocumentAPI(data),
    onUpdate: data => updateTestObjectDocumentAPI(data),
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
    >
      <template #column-typeLabel="{ row }">
        {{ row.remark ? row.remark : row.typeLabel }}
      </template>
      <template #column-sort="{ row }">
        <ScInput
          v-model="row.sort"
          type="number"
          placeholder="请输入排序序号"
          @blur="handleSortBlur(row as TestObjectDocumentData)"
        />
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

<style scoped lang="scss"></style>
