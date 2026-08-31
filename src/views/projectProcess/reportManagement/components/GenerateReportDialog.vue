<script setup lang="ts">
import { generateSubjectReportAPI } from '@/api/projectProcess/reportManagement-api.ts'
import { getProcessProjectDetail } from '@/utils/processProject'
import { ScMessage } from '@/utils/ElUtils'
import { WarningFilled, CircleCheckFilled } from '@element-plus/icons-vue'

defineOptions({ name: 'GenerateReportDialog' })

const emit = defineEmits<{ (e: 'success'): void }>()

type GenerateStage =
  'initial' | 'hainan-select' | 'loading' | 'confirm-msg' | 'done'

/** 海南模板验收类型选项：1 初验报告、2 终验报告 */
const acceptanceTypeOptions = [
  { label: '初验报告', value: 1 },
  { label: '终验报告', value: 2 }
]

const visible = ref(false)
const stage = ref<GenerateStage>('initial')
const subjectId = ref('')
/** 是否海南模板报告（项目 largeType=10 且 reportType=10-1） */
const isHainanReport = ref(false)
/** 海南模板验收类型：1 初验报告、2 终验报告 */
const acceptanceType = ref<number>()
const confirmMsg = ref('')
/** 服务端返回的下一步确认步骤 */
const pendingConfirmStep = ref(0)
/** 二次确认时继续携带的额外参数（如 acceptanceType） */
const pendingExtraParams = ref<{ acceptanceType?: number }>({})
const progress = ref(0)

let progressTimer: ReturnType<typeof setInterval> | null = null
let delayTimer: ReturnType<typeof setTimeout> | null = null
let closeTimer: ReturnType<typeof setTimeout> | null = null

const clearTimers = () => {
  if (progressTimer) {
    clearInterval(progressTimer)
    progressTimer = null
  }
  if (delayTimer) {
    clearTimeout(delayTimer)
    delayTimer = null
  }
  if (closeTimer) {
    clearTimeout(closeTimer)
    closeTimer = null
  }
}

const stopProgress = () => {
  if (progressTimer) {
    clearInterval(progressTimer)
    progressTimer = null
  }
}

const resetState = () => {
  stage.value = 'initial'
  isHainanReport.value = false
  acceptanceType.value = undefined
  confirmMsg.value = ''
  pendingConfirmStep.value = 0
  pendingExtraParams.value = {}
  progress.value = 0
}

/** 打开弹窗时读取流程作用域项目详情缓存，判断是否海南模板 */
const loadSubjectDetail = async () => {
  const detail = await getProcessProjectDetail()
  isHainanReport.value =
    !!detail && detail.largeType === '10' && detail.reportType === '10-1'
}

const open = (id: string) => {
  clearTimers()
  resetState()
  subjectId.value = id
  visible.value = true
  loadSubjectDetail()
}

defineExpose({ open })

/** 模拟生成进度：缓慢逼近 85%，完成后置 100% */
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

/** 调用生成接口：响应返回更高 confirmStep 时进入二次确认 */
const reportFileDownload = async (
  confirmStep: number,
  extraParams?: { acceptanceType?: number }
) => {
  stage.value = 'loading'
  startFakeProgress()
  try {
    const res = await generateSubjectReportAPI({
      params: {
        confirmStep,
        id: subjectId.value,
        ...extraParams
      }
    })
    finishProgress()
    if (res.confirmStep && res.confirmStep > confirmStep) {
      const nextStep = res.confirmStep
      delayTimer = setTimeout(() => {
        confirmMsg.value = res.msg
        pendingConfirmStep.value = nextStep
        pendingExtraParams.value = extraParams ?? {}
        stage.value = 'confirm-msg'
      }, 500)
      return
    }
    delayTimer = setTimeout(() => {
      stage.value = 'done'
      emit('success')
      closeTimer = setTimeout(() => {
        visible.value = false
      }, 2500)
    }, 500)
  } catch {
    stopProgress()
    ScMessage.error('生成报告失败，请重试')
    stage.value = 'initial'
  }
}

