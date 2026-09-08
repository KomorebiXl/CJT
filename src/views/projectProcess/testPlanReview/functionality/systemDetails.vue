<!--功能性-系统详情-->
<script setup lang="ts">
import { Back } from '@element-plus/icons-vue'
import type { ScBaseFormItem } from '@/components/ScBaseForm/types/formItem.ts'
import type { DynamicFileColumn } from '@/types/projectProcess/projectProcessCommon'
import type {
  SystemDetailFormData,
  SystemDetailResult,
  SystemDetailSearchParams
} from '@/types/projectProcess/testPlanReview'
import {
  addSystemDetailAPI,
  deleteSystemDetailAPI,
  getSystemDetailDetailAPI,
  getSystemDetailListAPI,
  updateSystemDetailAPI
} from '@/api/projectProcess/testPlanReview-api.ts'
import { defineFormItems } from '@/utils/form.ts'
import { findFormItem } from '@/utils/formItemUtils.ts'
import { useDeleteAction } from '@/hooks/useDeleteAction.ts'
import { useUploadDialog } from '@/hooks/useUploadDialog.ts'
import { useScConfirm } from '@/hooks/useScConfirmDialog.ts'
import { useDialogForm } from '@/hooks/useDialogForm.ts'
import { useIfUsePlanStealer } from '@/hooks/useProcessProjectFlags.ts'
import { mergeDynamicAfterAnchor } from '@/views/projectProcess/projectProcessUtils.ts'
import {
  FUNCTIONALITY_EXPORT_URL,
  FUNCTIONALITY_IMPORT_EXTRA_PARAMS,
  FUNCTIONALITY_IMPORT_URL,
  FUNCTIONALITY_TEMPLATE_URL
} from './functionality.config'

const props = defineProps<{
  systemId: string
  systemName: string
}>()

const emit = defineEmits<{
  (e: 'back'): void
}>()

const { scConfirm } = useScConfirm()

const scResourcePageRef = useTemplateRef<PageInstance>('scResourcePageRef')

const ifUsePlanStealer = useIfUsePlanStealer()

const searchbarItems = reactive<SearchbarItems<SystemDetailSearchParams>>([
  { prop: 'serialNumber', type: 'input', placeholder: '请输入序号' },
  { prop: 'item', type: 'input', placeholder: '请输入测试项' }
])

const dynamicData = ref<DynamicFileColumn[]>([])

// 基础列 + 动态文件列（插在「测试项说明」或「测试项」之后）
const columns = computed<TableColumns>(() => {
  let list: TableColumns = [
    { label: '序号', prop: 'serialNumber' },
    { label: '测试项', prop: 'item' },
    { label: '测试项说明', prop: 'itemDescription' },
    { label: '相关测试项', prop: 'relatedItem' },
    { label: '备注', prop: 'remark' }
  ]
  if (ifUsePlanStealer.value)
    list = list.filter(col => col.prop !== 'itemDescription')
  return mergeDynamicAfterAnchor(list, dynamicData.value, item => ({
    label: item.name,
    prop: item.field
  }))
})

const pageConfig: PageConfig<SystemDetailResult> = {
  searchConfig: { searchbarItems },
  operateConfig: {
    defaultButtons: ['add', 'import', 'export'],
    defaultButtonsConfig: {
      add: { permission: 'asset:plan:add' },
      export: { permission: 'asset:plan:function:export' }
    },
    customButtons: [{ id: 'back', name: '返回', type: 'info', icon: Back }]
  },
  tableConfig: {
    get tableColumns() {
      return columns.value
    },
    defaultButtonsConfig: {
      edit: { permission: 'asset:plan:edit' },
      delete: { permission: 'asset:plan:remove' }
    }
  },
  fetchData: async params => {
    const res = await getSystemDetailListAPI({
      ...params,
      feature: '1',
      subsystem: props.systemId
    })
    dynamicData.value = res.data?.files ?? []
    return {
      rows: res.data?.result?.rows ?? [],
      total: res.data?.result?.total ?? 0
    }
  },
  treeConfig: { children: 'child', rowKey: 'id', showExpandButton: true }
}

const exportConfig: ExportConfig = {
  exportUrl: FUNCTIONALITY_EXPORT_URL,
  exportExtraParams: {
    feature: '1',
    subFeature: '1',
    subsystem: props.systemId
  },
  beforeExport: async () => {
    try {
      await scConfirm({
        title: '提示',
        message: '生成执行记录表将清空原有的记录表数据，是否继续？',
        confirmText: '确定',
        cancelText: '取消'
      })
      return true
    } catch {
      return false
    }
  }
}

