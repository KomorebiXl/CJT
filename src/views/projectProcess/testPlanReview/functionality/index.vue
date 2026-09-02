<!--测试方案（校核）--功能性-->
<script setup lang="ts">
import type {
  CreateSystemNameData,
  CreateSystemNameFormData,
  CreateSystemNameSearchParams
} from '@/types/projectProcess/createSystemName'
import {
  addCreateSystemNameAPI,
  deleteCreateSystemNameAPI,
  getCreateSystemNameDataAPI,
  getCreateSystemNameDetailAPI,
  updateCreateSystemNameAPI
} from '@/api/projectProcess/createSystemName-api.ts'
import { defineFormItems } from '@/utils/form.ts'
import { findFormItem } from '@/utils/formItemUtils.ts'
import { disableSubtreeById } from '@/utils/tree.ts'
import { useDialogForm } from '@/hooks/useDialogForm.ts'
import { useDeleteAction } from '@/hooks/useDeleteAction.ts'
import { useUploadDialog } from '@/hooks/useUploadDialog.ts'
import { useScConfirm } from '@/hooks/useScConfirmDialog.ts'
import SystemDetails from './systemDetails.vue'
import {
  FUNCTIONALITY_EXPORT_URL,
  FUNCTIONALITY_IMPORT_EXTRA_PARAMS,
  FUNCTIONALITY_IMPORT_URL,
  FUNCTIONALITY_STAT_COLUMNS,
  FUNCTIONALITY_TEMPLATE_URL
} from './functionality.config'

const { scConfirm } = useScConfirm()

const scResourcePageRef = useTemplateRef<PageInstance>('scResourcePageRef')

const searchbarItems = reactive<SearchbarItems<CreateSystemNameSearchParams>>([
  { prop: 'name', type: 'input', label: '系统名称' }
])

const tableColumns = reactive<TableColumns>([
  { label: '系统名称', prop: 'name', align: 'left' },
  ...FUNCTIONALITY_STAT_COLUMNS
])

/** 当前下钻的系统（null = 树页）；树页用 v-show 保状态 */
const currentSystem = ref<{ id: string; name: string } | null>(null)

const openSystem = (row: CreateSystemNameData) => {
  currentSystem.value = { id: row.id, name: row.name }
}

const pageConfig: PageConfig<CreateSystemNameData> = {
  searchConfig: { searchbarItems },
  operateConfig: {
    defaultButtons: ['add', 'import', 'export'],
    defaultButtonsConfig: {
      add: { permission: 'asset:subsystem:add' },
      import: { permission: 'asset:plan:function:import' },
      export: { permission: 'asset:plan:function:export' }
    }
  },
  tableConfig: {
    tableColumns,
    defaultButtonsConfig: {
      edit: { permission: 'asset:subsystem:edit' },
      delete: {
        show: row => !!row.child && row.child.length === 0,
        permission: 'asset:subsystem:remove'
      }
    },
    customActionButtons: [
      {
        name: '操作',
        type: 'primary',
        text: true,
        permission: 'asset:plan:list',
        show: row => !!row.child && row.child.length === 0,
        onClick: openSystem
      }
    ],
    showPagination: false
  },
  fetchData: getCreateSystemNameDataAPI,
  treeConfig: { children: 'child', rowKey: 'id', showExpandButton: true }
}

const exportConfig: ExportConfig = {
  exportUrl: FUNCTIONALITY_EXPORT_URL,
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
  title: '功能性导入',
  extraParams: { ...FUNCTIONALITY_IMPORT_EXTRA_PARAMS },
  onSuccess: () => scResourcePageRef.value?.refresh()
})

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
    label: '系统名称',
    prop: 'name',
    type: 'input',
    rules: [{ required: true, message: '请输入名称', trigger: 'blur' }]
  }
])

const handlePageClick = (row: CreateSystemNameData | undefined = undefined) =>
  open(row)

const { handleDelete } = useDeleteAction<CreateSystemNameData>(
  ids => deleteCreateSystemNameAPI({ ids }),
  {
    message: '是否删除当前数据',
    onSuccess: () => scResourcePageRef.value?.refresh()
  }
)

const loadParentOptions = async (currentId?: string) => {
  const { rows } = await getCreateSystemNameDataAPI({
    pageNum: 1,
    pageSize: 999999,
    name: ''
  })
  const options = disableSubtreeById(rows, currentId, { childrenKey: 'child' })
  const parentFormItem = findFormItem(formItems, 'parentId', 'treeSelect')
  if (parentFormItem?.componentProps) {
    parentFormItem.componentProps.options = options
  }
}

const { visible, formData, confirmLoading, open, handleConfirm, dialogTitle } =
  useDialogForm<CreateSystemNameFormData>({
    defaultFormData: dialogFormData,
    title: '系统名称',
    fetchDetail: id => getCreateSystemNameDetailAPI(id),
    onCreate: data => addCreateSystemNameAPI(data),
    onUpdate: data => updateCreateSystemNameAPI(data),
    beforeOpen: async (_data, row) => {
      await loadParentOptions(row?.id)
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
    <div v-show="!currentSystem" class="page-level">
      <ScResourcePage
        ref="scResourcePageRef"
        :page-config="pageConfig"
        :export-config="exportConfig"
        @add="handlePageClick()"
        @edit="handlePageClick"
        @delete="handleDelete"
        @import="importOpen()"
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
