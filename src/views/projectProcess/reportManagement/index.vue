<script setup lang="ts">
import type {
  ReportManagementData,
  ReportManagementSearchParams
} from '@/types/projectProcess/reportManagement'
import {
  batchRebuildOrderAPI,
  deleteReportManagementAPI,
  getReportManagementBlobAPI,
  getReportManagementDataAPI
} from '@/api/projectProcess/reportManagement-api.ts'
import { ScMessage } from '@/utils/ElUtils'
import { useScConfirm } from '@/hooks/useScConfirmDialog.ts'
import { safeRequest } from '@/utils/safeRequest.ts'
import { downloadFile } from '@/utils/file.ts'
import { useDeleteAction } from '@/hooks/useDeleteAction.ts'
import { getProjectIdFromRoute } from '@/store/modules/router-store'
import GenerateReportDialog from './components/GenerateReportDialog.vue'

const route = useRoute()

const searchbarItems = reactive<SearchbarItems<ReportManagementSearchParams>>([
  { label: '报告名称', prop: 'reportName', type: 'input' },
  { label: '生成人', prop: 'createByName', type: 'input' }
])

const tableColumns = reactive<TableColumns>([
  { label: '报告名称', prop: 'reportName' },
  { label: '生成日期', prop: 'createTime' },
  { label: '生成人', prop: 'createByName', width: 150 }
])

const scResourcePageRef = useTemplateRef<PageInstance>('scResourcePageRef')

const generateReportDialogRef = useTemplateRef<
  InstanceType<typeof GenerateReportDialog>
>('generateReportDialogRef')

/** 打开生成报告弹窗，项目 id 取当前项目流程作用域 */
const handleGenerateReport = () => {
  generateReportDialogRef.value?.open(getProjectIdFromRoute(route))
}

const { scConfirm } = useScConfirm()

/** 重构序号（subjectId 由流程拦截器注入） */
const handleRebuildIndex = async () => {
  await scConfirm({
    message: '确定重构序号吗？',
    confirmText: '确定重构'
  })
  await batchRebuildOrderAPI()
  ScMessage.success('重构序号成功')
}

/** 下载报告，文件名取行数据 reportName */
const handleDownloadReport = async (row: ReportManagementData) => {
  const [err, res] = await safeRequest(
    getReportManagementBlobAPI({ id: row.id, subjectId: row.subjectId }),
    { message: '文件下载失败' }
  )
  if (err) return
  await downloadFile(res!, row.reportName)
}

const pageConfig: PageConfig<ReportManagementData> = {
  searchConfig: { searchbarItems },
  operateConfig: {
    defaultButtons: [],
    customButtons: [
      {
        name: '生成报告',
        type: 'primary',
        permission: 'system:report:add',
        onClick: handleGenerateReport
      },
      {
        name: '重构序号',
        type: 'warning',
        permission: 'acceptance:result:batchRebuildSerial',
        onClick: handleRebuildIndex
      }
    ]
  },
  tableConfig: {
    tableColumns,
    showPagination: false,
    defaultButtonsConfig: {
      edit: { show: () => false },
      delete: { permission: 'system:report:remove' }
    },
    customActionButtons: [
      {
        name: '下载',
        type: 'text',
        permission: 'system:report:download',
        onClick: row => handleDownloadReport(row)
      }
    ]
  },
  fetchData: async params => {
    const { data } = await getReportManagementDataAPI({
      ...params,
      id: getProjectIdFromRoute(route)
    })
    return { rows: data ?? [] }
  }
}

const { handleDelete } = useDeleteAction<ReportManagementData>(
  ids => deleteReportManagementAPI({ id: ids[0] }),
  {
    message: '确定删除该报告吗？删除后不可恢复。',
    onSuccess: () => scResourcePageRef.value?.refresh()
  }
)
</script>

<template>
  <div class="page-card">
    <ScResourcePage
      ref="scResourcePageRef"
      :page-config="pageConfig"
      @delete="handleDelete"
    />
    <GenerateReportDialog
      ref="generateReportDialogRef"
      @success="scResourcePageRef?.refresh()"
    />
  </div>
</template>

<style scoped lang="scss"></style>
