<script setup lang="ts">
import type {
  VersionRevisionData,
  VersionRevisionFormData
} from '@/types/projectProcess/versionRevision'
import {
  createVersionRevisionAPI,
  deleteVersionRevisionAPI,
  getVersionRevisionDataAPI,
  getVersionRevisionDetailAPI,
  updateVersionRevisionAPI
} from '@/api/projectProcess/versionRevision-api.ts'
import { getUserOptionsAPI } from '@/api/projectManagement-api.ts'
import { defineFormItems } from '@/utils/form.ts'
import { findFormItem } from '@/utils/formItemUtils.ts'
import { mapSelectOptions } from '@/utils/optionUtils.ts'
import { useDialogForm } from '@/hooks/useDialogForm.ts'
import { useDeleteAction } from '@/hooks/useDeleteAction.ts'

const tableColumns = reactive<TableColumns>([
  { label: '版本号', prop: 'versionNum' },
  { label: '修改内容摘要', prop: 'operateContent', showOverflowTooltip: true },
  { label: '修改人', prop: 'operatorName' },
  { label: '修改日期', prop: 'operateDate' }
])

const pageConfig: PageConfig<VersionRevisionData> = {
  searchConfig: { searchbarItems: [] },
  operateConfig: {
    defaultButtonsConfig: { add: { permission: 'asset:version:add' } }
  },
  tableConfig: {
    tableColumns,
    defaultButtonsConfig: {
      edit: { permission: 'asset:version:edit' },
      delete: { permission: 'asset:version:remove' }
    }
  },
  fetchData: getVersionRevisionDataAPI
}

const dialogFormData = reactive<VersionRevisionFormData>({
  versionNum: '',
  operateContent: '',
  operator: '',
  operateDate: ''
})

const formItems = defineFormItems<VersionRevisionFormData>([
  {
    label: '版本号',
    prop: 'versionNum',
    type: 'input',
    rules: [{ required: true, message: '版本号不能为空', trigger: 'blur' }]
  },
  {
    label: '修改人',
    prop: 'operator',
    type: 'select',
    componentProps: { options: [] },
    rules: [{ required: true, message: '修改人不能为空', trigger: 'change' }]
  },
  {
    label: '修改日期',
    prop: 'operateDate',
    type: 'date',
    componentProps: { valueFormat: 'YYYY-MM-DD' },
    rules: [{ required: true, message: '修改日期不能为空', trigger: 'change' }]
  },
  {
    label: '修改内容摘要',
    prop: 'operateContent',
    type: 'input',
    componentProps: { type: 'textarea' },
    rules: [
      { required: true, message: '修改内容摘要不能为空', trigger: 'blur' }
    ],
    colSpan: 2
  }
])

const scResourcePageRef = useTemplateRef<PageInstance>('scResourcePageRef')

/** 加载修改人选项 */
const loadUserOptions = async () => {
  const { data } = await getUserOptionsAPI()
  const operatorItem = findFormItem(formItems, 'operator', 'select')
  if (operatorItem?.componentProps) {
    operatorItem.componentProps.options = mapSelectOptions(data, {
      label: 'nickName',
      value: 'userId'
    })
  }
}

const handlePageClick = (row: VersionRevisionData | undefined = undefined) =>
  open(row)

onMounted(() => {
  loadUserOptions()
})

const { handleDelete } = useDeleteAction<VersionRevisionData>(
  ids => deleteVersionRevisionAPI({ ids }),
  {
    message: '确定删除该版本修订吗？删除后不可恢复。',
    onSuccess: () => scResourcePageRef.value?.refresh()
  }
)

const { visible, formData, confirmLoading, open, handleConfirm, dialogTitle } =
  useDialogForm<VersionRevisionFormData>({
    defaultFormData: dialogFormData,
    title: '版本修订',
    fetchDetail: id => getVersionRevisionDetailAPI(id),
    onCreate: data => createVersionRevisionAPI(data),
    onUpdate: data => updateVersionRevisionAPI(data),
    beforeOpen: async () => {
      await loadUserOptions()
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
