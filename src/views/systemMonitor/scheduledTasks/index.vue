<script setup lang="ts">
import type {
  ScheduledTaskData,
  ScheduledTaskFormData,
  ScheduledTaskSearchParams
} from '@/types/systemMonitor/scheduledTasks'
import {
  changeScheduledTaskStatusAPI,
  createScheduledTaskAPI,
  deleteScheduledTasksAPI,
  getScheduledTaskDetailAPI,
  getScheduledTaskListAPI,
  runScheduledTaskAPI,
  updateScheduledTaskAPI
} from '@/api/systemMonitor/scheduledTasks-api.ts'
import { Document } from '@element-plus/icons-vue'
import { defineFormItems } from '@/utils/form.ts'
import { useDialogForm } from '@/hooks/useDialogForm.ts'
import { useDeleteAction } from '@/hooks/useDeleteAction.ts'
import { ScMessage } from '@/utils/ElUtils'
import { getDictLabel } from '@/utils/dict.ts'
import { safeRequest } from '@/utils/safeRequest.ts'
import CronExpressionEditor from './components/CronExpressionEditor/index.vue'
import ScheduledTaskDetailDialog from './components/ScheduledTaskDetailDialog.vue'

const scResourcePageRef = useTemplateRef<PageInstance>('scResourcePageRef')
const router = useRouter()
const executionLogPath = '/system-monitor/scheduled-tasks/logs'
const detailVisible = ref(false)
const detailData = ref<ScheduledTaskData | null>(null)
const changingTaskIds = ref(new Set<string | number>())

const searchbarItems = reactive<SearchbarItems<ScheduledTaskSearchParams>>([
  { label: '任务名称', prop: 'jobName', type: 'input' },
  {
    label: '任务分组',
    prop: 'jobGroup',
    type: 'select',
    dictField: 'sys_job_group'
  },
  {
    label: '任务状态',
    prop: 'status',
    type: 'select',
    dictField: 'sys_job_status'
  }
])

const tableColumns = reactive<TableColumns>([
  { label: '任务编号', prop: 'jobId' },
  { label: '任务名称', prop: 'jobName' },
  { label: '任务组名', prop: 'jobGroup', slot: 'jobGroup' },
  { label: '调用目标字符串', prop: 'invokeTarget', showOverflowTooltip: true },
  {
    label: 'Cron 执行表达式',
    prop: 'cronExpression',
    showOverflowTooltip: true
  },
  { label: '状态', prop: 'status', slot: 'status' }
])

const defaultFormData = reactive<ScheduledTaskFormData>({
  jobName: '',
  jobGroup: '',
  invokeTarget: '',
  cronExpression: '',
  status: '0',
  misfirePolicy: '0',
  concurrent: '0'
})

const formItems = defineFormItems<ScheduledTaskFormData>([
  {
    label: '任务名称',
    prop: 'jobName',
    type: 'input',
    rules: [{ required: true, message: '任务名称不能为空', trigger: 'blur' }]
  },
  {
    label: '任务分组',
    prop: 'jobGroup',
    type: 'select',
    componentProps: { dictField: 'sys_job_group' },
    rules: [{ required: true, message: '任务分组不能为空', trigger: 'change' }]
  },
  {
    label: '调用目标字符串',
    prop: 'invokeTarget',
    type: 'input',
    rules: [
      { required: true, message: '调用目标字符串不能为空', trigger: 'blur' }
    ]
  },
  {
    label: 'Cron 表达式',
    prop: 'cronExpression',
    customSlot: 'cronExpression',
    rules: [{ required: true, message: 'Cron 表达式不能为空', trigger: 'blur' }]
  },
  {
    label: '状态',
    prop: 'status',
    type: 'radio',
    colSpan: 2,
    componentProps: { dictField: 'sys_job_status', border: true }
  },
  {
    label: '执行策略',
    prop: 'misfirePolicy',
    type: 'radio',
    colSpan: 2,
    componentProps: {
      radioOptions: [
        { label: '默认策略', value: '0' },
        { label: '立即执行', value: '1' },
        { label: '执行一次', value: '2' },
        { label: '放弃执行', value: '3' }
      ],
      border: true
    }
  },
  {
    label: '是否并发',
    prop: 'concurrent',
    type: 'radio',
    colSpan: 2,
    componentProps: {
      radioOptions: [
        { label: '允许', value: '0' },
        { label: '禁止', value: '1' }
      ],
      border: true
    }
  }
])

