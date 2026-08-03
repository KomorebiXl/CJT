<script setup lang="ts">
import { Download, Edit, Refresh, Share, View } from '@element-plus/icons-vue'
import {
  deleteCodeGenerationAPI,
  downloadGeneratedCodeAPI,
  generateCodeToPathAPI,
  getCodeGenerationListAPI,
  syncCodeGenerationTableAPI
} from '@/api/systemTools/codeGeneration-api.ts'
import type { CodeGenerationRow } from '@/types/systemTools/codeGeneration'
import {
  codeGenerationSearchbarItems,
  codeGenerationTableColumns
} from './config'
import { useDeleteAction } from '@/hooks/useDeleteAction.ts'
import { useScConfirm } from '@/hooks/useScConfirmDialog.ts'
import ScMessage from '@/utils/ElUtils/message.ts'
import CodeGenerationImportDialog from './components/CodeGenerationImportDialog.vue'
import CodePreviewDialog from './components/CodePreviewDialog.vue'

defineOptions({ name: 'CodeGenerationPage' })
const router = useRouter()
const { scConfirm } = useScConfirm()
const scResourcePageRef = useTemplateRef<PageInstance>('scResourcePageRef')
const importDialogRef = useTemplateRef<{ open: () => Promise<void> }>(
  'importDialogRef'
)
const previewDialogRef = useTemplateRef<{
  open: (tableId: number | string) => Promise<void>
}>('previewDialogRef')
const previewCode = (row: CodeGenerationRow) =>
  previewDialogRef.value?.open(row.tableId)
const editCode = (row: CodeGenerationRow) =>
  router.push({ path: `/system-tools/code-generation/edit/${row.tableId}` })
const syncTable = async (row: CodeGenerationRow) => {
  await scConfirm({
    message: `确定同步表“${row.tableName}”吗？`,
    confirmText: '确定同步'
  })
  await syncCodeGenerationTableAPI(row.tableName)
  ScMessage.success('同步成功')
  await scResourcePageRef.value?.refresh()
}
const downloadCode = async (row: CodeGenerationRow) => {
  if (row.genType === '1') {
    await generateCodeToPathAPI(row.tableName)
    ScMessage.success(`代码已生成到${row.genPath || '自定义路径'}`)
    return
  }
  const response = await downloadGeneratedCodeAPI(row.tableName)
  const url = URL.createObjectURL(response.data)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `${row.tableName}.zip`
  anchor.click()
  URL.revokeObjectURL(url)
}
const { handleDelete } = useDeleteAction<CodeGenerationRow>(
  deleteCodeGenerationAPI,
  {
    getId: row => String(row.tableId),
    message: '确定删除选中的代码生成配置吗？删除后不可恢复。',
    onSuccess: () => scResourcePageRef.value?.refresh()
  }
)
const handleBatchDelete = () => {
  const selectedRows = (scResourcePageRef.value?.getSelectedRows() ?? []) as CodeGenerationRow[]
  return handleDelete(selectedRows)
}
const openImportDialog = () => importDialogRef.value?.open()
const pageConfig: PageConfig<CodeGenerationRow> = {
  searchConfig: { searchbarItems: codeGenerationSearchbarItems },
  operateConfig: {
    defaultButtons: ['import'],
    defaultButtonsConfig: { import: { permission: 'tool:gen:import' } },
    customButtons: [
      {
        name: '批量删除',
        type: 'danger',
        icon: Refresh,
        permission: 'tool:gen:remove',
        onClick: handleBatchDelete
      }
    ]
  },
  tableConfig: {
    tableColumns: codeGenerationTableColumns,
    showSelection: true,
    customActionButtons: [
      {
        name: '预览',
        type: 'primary',
        text: true,
        icon: View,
        permission: 'tool:gen:preview',
        onClick: previewCode
      },
      {
        name: '编辑',
        type: 'warning',
        text: true,
        icon: Edit,
        permission: 'tool:gen:edit',
        onClick: editCode
      },
      {
        name: '同步',
        type: 'success',
        text: true,
        icon: Share,
        permission: 'tool:gen:edit',
        onClick: syncTable
      },
      {
        name: '生成',
        type: 'primary',
        text: true,
        icon: Download,
        permission: 'tool:gen:code',
        onClick: downloadCode
      }
    ],
    showDefaultButtons: false
  },
  fetchData: getCodeGenerationListAPI,
  treeConfig: { rowKey: 'tableId' }
}
</script>

<template>
  <div class="page-card">
    <ScResourcePage
      ref="scResourcePageRef"
      :page-config="pageConfig"
      @import="openImportDialog"
    />
    <CodeGenerationImportDialog
      ref="importDialogRef"
      @success="scResourcePageRef?.refresh()"
    />
    <CodePreviewDialog ref="previewDialogRef" />
  </div>
</template>
