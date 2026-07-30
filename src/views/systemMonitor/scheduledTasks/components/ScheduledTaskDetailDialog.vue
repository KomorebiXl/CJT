<script setup lang="ts">
import type { ScheduledTaskData } from '@/types/systemMonitor/scheduledTasks'
import { defineFormItems } from '@/utils/form.ts'
import { getDictLabel } from '@/utils/dict.ts'

const props = defineProps<{ data: ScheduledTaskData | null }>()
const modelValue = defineModel<boolean>()
const formItems = defineFormItems<ScheduledTaskData>([
  { label: '任务编号', prop: 'jobId', customSlot: 'value' },
  { label: '任务分组', prop: 'jobGroup', customSlot: 'jobGroup' },
  { label: '任务名称', prop: 'jobName', customSlot: 'value' },
  { label: '创建时间', prop: 'createTime', customSlot: 'value' },
  { label: 'Cron 表达式', prop: 'cronExpression', customSlot: 'value' },
  { label: '下次执行时间', prop: 'nextValidTime', customSlot: 'value' },
  { label: '调用目标方法', prop: 'invokeTarget', customSlot: 'value', colSpan: 2 },
  { label: '任务状态', prop: 'status', customSlot: 'status' },
  { label: '是否并发', prop: 'concurrent', customSlot: 'concurrent' },
  { label: '执行策略', prop: 'misfirePolicy', customSlot: 'misfirePolicy' }
])
const value = (item: unknown) =>
  item === null || item === undefined || item === '' ? '--' : String(item)
</script>

<template>
  <ScDialog v-model="modelValue" title="任务详情" dialog-width="760px" auto-height>
    <el-scrollbar max-height="500px">
      <ScBaseForm :model-value="props.data ?? {}" :form-items="formItems" :columns="2">
        <template #custom-value="{ data: row, item }">
          {{ value(row[item.prop]) }}
        </template>
        <template #custom-jobGroup="{ data: row }">
          {{ getDictLabel('sys_job_group', row.jobGroup) }}
        </template>
        <template #custom-status="{ data: row }">
          {{ getDictLabel('sys_job_status', row.status) }}
        </template>
        <template #custom-concurrent="{ data: row }">{{ row.concurrent === '1' || row.concurrent === 1 ? '禁止' : '允许' }}</template>
        <template #custom-misfirePolicy="{ data: row }">{{ ['默认策略', '立即执行', '执行一次', '放弃执行'][Number(row.misfirePolicy) ?? 0] ?? value(row.misfirePolicy) }}</template>
      </ScBaseForm>
    </el-scrollbar>
    <template #footer><ScButton type="warning" @click="modelValue = false">关闭</ScButton></template>
  </ScDialog>
</template>
