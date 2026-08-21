<script setup lang="ts">
import type {
  ReferenceBasisData,
  ReferenceBasisFormData,
  ReferenceBasisSearchParams
} from '@/types/projectProcess/referenceBasis'
import {
  createReferenceBasisAPI,
  deleteReferenceBasisAPI,
  getReferenceBasisDataAPI,
  getReferenceBasisDetailAPI,
  updateReferenceBasisAPI
} from '@/api/projectProcess/referenceBasis-api.ts'
import { getIndustryStandardOptionsAPI } from '@/api/adminManagement/industryStandard-api.ts'
import { defineFormItems } from '@/utils/form.ts'
import { findFormItem } from '@/utils/formItemUtils.ts'
import { mapSelectOptions } from '@/utils/optionUtils.ts'
import { useDialogForm } from '@/hooks/useDialogForm.ts'
import { useDeleteAction } from '@/hooks/useDeleteAction.ts'

const searchbarItems = reactive<SearchbarItems<ReferenceBasisSearchParams>>([
  {
    label: '标准编号',
    prop: 'standardNo',
    type: 'input',
    placeholder: '请输入标准编号'
  },
  {
    label: '标准名称',
    prop: 'standardName',
    type: 'input',
    placeholder: '请输入标准名称'
  },
  {
    label: '使用类型',
    prop: 'useType',
    type: 'select',
    dictField: 'asset_standard_type'
  }
])

const tableColumns = reactive<TableColumns>([
  { label: '标准编号', prop: 'standardNo' },
  { label: '标准名称', prop: 'standardName' },
  { label: '颁布部门', prop: 'promulgationDept' },
  { label: '使用类型', prop: 'useTypeLabel' },
  { label: '颁布时间', prop: 'promulgationDate' },
  { label: '实施时间', prop: 'implementationDate' }
])

const pageConfig: PageConfig<ReferenceBasisData> = {
  searchConfig: { searchbarItems },
  operateConfig: {
    defaultButtonsConfig: { add: { permission: 'asset:standard:add' } }
  },
  tableConfig: {
    tableColumns,
    defaultButtonsConfig: {
      edit: { permission: 'asset:standard:edit' },
      delete: { permission: 'asset:standard:remove' }
    }
  },
  fetchData: getReferenceBasisDataAPI
}

const dialogFormData = reactive<ReferenceBasisFormData>({
  standardId: '',
  useType: ''
})

const formItems = defineFormItems<ReferenceBasisFormData>([
  {
    label: '标准',
    prop: 'standardId',
    type: 'select',
    componentProps: { options: [] },
    rules: [{ required: true, message: '标准不能为空', trigger: 'change' }]
  },
  {
    label: '使用类型',
    prop: 'useType',
    type: 'select',
    componentProps: { dictField: 'asset_standard_type' },
    rules: [{ required: true, message: '使用类型不能为空', trigger: 'change' }]
  }
])

const scResourcePageRef = useTemplateRef<PageInstance>('scResourcePageRef')

/** 加载标准选项 */
const loadStandardOptions = async () => {
  const { data } = await getIndustryStandardOptionsAPI()
  const standardItem = findFormItem(formItems, 'standardId', 'select')
  if (standardItem?.componentProps) {
    standardItem.componentProps.options = mapSelectOptions(data, {
      label: ['standardNo', 'standardName'],
      value: 'id'
    })
  }
}

const handlePageClick = (row: ReferenceBasisData | undefined = undefined) =>
  open(row)

onMounted(() => {
  loadStandardOptions()
})

const { handleDelete } = useDeleteAction<ReferenceBasisData>(
  ids => deleteReferenceBasisAPI({ ids }),
  {
    message: '确定删除该参考依据吗？删除后不可恢复。',
    onSuccess: () => scResourcePageRef.value?.refresh()
  }
)

const { visible, formData, confirmLoading, open, handleConfirm, dialogTitle } =
  useDialogForm<ReferenceBasisFormData>({
    defaultFormData: dialogFormData,
    title: '参考依据',
    fetchDetail: id => getReferenceBasisDetailAPI(id),
    onCreate: data => createReferenceBasisAPI(data),
    onUpdate: data => updateReferenceBasisAPI(data),
    beforeOpen: async () => {
      await loadStandardOptions()
    },
    onSuccess: () => scResourcePageRef.value?.refresh()
  })

const pageDialogConfig = computed<DialogFormConfig>(() => ({
  formItems,
  title: dialogTitle.value,
  columns: 1
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
