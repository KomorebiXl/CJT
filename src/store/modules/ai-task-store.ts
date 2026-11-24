import { ElMessage } from 'element-plus'
import {
  downloadAiTestCaseAPI,
  extractFunctionPointsAPI,
  generateAiTestCaseAPI,
  generateDocSetAPI,
  getAiTestCaseProgressAPI,
  stopAiTestCaseAPI
} from '@/api/projectProcess/testCases-api'
import type {
  TestCaseAiDocSetGenerateParams,
  TestCaseAiDownloadParams,
  TestCaseAiGenerateParams,
  TestCaseAiTaskProgress
} from '@/types/projectProcess/testCases'
import { downloadFile } from '@/utils/file'
import { localStorage } from '@/utils/storage'
import { useUserStore } from '@/store/modules/user-store'

/** 轮询间隔（毫秒） */
const POLL_INTERVAL = 2000

/** 进度查询连续失败上限（约 10 秒），超过即停止轮询并提示 */
const MAX_POLL_FAILURES = 5

/** 范围信息不足时的兜底文案（快照不可信且无提交参数） */
const INSUFFICIENT_SCOPE_LABEL = '任务范围信息不足，请回原范围选择版本下载'

/** 任务元信息：刷新页面后据此恢复轮询与「下载用例文档」入口（存 sessionStorage） */
export type AiTaskMeta = {
  subjectId: string
  taskId?: string
  /** 范围说明，如「全部子系统」或子系统名 */
  scopeLabel: string
  /** 完成后下载用例文档所用参数（与本次生成范围一致） */
  downloadParams: TestCaseAiDownloadParams | null
  /** 下载文件名 */
  fileName: string
}

/** 任务卡范围登记：发起/轮询保住真实范围时按 taskId 记一份，恢复兜底避免「项目+长ID」丑标签（2026-11-18 反馈2） */
type TaskLabelEntry = {
  subjectId: string
  scopeLabel: string
  fileName?: string
  at: number
}
const TASK_LABEL_KEY = 'aiTaskLabels'
const TASK_LABEL_LIMIT = 30
const readTaskLabels = (): Record<string, TaskLabelEntry> =>
  localStorage.get<Record<string, TaskLabelEntry>>(TASK_LABEL_KEY) ?? {}
const rememberTaskLabel = (meta: AiTaskMeta) => {
  if (!meta.taskId) return
  const labels = readTaskLabels()
  labels[meta.taskId] = {
    subjectId: meta.subjectId,
    scopeLabel: meta.scopeLabel,
    fileName: meta.fileName,
    at: Date.now()
  }
  const recent = Object.entries(labels)
    .sort((a, b) => b[1].at - a[1].at)
    .slice(0, TASK_LABEL_LIMIT)
  localStorage.set(TASK_LABEL_KEY, Object.fromEntries(recent))
}
const readTaskLabel = (
  taskId: string,
  subjectId: string
): TaskLabelEntry | null => {
  const entry = readTaskLabels()[taskId]
  // 同项目才可信：不能把别的项目的任务标签套到当前快照上
  return entry && entry.subjectId === subjectId ? entry : null
}

/** 终态已知晓登记：同用户+项目+taskId 的完成任务，关闭后切页/刷新不再弹出（2026-11-18 反馈2）；
 *  无 taskId 的旧快照不登记，避免把无 ID 任务永久去重 */
const TASK_ACKED_KEY = 'aiTaskAcked'
const TASK_ACKED_LIMIT = 50
const ackedKeyOf = (subjectId: string, taskId?: string) =>
  taskId ? `${useUserStore().username}::${subjectId}::${taskId}` : ''
const isAckedTask = (subjectId: string, taskId?: string) => {
  const key = ackedKeyOf(subjectId, taskId)
  return (
    !!key && !!localStorage.get<Record<string, number>>(TASK_ACKED_KEY)?.[key]
  )
}
const markTaskAcked = (subjectId: string, taskId?: string) => {
  const key = ackedKeyOf(subjectId, taskId)
  if (!key) return
  const acked = localStorage.get<Record<string, number>>(TASK_ACKED_KEY) ?? {}
  acked[key] = Date.now()
  const recent = Object.entries(acked)
    .sort((a, b) => b[1] - a[1])
    .slice(0, TASK_ACKED_LIMIT)
  localStorage.set(TASK_ACKED_KEY, Object.fromEntries(recent))
}

