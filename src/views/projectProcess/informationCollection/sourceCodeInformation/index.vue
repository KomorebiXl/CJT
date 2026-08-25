<script setup lang="ts">
import type {
  SourceCodeInformationSearchParams,
  SourceCodeInformationData,
  SourceCodeInformationFormData
} from '@/types/projectProcess/informationCollection/sourceCodeInformation'
import {
  createSourceCodeInformationAPI,
  deleteSourceCodeInformationAPI,
  getSourceCodeInformationDataAPI,
  getSourceCodeInformationDetailAPI,
  updateSourceCodeInformationAPI
} from '@/api/projectProcess/informationCollection/sourceCodeInformation-api.ts'
import { defineFormItems } from '@/utils/form.ts'
import { useDialogForm } from '@/hooks/useDialogForm.ts'
import { useDeleteAction } from '@/hooks/useDeleteAction.ts'

const searchbarItems = reactive<
  SearchbarItems<SourceCodeInformationSearchParams>
>([
  {
    label: '系统名称',
    prop: 'assetName',
    type: 'input'
  }
])

const tableColumns = reactive<TableColumns>([
  { label: '系统名称', prop: 'assetName', minWidth: 100 },
  { label: 'Hash', prop: 'belongingSystemAssetNo', minWidth: 100 },
  { label: '代码包', prop: 'belongingSystemAssetName', minWidth: 100 }
])

const pageConfig: PageConfig<SourceCodeInformationData> = {
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
  fetchData: getSourceCodeInformationDataAPI
}

const dialogFormData = reactive<SourceCodeInformationFormData>({
  assetName: '',
  belongingSystemAssetNo: '',
  belongingSystemAssetName: '',
  assetType: '3'
})

const formItems = defineFormItems<SourceCodeInformationFormData>([
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

const scResourcePageRef = useTemplateRef<PageInstance>('scResourcePageRef')

const handlePageClick = (
  row: SourceCodeInformationData | undefined = undefined
) => open(row)

const { handleDelete } = useDeleteAction<SourceCodeInformationData>(
  ids => deleteSourceCodeInformationAPI({ ids }),
  {
    message: '确定删除该源代码信息吗？删除后不可恢复。',
    onSuccess: () => scResourcePageRef.value?.refresh()
  }
)

const { visible, formData, confirmLoading, open, handleConfirm, dialogTitle } =
  useDialogForm<SourceCodeInformationFormData>({
    defaultFormData: dialogFormData,
    title: '源代码信息',
    fetchDetail: id => getSourceCodeInformationDetailAPI(id),
    onCreate: data => createSourceCodeInformationAPI(data),
    onUpdate: data => updateSourceCodeInformationAPI(data),
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
