<script setup lang="ts">
import {
  checkGenerateTestlogAPI,
  generateTestlogAPI
} from '@/api/projectProcess/initialTest-api.ts'
import { safeRequest } from '@/utils/safeRequest.ts'
import { getProjectIdFromRoute } from '@/store/modules/router-store'
import { ScMessage } from '@/utils/ElUtils'
import { WarningFilled, CircleCheckFilled } from '@element-plus/icons-vue'

const props = defineProps<{
  flgFirst: boolean
}>()

const visible = defineModel<boolean>({ required: true })

const router = useRouter()
const route = useRoute()

const DEFAULT_CONFIRM_MSG = '即将生成测试日志，是否继续？'
const errMsg = ref<string | undefined>()

type Stage = 'confirm' | 'loading' | 'done'
const stage = ref<Stage>('confirm')
const progress = ref(0)

let progressTimer: ReturnType<typeof setInterval> | null = null
let delayTimer: ReturnType<typeof setTimeout> | null = null

const clearTimers = () => {
  if (progressTimer) {
    clearInterval(progressTimer)
    progressTimer = null
  }
  if (delayTimer) {
    clearTimeout(delayTimer)
    delayTimer = null
  }
}

const resetState = () => {
  stage.value = 'confirm'
  progress.value = 0
  errMsg.value = undefined
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
      const step = Math.max(0.5, (85 - progress.value) * 0.08)
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

/** 打开弹窗时先检查，服务端返回 msg 时作为确认提示展示 */
const handleGenerateCheck = async () => {
  const [err, res] = await safeRequest(
    checkGenerateTestlogAPI(getProjectIdFromRoute(route)),
    { showError: false }
  )
  if (err || !res) return
  errMsg.value = res.msg
}

const handleConfirm = async () => {
  stage.value = 'loading'
  startFakeProgress()

  const [err] = await safeRequest(
    generateTestlogAPI({ flgFirst: props.flgFirst }),
    { showError: false }
  )

  if (err) {
    stopProgress()
    ScMessage.error('测试日志生成失败，请重试')
    stage.value = 'confirm'
    return
  }

  finishProgress()
  ScMessage.success('测试日志生成成功！')
  delayTimer = setTimeout(() => {
    stage.value = 'done'
  }, 500)
}

const handleViewLog = () => {
  visible.value = false
  router.push({
    path: '/projectProcess/executionLog/logManagement',
    query: {
      projectId: getProjectIdFromRoute(route)
    }
  })
}

const handleOpen = () => {
  clearTimers()
  resetState()
  handleGenerateCheck()
}

const handleClosed = () => {
  clearTimers()
  resetState()
}

onUnmounted(() => {
  clearTimers()
})

/** 服务端消息按行渲染纯文本，替代源 v-html（\n 转 <br>）的换行展示 */
const confirmMsgLines = computed(() =>
  (errMsg.value || DEFAULT_CONFIRM_MSG).split('\n')
)
</script>

<template>
  <ScDialog
    v-model="visible"
    title="操作确认"
    dialog-width="440px"
    auto-height
    :close-on-click-modal="false"
    :close-on-press-escape="stage !== 'loading'"
    :show-close="stage !== 'loading'"
    align-center
    @open="handleOpen"
    @closed="handleClosed"
  >
    <div v-if="stage === 'confirm'" class="stage-body">
      <div class="info-row">
        <el-icon class="info-icon" :size="26"><WarningFilled /></el-icon>
        <div>
          <p class="stage-title">请确认以下操作</p>
          <div class="stage-desc">
            <p v-for="(line, i) in confirmMsgLines" :key="i">{{ line }}</p>
          </div>
        </div>
      </div>
    </div>
    <div v-else-if="stage === 'loading'" class="stage-body stage-progress">
      <p class="stage-desc">正在生成测试日志，请稍候...</p>
      <el-progress
        :percentage="Math.round(progress)"
        :stroke-width="10"
        striped
        striped-flow
        :duration="8"
      />
      <p class="progress-tip">请勿关闭页面</p>
    </div>
    <div v-else-if="stage === 'done'" class="stage-body stage-done">
      <el-icon class="done-icon" :size="48"><CircleCheckFilled /></el-icon>
      <p class="done-title">测试日志生成成功</p>
      <p class="stage-desc">是否前往查看生成日志？</p>
    </div>

    <template #footer>
      <template v-if="stage !== 'loading'">
        <ScButton type="warning" @click="handleClose">取消</ScButton>
        <ScButton
          v-if="stage === 'confirm'"
          type="primary"
          @click="handleConfirm"
        >
          确定
        </ScButton>
        <ScButton v-else type="primary" @click="handleViewLog">查看</ScButton>
      </template>
    </template>
  </ScDialog>
</template>

<style lang="scss" scoped>
.stage-body {
  padding: 4px 0 8px;
  min-height: 80px;
}

.info-row {
  display: flex;
  gap: 14px;
  align-items: flex-start;

  .info-icon {
    flex-shrink: 0;
    margin-top: 2px;
    color: var(--el-color-warning);
  }
}

.stage-title {
  margin: 0 0 6px;
  font-size: 15px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  line-height: 1.4;
}

.stage-desc {
  margin: 0;
  font-size: 14px;
  color: var(--el-text-color-regular);
  line-height: 1.7;

  p {
    margin: 0;
  }
}

.stage-progress {
  text-align: center;

  .stage-desc {
    margin-bottom: 16px;
  }

  .progress-tip {
    margin: 10px 0 0;
    font-size: 12px;
    color: var(--el-text-color-placeholder);
  }
}

.stage-done {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px 0 8px;
  gap: 8px;

  .done-icon {
    color: var(--el-color-success);
  }

  .done-title {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    color: var(--el-text-color-primary);
  }
}
</style>
