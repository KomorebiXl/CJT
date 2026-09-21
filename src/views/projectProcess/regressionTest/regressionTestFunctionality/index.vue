<!--回归测试-功能性-->
<script setup lang="ts">
import type {
  CreateSystemNameData,
  CreateSystemNameFormData,
  CreateSystemNameSearchParams
} from '@/types/projectProcess/createSystemName'
import {
  deleteCreateSystemNameAPI,
  getCreateSystemNameDataAPI,
  getCreateSystemNameDetailAPI,
  updateCreateSystemNameAPI
} from '@/api/projectProcess/createSystemName-api.ts'
import {
  exportInitialTestRegressReportAPI,
  exportInitialTestResultReportAPI
} from '@/api/projectProcess/initialTest-api.ts'
import { downloadFile } from '@/utils/file.ts'
import { safeRequest } from '@/utils/safeRequest.ts'
import { ScMessage } from '@/utils/ElUtils'
import { defineFormItems } from '@/utils/form.ts'
import { findFormItem } from '@/utils/formItemUtils.ts'
import { disableSubtreeById } from '@/utils/tree.ts'
import { useDialogForm } from '@/hooks/useDialogForm.ts'
import { useDeleteAction } from '@/hooks/useDeleteAction.ts'
import SystemDetails from './systemDetails.vue'
import {
  REGRESSION_TEST_FN_TREE_EXPORT_BUTTONS,
  REGRESSION_TEST_FN_TREE_EXPORT_PARAMS
} from './regressionTestFunctionality.config'

const scResourcePageRef = useTemplateRef<PageInstance>('scResourcePageRef')

const searchbarItems = reactive<SearchbarItems<{ name: string }>>([
  { prop: 'name', type: 'input', placeholder: '请输入名称' }
])

const tableColumns = reactive<TableColumns>([
  { label: '名称', prop: 'name', align: 'left' },
  { label: '未完成数量', prop: 'unfinishedTotal', width: 110 }
])

const currentSystem = ref<{ id: string; name: string } | null>(null)

const openSystem = (row: CreateSystemNameData) => {
  currentSystem.value = { id: row.id, name: row.name }
}

let parentRowsCache: Array<CreateSystemNameData> = []

const fetchData = async (params: ListQuery<CreateSystemNameSearchParams>) => {
  const res = await getCreateSystemNameDataAPI(params)
  if (!params.name) {
    parentRowsCache = res.rows
  }
  return res
}

const pageConfig: PageConfig<CreateSystemNameData> = {
  searchConfig: { searchbarItems },
  operateConfig: {
    defaultButtons: [],
    customButtons: REGRESSION_TEST_FN_TREE_EXPORT_BUTTONS
  },
  tableConfig: {
    tableColumns,
    defaultButtonsConfig: {
      edit: { permission: 'acceptance:result:edit' },
      delete: {
        show: row => !!row.child && row.child.length === 0,
        permission: 'acceptance:result:remove'
      }
    },
    customActionButtons: [
      {
        name: '操作',
        type: 'primary',
        text: true,
        permission: 'asset:security:operate',
        show: row => !!row.child && row.child.length === 0,
        onClick: openSystem
      }
    ],
    showPagination: false
  },
  fetchData,
  treeConfig: { children: 'child', rowKey: 'id', showExpandButton: true }
}

const { handleDelete } = useDeleteAction<CreateSystemNameData>(
  ids => deleteCreateSystemNameAPI({ ids }),
  {
    message: '是否删除当前数据',
    onSuccess: () => scResourcePageRef.value?.refresh()
  }
)

/** 回归（未通过记录）导出（树页为全项目维度，不带 subsystem） */
const handleExportFailedReport = async () => {
  const [err, res] = await safeRequest(
    exportInitialTestRegressReportAPI(REGRESSION_TEST_FN_TREE_EXPORT_PARAMS),
    { showError: false }
  )
  if (err || !res) return
  await downloadFile(res)
  ScMessage.success('数据导出成功！')
}

/** 回归（全部记录）导出 */
const handleExportAllReport = async () => {
  const [err, res] = await safeRequest(
    exportInitialTestResultReportAPI(REGRESSION_TEST_FN_TREE_EXPORT_PARAMS),
    { showError: false }
  )
  if (err || !res) return
  await downloadFile(res)
  ScMessage.success('数据导出成功！')
}

const handleOperateClick = (btnId: string | undefined) => {
  switch (btnId) {
    case 'failedExport':
      handleExportFailedReport()
      break
    case 'allExport':
      handleExportAllReport()
      break
    default:
      break
  }
}

const dialogFormData = reactive<CreateSystemNameFormData>({
  name: '',
  parentId: ''
})

const formItems = defineFormItems<CreateSystemNameFormData>([
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

const applyParentOptions = (currentId?: string) => {
  const parentFormItem = findFormItem(formItems, 'parentId', 'treeSelect')
  if (parentFormItem?.componentProps) {
    parentFormItem.componentProps.options = disableSubtreeById(
      parentRowsCache,
      currentId,
      { childrenKey: 'child' }
    )
  }
}

const { visible, formData, confirmLoading, open, handleConfirm, dialogTitle } =
  useDialogForm<CreateSystemNameFormData>({
    defaultFormData: dialogFormData,
    title: '功能性',
    fetchDetail: id => getCreateSystemNameDetailAPI(id),
    onUpdate: data => updateCreateSystemNameAPI(data),
    beforeOpen: (_data, row) => applyParentOptions(row?.id),
    onSuccess: () => scResourcePageRef.value?.refresh()
  })

const pageDialogConfig = computed<DialogFormConfig>(() => ({
  formItems,
  title: dialogTitle.value
}))
</script>

<template>
  <div class="page-card">
    <div v-show="!currentSystem" class="page-level">
      <ScResourcePage
        ref="scResourcePageRef"
        :page-config="pageConfig"
        @edit="open"
        @delete="handleDelete"
        @operate-click="handleOperateClick"
      />
      <ScDialogForm
        v-model="visible"
        :form-data="formData"
        :config="pageDialogConfig"
        :confirm-loading="confirmLoading"
        @confirm="handleConfirm"
      />
    </div>
    <SystemDetails
      v-if="currentSystem"
      :system-id="currentSystem.id"
      :system-name="currentSystem.name"
      @back="currentSystem = null"
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
