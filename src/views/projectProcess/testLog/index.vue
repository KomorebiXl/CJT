<script setup lang="ts">
import type {
  TestLogData,
  TestLogSearchParams
} from '@/types/projectProcess/testLog'
import {
  deleteTestLogAPI,
  getTestLogBlobAPI,
  getTestLogDataAPI
} from '@/api/projectProcess/testLog-api.ts'
import { safeRequest } from '@/utils/safeRequest.ts'
import { downloadFile } from '@/utils/file.ts'
import { useDeleteAction } from '@/hooks/useDeleteAction.ts'

const searchbarItems = reactive<SearchbarItems<TestLogSearchParams>>([
  { label: '测试日志名称', prop: 'name', type: 'input' }
])

const tableColumns = reactive<TableColumns>([
  { label: '测试日志名称', prop: 'name' },
  { label: '生成日期', prop: 'createTime' },
  { label: '生成人', prop: 'createByName', width: 150 }
])

const scResourcePageRef = useTemplateRef<PageInstance>('scResourcePageRef')

/** 下载测试日志，文件名取行数据 name */
const handleDownloadLog = async (row: TestLogData) => {
  const [err, res] = await safeRequest(getTestLogBlobAPI({ id: row.id }), {
    message: '文件下载失败'
  })
  if (err) return
  await downloadFile(res!, row.name)
}

const pageConfig: PageConfig<TestLogData> = {
  searchConfig: { searchbarItems },
  operateConfig: { defaultButtons: [] },
  tableConfig: {
    tableColumns,
    showPagination: false,
    defaultButtonsConfig: {
      edit: { show: () => false },
      delete: { permission: 'subject:log:remove' }
    },
    customActionButtons: [
      {
        name: '下载',
        type: 'text',
        onClick: row => handleDownloadLog(row),
        permission: 'subject:log:download'
      }
    ]
  },
  fetchData: async params => {
    const { data } = await getTestLogDataAPI(params)
    return { rows: data ?? [] }
  }
}

const { handleDelete } = useDeleteAction<TestLogData>(
  ids => deleteTestLogAPI({ ids }),
  {
    message: '确定删除该测试日志吗？删除后不可恢复。',
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
