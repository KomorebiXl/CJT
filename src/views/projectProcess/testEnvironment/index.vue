<script setup lang="ts">
import type {
  TestEnvironmentData,
  TestEnvironmentFormData,
  TestEnvironmentSearchParams
} from '@/types/projectProcess/testEnvironment'
import type { CommonTestEnvironmentsData } from '@/types/adminManagement/commonTestEnvironments'
import {
  createTestEnvironmentAPI,
  deleteTestEnvironmentAPI,
  getTestEnvironmentDataAPI,
  getTestEnvironmentDetailAPI,
  updateTestEnvironmentAPI
} from '@/api/projectProcess/testEnvironment-api.ts'
import { getCommonTestEnvironmentsOptionsAPI } from '@/api/adminManagement/commonTestEnvironments-api.ts'
import { defineFormItems } from '@/utils/form.ts'
import { findFormItem } from '@/utils/formItemUtils.ts'
import { mapSelectOptions } from '@/utils/optionUtils.ts'
import { useDialogForm } from '@/hooks/useDialogForm.ts'
import { useDeleteAction } from '@/hooks/useDeleteAction.ts'
import { useUploadDialog } from '@/hooks/useUploadDialog.ts'

const searchbarItems = reactive<SearchbarItems<TestEnvironmentSearchParams>>([
  {
    label: '名称',
    prop: 'name',
    type: 'input',
    placeholder: '请输入名称'
  },
  {
    label: '操作系统',
    prop: 'system',
    type: 'input',
    placeholder: '请输入操作系统'
  },
  {
    label: '运行环境',
    prop: 'env',
    type: 'input',
    placeholder: '请输入运行环境'
  }
])

const tableColumns = reactive<TableColumns>([
  { label: '名称/型号/设备编号/提供方/用途', prop: 'name' },
  { label: '操作系统/数据库/中间层(应用层)', prop: 'system' },
  { label: '运行环境', prop: 'env' }
])

const dialogFormData = reactive<TestEnvironmentFormData>({
  common: '',
  name: '',
  system: '',
  env: ''
})

/** 常用环境选项原始数据，供联动覆盖时按 id 回查 */
const commonEnvOptions = ref<Array<CommonTestEnvironmentsData>>([])

/** 常用环境选择后联动覆盖 */
const handleCommonChange = (
  value: string,
  formData: TestEnvironmentFormData
) => {
  const option = commonEnvOptions.value.find(item => item.id === value)
  if (!option) return
  formData.name = option.name
  formData.system = option.system
  formData.env = option.env
}

const formItems = defineFormItems<TestEnvironmentFormData>([
  {
    label: '常用环境',
    prop: 'common',
    type: 'select',
    componentProps: { options: [], clearable: true },
    onChange: handleCommonChange
  },
  {
    label: '名称',
    prop: 'name',
    type: 'input',
    componentProps: { type: 'textarea', rows: 3 },
    colSpan: 2
  },
  {
    label: '操作系统',
    prop: 'system',
    type: 'input',
    componentProps: { type: 'textarea', rows: 3 },
    colSpan: 2
  },
  {
    label: '运行环境',
    prop: 'env',
    type: 'input',
    componentProps: { type: 'textarea', rows: 3 },
    colSpan: 2
  }
])

const scResourcePageRef = useTemplateRef<PageInstance>('scResourcePageRef')

/** 加载常用环境选项 */
const loadCommonEnvOptions = async () => {
  const { data } = await getCommonTestEnvironmentsOptionsAPI()
  commonEnvOptions.value = data ?? []
  const commonItem = findFormItem(formItems, 'common', 'select')
  if (commonItem?.componentProps) {
    commonItem.componentProps.options = mapSelectOptions(
      commonEnvOptions.value,
      { label: 'name', value: 'id' }
    )
  }
}

const handlePageClick = (row: TestEnvironmentData | undefined = undefined) =>
  open(row)

onMounted(() => {
  loadCommonEnvOptions()
})

const { visible, formData, confirmLoading, open, handleConfirm, dialogTitle } =
  useDialogForm<TestEnvironmentFormData>({
    defaultFormData: dialogFormData,
    title: '测试环境',
    fetchDetail: id => getTestEnvironmentDetailAPI(id),
    onCreate: data => createTestEnvironmentAPI(data),
    onUpdate: data => updateTestEnvironmentAPI(data),
    beforeOpen: async () => {
      await loadCommonEnvOptions()
    },
    onSuccess: () => scResourcePageRef.value?.refresh()
  })

const { handleDelete } = useDeleteAction<TestEnvironmentData>(
  ids => deleteTestEnvironmentAPI({ ids }),
  {
    message: '确定删除该测试环境吗？删除后不可恢复。',
    onSuccess: () => scResourcePageRef.value?.refresh()
  }
)

const uploadConfig: UploadConfig = {
  uploadUrl: '/asset/env/import',
  accept: ['.xlsx', '.docx']
}

const templateConfig: TemplateConfig = {
  templateUrl: '/asset/env/template',
  requestMethod: 'POST',
  showTemplateDownload: true
}

const { open: importOpen } = useUploadDialog({
  uploadConfig,
  templateConfig,
  title: '测试环境导入',
  onSuccess: () => scResourcePageRef.value?.refresh()
})

const pageConfig: PageConfig<TestEnvironmentData> = {
  searchConfig: { searchbarItems },
  operateConfig: {
    defaultButtons: ['add', 'import'],
    defaultButtonsConfig: {
      add: { permission: 'asset:env:add' },
      import: { permission: 'asset:env:import' }
    }
  },
  tableConfig: {
    tableColumns,
    defaultButtonsConfig: {
      edit: { permission: 'asset:env:edit' },
      delete: { permission: 'asset:env:remove' }
    }
  },
  fetchData: getTestEnvironmentDataAPI
}

const pageDialogConfig = computed<DialogFormConfig>(() => ({
  formItems,
  title: dialogTitle.value,
  columns: 2
}))
</script>

<template>
  <div class="page-card">
    <ScResourcePage
      ref="scResourcePageRef"
      :page-config="pageConfig"
      @add="handlePageClick"
      @edit="handlePageClick"
      @import="importOpen()"
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
