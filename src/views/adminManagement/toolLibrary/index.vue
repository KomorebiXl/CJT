<script setup lang="ts">
import type {
  ToolLibrarySearchParams,
  ToolLibraryData,
  ToolLibraryFormData
} from '@/types/adminManagement/toolLibrary'
import {
  createToolLibraryAPI,
  deleteToolLibraryAPI,
  getToolLibraryDataAPI,
  getToolLibraryDetailAPI,
  updateToolLibraryAPI
} from '@/api/adminManagement/toolLibrary-api.ts'
import { defineFormItems } from '@/utils/form.ts'
import { useDialogForm } from '@/hooks/useDialogForm.ts'
import { useDeleteAction } from '@/hooks/useDeleteAction.ts'

const searchbarItems = reactive<SearchbarItems<ToolLibrarySearchParams>>([
  { label: '名称', prop: 'name', type: 'input' },
  { label: '用途', prop: 'purpose', type: 'input' }
])

const tableColumns = reactive<TableColumns>([
  { label: '名称', prop: 'name', slot: 'name' },
  { label: '类型', prop: 'type' },
  { label: '生厂商/来源', prop: 'source' },
  { label: '用途', prop: 'purpose' }
])

const pageConfig: PageConfig<ToolLibraryData> = {
  searchConfig: { searchbarItems },
  operateConfig: {
    defaultButtonsConfig: { add: { permission: 'background:tool:add' } }
  },
  tableConfig: {
    tableColumns,
    defaultButtonsConfig: {
      edit: { permission: 'background:tool:edit' },
      delete: { permission: 'background:tool:remove' }
    }
  },
  fetchData: getToolLibraryDataAPI
}

const dialogFormData = reactive<ToolLibraryFormData>({
  name: '',
  type: '',
  source: '',
  purpose: ''
})

const formItems = defineFormItems<ToolLibraryFormData>([
  {
    label: '名称',
    prop: 'name',
    type: 'input',
    rules: [{ required: true, message: '未填写名称', trigger: 'blur' }]
  },
  {
    label: '类型',
    prop: 'type',
    type: 'input'
  },
  {
    label: '生厂商/来源',
    prop: 'source',
    type: 'input'
  },
  {
    label: '用途',
    prop: 'purpose',
    type: 'input',
    rules: [{ required: true, message: '未填写用途', trigger: 'blur' }]
  }
])

const scResourcePageRef = useTemplateRef<PageInstance>('scResourcePageRef')

const handlePageClick = (row: ToolLibraryData | undefined = undefined) =>
  open(row)

const { handleDelete } = useDeleteAction<ToolLibraryData>(
  ids => deleteToolLibraryAPI({ ids }),
  {
    message: '确定删除该工具吗？删除后不可恢复。',
    onSuccess: () => scResourcePageRef.value?.refresh()
  }
)

const { visible, formData, confirmLoading, open, handleConfirm, dialogTitle } =
  useDialogForm<ToolLibraryFormData>({
    defaultFormData: dialogFormData,
    title: '工具库',
    fetchDetail: id => getToolLibraryDetailAPI(id),
    onCreate: data => createToolLibraryAPI(data),
    onUpdate: data => updateToolLibraryAPI(data),
    onSuccess: () => scResourcePageRef.value?.refresh()
  })

const pageDialogConfig = computed<DialogFormConfig>(() => ({
  formItems,
  title: dialogTitle.value
}))

const router = useRouter()

const handleNameClick = (row: ToolLibraryData) => {
  router.push({
    name: 'ToolVersion',
    params: { id: row.id }
  })
}
</script>

<template>
  <div class="page-card">
    <ScResourcePage
      ref="scResourcePageRef"
      :page-config="pageConfig"
      @add="handlePageClick"
      @edit="handlePageClick"
      @delete="handleDelete"
    >
      <template #column-name="{ row }">
        <ScLinkText
          :content="row.name"
          @click="handleNameClick(row as ToolLibraryData)"
        />
      </template>
    </ScResourcePage>
    <ScDialogForm
      v-model="visible"
      :form-data="formData"
      :config="pageDialogConfig"
      :confirm-loading="confirmLoading"
      @success="scResourcePageRef?.refresh()"
      @confirm="handleConfirm"
    />
  </div>
</template>

<style scoped lang="scss"></style>
