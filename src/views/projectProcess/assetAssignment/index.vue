<script setup lang="ts">
import type {
  AssetAssignmentSearchParams,
  AssetAssignmentData,
  AssetAssignmentFormData
} from '@/types/projectProcess/assetAssignment'
import {
  createAssetAssignmentAPI,
  deleteAssetAssignmentAPI,
  getAssetAssignmentDataAPI,
  getAssetAssignmentDetailAPI,
  getAssetSystemOptionsAPI,
  updateAssetAssignmentAPI
} from '@/api/projectProcess/assetAssignment-api.ts'
import { defineFormItems } from '@/utils/form.ts'
import { useDialogForm } from '@/hooks/useDialogForm.ts'
import { useDeleteAction } from '@/hooks/useDeleteAction.ts'
import { findFormItem } from '@/utils/formItemUtils.ts'
import { useUploadDialog } from '@/hooks/useUploadDialog.ts'

const searchbarItems = reactive<SearchbarItems<AssetAssignmentSearchParams>>([
  {
    label: '业务编号',
    prop: 'assetNo',
    type: 'input',
    placeholder: '请输入业务编号'
  },
  {
    label: '业务名称',
    prop: 'assetName',
    type: 'input',
    placeholder: '请输入业务名称'
  }
])

const tableColumns = reactive<TableColumns>([
  { label: '业务编号', prop: 'assetNo', minWidth: 100 },
  { label: '业务名称', prop: 'assetName', minWidth: 100 },
  {
    label: '属性',
    prop: 'usageDescription',
    minWidth: 100,
    showOverflowTooltip: true
  },
  { label: '定位', prop: 'usagePosition', minWidth: 100 },
  { label: '完整性', prop: 'integrityLabel', minWidth: 100 },
  { label: '关联资产', prop: 'relevance', slot: 'relevance', minWidth: 100 }
])

const pageConfig: PageConfig<AssetAssignmentData> = {
  searchConfig: { searchbarItems },
  pageExtraParams: { systemAssetType: '2' },
  operateConfig: {
    defaultButtons: ['add', 'import'],
    defaultButtonsConfig: {
      add: { permission: 'asset:business:add' },
      import: { permission: 'asset:business:add' }
    }
  },
  tableConfig: {
    tableColumns,
    defaultButtonsConfig: {
      edit: { permission: 'asset:business:edit' },
      delete: { permission: 'asset:business:remove' }
    }
  },
  fetchData: getAssetAssignmentDataAPI
}

const dialogFormData = reactive<AssetAssignmentFormData>({
  assetNo: '',
  assetName: '',
  usageDescription: '',
  usagePosition: '',
  integrity: '',
  relevanceAssets: [],
  systemAssetType: '2'
})

const formItems = defineFormItems<AssetAssignmentFormData>([
  {
    label: '业务编号',
    prop: 'assetNo',
    type: 'input'
  },
  {
    label: '业务名称',
    prop: 'assetName',
    type: 'input'
  },
  {
    label: '属性',
    prop: 'usageDescription',
    type: 'input'
  },
  {
    label: '定位',
    prop: 'usagePosition',
    type: 'input'
  },
  {
    label: '完整性',
    prop: 'integrity',
    type: 'select',
    componentProps: {
      dictField: 'asset_business_integrity',
      clearable: false
    }
  },
  {
    label: '关联资产',
    prop: 'relevanceAssets',
    type: 'select',
    componentProps: {
      options: [],
      multiple: true
    }
  }
])

const scResourcePageRef = useTemplateRef<PageInstance>('scResourcePageRef')

const handlePageClick = (row: AssetAssignmentData | undefined = undefined) =>
  open(row)

const { handleDelete } = useDeleteAction<AssetAssignmentData>(
  ids => deleteAssetAssignmentAPI({ ids }),
  {
    message: '确定删除该业务资产吗？删除后不可恢复。',
    onSuccess: () => scResourcePageRef.value?.refresh()
  }
)

/** 加载系统资产选项（关联资产下拉） */
const loadSystemAssets = async () => {
  const { data } = await getAssetSystemOptionsAPI()
  const relevanceItem = findFormItem(formItems, 'relevanceAssets', 'select')
  if (relevanceItem?.componentProps) {
    relevanceItem.componentProps.options = (data ?? []).map(item => ({
      label: `${item.assetNo} ${item.assetName}`,
      value: item.id
    }))
  }
}

onMounted(() => loadSystemAssets())

const { visible, formData, confirmLoading, open, handleConfirm, dialogTitle } =
  useDialogForm<AssetAssignmentFormData>({
    defaultFormData: dialogFormData,
    title: '业务资产',
    fetchDetail: id => getAssetAssignmentDetailAPI(id),
    onCreate: data => createAssetAssignmentAPI(data),
    onUpdate: data => updateAssetAssignmentAPI(data),
    onSuccess: () => scResourcePageRef.value?.refresh()
  })

const pageDialogConfig = computed<DialogFormConfig>(() => ({
  formItems,
  title: dialogTitle.value,
  columns: 1
}))

const uploadConfig: UploadConfig = {
  uploadUrl: '/asset/business/import',
  accept: ['.xls', '.xlsx']
}

const templateConfig: TemplateConfig = {
  templateUrl: '/asset/business/template',
  requestMethod: 'POST',
  showTemplateDownload: true
}

const { open: importOpen } = useUploadDialog({
  uploadConfig,
  templateConfig,
  title: '业务资产导入',
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
    >
      <template #column-relevance="{ row }">
        <div
          v-for="(item, index) in row.relevanceVos ?? []"
          :key="`${row.id}-${index}`"
        >
          {{ item.assetNo }} {{ item.assetName }}
        </div>
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
