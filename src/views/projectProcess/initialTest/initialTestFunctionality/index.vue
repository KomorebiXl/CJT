<!--首轮测试-功能性-->
<script setup lang="ts">
import type {
  CreateSystemNameData,
  CreateSystemNameFormData,
  CreateSystemNameSearchParams
} from '@/types/projectProcess/createSystemName'
import {
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
import SystemDetails from './systemDetails.vue'

const scResourcePageRef = useTemplateRef<PageInstance>('scResourcePageRef')

const searchbarItems = reactive<SearchbarItems<{ name: string }>>([
  { prop: 'name', type: 'input', placeholder: '请输入名称' }
])

const tableColumns = reactive<TableColumns>([
  { label: '名称', prop: 'name', align: 'left' },
  { label: '未完成数量', prop: 'unfinishedTotal', width: 110 }
])

const currentSystem = ref<{ id: string; name: string } | null>(null)

const openSystem = (row: CreateSystemNameData) => {
  currentSystem.value = { id: row.id, name: row.name }
}

let parentRowsCache: Array<CreateSystemNameData> = []

const fetchData = async (params: ListQuery<CreateSystemNameSearchParams>) => {
  const res = await getCreateSystemNameDataAPI(params)
  if (!params.name) {
    parentRowsCache = res.rows
  }
  return res
}

const pageConfig: PageConfig<CreateSystemNameData> = {
  searchConfig: { searchbarItems },
  operateConfig: { defaultButtons: [] },
  tableConfig: {
    tableColumns,
    defaultButtonsConfig: {
      edit: { permission: 'acceptance:result:edit' },
      delete: {
        show: row => !!row.child && row.child.length === 0,
        permission: 'acceptance:result:remove'
      }
    },
    customActionButtons: [
      {
        name: '操作',
        type: 'primary',
        text: true,
        permission: 'asset:security:operate',
        show: row => !!row.child && row.child.length === 0,
        onClick: openSystem
      }
    ],
    showPagination: false
  },
  fetchData,
  treeConfig: { children: 'child', rowKey: 'id', showExpandButton: true }
}

const { handleDelete } = useDeleteAction<CreateSystemNameData>(
  ids => deleteCreateSystemNameAPI({ ids }),
  {
    message: '是否删除当前数据',
    onSuccess: () => scResourcePageRef.value?.refresh()
  }
)

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

const applyParentOptions = (currentId?: string) => {
  const parentFormItem = findFormItem(formItems, 'parentId', 'treeSelect')
  if (parentFormItem?.componentProps) {
    parentFormItem.componentProps.options = disableSubtreeById(
      parentRowsCache,
      currentId,
      { childrenKey: 'child' }
    )
  }
}

const { visible, formData, confirmLoading, open, handleConfirm, dialogTitle } =
  useDialogForm<CreateSystemNameFormData>({
    defaultFormData: dialogFormData,
    title: '功能性',
    fetchDetail: id => getCreateSystemNameDetailAPI(id),
    onUpdate: data => updateCreateSystemNameAPI(data),
    beforeOpen: (_data, row) => applyParentOptions(row?.id),
    onSuccess: () => scResourcePageRef.value?.refresh()
  })

const pageDialogConfig = computed<DialogFormConfig>(() => ({
  formItems,
  title: dialogTitle.value
}))
</script>

<template>
  <div class="page-card">
    <div v-show="!currentSystem" class="page-level">
      <ScResourcePage
        ref="scResourcePageRef"
        :page-config="pageConfig"
        @edit="open"
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
    <SystemDetails
      v-if="currentSystem"
      :system-id="currentSystem.id"
      :system-name="currentSystem.name"
      @back="currentSystem = null"
    />
  </div>
</template>

<style scoped lang="scss">
.page-level {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}
</style>
