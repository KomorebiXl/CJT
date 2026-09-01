<script setup lang="ts">
import type {
  CreateSystemNameSearchParams,
  CreateSystemNameData,
  CreateSystemNameFormData
} from '@/types/projectProcess/createSystemName'
import {
  addCreateSystemNameAPI,
  deleteCreateSystemNameAPI,
  getCreateSystemNameDataAPI,
  getCreateSystemNameDetailAPI,
  updateCreateSystemNameAPI
} from '@/api/projectProcess/createSystemName-api.ts'
import { defineFormItems } from '@/utils/form.ts'
import { findFormItem } from '@/utils/formItemUtils.ts'
import { disableSubtreeById } from '@/utils/tree.ts'
import { useDialogForm } from '@/hooks/useDialogForm.ts'
import { useDeleteAction } from '@/hooks/useDeleteAction.ts'

const searchbarItems = reactive<SearchbarItems<CreateSystemNameSearchParams>>([
  { prop: 'name', type: 'input', placeholder: '请输入名称' }
])

const tableColumns = reactive<TableColumns>([
  { label: '名称', prop: 'name', align: 'left' }
])

const pageConfig: PageConfig<CreateSystemNameData> = {
  searchConfig: { searchbarItems },
  operateConfig: {
    defaultButtonsConfig: { add: { permission: 'asset:subsystem:add' } }
  },
  tableConfig: {
    tableColumns,
    defaultButtonsConfig: {
      edit: { permission: 'asset:subsystem:edit' },
      delete: {
        show: row => !!row.child && row.child.length === 0,
        permission: 'asset:subsystem:remove'
      }
    },
    showPagination: false
  },
  fetchData: getCreateSystemNameDataAPI,
  treeConfig: { children: 'child', rowKey: 'id' }
}

const dialogFormData = reactive<CreateSystemNameFormData>({
  name: '',
  parentId: ''
})

const formItems = defineFormItems<CreateSystemNameFormData>([
  {
    label: '层级',
    prop: 'parentId',
    type: 'treeSelect',
    componentProps: {
      options: [],
      nodeKey: 'id',
      fieldNames: { label: 'name', children: 'child' },
      renderAfterExpand: false
    }
  },
  {
    label: '名称',
    prop: 'name',
    type: 'input',
    rules: [{ required: true, message: '请输入名称', trigger: 'blur' }]
  }
])

const scResourcePageRef = useTemplateRef<PageInstance>('scResourcePageRef')

const handlePageClick = (row: CreateSystemNameData | undefined = undefined) =>
  open(row)

const { handleDelete } = useDeleteAction<CreateSystemNameData>(
  ids => deleteCreateSystemNameAPI({ ids }),
  {
    message: '是否删除当前数据',
    onSuccess: () => scResourcePageRef.value?.refresh()
  }
)

const loadParentOptions = async (currentId?: string) => {
  const { rows } = await getCreateSystemNameDataAPI({
    pageNum: 1,
    pageSize: 999999,
    name: ''
  })
  const options = disableSubtreeById(rows, currentId, { childrenKey: 'child' })
  const parentFormItem = findFormItem(formItems, 'parentId', 'treeSelect')
  if (parentFormItem?.componentProps) {
    parentFormItem.componentProps.options = options
  }
}

const { visible, formData, confirmLoading, open, handleConfirm, dialogTitle } =
  useDialogForm<CreateSystemNameFormData>({
    defaultFormData: dialogFormData,
    title: '系统名称',
    fetchDetail: id => getCreateSystemNameDetailAPI(id),
    onCreate: data => addCreateSystemNameAPI(data),
    onUpdate: data => updateCreateSystemNameAPI(data),
    beforeOpen: async (_data, row) => {
      await loadParentOptions(row?.id)
    },
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
