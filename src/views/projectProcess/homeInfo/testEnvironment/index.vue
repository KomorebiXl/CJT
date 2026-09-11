<!--主页信息-测试环境 -->
<script setup lang="ts">
import type {
  TestEnvironmentData,
  TestEnvironmentFormData,
  TestEnvironmentSearchParams,
  TestEnvironmentTopologyFormData
} from '@/types/projectProcess/homeInfo/testEnvironment'
import {
  addTestEnvironmentAPI,
  deleteTestEnvironmentAPI,
  getTestEnvironmentDetailAPI,
  getTestEnvironmentListAPI,
  updateTestEnvironmentAPI
} from '@/api/projectProcess/homeInfo/testEnvironment-api.ts'
import {
  createTopologyDiagramAPI,
  getTopologyDiagramDetailAPI,
  updateTopologyDiagramAPI
} from '@/api/projectProcess/topologyDiagram-api.ts'
import { objectToFormData } from '@/utils/file.ts'
import { ScMessage } from '@/utils/ElUtils'
import { defineFormItems } from '@/utils/form.ts'
import { findFormItem } from '@/utils/formItemUtils.ts'
import { disableSubtreeById } from '@/utils/tree.ts'
import { useDialogForm } from '@/hooks/useDialogForm.ts'
import { useDeleteAction } from '@/hooks/useDeleteAction.ts'
import FileReferenceInput from '@/components/FileReferenceInput/index.vue'
import TestEnvironmentDetails from './testEnvironmentDetails.vue'

const searchbarItems = reactive<SearchbarItems<TestEnvironmentSearchParams>>([
  { prop: 'name', type: 'input', placeholder: '请输入名称' }
])

const tableColumns = reactive<TableColumns>([
  { label: '名称', prop: 'name', align: 'left' },
  { label: '环境数量', prop: 'envTotal' },
  {
    label: '拓扑图内容',
    prop: 'networkTopology',
    slot: 'networkTopology',
    width: 190
  }
])

const currentCategory = ref<{ id: string } | null>(null)

const openDetails = (row: TestEnvironmentData) => {
  currentCategory.value = { id: row.id }
}

const topologyEnvId = ref('')

const topologyFormData = reactive<TestEnvironmentTopologyFormData>({
  content: '',
  files: []
})

const topologyFormItems = defineFormItems<TestEnvironmentTopologyFormData>([
  {
    label: '描述内容',
    prop: 'content',
    customSlot: 'content',
    rules: [{ required: true, message: '请输入描述内容', trigger: 'blur' }]
  }
])

const {
  visible: topologyVisible,
  formData: topologyCurrentFormData,
  confirmLoading: topologyConfirmLoading,
  open: openTopology,
  handleConfirm: handleTopologyConfirm,
  dialogTitle: topologyDialogTitle
} = useDialogForm<TestEnvironmentTopologyFormData, 'id', string, FormData>({
  defaultFormData: topologyFormData,
  title: '',
  fetchDetail: id => getTopologyDiagramDetailAPI(id),
  transformRequest: data =>
    objectToFormData({ ...data, type: topologyEnvId.value }),
  onCreate: data => createTopologyDiagramAPI(data),
  onUpdate: data => updateTopologyDiagramAPI(data),
  onSuccess: () => scResourcePageRef.value?.refresh()
})

const openTopologyDialog = (row: TestEnvironmentData) => {
  topologyEnvId.value = row.id
  openTopology(row.topologyId ? { id: row.topologyId } : undefined)
}

/** 提交前校验已上传图片均已插入描述内容 */
const handleTopologyFormConfirm = async () => {
  const uninserted = topologyCurrentFormData.files.filter(
    file => !topologyCurrentFormData.content.includes(file.formattedName)
  )
  if (uninserted.length) {
    ScMessage.warning('还有未插入描述内容的图片，请插入后再提交')
    return
  }
  await handleTopologyConfirm(topologyCurrentFormData)
}

