<script setup lang="ts">
import type {
  GuidelineData,
  GuidelineFormData,
  GuidelineSearchParams
} from '@/types/adminManagement/guideline'
import {
  createGuidelineDataAPI,
  deleteGuidelineAPI,
  getGuidelineDataAPI,
  getGuidelineDetailAPI,
  updateGuidelineDataAPI
} from '@/api/adminManagement/guideline-api.ts'
import { getIndustryStandardOptionsAPI } from '@/api/adminManagement/industryStandard-api.ts'
import { findSelectItem } from '@/utils/searchbarUtils.ts'
import { defineFormItems } from '@/utils/form.ts'
import { findFormSelectItem } from '@/utils/formItemUtils.ts'
import { mapSelectOptions } from '@/utils/optionUtils.ts'
import { useDialogForm } from '@/hooks/useDialogForm.ts'
import { useDeleteAction } from '@/hooks/useDeleteAction.ts'

const searchbarItems = reactive<SearchbarItems<GuidelineSearchParams>>([
  {
    label: '指导书名称',
    prop: 'guideName',
    type: 'input'
  },
  {
    label: '安全层面',
    prop: 'securityAspect',
    type: 'input'
  },
  {
    label: '标准',
    prop: 'standardId',
    type: 'select',
    options: []
  },
  {
    label: '属性标识',
    prop: 'attribute',
    type: 'select',
    componentProps: {
      dictField: 'background_attribute'
    }
  }
])

const tableColumns = reactive<TableColumns>([
  { label: '指导书名称', prop: 'guideName' },
  { label: '标准编号', prop: 'standardNo' },
  { label: '标准', prop: 'standardName' }
])

const pageConfig: PageConfig<GuidelineData> = {
  searchConfig: { searchbarItems },
  operateConfig: {
    defaultButtonsConfig: { add: { permission: 'background:guide:add' } }
  },
  tableConfig: {
    tableColumns,
    defaultButtonsConfig: {
      edit: { permission: 'background:guide:edit' },
      delete: { permission: 'background:guide:remove' }
    }
  },
  fetchData: getGuidelineDataAPI
}

const dialogFormData = reactive<GuidelineFormData>({
  guideName: '',
  standardId: ''
})

const formItems = defineFormItems<GuidelineFormData>([
  {
    label: '指导书名称',
    prop: 'guideName',
    type: 'input',
    rules: [{ required: true, message: '未填写指导书名称', trigger: 'blur' }]
  },
  {
    label: '标准',
    prop: 'standardId',
    type: 'select',
    componentProps: {
      options: []
    },
    rules: [{ required: true, message: '未选择标准', trigger: 'blur' }]
  }
])

const scResourcePageRef = useTemplateRef<PageInstance>('scResourcePageRef')

const { visible, formData, confirmLoading, open, handleConfirm, dialogTitle } =
  useDialogForm<GuidelineFormData>({
    defaultFormData: dialogFormData,
    title: '指导书',
    fetchDetail: id => getGuidelineDetailAPI(id),
    onCreate: data => createGuidelineDataAPI(data),
    onUpdate: data => updateGuidelineDataAPI(data),
    onSuccess: () => scResourcePageRef.value?.refresh()
  })

const pageDialogConfig = computed<DialogFormConfig>(() => ({
  formItems,
  title: dialogTitle.value,
  columns: 1
}))

const handlePageClick = (row: GuidelineData | undefined = undefined) => {
  open(row)
}

const { handleDelete } = useDeleteAction<GuidelineFormData>(
  ids => deleteGuidelineAPI({ ids }),
  {
    message: '确定删除该指导书吗？删除后不可恢复',
    onSuccess: () => scResourcePageRef.value?.refresh()
  }
)

const getIndustryStandardData = async () => {
  const { data } = await getIndustryStandardOptionsAPI()
  const options = mapSelectOptions(data, {
    label: ['standardNo', 'standardName'],
    value: 'id'
  })
  const standardItem = findSelectItem(searchbarItems, 'standardId')
  if (standardItem) standardItem.options = options
  const formItem = findFormSelectItem(formItems, 'standardId')
  if (formItem)
    formItem.componentProps = {
      ...formItem.componentProps,
      options
    }
}

onMounted(() => {
  getIndustryStandardData()
})
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
