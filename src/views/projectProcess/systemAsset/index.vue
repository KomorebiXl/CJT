<script setup lang="ts">
import type {
  SystemAssetSearchParams,
  SystemAssetData,
  SystemAssetFormData
} from '@/types/projectProcess/systemAsset'
import {
  createSystemAssetAPI,
  deleteSystemAssetAPI,
  getSystemAssetDataAPI,
  getSystemAssetDetailAPI,
  updateSystemAssetAPI
} from '@/api/projectProcess/systemAsset-api.ts'
import { defineFormItems } from '@/utils/form.ts'
import { useDialogForm } from '@/hooks/useDialogForm.ts'
import { useDeleteAction } from '@/hooks/useDeleteAction.ts'
import { useUploadDialog } from '@/hooks/useUploadDialog.ts'
import { findFormItem } from '@/utils/formItemUtils.ts'
import { getDictOptions } from '@/utils/dict.ts'
import { getGuideOptionsAPI } from '@/api/adminManagement/guideline-api.ts'

const searchbarItems = reactive<SearchbarItems<SystemAssetSearchParams>>([
  {
    label: '资产编号',
    prop: 'assetNo',
    type: 'input',
    placeholder: '请输入资产编号'
  },
  {
    label: '资产名称',
    prop: 'assetName',
    type: 'input',
    placeholder: '请输入资产名称'
  }
])

const tableColumns = reactive<TableColumns>([
  { label: '资产编号', prop: 'assetNo' },
  { label: '资产名称', prop: 'assetName' },
  { label: '资产分类', prop: 'assetSecondTypeLabel' },
  { label: '资产位置', prop: 'assetAddress' },
  { label: '资产IP地址', prop: 'ipAddress' },
  { label: '所属部门', prop: 'responsibleDept' },
  { label: '责任人', prop: 'responsibleUser' },
  { label: '重要程度', prop: 'importLevel' },
  { label: '系统资产价值赋值', prop: 'assetValue' },
  { label: '保密性', prop: 'confidentiality' },
  { label: '完整性', prop: 'integrity' },
  { label: '可用性', prop: 'usability' },
  { label: '业务承载性赋值', prop: 'businessAssignment' },
  { label: '指导书', prop: 'guideName' }
])

const pageConfig: PageConfig<SystemAssetData> = {
  searchConfig: { searchbarItems },
  pageExtraParams: { assetType: '3' },
  operateConfig: {
    defaultButtons: ['add', 'import'],
    defaultButtonsConfig: {
      add: { permission: 'asset:system:add' },
      import: { permission: 'background:standard:query' }
    }
  },
  tableConfig: {
    tableColumns,
    defaultButtonsConfig: {
      edit: { permission: 'asset:system:edit' },
      delete: { permission: 'asset:system:remove' }
    }
  },
  fetchData: getSystemAssetDataAPI
}

/** 保密性/完整性/可用性/业务承载性赋值 静态 1-5 选项 */
const levelOptions = [1, 2, 3, 4, 5].map(v => ({
  label: String(v),
  value: String(v)
}))

const defaultFormData = reactive<SystemAssetFormData>({
  assetNo: '',
  assetName: '',
  assetSecondType: '',
  assetAddress: '',
  ipAddress: '',
  responsibleDept: '',
  responsibleUser: '',
  confidentiality: '',
  integrity: '',
  usability: '',
  businessAssignment: '',
  guideId: '',
  assetType: '3'
})

const formItems = defineFormItems<SystemAssetFormData>([
  {
    label: '系统资产编号',
    prop: 'assetNo',
    type: 'input'
  },
  {
    label: '系统资产名称',
    prop: 'assetName',
    type: 'input'
  },
  {
    label: '系统资产分类',
    prop: 'assetSecondType',
    type: 'select',
    componentProps: {
      options: [],
      clearable: false
    }
  },
  {
    label: '资产位置',
    prop: 'assetAddress',
    type: 'input'
  },
  {
    label: '资产IP地址',
    prop: 'ipAddress',
    type: 'input'
  },
  {
    label: '所属部门',
    prop: 'responsibleDept',
    type: 'input'
  },
  {
    label: '责任人',
    prop: 'responsibleUser',
    type: 'input'
  },
  {
    label: '保密性',
    prop: 'confidentiality',
    type: 'select',
    componentProps: {
      options: levelOptions,
      clearable: false
    }
  },
  {
    label: '完整性',
    prop: 'integrity',
    type: 'select',
    componentProps: {
      options: levelOptions,
      clearable: false
    }
  },
  {
    label: '可用性',
    prop: 'usability',
    type: 'select',
    componentProps: {
      options: levelOptions,
      clearable: false
    }
  },
  {
    label: '业务承载性赋值',
    prop: 'businessAssignment',
    type: 'select',
    componentProps: {
      options: levelOptions,
      clearable: false
    }
  },
  {
    label: '指导书',
    prop: 'guideId',
    type: 'select',
    componentProps: {
      options: [],
      filterable: true,
      clearable: false
    }
  }
])

const scResourcePageRef = useTemplateRef<PageInstance>('scResourcePageRef')

const handlePageClick = (row: SystemAssetData | undefined = undefined) =>
  open(row)

const { handleDelete } = useDeleteAction<SystemAssetData>(
  ids => deleteSystemAssetAPI({ ids }),
  {
    message: '确定删除该系统资产吗？删除后不可恢复。',
    onSuccess: () => scResourcePageRef.value?.refresh()
  }
)

/** 加载系统资产分类选项（asset_second_type 字典，过滤 30-39） */
const loadAssetSecondTypeOptions = async () => {
  const options = await getDictOptions('asset_second_type')
  const filtered = options.filter(
    item => item.value > '29' && item.value < '40'
  )
  const secondTypeItem = findFormItem(formItems, 'assetSecondType', 'select')
  if (secondTypeItem?.componentProps) {
    secondTypeItem.componentProps.options = filtered
  }
}

/** 加载指导书选项（guideId 下拉） */
const loadGuideOptions = async () => {
  const { data } = await getGuideOptionsAPI()
  const guideItem = findFormItem(formItems, 'guideId', 'select')
  if (guideItem?.componentProps) {
    guideItem.componentProps.options = (data ?? []).map(item => ({
      label: item.guideName,
      value: item.id
    }))
  }
}

onMounted(() => {
  loadAssetSecondTypeOptions()
  loadGuideOptions()
})

const { visible, formData, confirmLoading, open, handleConfirm, dialogTitle } =
  useDialogForm<SystemAssetFormData>({
    defaultFormData,
    title: '系统资产',
    fetchDetail: id => getSystemAssetDetailAPI(id),
    onCreate: data => createSystemAssetAPI(data),
    onUpdate: data => updateSystemAssetAPI(data),
    onSuccess: () => scResourcePageRef.value?.refresh()
  })

const pageDialogConfig = computed<DialogFormConfig>(() => ({
  formItems,
  title: dialogTitle.value,
  columns: 2
}))

const uploadConfig: UploadConfig = {
  uploadUrl: '/asset/business/import',
  accept: ['.xls', '.xlsx']
}

const templateConfig: TemplateConfig = {
  templateUrl: '/asset/system/template',
  requestMethod: 'POST',
  showTemplateDownload: true
}

const { open: importOpen } = useUploadDialog({
  uploadConfig,
  templateConfig,
  title: '系统资产导入',
  extraParams: { scene: '2' },
  onSuccess: () => scResourcePageRef.value?.refresh()
})
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
