<script setup lang="ts">
import type {
  IssueLogData,
  IssueLogSearchParams
} from '@/types/projectProcess/issueLog'
import {
  deleteIssueLogAPI,
  getIssueLogBlobAPI,
  getIssueLogDataAPI
} from '@/api/projectProcess/issueLog-api.ts'
import { safeRequest } from '@/utils/safeRequest.ts'
import { downloadFile } from '@/utils/file.ts'
import { useDeleteAction } from '@/hooks/useDeleteAction.ts'
import { Back } from '@element-plus/icons-vue'

const router = useRouter()

const searchbarItems = reactive<SearchbarItems<IssueLogSearchParams>>([
  { label: '日志名称', prop: 'logName', type: 'input' }
])

const tableColumns = reactive<TableColumns>([
  { label: '日志名称', prop: 'logName' },
  { label: '生成时间', prop: 'createTime' }
])

const scResourcePageRef = useTemplateRef<PageInstance>('scResourcePageRef')

/** 下载问题日志，文件名取行数据 logName */
const handleDownloadLog = async (row: IssueLogData) => {
  const [err, res] = await safeRequest(getIssueLogBlobAPI({ id: row.id }), {
    message: '文件下载失败'
  })
  if (err) return
  await downloadFile(res!, row.logName)
}

const pageConfig: PageConfig<IssueLogData> = {
  searchConfig: { searchbarItems },
  operateConfig: {
    defaultButtons: [],
    customButtons: [
      {
        name: '返回',
        type: 'info',
        icon: Back,
        onClick: () => router.back()
      }
    ]
  },
  tableConfig: {
    tableColumns,
    defaultButtonsConfig: {
      edit: { show: () => false },
      delete: { permission: 'acceptance:testLog:delete' }
    },
    customActionButtons: [
      {
        name: '下载',
        type: 'text',
        onClick: row => handleDownloadLog(row),
        permission: 'acceptance:testLog:download'
      }
    ]
  },
  fetchData: getIssueLogDataAPI
}

const { handleDelete } = useDeleteAction<IssueLogData>(
  ids => deleteIssueLogAPI({ id: ids[0] }),
  {
    message: '确定删除该日志吗？删除后不可恢复。',
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
  </div>
</template>

<style scoped lang="scss"></style>
