<script setup lang="ts">
import type {
  SystemComponentAndUnitAssetSearchParams,
  SystemComponentAndUnitAssetData,
  SystemComponentAndUnitAssetFormData
} from '@/types/projectProcess/systemComponentAndUnitAsset'
import {
  createSystemComponentAndUnitAssetAPI,
  deleteSystemComponentAndUnitAssetAPI,
  getSystemComponentAndUnitAssetDataAPI,
  getSystemComponentAndUnitAssetDetailAPI,
  updateSystemComponentAndUnitAssetAPI
} from '@/api/projectProcess/systemComponentAndUnitAsset-api.ts'
import { defineFormItems } from '@/utils/form.ts'
import { useDialogForm } from '@/hooks/useDialogForm.ts'
import { useDeleteAction } from '@/hooks/useDeleteAction.ts'
import { useUploadDialog } from '@/hooks/useUploadDialog.ts'
import { findFormItem } from '@/utils/formItemUtils.ts'
import { getDictOptionsMap } from '@/utils/dict.ts'
import type { DictOption } from '@/api/system/dict'
import { getGuideOptionsAPI } from '@/api/adminManagement/guideline-api.ts'

defineOptions({ name: 'AssetComposition' })

const searchbarItems = reactive<
  SearchbarItems<SystemComponentAndUnitAssetSearchParams>
>([
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
  { label: '资产三级分类', prop: 'assetThirdTypeLabel' },
  { label: '资产位置', prop: 'assetAddress' },
  { label: '资产IP地址', prop: 'ipAddress' },
  { label: '所属部门', prop: 'responsibleDept' },
  { label: '责任人', prop: 'responsibleUser' },
  { label: '系统资产价值赋值', prop: 'assetValue' },
  { label: '重要程度', prop: 'importLevel' },
  { label: '保密性', prop: 'confidentiality' },
  { label: '完整性', prop: 'integrity' },
  { label: '可用性', prop: 'usability' },
  { label: '指导书', prop: 'guideName' }
])

const assetSecondTypeOptions = ref<Array<DictOption>>([])

const activeAssetSecondType = ref<string>('41')

const listExtraParams = reactive({
  assetType: '4',
  assetSecondType: '41'
})

const uploadExtraParams = reactive({
  scene: '2',
  assetSecondType: '41'
})

watch(activeAssetSecondType, value => {
  listExtraParams.assetSecondType = value
  uploadExtraParams.assetSecondType = value
  scResourcePageRef.value?.refresh()
})

const pageConfig: PageConfig<SystemComponentAndUnitAssetData> = {
  searchConfig: { searchbarItems },
  pageExtraParams: listExtraParams,
  operateConfig: {
    defaultButtons: ['add', 'import'],
    defaultButtonsConfig: {
      add: { permission: 'project:overview:add' },
      import: { permission: 'background:standard:query' }
    }
  },
  tableConfig: {
    tableColumns,
    defaultButtonsConfig: {
      edit: { permission: 'project:overview:edit' },
      delete: { permission: 'project:overview:remove' }
    }
  },
  fetchData: getSystemComponentAndUnitAssetDataAPI
}

/** 保密性/完整性/可用性 静态 1-5 选项 */
const levelOptions = [1, 2, 3, 4, 5].map(v => ({
  label: String(v),
  value: String(v)
}))

const defaultFormData = reactive<SystemComponentAndUnitAssetFormData>({
  assetSecondType: '',
  assetThirdType: '',
  assetNo: '',
  assetName: '',
  assetAddress: '',
  confidentiality: '',
  integrity: '',
  usability: '',
  guideId: '',
  assetType: '4'
})

const formItems = defineFormItems<SystemComponentAndUnitAssetFormData>([
  {
    label: '资产三级分类',
    prop: 'assetThirdType',
    type: 'select',
    componentProps: {
      options: []
    }
  },
  {
    label: '资产编号',
    prop: 'assetNo',
    type: 'input'
  },
  {
    label: '资产名称',
    prop: 'assetName',
    type: 'input'
  },
  {
    label: '资产位置',
    prop: 'assetAddress',
    type: 'input'
  },
  {
    label: '保密性',
    prop: 'confidentiality',
    type: 'select',
    componentProps: {
      options: levelOptions
    }
  },
  {
    label: '完整性',
    prop: 'integrity',
    type: 'select',
    componentProps: {
      options: levelOptions
    }
  },
  {
    label: '可用性',
    prop: 'usability',
    type: 'select',
    componentProps: {
      options: levelOptions
    }
  },
  {
    label: '指导书',
    prop: 'guideId',
    type: 'select',
    componentProps: {
      options: [],
      filterable: true
    }
  }
])

const scResourcePageRef = useTemplateRef<PageInstance>('scResourcePageRef')

const handlePageClick = (
  row: SystemComponentAndUnitAssetData | undefined = undefined
) => open(row)

const { handleDelete } = useDeleteAction<SystemComponentAndUnitAssetData>(
  ids => deleteSystemComponentAndUnitAssetAPI({ ids }),
  {
    message: '确定删除该系统组件与单元资产吗？删除后不可恢复。',
    onSuccess: () => scResourcePageRef.value?.refresh()
  }
)

/** 加载资产二级分类选项（asset_second_type 字典，过滤 40-49） */
const loadAssetSecondTypeOptions = async () => {
  const dictMap = await getDictOptionsMap(['asset_second_type'])
  assetSecondTypeOptions.value = (dictMap['asset_second_type'] ?? []).filter(
    item => item.value > '39' && item.value < '50'
  )
}

/** 加载资产三级分类选项（asset_third_type 字典） */
const loadAssetThirdTypeOptions = async () => {
  const dictMap = await getDictOptionsMap(['asset_third_type'])
  const thirdTypeItem = findFormItem(formItems, 'assetThirdType', 'select')
  if (thirdTypeItem?.componentProps) {
    thirdTypeItem.componentProps.options = dictMap['asset_third_type'] ?? []
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

const loadOptions = async () => {
  await Promise.allSettled([
    loadAssetSecondTypeOptions(),
    loadAssetThirdTypeOptions(),
    loadGuideOptions()
  ])
}

onMounted(loadOptions)

const { visible, formData, confirmLoading, open, handleConfirm, dialogTitle } =
  useDialogForm<SystemComponentAndUnitAssetFormData>({
    defaultFormData,
    title: '系统组件与单元资产',
    fetchDetail: id => getSystemComponentAndUnitAssetDetailAPI(id),
    beforeOpen: data => {
      data.assetSecondType = activeAssetSecondType.value
    },
    onCreate: data => createSystemComponentAndUnitAssetAPI(data),
    onUpdate: data => updateSystemComponentAndUnitAssetAPI(data),
    onSuccess: () => scResourcePageRef.value?.refresh()
  })

const pageDialogConfig = computed<DialogFormConfig>(() => ({
  formItems,
  title: dialogTitle.value,
  columns: 2
}))

const uploadConfig: UploadConfig = {
  uploadUrl: '/asset/system/import',
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
  title: '系统组件与单元资产导入',
  extraParams: uploadExtraParams,
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
    >
      <template #extra-operate-left>
        <el-radio-group
          v-model="activeAssetSecondType"
          class="asset-second-type-radio"
        >
          <el-radio-button
            v-for="item in assetSecondTypeOptions"
            :key="item.value"
            :value="item.value"
          >
            {{ item.label }}
          </el-radio-button>
        </el-radio-group>
      </template>
    </ScResourcePage>
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
