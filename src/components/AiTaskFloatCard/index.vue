<!--AI 测试用例生成-右下角任务进度卡片（全局挂载于 layout，替代全屏遮罩）-->
<script setup lang="ts">
import { Close, MagicStick } from '@element-plus/icons-vue'
import { useAiTaskStore } from '@/store/modules/ai-task-store'
import { usePermission } from '@/components/ScBaseComponents/ScResourcePage/hooks/usePermission.ts'

const aiTaskStore = useAiTaskStore()
const { hasPermission } = usePermission()

const progress = computed(() => aiTaskStore.progress)

/** 卡片形态：进行中 / 失联 / 完成（含部分失败）/ 失败 / 已停止 */
const phase = computed(() => {
  if (aiTaskStore.lostConnection) return 'lost'
  const status = progress.value?.status
  if (status === 'running') return 'running'
  if (status === 'failed') return 'failed'
  if (status === 'stopped') return 'stopped'
  return 'done'
})

const hasProblem = computed(
  () => (progress.value?.failed ?? 0) > 0 || (progress.value?.degraded ?? 0) > 0
)

/** 任务类型（generate 用例生成 / extract 功能点提取；后端快照携带） */
const isExtract = computed(() => progress.value?.taskType === 'extract')

const title = computed(() => {
  const noun = isExtract.value ? '功能点提取' : '测试用例生成'
  switch (phase.value) {
    case 'running':
      return `AI ${noun}中`
    case 'lost':
      return '进度暂时无法获取'
    case 'failed':
      return `${noun}任务失败`
    case 'stopped':
      return `${noun}已停止`
    default:
      return hasProblem.value ? `${noun}完成（部分未成功）` : `${noun}完成`
  }
})

const progressStatus = computed(() => {
  if (phase.value === 'failed') return 'exception'
  if (phase.value === 'lost' || phase.value === 'stopped') return 'warning'
  if (phase.value === 'done') return hasProblem.value ? 'warning' : 'success'
  return undefined
})

/** 停止：点击即发停止请求（无二次确认——确认期间的生成会随停止作废，犹豫即浪费；
 *  误触代价=重新生成，可接受；在途调用（≤并发数）跑完后完全停止） */
const handleStop = () => {
  void aiTaskStore.stop()
}

const canDownload = computed(
  () =>
    !isExtract.value &&
    !!aiTaskStore.meta?.downloadParams &&
    phase.value === 'done' &&
    (progress.value?.total ?? 0) > 0 &&
    hasPermission('acceptance:result:aiTestCase:download')
)

// 刷新页面后，按持久化的任务信息向后端探测并接上轮询
onMounted(() => {
  aiTaskStore.resume()
})
</script>