const pageConfig: PageConfig<TestEnvironmentData> = {
  searchConfig: { searchbarItems },
  operateConfig: {
    defaultButtonsConfig: { add: { permission: 'asset:category:add' } }
  },
  tableConfig: {
    tableColumns,
    showPagination: false,
    customActionButtons: [
      {
        name: row => `${row.topologyId ? '编辑' : '新增'}网络拓扑图`,
        type: 'primary',
        text: true,
        show: row => !!row.child && row.child.length === 0,
        onClick: openTopologyDialog,
        permission: 'asset:category:list'
      },
      {
        name: '操作',
        type: 'primary',
        text: true,
        show: row => !!row.child && row.child.length === 0,
        onClick: openDetails,
        order: 5,
        permission: 'asset:category:operate'
      }
    ],
    defaultButtonsConfig: {
      edit: { permission: 'asset:category:edit' },
      delete: {
        show: row => !!row.child && row.child.length === 0,
        permission: 'asset:category:remove'
      }
    }
  },
  fetchData: getTestEnvironmentListAPI,
  treeConfig: { children: 'child', rowKey: 'id', showExpandButton: true }
}

const scResourcePageRef = useTemplateRef<PageInstance>('scResourcePageRef')

const handlePageClick = (row: TestEnvironmentData | undefined = undefined) =>
  open(row)

const { handleDelete } = useDeleteAction<TestEnvironmentData>(
  ids => deleteTestEnvironmentAPI({ ids }),
  {
    message: '是否删除当前数据',
    onSuccess: () => scResourcePageRef.value?.refresh()
  }
)

const dialogFormData = reactive<TestEnvironmentFormData>({
  name: '',
  parentId: ''
})

const formItems = defineFormItems<TestEnvironmentFormData>([
  {
    label: '层级',
    prop: 'parentId',
    type: 'treeSelect',
    componentProps: {
      options: [],
      nodeKey: 'id',
      fieldNames: { label: 'name', children: 'child' },
      renderAfterExpand: false
    }
  },
  {
    label: '名称',
    prop: 'name',
    type: 'input',
    rules: [{ required: true, message: '请输入名称', trigger: 'blur' }]
  }
])

const loadParentOptions = async (currentId?: string) => {
  const { rows } = await getTestEnvironmentListAPI({})
  const options = disableSubtreeById(rows, currentId, { childrenKey: 'child' })
  const parentFormItem = findFormItem(formItems, 'parentId', 'treeSelect')
  if (parentFormItem?.componentProps) {
    parentFormItem.componentProps.options = options
  }
}

const { visible, formData, confirmLoading, open, handleConfirm, dialogTitle } =
  useDialogForm<TestEnvironmentFormData>({
    defaultFormData: dialogFormData,
    title: '',
    fetchDetail: id => getTestEnvironmentDetailAPI(id),
    onCreate: data => addTestEnvironmentAPI(data),
    onUpdate: data => updateTestEnvironmentAPI(data),
    beforeOpen: async (_data, row) => {
      await loadParentOptions(row?.id)
    },
    onSuccess: () => scResourcePageRef.value?.refresh()
  })

const pageDialogConfig = computed<DialogFormConfig>(() => ({
  formItems,
  title: dialogTitle.value
}))

const topologyDialogConfig = computed<DialogFormConfig>(() => ({
  formItems: topologyFormItems,
  title: topologyDialogTitle.value,
  columns: 1
}))
</script>

<template>
  <div class="page-card">
    <div v-show="!currentCategory" class="page-level">
      <ScResourcePage
        ref="scResourcePageRef"
        :page-config="pageConfig"
        @add="handlePageClick()"
        @edit="handlePageClick"
        @delete="handleDelete"
      >
        <template #column-networkTopology="{ row }">
          <el-tag :type="row.topologyId ? 'success' : 'danger'">
            {{ row.topologyId ? '已添加网络拓扑图' : '未添加网络拓扑图' }}
          </el-tag>
        </template>
      </ScResourcePage>
      <ScDialogForm
        v-model="visible"
        :form-data="formData"
        :config="pageDialogConfig"
        :confirm-loading="confirmLoading"
        @confirm="handleConfirm"
      />
      <ScDialogForm
        v-model="topologyVisible"
        :form-data="topologyCurrentFormData"
        :config="topologyDialogConfig"
        :confirm-loading="topologyConfirmLoading"
        @confirm="handleTopologyFormConfirm"
      >
        <template #custom-content="{ data }">
          <FileReferenceInput
            v-model="data.content"
            v-model:file-list="data.files"
            placeholder="请输入描述内容"
          />
        </template>
      </ScDialogForm>
    </div>
    <TestEnvironmentDetails
      v-if="currentCategory"
      :category-id="currentCategory.id"
      @back="currentCategory = null"
    />
  </div>
</template>

<style scoped lang="scss">
.page-level {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}
</style>