/** 恢复范围只信服务端任务快照；旧快照可以看进度，但不能猜测下载版本/范围。 */
export const resolveAiTaskMeta = (
  data: TestCaseAiTaskProgress,
  subjectId: string,
  displayMeta?: AiTaskMeta,
  submitted?: TestCaseAiDownloadParams
): AiTaskMeta => {
  // 提取任务无版本语义：不提供下载参数，范围文案也不拼版本（2026-11-18 反馈2）
  const isExtract = data.taskType === 'extract'
  const trusted =
    data.subjectId === subjectId &&
    !!data.taskId &&
    (data.scope === 'allFeatures' || !!data.feature) &&
    (data.caseType === 'detail' || data.caseType === 'simple')
  const downloadParams: TestCaseAiDownloadParams | null = isExtract
    ? null
    : trusted
      ? {
          subjectId,
          ...(data.scope === 'allFeatures'
            ? { scope: data.scope }
            : { feature: data.feature as string }),
          ...(data.subFeature ? { subFeature: data.subFeature } : {}),
          ...(data.subsystem ? { subsystem: data.subsystem } : {}),
          caseType: data.caseType as 'detail' | 'simple'
        }
      : (submitted ?? null)
  const featureNames: Record<string, string> = {
    '1': '功能性',
    '2': '信息安全性',
    '3': '兼容性',
    '4': '可靠性',
    '5': '易用性',
    '6': '可移植性',
    '7': '维护性',
    '8': '用户文档集',
    '9': '性能效率'
  }
  // 范围只取任务自身快照/提交参数，绝不用当前路由改写任务归属；
  // 生成任务快照不可信（缺版本）时不拼版本文案，避免猜测下载范围
  const scopeParams =
    downloadParams ??
    (isExtract && (data.feature || data.scope === 'allFeatures')
      ? {
          subjectId,
          scope: data.scope,
          feature: data.feature,
          ...(data.subFeature ? { subFeature: data.subFeature } : {}),
          ...(data.subsystem ? { subsystem: data.subsystem } : {})
        }
      : null)
  const feature = scopeParams?.feature ?? ''
  const scope =
    scopeParams?.scope === 'allFeatures'
      ? '全部特性'
      : `${featureNames[feature] ?? `特性${feature}`}${scopeParams?.subFeature ? ` · 子特性${scopeParams.subFeature}` : ''}${scopeParams?.subsystem ? ` · 子系统${scopeParams.subsystem}` : ''}`
  const version = downloadParams?.caseType === 'simple' ? '常规版' : '详细版'
  const displayParams = displayMeta?.downloadParams
  const scopeKeyOf = (params?: TestCaseAiDownloadParams | null) =>
    `${params?.scope ?? ''}|${params?.feature ?? ''}|${params?.subFeature ?? ''}|${params?.subsystem ?? ''}`
  const sameScope =
    !!scopeParams &&
    !!displayParams &&
    displayParams.subjectId === subjectId &&
    scopeKeyOf(scopeParams) === scopeKeyOf(displayParams)
  // 只保留本次提交或同一任务的显示信息；恢复时绝不能用当前页面猜下载范围。
  const keepDisplay =
    sameScope &&
    (!!submitted || (!!data.taskId && displayMeta?.taskId === data.taskId))
  // 恢复兜底：按 taskId 找回发起时的真实范围文案，再退快照范围，最后才提示信息不足
  const remembered = data.taskId ? readTaskLabel(data.taskId, subjectId) : null
  const scopeLabel =
    keepDisplay && displayMeta
      ? displayMeta.scopeLabel
      : (remembered?.scopeLabel ??
        (scope
          ? `${scope}${isExtract ? '' : ` · ${version}`}`
          : INSUFFICIENT_SCOPE_LABEL))
  const fileName =
    keepDisplay && displayMeta
      ? displayMeta.fileName
      : (remembered?.fileName ??
        (isExtract
          ? `功能点提取-${scope}.docx`
          : `测试用例-${subjectId}-${scope}-${version}.docx`))
  return {
    subjectId,
    taskId: data.taskId,
    scopeLabel,
    downloadParams,
    fileName
  }
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
    const allFeaturesExtracted = ref<Record<string, boolean>>({})
    const syncExtractionState = (
      subjectId: string,
      data: TestCaseAiTaskProgress
    ) => {
      allFeaturesExtracted.value[subjectId] = data.allFeaturesExtracted === true
    }

    let pollTimer: number | undefined
    let pollFailures = 0
    let lifecycle = 0
    const submitting = ref(false)
    const stopping = ref(false)

    const isRunning = computed(() => progress.value?.status === 'running')
    const isBusy = computed(
      () => submitting.value || stopping.value || isRunning.value
    )

    const percent = computed(() => {
      const total = progress.value?.total ?? 0
      if (!total) return isRunning.value ? 0 : 100
      return Math.min(
        100,
        Math.round(((progress.value?.processed ?? 0) / total) * 100)
      )
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
      const request = lifecycle
      const subjectId = meta.value.subjectId
      try {
        const { data } = await getAiTestCaseProgressAPI(subjectId)
        if (request !== lifecycle || subjectId !== meta.value?.subjectId) return
        syncExtractionState(subjectId, data)
        pollFailures = 0
        lostConnection.value = false
        if (data.status === 'idle') {
          // 后端重启后内存任务丢失：已处理项均已落库，按结束处理
          progress.value = {
            ...(progress.value ?? { status: 'failed' }),
            status: 'failed',
            message:
              '任务记录已丢失（服务可能重启过），已生成的内容不受影响，可重新执行补齐'
          }
          markFinished()
          return
        }
        meta.value = resolveAiTaskMeta(data, subjectId, meta.value)
        rememberTaskLabel(meta.value)
        progress.value = data
        if (data.status === 'running') {
          pollTimer = window.setTimeout(poll, POLL_INTERVAL)
          return
        }
        markFinished()
      } catch {
        if (request !== lifecycle || subjectId !== meta.value?.subjectId) return
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
     * 提交任务（kind：generate 用例生成 / extract 功能点提取 / docset 用户文档集步骤生成）；提交失败抛出，由调用方提示
     */
    const start = async (
      params: TestCaseAiGenerateParams | TestCaseAiDocSetGenerateParams,
      taskMeta: AiTaskMeta,
      kind: 'generate' | 'extract' | 'docset' = 'generate'
    ) => {
      if (submitting.value || stopping.value)
        throw new Error('任务请求处理中，请稍候')
      if (progress.value?.cleanupPending)
        throw new Error('上次停止清理失败，请先重试作废本批内容')
      if (isRunning.value) {
        throw new Error(
          kind === 'extract'
            ? '已有 AI 任务进行中，请等待完成'
            : '已有 AI 生成任务进行中，请等待完成'
        )
      }
      const request = ++lifecycle
      submitting.value = true
      stopPolling()
      try {
        const { data } =
          kind === 'extract'
            ? await extractFunctionPointsAPI(params as TestCaseAiGenerateParams)
            : kind === 'docset'
              ? await generateDocSetAPI(
                  params as TestCaseAiDocSetGenerateParams
                )
              : await generateAiTestCaseAPI(params as TestCaseAiGenerateParams)
        if (request !== lifecycle) return
        syncExtractionState(params.subjectId, data)
        if (data.status === 'failed') {
          throw new Error(data.message || '任务启动失败')
        }
        meta.value = resolveAiTaskMeta(data, params.subjectId, taskMeta, {
          ...params,
          ...('feature' in params || 'scope' in params ? {} : { feature: '8' }),
          caseType: 'caseType' in params ? params.caseType : 'detail'
        })
        rememberTaskLabel(meta.value)
        progress.value = data
        lostConnection.value = false
        cardVisible.value = true
        if (data.status === 'running') {
          startPolling()
        } else {
          markFinished()
        }
      } finally {
        submitting.value = false
      }
    }

    /**
     * 恢复轮询：页面进入或刷新后调用。
     * 传 subjectId 时以后端为准探测该项目是否有进行中的任务（可接上别处发起的任务）。
     * 后端无进行中任务时，清理本会话残留的 running 快照（轮询失联/后端重启遗留），
     * 避免 isRunning 永久卡真导致生成/提取按钮一直禁用。
     */
    const resume = async (subjectId?: string, fallbackMeta?: AiTaskMeta) => {
      if (submitting.value || stopping.value) return
      const targetId = subjectId ?? meta.value?.subjectId
      if (!targetId) return
      if (
        (pollTimer !== undefined || isRunning.value || progress.value?.cleanupPending) &&
        meta.value?.subjectId !== targetId
      ) {
        // 另一个项目仍在轮询时，只读取目标项目的提取资格，不替换活动任务。
        try {
          const { data } = await getAiTestCaseProgressAPI(targetId)
          syncExtractionState(targetId, data)
        } catch {
          /* 状态未确认前保持第三步禁用 */
        }
        return
      }
      if (pollTimer !== undefined) return
      const request = ++lifecycle
      try {
        const { data } = await getAiTestCaseProgressAPI(targetId)
        if (request !== lifecycle) return
        syncExtractionState(targetId, data)
        if (data.status === 'idle') {
          if (progress.value?.status === 'running') {
            stopPolling()
            progress.value = null
            lostConnection.value = false
          }
          return
        }
        // 终态且已知晓（点过「知道了」/关闭）：不再重建任务与弹卡，防止切页/刷新复活（2026-11-18 反馈2）
        if (data.status !== 'running' && isAckedTask(targetId, data.taskId))
          return
        meta.value = resolveAiTaskMeta(
          data,
          targetId,
          meta.value ?? fallbackMeta
        )
        progress.value = data
        lostConnection.value = false
        cardVisible.value = true
        if (data.status === 'running') startPolling()
      } catch {
        // 探测失败不打扰用户
      }
    }

    /** 失联后手动重试 */
    const retry = () => {
      if (submitting.value || stopping.value) return
      lifecycle += 1
      lostConnection.value = false
      startPolling()
    }

    const download = async () => {
      if (!meta.value || downloading.value) return
      if (!meta.value.downloadParams) {
        ElMessage.warning('任务范围信息不足，请回原范围选择版本下载')
        return
      }
      downloading.value = true
      const { downloadParams, fileName } = meta.value
      try {
        const response = await downloadAiTestCaseAPI(downloadParams)
        await downloadFile(response, fileName)
      } catch {
        ElMessage.error('用例文档下载失败，请稍后重试')
      } finally {
        downloading.value = false
      }
    }

    /**
     * 停止进行中的任务（2026-11-13）：剩余项跳过、本批已生成记录作废；
     * 终态由轮询拿到 stopped，页面经 finishSeq 自动恢复按钮
     */
    const stop = async () => {
      if (submitting.value || stopping.value) return
      if ((!isRunning.value && !progress.value?.cleanupPending) || !meta.value)
        return
      const subjectId = meta.value.subjectId
      const request = ++lifecycle
      stopping.value = true
      stopPolling()
      try {
        const { data } = await stopAiTestCaseAPI({ subjectId })
        if (request !== lifecycle || subjectId !== meta.value?.subjectId) return
        progress.value = data
        ElMessage.success(
          data.status === 'stopped'
            ? '本批内容已作废'
            : '停止请求已发出，等待进行中的项结束后生效'
        )
        if (data.status === 'running') startPolling()
        else markFinished()
      } catch (error) {
        ElMessage.error(error instanceof Error ? error.message : '停止请求失败')
        if (request === lifecycle) startPolling()
      } finally {
        stopping.value = false
      }
    }

    /** 关闭卡片：进行中仅收起；已结束则登记已知晓并清理任务（失联收起≠知晓终态，不登记） */
    const closeCard = () => {
      cardVisible.value = false
      if (submitting.value || stopping.value || progress.value?.cleanupPending)
        return
      if (!isRunning.value || lostConnection.value) {
        if (!lostConnection.value && meta.value)
          markTaskAcked(meta.value.subjectId, meta.value.taskId)
        lifecycle += 1
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
      allFeaturesExtracted,
      isRunning,
      isBusy,
      percent,
      start,
      resume,
      retry,
      download,
      stop,
      closeCard
    }
  },
  {
    // 仅持久化元信息：刷新后由卡片据此向后端探测并恢复轮询
    persist: { storage: sessionStorage, pick: ['meta'] }
  }
)
