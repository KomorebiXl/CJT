import { computed, onMounted, onScopeDispose, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useAiTaskStore } from '@/store/modules/ai-task-store'
import { usePermission } from '@/components/ScBaseComponents/ScResourcePage/hooks/usePermission'
import { useScConfirm } from '@/hooks/useScConfirmDialog'
import { getProcessProjectDetail } from '@/utils/processProject'
import { sessionStorage } from '@/utils/storage'
import { PROCESS_PROJECT_ID_KEY } from '@/constant/globalVariables'
import { hasBusinessErrorHandler } from '@/utils/request/handler/errorHandler'
import type { CaseType } from './useTestCaseGeneration'

/** 项目级任务由后端统一执行，沿用全局轮询、停止与刷新恢复。 */
export const useAllTestCasesWorkflow = () => {
  const store = useAiTaskStore()
  const route = useRoute()
  const { hasPermission } = usePermission()
  const { scConfirm } = useScConfirm()
  const pending = ref<'extract' | 'generate' | null>(null)
  const restoring = ref(true)
  const currentProjectId = () =>
    sessionStorage.get<string>(PROCESS_PROJECT_ID_KEY)
  const subjectId = computed(() => {
    // 项目流程在路由切换前更新 sessionStorage。
    void route.fullPath
    return currentProjectId()
  })
  let revision = 0
  let disposed = false
  watch(
    () => route.fullPath,
    () => {
      revision += 1
    },
    { flush: 'sync' }
  )
  onScopeDispose(() => {
    disposed = true
  })

  const extractionComplete = computed(
    () =>
      !!subjectId.value && store.allFeaturesExtracted[subjectId.value] === true
  )
  const disabled = computed(
    () =>
      restoring.value ||
      !!pending.value ||
      store.isBusy ||
      !!store.progress?.cleanupPending ||
      !subjectId.value ||
      !hasPermission('acceptance:result:aiTestCase:generate')
  )
  const generationDisabled = computed(
    () => disabled.value || !extractionComplete.value
  )
  const buttonText = (kind: 'extract' | 'generate') =>
    computed(() => {
      const noun = kind === 'extract' ? '提取功能点' : '生成测试用例'
      if (pending.value === kind) return '准备' + noun + '中…'
      const progress = store.progress
      if (
        store.isRunning &&
        progress?.subjectId === subjectId.value &&
        progress.scope === 'allFeatures' &&
        progress.taskType === kind
      ) {
        return `${kind === 'extract' ? '提取' : '生成'}中 ${progress.processed ?? 0}/${progress.total ?? 0}`
      }
      return noun
    })

  const submit = async (kind: 'extract' | 'generate', caseType?: CaseType) => {
    if (
      disposed ||
      disabled.value ||
      (kind === 'generate' && generationDisabled.value)
    )
      return
    if (kind === 'generate' && caseType !== 'detail' && caseType !== 'simple')
      return
    pending.value = kind
    const projectId = subjectId.value!
    const capturedRevision = revision
    const current = () =>
      !disposed &&
      revision === capturedRevision &&
      currentProjectId() === projectId
    try {
      const project = await getProcessProjectDetail()
      if (!current()) return
      if (!project || String(project.id) !== projectId)
        throw new Error('未获取到项目信息，请重新进入项目')
      const version = caseType === 'simple' ? '常规版' : '详细版'
      try {
        await scConfirm({
          title:
            kind === 'extract' ? '提取全部特性功能点' : '生成全部特性测试用例',
          message:
            kind === 'extract'
              ? '将对当前项目全部普通特性（功能性至维护性）、全部子系统提取功能点，跳过素材未变更项。说明已变更项的人工编辑将被覆盖，已有 AI 用例将失效。用户文档集、性能效率沿用专用处理规则。确认执行？'
              : `将为当前项目全部普通特性生成${version}测试用例，同版本已有成功结果将跳过；用户文档集按需生成核查步骤，性能效率沿用原数据。确认执行？`,
          confirmText: kind === 'extract' ? '确认提取' : '确认生成'
        })
      } catch {
        return
      }
      if (
        !current() ||
        store.isBusy ||
        store.progress?.cleanupPending ||
        !hasPermission('acceptance:result:aiTestCase:generate') ||
        (kind === 'generate' && !extractionComplete.value)
      )
        return
      await store.start(
        {
          subjectId: projectId,
          scope: 'allFeatures',
          mode: 'increment',
          ...(caseType ? { caseType } : {})
        },
        {
          subjectId: projectId,
          scopeLabel: `${project.name} · 全部特性${kind === 'generate' ? ` · ${version}` : ''}`,
          downloadParams:
            kind === 'generate'
              ? { subjectId: projectId, scope: 'allFeatures', caseType }
              : null,
          fileName: `测试用例-九特性-${version}-${project.code}.docx`
        },
        kind
      )
    } catch (error) {
      if (current()) {
        const failure = error as {
          code?: number
          msg?: string
          message?: string
        }
        if (
          failure.code === undefined ||
          !hasBusinessErrorHandler(failure.code)
        ) {
          ElMessage.error(
            failure.msg || failure.message || '任务提交失败，请稍后重试'
          )
        }
      }
    } finally {
      pending.value = null
    }
  }

  const restore = async () => {
    restoring.value = true
    const id = currentProjectId()
    try {
      if (id) await store.resume(id)
    } finally {
      restoring.value = false
    }
  }
  onMounted(restore)
  watch(() => route.query.projectId, restore)

  return {
    extractionComplete,
    extractionDisabled: disabled,
    generationDisabled,
    extractionText: buttonText('extract'),
    generationText: buttonText('generate'),
    extract: () => submit('extract'),
    generate: (caseType: CaseType) => submit('generate', caseType)
  }
}
