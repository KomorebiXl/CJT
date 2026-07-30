<script setup lang="ts">
import type {
  ExecutionLogData,
  ExecutionLogSearchParams
} from '@/types/systemMonitor/scheduledTasks'
import { getExecutionLogListAPI } from '@/api/systemMonitor/scheduledTasks-api.ts'
import ExecutionLogDetailDialog from './components/ExecutionLogDetailDialog.vue'
import { CircleCloseFilled } from '@element-plus/icons-vue'
import { getDictLabel } from '@/utils/dict.ts'

const route = useRoute()
const router = useRouter()
const detailVisible = ref(false)
const detailData = ref<ExecutionLogData | null>(null)
const searchbarItems = reactive<SearchbarItems<ExecutionLogSearchParams>>([
  { label: '任务名称', prop: 'jobName', type: 'input' },
  {
    label: '任务分组',
    prop: 'jobGroup',
    type: 'select',
    dictField: 'sys_job_group'
  },
  {
    label: '执行状态',
    prop: 'status',
    type: 'select',
    dictField: 'sys_common_status'
  },
  { label: '执行时间', prop: 'dateRange', type: 'dateRange' }
])
const tableColumns = reactive<TableColumns>([
  { label: '日志编号', prop: 'jobLogId' },
  { label: '任务名称', prop: 'jobName' },
  { label: '任务组名', prop: 'jobGroup' },
  { label: '调用目标字符串', prop: 'invokeTarget', showOverflowTooltip: true },
  { label: '日志信息', prop: 'jobMessage', showOverflowTooltip: true },
  { label: '执行状态', prop: 'status', slot: 'status' },
  { label: '执行时间', prop: 'createTime' }
])

const handleView = (row: ExecutionLogData) => {
  detailData.value = row
  detailVisible.value = true
}

const pageConfig: PageConfig<ExecutionLogData> = {
  searchConfig: {
    searchbarItems,
    searchExtraParams: { jobId: route.params.jobId || 0 }
  },
  operateConfig: {
    defaultButtons: [],
    customButtons: [
      {
        name: '关闭',
        icon: CircleCloseFilled,
        type: 'warning',
        onClick: () => router.back()
      }
    ]
  },
  tableConfig: {
    tableColumns,
    showDefaultButtons: false,
    showSelection: false,
    customActionButtons: [
      {
        name: '详细',
        type: 'primary',
        text: true,
        permission: 'monitor:job:query',
        onClick: handleView
      }
    ]
  },
  fetchData: getExecutionLogListAPI
}
</script>

<template>
  <div class="page-card">
    <ScResourcePage :page-config="pageConfig">
      <template #column-status="{ row }">
        <el-tag :type="String(row.status) === '1' ? 'danger' : 'success'">
          {{ getDictLabel('sys_common_status', row.status) }}
        </el-tag>
      </template>
    </ScResourcePage>
    <ExecutionLogDetailDialog v-model="detailVisible" :data="detailData" />
  </div>
</template>
