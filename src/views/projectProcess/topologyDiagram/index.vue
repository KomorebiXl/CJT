<script setup lang="ts">
import type {
  TopologyDiagramData,
  TopologyDiagramFormData,
  TopologyDiagramSearchParams
} from '@/types/projectProcess/topologyDiagram'
import {
  createTopologyDiagramAPI,
  deleteTopologyDiagramAPI,
  getEnvironmentCategoryOptionsAPI,
  getTopologyDiagramDataAPI,
  getTopologyDiagramDetailAPI,
  updateTopologyDiagramAPI
} from '@/api/projectProcess/topologyDiagram-api.ts'
import { objectToFormData } from '@/utils/file.ts'
import { ScMessage } from '@/utils/ElUtils'
import { defineFormItems } from '@/utils/form.ts'
import { findFormItem } from '@/utils/formItemUtils.ts'
import { useDialogForm } from '@/hooks/useDialogForm.ts'
import { useDeleteAction } from '@/hooks/useDeleteAction.ts'
import FileReferenceInput from '@/components/FileReferenceInput/index.vue'

const searchbarItems = reactive<SearchbarItems<TopologyDiagramSearchParams>>([])

const tableColumns = reactive<TableColumns>([
  { label: '环境', prop: 'type' },
  { label: '内容描述', prop: 'content', showOverflowTooltip: true }
])

const pageConfig: PageConfig<TopologyDiagramData> = {
  searchConfig: { searchbarItems },
  operateConfig: {
    defaultButtonsConfig: { add: { permission: 'asset:topology:add' } }
  },
  tableConfig: {
    tableColumns,
    defaultButtonsConfig: {
      edit: { permission: 'asset:topology:edit' },
      delete: { permission: 'asset:topology:remove' }
    }
  },
  fetchData: getTopologyDiagramDataAPI
}

const dialogFormData = reactive<TopologyDiagramFormData>({
  type: null,
  content: '',
  files: []
})

/** 环境类型选项是否非空（为空时隐藏环境类型项，对齐源显隐条件） */
const hasEnvironmentOptions = ref(false)

const formItems = defineFormItems<TopologyDiagramFormData>([
  {
    label: '环境类型',
    prop: 'type',
    type: 'treeSelect',
    hide: () => !hasEnvironmentOptions.value,
    componentProps: {
      options: [],
      nodeKey: 'id',
      fieldNames: { label: 'name', children: 'child' },
      placeholder: '请选择环境类型'
    },
  },
  {
    label: '描述内容',
    prop: 'content',
    customSlot: 'content',
    rules: [{ required: true, message: '请输入描述内容', trigger: 'blur' }]
  }
])

const scResourcePageRef = useTemplateRef<PageInstance>('scResourcePageRef')

/** 加载环境类型树选项 */
const loadEnvironmentOptions = async () => {
  const { rows } = await getEnvironmentCategoryOptionsAPI()
  const options = rows ?? []
  hasEnvironmentOptions.value = options.length > 0
  const environmentItem = findFormItem(formItems, 'type', 'treeSelect')
  if (environmentItem?.componentProps) {
    environmentItem.componentProps.options = options
  }
}

const handlePageClick = (row: TopologyDiagramData | undefined = undefined) =>
  open(row)

onMounted(() => {
  loadEnvironmentOptions()
})

const { handleDelete } = useDeleteAction<TopologyDiagramData>(
  ids => deleteTopologyDiagramAPI({ ids }),
  {
    message: '确定删除该拓扑图吗？删除后不可恢复。',
    onSuccess: () => scResourcePageRef.value?.refresh()
  }
)

const { visible, formData, confirmLoading, open, handleConfirm, dialogTitle } =
  useDialogForm<TopologyDiagramFormData, 'id', string, FormData>({
    defaultFormData: dialogFormData,
    title: '拓扑图',
    transformRequest: data => objectToFormData(data),
    fetchDetail: id => getTopologyDiagramDetailAPI(id),
    onCreate: data => createTopologyDiagramAPI(data),
    onUpdate: data => updateTopologyDiagramAPI(data),
    onSuccess: () => scResourcePageRef.value?.refresh()
  })

/** 提交前校验已上传图片均已插入描述内容 */
const handleFormConfirm = async () => {
  const uninserted = formData.files.filter(
    file => !formData.content.includes(file.formattedName)
  )
  if (uninserted.length) {
    ScMessage.warning('还有未插入描述内容的图片，请插入后再提交')
    return
  }
  await handleConfirm(formData)
}

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
      @confirm="handleFormConfirm"
    >
      <template #custom-content="{ data }">
        <FileReferenceInput
          v-model="data.content"
          v-model:file-list="data.files"
          :rows="10"
          placeholder="请输入描述内容"
        />
      </template>
    </ScDialogForm>
  </div>
</template>

<style scoped lang="scss"></style>
