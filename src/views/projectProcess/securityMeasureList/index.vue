<script setup lang="ts">
import type {
  SecurityMeasureListSearchParams,
  SecurityMeasureListData,
  SecurityMeasureListFormData
} from '@/types/projectProcess/securityMeasureList'
import {
  createSecurityMeasureListAPI,
  deleteSecurityMeasureListAPI,
  getSecurityMeasureListDataAPI,
  getSecurityMeasureListDetailAPI,
  updateSecurityMeasureListAPI
} from '@/api/projectProcess/securityMeasureList-api.ts'
import { defineFormItems } from '@/utils/form.ts'
import { useDialogForm } from '@/hooks/useDialogForm.ts'
import { useDeleteAction } from '@/hooks/useDeleteAction.ts'

const searchbarItems = reactive<
  SearchbarItems<SecurityMeasureListSearchParams>
>([
  {
    label: '安全措施名称',
    prop: 'measureName',
    type: 'input',
    placeholder: '请输入安全措施名称'
  }
])

const tableColumns = reactive<TableColumns>([
  { label: '安全措施名称', prop: 'measureName' },
  { label: '类型', prop: 'measureTypeLabel' },
  {
    label: '功能描述',
    prop: 'measureDescription',
    showOverflowTooltip: true
  },
  { label: '验证方式', prop: 'measureMethodLabel' },
  { label: '实施效果', prop: 'measureResultLabel' }
])

const pageConfig: PageConfig<SecurityMeasureListData> = {
  searchConfig: { searchbarItems },
  operateConfig: {
    defaultButtonsConfig: { add: { permission: 'asset:measure:add' } }
  },
  tableConfig: {
    tableColumns,
    defaultButtonsConfig: {
      edit: { permission: 'asset:measure:edit' },
      delete: { permission: 'asset:measure:remove' }
    }
  },
  fetchData: getSecurityMeasureListDataAPI
}

const dialogFormData = reactive<SecurityMeasureListFormData>({
  measureName: '',
  measureType: '',
  measureDescription: '',
  measureMethod: [],
  measureResult: ''
})

const formItems = defineFormItems<SecurityMeasureListFormData>([
  {
    label: '安全措施名称',
    prop: 'measureName',
    type: 'input',
    rules: [
      { required: true, message: '安全措施名称不能为空', trigger: 'blur' }
    ]
  },
  {
    label: '类型',
    prop: 'measureType',
    type: 'select',
    rules: [{ required: true, message: '类型不能为空', trigger: 'blur' }],
    componentProps: {
      dictField: 'asset_measure_type',
      filterable: true
    }
  },
  {
    label: '验证方式',
    prop: 'measureMethod',
    type: 'select',
    componentProps: {
      dictField: 'asset_measure_method',
      multiple: true
    }
  },
  {
    label: '实施效果',
    prop: 'measureResult',
    type: 'select',
    componentProps: {
      dictField: 'asset_measure_result'
    }
  },
  {
    label: '功能描述',
    prop: 'measureDescription',
    type: 'input',
    componentProps: { type: 'textarea' },
    colSpan: 2
  }
])

const scResourcePageRef = useTemplateRef<PageInstance>('scResourcePageRef')

const handlePageClick = (
  row: SecurityMeasureListData | undefined = undefined
) => open(row)

const { handleDelete } = useDeleteAction<SecurityMeasureListData>(
  ids => deleteSecurityMeasureListAPI({ ids }),
  {
    message: '确定删除该已有措施吗？删除后不可恢复。',
    onSuccess: () => scResourcePageRef.value?.refresh()
  }
)

const { visible, formData, confirmLoading, open, handleConfirm, dialogTitle } =
  useDialogForm<SecurityMeasureListFormData>({
    defaultFormData: dialogFormData,
    title: '已有措施',
    fetchDetail: id => getSecurityMeasureListDetailAPI(id),
    onCreate: data => createSecurityMeasureListAPI(data),
    onUpdate: data => updateSecurityMeasureListAPI(data),
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
      @success="scResourcePageRef?.refresh()"
      @confirm="handleConfirm"
    />
  </div>
</template>

<style scoped lang="scss"></style>
