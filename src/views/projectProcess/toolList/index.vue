<script setup lang="ts">
import type {
  ToolListData,
  ToolListFormData,
  ToolListSearchParams
} from '@/types/projectProcess/toolList'
import type { ScCascaderModelValue } from '@/components/ScBaseFormItems/ScCascader'
import {
  createToolListAPI,
  deleteToolListAPI,
  getToolListDataAPI,
  getToolListDetailAPI,
  getToolTreeOptionsAPI,
  updateToolListAPI
} from '@/api/projectProcess/toolList-api.ts'
import { defineFormItems } from '@/utils/form.ts'
import { findFormItem } from '@/utils/formItemUtils.ts'
import { useDialogForm } from '@/hooks/useDialogForm.ts'
import { useDeleteAction } from '@/hooks/useDeleteAction.ts'

const searchbarItems = reactive<SearchbarItems<ToolListSearchParams>>([])

const tableColumns = reactive<TableColumns>([
  { label: '名称', prop: 'name' },
  { label: '版本', prop: 'version' },
  { label: '安全规则版本', prop: 'secureVersion', slot: 'secureVersion' },
  { label: '生厂商/来源', prop: 'source' },
  { label: '用途', prop: 'purpose' }
])

const pageConfig: PageConfig<ToolListData> = {
  searchConfig: { searchbarItems },
  operateConfig: {
    defaultButtonsConfig: { add: { permission: 'asset:tool:add' } }
  },
  tableConfig: {
    tableColumns,
    showIndex: true,
    defaultButtonsConfig: {
      edit: { permission: 'asset:tool:edit' },
      delete: { permission: 'asset:tool:remove' }
    }
  },
  fetchData: getToolListDataAPI
}

const dialogFormData = reactive<ToolListFormData>({
  tools: [],
  toolId: '',
  versionId: '',
  secureVersionId: ''
})

/** 级联路径各层级对应的隐藏 ID 字段 */
const TOOL_PATH_ID_PROPS = ['toolId', 'versionId', 'secureVersionId'] as const

/** 级联选择变化时，按级联路径顺序同步三个隐藏 ID */
const handleToolsChange = (
  value: ScCascaderModelValue,
  formData: ToolListFormData
) => {
  const path = Array.isArray(value) ? value : []
  TOOL_PATH_ID_PROPS.forEach((prop, index) => {
    formData[prop] = path[index] ?? ''
  })
}

const formItems = defineFormItems<ToolListFormData>([
  {
    label: '工具',
    prop: 'tools',
    type: 'cascader',
    componentProps: { options: [], fieldNames: { value: 'id' } },
    onChange: handleToolsChange,
    rules: [{ required: true, message: '工具不能为空', trigger: 'change' }]
  }
])

const scResourcePageRef = useTemplateRef<PageInstance>('scResourcePageRef')

const handlePageClick = (row: ToolListData | undefined = undefined) => open(row)

const { handleDelete } = useDeleteAction<ToolListData>(
  ids => deleteToolListAPI({ ids }),
  {
    message: '确定删除该工具吗？删除后不可恢复。',
    onSuccess: () => scResourcePageRef.value?.refresh()
  }
)

const { visible, formData, confirmLoading, open, handleConfirm, dialogTitle } =
  useDialogForm<ToolListFormData>({
    defaultFormData: dialogFormData,
    title: '工具列表',
    fetchDetail: async id => getToolListDetailAPI(id),
    onCreate: data => createToolListAPI(data),
    onUpdate: data => updateToolListAPI(data),
    onSuccess: () => scResourcePageRef.value?.refresh()
  })

/** 加载工具 / 版本 / 安全规则版本三级选项树 */
const loadToolOptions = async () => {
  const { data } = await getToolTreeOptionsAPI()
  const toolsItem = findFormItem(formItems, 'tools', 'cascader')
  if (toolsItem?.componentProps) {
    toolsItem.componentProps.options = data ?? []
  }
}

onMounted(() => loadToolOptions())

/** 安全规则版本：安全文本渲染，换行标签转为换行符 */
const formatSecureVersion = (row: ToolListData) =>
  (row.secureVersion ?? '').replace(/<br\s*\/?>/gi, '\n')

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
    >
      <template #column-secureVersion="{ row }">
        <div class="secure-version-text">
          {{ formatSecureVersion(row as ToolListData) }}
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

<style scoped lang="scss">
.secure-version-text {
  white-space: pre-line;
}
</style>