const handleGenerateReport = () => {
  if (isHainanReport.value) {
    stage.value = 'hainan-select'
    return
  }
  reportFileDownload(1)
}

const handleHainanConfirm = () => {
  if (acceptanceType.value == null) {
    ScMessage.warning('请选择验收类型')
    return
  }
  reportFileDownload(1, { acceptanceType: acceptanceType.value })
}

const handleMsgConfirm = () => {
  reportFileDownload(pendingConfirmStep.value, pendingExtraParams.value)
}

const handleClose = () => {
  visible.value = false
}

const handleClosed = () => {
  clearTimers()
  resetState()
}

onUnmounted(() => {
  clearTimers()
})
</script>

<template>
  <ScDialog
    v-model="visible"
    title="生成报告"
    dialog-width="440px"
    auto-height
    :close-on-click-modal="false"
    :close-on-press-escape="stage !== 'loading'"
    :show-close="stage !== 'loading'"
    align-center
    @closed="handleClosed"
  >
    <div class="p-10">
      <div v-if="stage === 'initial'" class="stage-body">
        <div class="info-row">
          <el-icon class="info-icon" :size="26"><WarningFilled /></el-icon>
          <div>
            <p class="stage-title">确认生成报告</p>
            <p class="stage-desc">
              点击「生成」后将为当前受检主体生成报告文件，请确认操作。
            </p>
          </div>
        </div>
      </div>
      <div v-else-if="stage === 'hainan-select'" class="stage-body">
        <div class="info-row">
          <el-icon class="info-icon" :size="26"><WarningFilled /></el-icon>
          <div>
            <p class="stage-title">请选择验收类型</p>
            <p class="stage-desc">
              当前报告类型为海南模板，生成前需指定验收类型。
            </p>
          </div>
        </div>
        <div class="radio-group">
          <ScRadio
            v-model="acceptanceType"
            :radio-options="acceptanceTypeOptions"
            border
          />
        </div>
      </div>
      <div v-else-if="stage === 'loading'" class="stage-body stage-progress">
        <p class="stage-desc">正在生成报告，请稍候...</p>
        <el-progress
          :percentage="Math.round(progress)"
          :stroke-width="10"
          striped
          striped-flow
          :duration="8"
        />
        <p class="progress-tip">请勿关闭页面</p>
      </div>
      <div v-else-if="stage === 'confirm-msg'" class="stage-body">
        <div class="info-row">
          <el-icon class="info-icon warning" :size="26">
            <WarningFilled />
          </el-icon>
          <div>
            <p class="stage-title">请确认后继续</p>
            <p class="stage-desc">{{ confirmMsg }}</p>
          </div>
        </div>
      </div>
      <div v-else-if="stage === 'done'" class="stage-body stage-done">
        <el-icon class="done-icon" :size="48"><CircleCheckFilled /></el-icon>
        <p class="done-title">报告生成成功</p>
        <p class="stage-desc">报告已生成，请查看列表</p>
      </div>
    </div>
    <template #footer>
      <template v-if="stage === 'initial'">
        <ScButton type="warning" @click="handleClose">取消</ScButton>
        <ScButton type="primary" @click="handleGenerateReport">生成</ScButton>
      </template>
      <template v-else-if="stage === 'hainan-select'">
        <ScButton type="warning" @click="handleClose">取消</ScButton>
        <ScButton
          type="primary"
          :disabled="acceptanceType == null"
          @click="handleHainanConfirm"
        >
          生成
        </ScButton>
      </template>
      <template v-else-if="stage === 'confirm-msg'">
        <ScButton type="warning" @click="handleClose">取消</ScButton>
        <ScButton type="primary" @click="handleMsgConfirm">继续生成</ScButton>
      </template>
      <template v-else-if="stage === 'done'">
        <ScButton type="primary" @click="handleClose">关闭</ScButton>
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
}

.radio-group {
  display: flex;
  gap: 12px;
  margin-top: 20px;
  padding-left: 40px;

  :deep(.el-radio.is-bordered) {
    flex: 1;
    justify-content: center;
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
