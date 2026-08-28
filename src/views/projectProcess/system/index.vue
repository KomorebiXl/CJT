<script setup lang="ts">
import type {
  SystemSearchParams,
  SystemData,
  SystemFormData
} from '@/types/projectProcess/system'
import {
  createSystemAPI,
  deleteSystemAPI,
  getSystemDataAPI,
  getSystemDetailAPI,
  updateSystemAPI
} from '@/api/projectProcess/system-api.ts'
import { defineFormItems } from '@/utils/form.ts'
import { useDialogForm } from '@/hooks/useDialogForm.ts'
import { useDeleteAction } from '@/hooks/useDeleteAction.ts'

const searchbarItems = reactive<SearchbarItems<SystemSearchParams>>([
  {
    label: '系统资产名称',
    prop: 'unitComponentAssetName',
    type: 'input',
    placeholder: '请输入系统资产名称'
  },
  {
    label: '承载业务',
    prop: 'businessApplication',
    type: 'input',
    placeholder: '请输入承载业务'
  }
])

const tableColumns = reactive<TableColumns>([
  { label: '系统名称', prop: 'assetName' },
  { label: 'Hash', prop: 'belongingSystemAssetNo' },
  { label: '代码包', prop: 'belongingSystemAssetName' }
])

const scResourcePageRef = useTemplateRef<PageInstance>('scResourcePageRef')

const pageConfig: PageConfig<SystemData> = {
  searchConfig: { searchbarItems },
  pageExtraParams: { assetType: '3' },
  operateConfig: {
    defaultButtonsConfig: { add: { permission: 'asset:system:add' } }
  },
  tableConfig: {
    tableColumns,
    defaultButtonsConfig: {
      edit: { permission: 'asset:system:edit' },
      delete: { permission: 'asset:system:remove' }
    }
  },
  fetchData: getSystemDataAPI
}

const dialogFormData = reactive<SystemFormData>({
  assetName: '',
  belongingSystemAssetNo: '',
  belongingSystemAssetName: '',
  assetType: '3'
})

const formItems = defineFormItems<SystemFormData>([
  {
    label: '系统名称',
    prop: 'assetName',
    type: 'input'
  },
  {
    label: 'Hash',
    prop: 'belongingSystemAssetNo',
    type: 'input'
  },
  {
    label: '代码包',
    prop: 'belongingSystemAssetName',
    type: 'input'
  }
])

const handlePageClick = (row: SystemData | undefined = undefined) => open(row)

const { handleDelete } = useDeleteAction<SystemData>(
  ids => deleteSystemAPI({ ids }),
  {
    message: '确定删除该系统吗？删除后不可恢复。',
    onSuccess: () => scResourcePageRef.value?.refresh()
  }
)

const { visible, formData, confirmLoading, open, handleConfirm, dialogTitle } =
  useDialogForm<SystemFormData>({
    defaultFormData: dialogFormData,
    title: '系统',
    fetchDetail: id => getSystemDetailAPI(id),
    onCreate: data => createSystemAPI(data),
    onUpdate: data => updateSystemAPI(data),
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
      @add="handlePageClick"
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
