<script setup lang="ts">
import type { ExecutionLogData } from '@/types/systemMonitor/scheduledTasks'
import { getDictLabel } from '@/utils/dict.ts'

const props = defineProps<{ data: ExecutionLogData | null }>()
const modelValue = defineModel<boolean>({ required: true })
const value = (item: unknown) =>
  item === null || item === undefined || item === '' ? '--' : String(item)
</script>

<template>
  <ScDialog
    v-model="modelValue"
    title="调度日志详细"
    dialog-width="760px"
    auto-height
  >
    <el-descriptions :column="2" border>
      <el-descriptions-item label="日志编号">
        {{ value(props.data?.jobLogId) }}
      </el-descriptions-item>
      <el-descriptions-item label="任务名称">
        {{ value(props.data?.jobName) }}
      </el-descriptions-item>
      <el-descriptions-item label="任务分组">
        {{ value(props.data?.jobGroup) }}
      </el-descriptions-item>
      <el-descriptions-item label="执行时间">
        {{ value(props.data?.createTime) }}
      </el-descriptions-item>
      <el-descriptions-item label="调用目标方法" :span="2">
        {{ value(props.data?.invokeTarget) }}
      </el-descriptions-item>
      <el-descriptions-item label="日志信息" :span="2">
        <span class="detail-text">
          {{ value(props.data?.jobMessage) }}
        </span>
      </el-descriptions-item>
      <el-descriptions-item label="执行状态">
        {{ getDictLabel('sys_common_status', props.data?.status) }}
      </el-descriptions-item>
      <el-descriptions-item label="异常信息" :span="2">
        <span class="detail-text error-text">
          {{ value(props.data?.exceptionInfo) }}
        </span>
      </el-descriptions-item>
    </el-descriptions>
    <template #footer>
      <ScButton type="warning" @click="modelValue = false"> 关闭 </ScButton>
    </template>
  </ScDialog>
</template>

<style scoped lang="scss">
.detail-text {
  white-space: pre-wrap;
  word-break: break-word;
}
.error-text {
  color: var(--el-color-danger);
}
</style>
