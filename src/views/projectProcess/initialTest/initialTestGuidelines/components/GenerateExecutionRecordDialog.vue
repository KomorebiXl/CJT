<script setup lang="ts">
import { exportExecutionRecordAPI } from '@/api/projectProcess/initialTest-api.ts'
import { getProcessProjectDetail } from '@/utils/processProject'
import { downloadFile } from '@/utils/file.ts'
import { safeRequest } from '@/utils/safeRequest.ts'
import { ScMessage } from '@/utils/ElUtils'
import { WarningFilled } from '@element-plus/icons-vue'

defineOptions({ name: 'GenerateExecutionRecordDialog' })

const visible = defineModel<boolean>({ required: true })

/** 确认按钮读秒时长（秒），倒计时结束前禁止生成 */
const COUNTDOWN_SECONDS = 2
const countdown = ref(COUNTDOWN_SECONDS)

type Stage = 'confirm' | 'loading' | 'done'
const stage = ref<Stage>('confirm')
const progress = ref(0)
const loading = ref(false)

let countdownTimer: ReturnType<typeof setInterval> | null = null
let progressTimer: ReturnType<typeof setInterval> | null = null
let closeTimer: ReturnType<typeof setTimeout> | null = null

const clearTimers = () => {
  if (countdownTimer) {
    clearInterval(countdownTimer)
    countdownTimer = null
  }
  if (progressTimer) {
    clearInterval(progressTimer)
    progressTimer = null
  }
  if (closeTimer) {
    clearTimeout(closeTimer)
    closeTimer = null
  }
}

const resetState = () => {
  stage.value = 'confirm'
  progress.value = 0
  countdown.value = COUNTDOWN_SECONDS
}

const startCountdown = () => {
  countdown.value = COUNTDOWN_SECONDS
  countdownTimer = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      clearInterval(countdownTimer!)
      countdownTimer = null
    }
  }, 1000)
}

const stopProgress = () => {
  if (progressTimer) {
    clearInterval(progressTimer)
    progressTimer = null
  }
}

/** 启动假进度：快速推到 85%，剩余留给请求完成时跳满 */
const startFakeProgress = () => {
  progress.value = 0
  progressTimer = setInterval(() => {
    if (progress.value < 85) {
      const step = Math.max(1, (85 - progress.value) * 0.08)
      progress.value = Math.min(85, progress.value + step)
    }
  }, 200)
}

const finishProgress = () => {
  stopProgress()
  progress.value = 100
}

const handleClose = () => {
  visible.value = false
}

const delayedClose = (delay: number) => {
  closeTimer = setTimeout(() => handleClose(), delay)
}

const handleConfirm = async () => {
  const detail = await getProcessProjectDetail()
  if (!detail) return

  loading.value = true
  stage.value = 'loading'
  startFakeProgress()

  const [err, res] = await safeRequest(exportExecutionRecordAPI(), {
    message: '获取文件失败！'
  })

  finishProgress()
  loading.value = false

  if (err || !res) {
    delayedClose(600)
    return
  }

  await downloadFile(res, `${detail.code}-${detail.name}-执行记录表-首轮`)
  ScMessage.success('生成执行记录表成功！')
  stage.value = 'done'
  delayedClose(800)
}

const handleOpen = () => {
  clearTimers()
  resetState()
  startCountdown()
}

const handleClosed = () => {
  clearTimers()
  resetState()
}

onUnmounted(() => {
  clearTimers()
})

const progressStatus = computed(() =>
  stage.value === 'done' ? 'success' : undefined
)
</script>

<template>
  <ScDialog
    v-model="visible"
    title="操作确认"
    dialog-width="440px"
    auto-height
    :close-on-click-modal="false"
    :close-on-press-escape="!loading"
    :show-close="!loading"
    align-center
    @open="handleOpen"
    @closed="handleClosed"
  >
    <div v-if="stage === 'confirm'" class="confirm-body">
      <div class="warn-icon">
        <el-icon :size="28"><WarningFilled /></el-icon>
      </div>
      <div class="confirm-content">
        <p class="confirm-title">请阅读以下内容</p>
        <p class="confirm-desc">
          生成执行记录表将清空原有的记录表数据，是否继续？
        </p>
      </div>
    </div>
    <div v-else class="progress-body">
      <p class="progress-label">
        {{
          stage === 'done' ? '文件生成完成' : '正在生成执行记录表，请稍候...'
        }}
      </p>
      <el-progress
        :percentage="Math.round(progress)"
        :status="progressStatus"
        :stroke-width="10"
        striped
        :striped-flow="stage === 'loading'"
        :duration="8"
      />
      <p class="progress-tip">
        {{ stage === 'done' ? '文件已开始下载' : '请勿关闭页面' }}
      </p>
    </div>

    <template #footer>
      <div v-if="stage === 'confirm'" class="dialog-footer">
        <ScButton type="warning" :disabled="loading" @click="handleClose">
          取消
        </ScButton>
        <ScButton
          type="primary"
          :disabled="countdown > 0"
          :loading="loading"
          @click="handleConfirm"
        >
          {{ countdown > 0 ? `确定（${countdown}s）` : '确定' }}
        </ScButton>
      </div>
    </template>
  </ScDialog>
</template>

<style lang="scss" scoped>
.confirm-body {
  display: flex;
  gap: 14px;
  align-items: flex-start;
  padding: 4px 0 8px;

  .warn-icon {
    flex-shrink: 0;
    color: var(--el-color-warning);
    margin-top: 2px;
  }

  .confirm-content {
    flex: 1;
  }

  .confirm-title {
    margin: 0 0 6px;
    font-size: 15px;
    font-weight: 600;
    color: var(--el-text-color-primary);
    line-height: 1.4;
  }

  .confirm-desc {
    margin: 0;
    font-size: 14px;
    color: var(--el-text-color-regular);
    line-height: 1.7;
  }
}

.progress-body {
  padding: 8px 0 4px;
  text-align: center;

  .progress-label {
    margin: 0 0 16px;
    font-size: 14px;
    color: var(--el-text-color-primary);
  }

  .progress-tip {
    margin: 10px 0 0;
    font-size: 12px;
    color: var(--el-text-color-placeholder);
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>