<template>
  <transition name="ai-task-card">
    <div v-if="aiTaskStore.cardVisible && progress" class="ai-task-card">
      <div class="ai-task-card__header">
        <el-icon
          class="ai-task-card__icon"
          :class="{ 'is-running': phase === 'running' }"
        >
          <MagicStick />
        </el-icon>
        <span class="ai-task-card__title">{{ title }}</span>
        <el-icon
          class="ai-task-card__close"
          :title="phase === 'running' ? '收起（任务继续在后台执行）' : '关闭'"
          @click="aiTaskStore.closeCard()"
        >
          <Close />
        </el-icon>
      </div>

      <div class="ai-task-card__scope">{{ aiTaskStore.meta?.scopeLabel }}</div>
      <ScButton
        v-if="progress.status === 'failed' && progress.cleanupPending"
        size="small"
        type="danger"
        @click="handleStop"
        >重试作废</ScButton
      >

      <el-progress
        :percentage="aiTaskStore.percent"
        :status="progressStatus"
        :stroke-width="8"
        :indeterminate="phase === 'running' && !progress.total"
      />

      <div class="ai-task-card__stats">
        <span>{{ progress.processed ?? 0 }}/{{ progress.total ?? 0 }}</span>
        <span class="is-success">成功 {{ progress.success ?? 0 }}</span>
        <span v-if="progress.degraded" class="is-warning"
          >原文回填 {{ progress.degraded }}</span
        >
        <span v-if="progress.failed" class="is-danger"
          >失败 {{ progress.failed }}</span
        >
        <span v-if="progress.skipped" class="is-warning"
          >停止跳过 {{ progress.skipped }}</span
        >
      </div>

      <div class="ai-task-card__tip">
        <template v-if="phase === 'running'"
          >可以继续其他操作，完成后会在这里提醒你</template
        >
        <template v-else-if="phase === 'lost'"
          >任务可能仍在后台执行，网络恢复后可重试</template
        >
        <template v-else-if="phase === 'failed'">{{
          progress.message || '请稍后重试'
        }}</template>
        <template v-else-if="phase === 'stopped'">
          {{ progress.message || '已停止' }}——本批内容已作废，可重新发起生成
        </template>
        <template v-else-if="isExtract && progress.total === 0"
          >没有需要提取的测试项（素材未变更的已跳过）</template
        >
        <template v-else-if="progress.total === 0"
          >没有需要生成的测试项</template
        >
        <template v-else-if="isExtract"
          >请到测试项详情确认功能点清单后再生成用例</template
        >
        <template v-else-if="hasProblem"
          >未成功的项可进入子系统单项重新生成</template
        >
      </div>

      <div v-if="phase !== 'running'" class="ai-task-card__footer">
        <ScButton
          v-if="phase === 'lost'"
          size="small"
          type="primary"
          @click="aiTaskStore.retry()"
        >
          重试
        </ScButton>
        <!-- on-click 异步自动 loading（ScButton 封装点，替代手动 :loading） -->
        <ScButton
          v-if="canDownload"
          size="small"
          type="primary"
          :on-click="() => aiTaskStore.download()"
        >
          下载用例文档
        </ScButton>
        <ScButton size="small" @click="aiTaskStore.closeCard()"
          >知道了</ScButton
        >
      </div>
      <div v-else class="ai-task-card__footer">
        <ScButton
          size="small"
          type="danger"
          plain
          title="停止并作废本批已生成内容（在途项跑完后生效），再次生成将从头开始"
          @click="handleStop"
        >
          停止
        </ScButton>
      </div>
    </div>
  </transition>
</template>

<style scoped lang="scss">
.ai-task-card {
  position: fixed;
  right: 24px;
  bottom: 24px;
  z-index: 2000;
  width: 320px;
  padding: 14px 16px 12px;
  border-radius: 8px;
  background-color: var(--el-bg-color-overlay);
  border: 1px solid var(--el-border-color-lighter);
  box-shadow: var(--el-box-shadow-light);

  &__header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 4px;
  }

  &__icon {
    color: var(--el-color-primary);
    font-size: 16px;

    &.is-running {
      animation: ai-task-pulse 1.4s ease-in-out infinite;
    }
  }

  &__title {
    flex: 1;
    font-size: 14px;
    font-weight: 600;
    color: var(--el-text-color-primary);
  }

  &__close {
    cursor: pointer;
    color: var(--el-text-color-secondary);

    &:hover {
      color: var(--el-text-color-primary);
    }
  }

  &__scope {
    margin: 0 0 10px 24px;
    font-size: 12px;
    color: var(--el-text-color-secondary);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__stats {
    display: flex;
    flex-wrap: wrap;
    gap: 4px 12px;
    margin-top: 8px;
    font-size: 12px;
    color: var(--el-text-color-regular);

    .is-success {
      color: var(--el-color-success);
    }

    .is-warning {
      color: var(--el-color-warning);
    }

    .is-danger {
      color: var(--el-color-danger);
    }
  }

  &__tip {
    margin-top: 6px;
    font-size: 12px;
    color: var(--el-text-color-secondary);

    &:empty {
      display: none;
    }
  }

  &__footer {
    display: flex;
    justify-content: flex-end;
    margin-top: 10px;
  }
}

.ai-task-card-enter-active,
.ai-task-card-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.ai-task-card-enter-from,
.ai-task-card-leave-to {
  opacity: 0;
  transform: translateY(12px);
}

@keyframes ai-task-pulse {
  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.35;
  }
}
</style>