const { visible, formData, confirmLoading, dialogTitle, open, handleConfirm } =
  useDialogForm<ScheduledTaskFormData, 'jobId', string | number>({
    defaultFormData,
    title: '定时任务',
    idKey: 'jobId',
    fetchDetail: getScheduledTaskDetailAPI,
    onCreate: createScheduledTaskAPI,
    onUpdate: updateScheduledTaskAPI,
    onSuccess: () => scResourcePageRef.value?.refresh()
  })

const { handleDelete } = useDeleteAction<ScheduledTaskData>(
  deleteScheduledTasksAPI,
  {
    getId: row => String(row.jobId),
    message: '确定删除选中的定时任务吗？删除后不可恢复。',
    onSuccess: () => scResourcePageRef.value?.refresh()
  }
)

const handleView = (row: ScheduledTaskData) => {
  detailData.value = row
  detailVisible.value = true
}

const handleRun = async (row: ScheduledTaskData) => {
  await runScheduledTaskAPI({ jobId: row.jobId, jobGroup: row.jobGroup })
  ScMessage.success('执行成功')
}

const goExecutionLogs = (jobId: number = 0) => {
  router.push(`${executionLogPath}/${jobId}`)
}

const handleStatus = async (row: ScheduledTaskData) => {
  if (changingTaskIds.value.has(row.jobId)) return

  const nextStatus = String(row.status) === '0' ? '1' : '0'
  changingTaskIds.value = new Set(changingTaskIds.value).add(row.jobId)
  try {
    const [err] = await safeRequest(
      changeScheduledTaskStatusAPI({ jobId: row.jobId, status: nextStatus })
    )
    if (err) return
    row.status = nextStatus
    ScMessage.success(nextStatus === '0' ? '启用成功' : '停用成功')
  } finally {
    const pendingIds = new Set(changingTaskIds.value)
    pendingIds.delete(row.jobId)
    changingTaskIds.value = pendingIds
  }
}

const pageConfig: PageConfig<ScheduledTaskData> = {
  searchConfig: { searchbarItems },
  operateConfig: {
    defaultButtonsConfig: { add: { permission: 'monitor:job:add' } },
    customButtons: [
      {
        id: 'logs',
        name: '日志',
        type: 'info',
        icon: Document,
        permission: 'monitor:job:query',
        onClick: () => goExecutionLogs()
      }
    ]
  },
  tableConfig: {
    tableColumns,
    defaultButtonsConfig: {
      edit: { permission: 'monitor:job:edit' },
      delete: { permission: 'monitor:job:remove' }
    },
    customActionButtons: [
      {
        name: '详情',
        type: 'primary',
        text: true,
        permission: 'monitor:job:query',
        onClick: handleView
      },
      {
        name: '执行一次',
        type: 'primary',
        text: true,
        permission: 'monitor:job:changeStatus',
        onClick: handleRun
      },
      {
        name: '调度日志',
        type: 'info',
        text: true,
        permission: 'monitor:job:query',
        onClick: row => goExecutionLogs(row.jobId)
      }
    ]
  },
  fetchData: getScheduledTaskListAPI
}

const dialogFormConfig: DialogFormConfig = {
  formItems,
  title: dialogTitle.value,
  labelWidth: '130px'
}
</script>

<template>
  <div class="page-card"  >
    <ScResourcePage
      ref="scResourcePageRef"
      :page-config="pageConfig"
      @add="open"
      @edit="open"
      @delete="handleDelete"
    >
      <template #column-jobGroup="{ row }">
        {{ getDictLabel('sys_job_group', row.jobGroup) }}
      </template>
      <template #column-status="{ row }">
        <ScSwitch
          :model-value="String(row.status)"
          active-value="0"
          inactive-value="1"
          :disabled="changingTaskIds.has(row.jobId)"
          @click="handleStatus(row as ScheduledTaskData)"
        />
      </template>
    </ScResourcePage>
    <ScDialogForm
      v-model="visible"
      :form-data="formData"
      :config="dialogFormConfig"
      :confirm-loading="confirmLoading"
      @confirm="handleConfirm"
    >
      <template #custom-cronExpression="{ data }">
        <CronExpressionEditor v-model="data.cronExpression" />
      </template>
    </ScDialogForm>
    <ScheduledTaskDetailDialog v-model="detailVisible" :data="detailData" />
  </div>
</template>

<style scoped lang="scss"></style>
