import { ElMessage } from 'element-plus'
import {
  downloadAiTestCaseAPI,
  extractFunctionPointsAPI,
  generateAiTestCaseAPI,
  getAiTestCaseProgressAPI
} from '@/api/projectProcess/testCases-api'
import type {
  TestCaseAiDownloadParams,
  TestCaseAiGenerateParams,
  TestCaseAiTaskProgress
} from '@/types/projectProcess/testCases'
import { downloadFile } from '@/utils/file'

/** 轮询间隔（毫秒） */
const POLL_INTERVAL = 2000

/** 进度查询连续失败上限（约 10 秒），超过即停止轮询并提示 */
const MAX_POLL_FAILURES = 5

/** 任务元信息：刷新页面后据此恢复轮询与「下载用例文档」入口（存 sessionStorage） */
export type AiTaskMeta = {
  subjectId: string
  /** 范围说明，如「全部子系统」或子系统名 */
  scopeLabel: string
  /** 完成后下载用例文档所用参数（与本次生成范围一致） */
  downloadParams: TestCaseAiDownloadParams
  /** 下载文件名 */
  fileName: string
}

/**
 * AI 测试用例生成任务（全局单任务）：
 * 轮询脱离页面生命周期，切换菜单不中断；进度由右下角 AiTaskFloatCard 展示，不再锁屏。
 */
export const useAiTaskStore = defineStore(
  'aiTask',
  () => {
    const meta = ref<AiTaskMeta | null>(null)
    const progress = ref<TestCaseAiTaskProgress | null>(null)
    /** 进度卡片是否显示（用户可手动收起，不影响后台任务） */
    const cardVisible = ref(false)
    /** 任务结束计数：页面 watch 它刷新列表 */
    const finishSeq = ref(0)
    /** 进度查询连续失败（后端重启/断网），任务可能仍在后台执行 */
    const lostConnection = ref(false)
    const downloading = ref(false)

    let pollTimer: number | undefined
    let pollFailures = 0

    const isRunning = computed(() => progress.value?.status === 'running')

    const percent = computed(() => {
      const total = progress.value?.total ?? 0
      if (!total) return isRunning.value ? 0 : 100
      return Math.min(100, Math.round(((progress.value?.processed ?? 0) / total) * 100))
    })

    const stopPolling = () => {
      if (pollTimer !== undefined) {
        window.clearTimeout(pollTimer)
        pollTimer = undefined
      }
    }

    const markFinished = () => {
      stopPolling()
      cardVisible.value = true
      finishSeq.value += 1
    }

    // setTimeout 链式轮询：上一次请求结束后才排下一次，避免慢请求叠加
    const poll = async () => {
      if (!meta.value) return
      try {
        const { data } = await getAiTestCaseProgressAPI(meta.value.subjectId)
        pollFailures = 0
        lostConnection.value = false
        if (data.status === 'idle') {
          // 后端重启后内存任务丢失：已处理项均已落库，按结束处理
          progress.value = {
            ...(progress.value ?? { status: 'failed' }),
            status: 'failed',
            message: '任务记录已丢失（服务可能重启过），已生成的内容不受影响，可重新执行补齐'
          }
          markFinished()
          return
        }
        progress.value = data
        if (data.status === 'running') {
          pollTimer = window.setTimeout(poll, POLL_INTERVAL)
          return
        }
        markFinished()
      } catch {
        pollFailures += 1
        if (pollFailures >= MAX_POLL_FAILURES) {
          lostConnection.value = true
          stopPolling()
          return
        }
        pollTimer = window.setTimeout(poll, POLL_INTERVAL)
      }
    }

    const startPolling = () => {
      stopPolling()
      pollFailures = 0
      pollTimer = window.setTimeout(poll, POLL_INTERVAL)
    }

    /**
     * 提交任务（kind：generate 用例生成 / extract 功能点提取）；提交失败抛出，由调用方提示
     */
    const start = async (
      params: TestCaseAiGenerateParams,
      taskMeta: AiTaskMeta,
      kind: 'generate' | 'extract' = 'generate'
    ) => {
      if (isRunning.value) {
        throw new Error(
          kind === 'extract' ? '已有 AI 任务进行中，请等待完成' : '已有 AI 生成任务进行中，请等待完成'
        )
      }
      const { data } =
        kind === 'extract'
          ? await extractFunctionPointsAPI(params)
          : await generateAiTestCaseAPI(params)
      if (data.status === 'failed') {
        throw new Error(data.message || '任务启动失败')
      }
      meta.value = taskMeta
      progress.value = data
      lostConnection.value = false
      cardVisible.value = true
      if (data.status === 'running') {
        startPolling()
      } else {
        markFinished()
      }
    }

    /**
     * 恢复轮询：页面进入或刷新后调用。
     * 传 subjectId 时以后端为准探测该项目是否有进行中的任务（可接上别处发起的任务）。
     * 后端无进行中任务时，清理本会话残留的 running 快照（轮询失联/后端重启遗留），
     * 避免 isRunning 永久卡真导致生成/提取按钮一直禁用。
     */
    const resume = async (subjectId?: string, fallbackMeta?: AiTaskMeta) => {
      if (pollTimer !== undefined) return
      const targetId = subjectId ?? meta.value?.subjectId
      if (!targetId) return
      try {
        const { data } = await getAiTestCaseProgressAPI(targetId)
        if (data.status !== 'running') {
          if (progress.value?.status === 'running') {
            stopPolling()
            progress.value = null
            lostConnection.value = false
          }
          return
        }
        if (!meta.value || meta.value.subjectId !== targetId) {
          if (!fallbackMeta) return
          meta.value = fallbackMeta
        }
        progress.value = data
        lostConnection.value = false
        cardVisible.value = true
        startPolling()
      } catch {
        // 探测失败不打扰用户
      }
    }

    /** 失联后手动重试 */
    const retry = () => {
      lostConnection.value = false
      startPolling()
    }

    const download = async () => {
      if (!meta.value || downloading.value) return
      downloading.value = true
      try {
        const response = await downloadAiTestCaseAPI(meta.value.downloadParams)
        await downloadFile(response, meta.value.fileName)
      } catch {
        ElMessage.error('用例文档下载失败，请稍后重试')
      } finally {
        downloading.value = false
      }
    }

    /** 关闭卡片：进行中仅收起；已结束则清理任务 */
    const closeCard = () => {
      cardVisible.value = false
      if (!isRunning.value || lostConnection.value) {
        stopPolling()
        meta.value = null
        progress.value = null
        lostConnection.value = false
      }
    }

    return {
      meta,
      progress,
      cardVisible,
      finishSeq,
      lostConnection,
      downloading,
      isRunning,
      percent,
      start,
      resume,
      retry,
      download,
      closeCard
    }
  },
  {
    // 仅持久化元信息：刷新后由卡片据此向后端探测并恢复轮询
    persist: { storage: sessionStorage, pick: ['meta'] }
  }
)