const { open: importOpen } = useUploadDialog({
  uploadConfig: {
    uploadUrl: FUNCTIONALITY_IMPORT_URL,
    accept: ['.xls', '.xlsx'],
    formatSuccessMessage: response =>
      typeof response?.data === 'string' && response.data.trim()
        ? response.data
        : ''
  },
  templateConfig: {
    templateUrl: FUNCTIONALITY_TEMPLATE_URL,
    requestMethod: 'GET',
    showTemplateDownload: true
  },
  title: `${props.systemName}功能性导入`,
  extraParams: { ...FUNCTIONALITY_IMPORT_EXTRA_PARAMS },
  onSuccess: () => scResourcePageRef.value?.refresh()
})

const { handleDelete } = useDeleteAction<SystemDetailResult>(
  ids => deleteSystemDetailAPI({ ids }),
  {
    message: '是否删除当前数据',
    onSuccess: () => scResourcePageRef.value?.refresh()
  }
)

const handleOperateClick = (btnId: string | undefined) => {
  if (btnId === 'back') emit('back')
}

const dialogFormData = reactive<SystemDetailFormData>({
  serialNumber: '',
  item: '',
  itemDescription: '',
  remark: '',
  subsystem: '',
  feature: '1'
})

const baseFormItems = defineFormItems<SystemDetailFormData>([
  {
    label: '序号',
    prop: 'serialNumber',
    type: 'input',
    componentProps: { disabled: false }
  },
  {
    label: '测试项',
    prop: 'item',
    type: 'input',
    componentProps: { disabled: false }
  },
  {
    label: '测试项说明',
    prop: 'itemDescription',
    type: 'input',
    componentProps: { type: 'textarea' },
    colSpan: 2
  },
  {
    label: '备注',
    prop: 'remark',
    type: 'input',
    componentProps: { type: 'textarea', rows: 5 },
    colSpan: 2
  }
])

// 动态文件表单项同样插在「测试项说明」（或「测试项」）之后
const formItems = computed<ScBaseFormItem[]>(() => {
  let list: ScBaseFormItem[] = [...baseFormItems]
  if (ifUsePlanStealer.value) {
    list = list.filter(item => item.prop !== 'itemDescription')
  }
  return mergeDynamicAfterAnchor(list, dynamicData.value, item => ({
    label: item.name,
    prop: item.field,
    type: 'input',
    colSpan: 12
  }))
})

const { visible, formData, confirmLoading, open, handleConfirm, dialogTitle } =
  useDialogForm<SystemDetailFormData>({
    defaultFormData: dialogFormData,
    title: '测试项',
    fetchDetail: async id => {
      const res = await getSystemDetailDetailAPI(id)
      return {
        ...res,
        data: res.data?.result
      } as DataResponse<SystemDetailFormData>
    },
    onCreate: data =>
      addSystemDetailAPI({ ...data, subsystem: props.systemId, feature: '1' }),
    onUpdate: data =>
      updateSystemDetailAPI({
        ...data,
        subsystem: props.systemId,
        feature: '1'
      } as SystemDetailFormData & { id: string }),
    beforeOpen: async (_data, row) => {
      const isEdit = !!row
      ;(['serialNumber', 'item'] as const).forEach(prop => {
        const item = findFormItem(baseFormItems, prop, 'input')
        if (item?.componentProps) {
          item.componentProps.disabled = isEdit
        }
      })
    },
    onSuccess: () => scResourcePageRef.value?.refresh()
  })

const handlePageClick = (row: SystemDetailResult | undefined = undefined) =>
  open(row)

const pageDialogConfig = computed<DialogFormConfig>(() => ({
  formItems: formItems.value,
  title: dialogTitle.value
}))
</script>

<template>
  <ScResourcePage
    ref="scResourcePageRef"
    :page-config="pageConfig"
    :export-config="exportConfig"
    @add="handlePageClick()"
    @edit="handlePageClick"
    @delete="handleDelete"
    @import="importOpen()"
    @operate-click="handleOperateClick"
  >
    <template #extra-operate-left>
      <el-tag>{{ props.systemName }}</el-tag>
    </template>
  </ScResourcePage>
  <ScDialogForm
    v-model="visible"
    :form-data="formData"
    :config="pageDialogConfig"
    :confirm-loading="confirmLoading"
    @confirm="handleConfirm"
  />
</template>
