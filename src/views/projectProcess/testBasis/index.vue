<script setup lang="ts">
import type { ScSelectOption } from '@/components/ScBaseFormItems/ScSelect'
import type {
  TestBasisData,
  TestBasisFormData
} from '@/types/projectProcess/testBasis'
import { getIndustryStandardOptionsAPI } from '@/api/adminManagement/industryStandard-api.ts'
import {
  createTestBasisAPI,
  deleteTestBasisAPI,
  getTestBasisDataAPI,
  getTestBasisDetailAPI,
  updateTestBasisAPI
} from '@/api/projectProcess/testBasis-api.ts'
import { useDeleteAction } from '@/hooks/useDeleteAction.ts'
import { useDialogForm } from '@/hooks/useDialogForm.ts'
import { mapSelectOptions } from '@/utils/optionUtils.ts'
import {
  createTestBasisFormItems,
  searchbarItems,
  tableColumns
} from './testBasis.config'

const pageConfig: PageConfig<TestBasisData> = {
  searchConfig: { searchbarItems },
  operateConfig: {
    defaultButtonsConfig: { add: { permission: 'background:standard:add' } }
  },
  tableConfig: {
    tableColumns,
    defaultButtonsConfig: {
      edit: { permission: 'background:standard:edit' },
      delete: { permission: 'background:standard:remove' }
    }
  },
  fetchData: getTestBasisDataAPI
}

const dialogFormData = reactive<TestBasisFormData>({
  standardId: '',
  useType: '',
  otherReferences: ''
})

const standardOptions = ref<Array<ScSelectOption>>([])

const getStandardOptions = async () => {
  const { data } = await getIndustryStandardOptionsAPI()
  standardOptions.value = mapSelectOptions(data, {
    label: ['standardNo', 'standardName'],
    value: 'id',
    joinWith: ','
  })
}

const formItems = computed(() =>
  createTestBasisFormItems(standardOptions.value)
)

const scResourcePageRef = useTemplateRef<PageInstance>('scResourcePageRef')

const { handleDelete } = useDeleteAction<TestBasisData>(
  ids => deleteTestBasisAPI({ ids }),
  {
    message: '是否删除当前数据',
    onSuccess: () => scResourcePageRef.value?.refresh()
  }
)

const { visible, formData, confirmLoading, open, handleConfirm, dialogTitle } =
  useDialogForm<TestBasisFormData>({
    defaultFormData: dialogFormData,
    title: '测试依据',
    fetchDetail: id => getTestBasisDetailAPI(id),
    onCreate: data => createTestBasisAPI(data),
    onUpdate: data => updateTestBasisAPI(data),
    onSuccess: () => scResourcePageRef.value?.refresh()
  })

const pageDialogConfig = computed<DialogFormConfig>(() => ({
  formItems: formItems.value,
  title: dialogTitle.value,
  columns: 1
}))

onMounted(() => {
  getStandardOptions()
})
</script>

<template>
  <div class="page-card">
    <ScResourcePage
      ref="scResourcePageRef"
      :page-config="pageConfig"
      @add="open"
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
</template>
