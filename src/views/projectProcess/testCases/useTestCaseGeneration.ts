import {
  computed,
  onScopeDispose,
  ref,
  toValue,
  watch,
  type MaybeRefOrGetter
} from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useAiTaskStore, type AiTaskMeta } from '@/store/modules/ai-task-store'
import { usePermission } from '@/components/ScBaseComponents/ScResourcePage/hooks/usePermission'
import { useScConfirm } from '@/hooks/useScConfirmDialog'
import { getProcessProjectDetail } from '@/utils/processProject'
import { sessionStorage } from '@/utils/storage'
import { PROCESS_PROJECT_ID_KEY } from '@/constant/globalVariables'
import type { TestCaseAiGenerateParams } from '@/types/projectProcess/testCases'
import { hasBusinessErrorHandler } from '@/utils/request/handler/errorHandler'

export type CaseType = 'detail' | 'simple'
export type GenerateMode = 'increment' | 'overwrite'
export type StandardFeature = '1' | '2' | '3' | '4' | '5' | '6' | '7'
export interface GenerationScope {
  feature: StandardFeature
  featureName: string
  subFeature?: string
  subsystem?: { id: string; name: string }
}
export interface GenerationContext {
  subjectId: string
  scope: GenerationScope
  caseType: CaseType
  mode: GenerateMode
}
interface GenerationOptions {
  // 共享骨架也承载 8/9；null 明确表示不启用普通生成。
  scope: MaybeRefOrGetter<GenerationScope | null>
  beforeGenerate?: (context: Readonly<GenerationContext>) => Promise<boolean>
}
export type GenerateResult = 'submitted' | 'cancelled' | 'blocked' | 'failed'

export const isStandardFeature = (value: string): value is StandardFeature =>
  /^[1-7]$/.test(value)

export const generationScopeParams = (scope: GenerationScope) => ({
  feature: scope.feature,
  ...(scope.subFeature ? { subFeature: scope.subFeature } : {}),
  ...(scope.subsystem ? { subsystem: scope.subsystem.id } : {})
})

export const generationScopeName = (scope: GenerationScope) =>
  scope.subsystem?.name ??
  (scope.feature === '1' ? '功能性全部子系统' : scope.featureName)

export const createGenerationTaskMeta = (
  project: { id: number | string; code: string; name: string },
  scope: GenerationScope,
  caseType: CaseType
): AiTaskMeta => ({
  subjectId: String(project.id),
  scopeLabel: `${project.name} · ${generationScopeName(scope)} · ${caseType === 'simple' ? '常规版' : '详细版'}`,
  downloadParams: {
    subjectId: String(project.id),
    ...generationScopeParams(scope),
    caseType
  },
  fileName: `测试用例-${caseType === 'simple' ? '常规版-' : ''}${project.code}-${generationScopeName(scope)}.docx`
})

const projectId = () => sessionStorage.get<string>(PROCESS_PROJECT_ID_KEY)

/** 只编排普通特性批量生成；任务轮询、停止、恢复真值仍归 store。 */
export const useTestCaseGeneration = (options: GenerationOptions) => {
  const store = useAiTaskStore()
  const route = useRoute()
  const { hasPermission } = usePermission()
  const { scConfirm } = useScConfirm()
  const pending = ref(false)
  let disposed = false
  let revision = 0
  watch(
    () => [route.fullPath, JSON.stringify(toValue(options.scope))],
    () => {
      revision += 1
    },
    { flush: 'sync' }
  )
  onScopeDispose(() => {
    disposed = true
  })

  const disabled = computed(
    () =>
      pending.value ||
      store.isBusy ||
      !!store.progress?.cleanupPending ||
      !toValue(options.scope) ||
      !hasPermission('acceptance:result:aiTestCase:generate')
  )
  const matchesCurrentScope = computed(() => {
    const scope = toValue(options.scope)
    const p = store.progress
    return (
      !!scope &&
      p?.subjectId === projectId() &&
      p.feature === scope.feature &&
      (p.subFeature || '') === (scope.subFeature || '') &&
      (p.subsystem || '') === (scope.subsystem?.id || '')
    )
  })
  const buttonText = computed(() => {
    if (pending.value) return '准备生成中'
    const p = store.progress
    if (
      store.isRunning &&
      matchesCurrentScope.value &&
      p?.taskType !== 'extract'
    ) {
      return `生成中 ${p?.processed ?? 0}/${p?.total ?? 0}`
    }
    return '生成测试用例'
  })

  const generate = async (request: {
    caseType: CaseType
    mode: GenerateMode
  }): Promise<GenerateResult> => {
    if (disabled.value || disposed) return 'blocked'
    pending.value = true
    const source = toValue(options.scope)!
    const scope = {
      ...source,
      ...(source.subsystem ? { subsystem: { ...source.subsystem } } : {})
    }
    const subjectId = projectId()
    const fullPath = route.fullPath
    const capturedRevision = revision
    const scopeKey = JSON.stringify(scope)
    const current = () =>
      !disposed &&
      revision === capturedRevision &&
      projectId() === subjectId &&
      route.fullPath === fullPath &&
      JSON.stringify(toValue(options.scope)) === scopeKey
    try {
      if (!subjectId) throw new Error('未获取到项目信息，请重新进入项目')
      if (
        !isStandardFeature(scope.feature) ||
        !['detail', 'simple'].includes(request.caseType) ||
        !['increment', 'overwrite'].includes(request.mode)
      ) {
        throw new Error('生成参数无效')
      }
      const context: GenerationContext = { subjectId, scope, ...request }
      const detail = await getProcessProjectDetail()
      if (!current()) return 'blocked'
      if (!detail || String(detail.id) !== subjectId)
        throw new Error('未获取到项目信息')
      if (options.beforeGenerate && !(await options.beforeGenerate(context)))
        return 'blocked'
      if (!current()) return 'blocked'
      const version =
        request.caseType === 'simple'
          ? '常规版（一测试项一用例，含正反用例）'
          : '详细版（按功能点拆分成例）'
      try {
        await scConfirm({
          title:
            request.mode === 'overwrite' ? '重新生成测试用例' : '生成测试用例',
          message:
            request.mode === 'overwrite'
              ? `将重新生成「${generationScopeName(scope)}」的${version}，覆盖该范围内同版本已有结果，另一版本不受影响，确认执行？`
              : `将对「${generationScopeName(scope)}」生成${version}（同版本已有成功结果的项自动跳过，降级/失败项自动重试），确认执行？`,
          confirmText:
            request.mode === 'overwrite' ? '确认重新生成' : '确认生成'
        })
      } catch {
        return 'cancelled'
      }
      if (
        !current() ||
        store.isBusy ||
        store.progress?.cleanupPending ||
        !hasPermission('acceptance:result:aiTestCase:generate')
      )
        return 'blocked'
      // 确认期间仍可能编辑或排队保存，提交前再次检查当前草稿。
      if (options.beforeGenerate && !(await options.beforeGenerate(context)))
        return 'blocked'
      if (!current()) return 'blocked'
      const params: TestCaseAiGenerateParams = {
        subjectId,
        ...generationScopeParams(scope),
        ...request
      }
      await store.start(
        params,
        createGenerationTaskMeta(detail, scope, request.caseType)
      )
      return 'submitted'
    } catch (error) {
      if (current()) {
        const failure = error as {
          code?: number
          msg?: string
          message?: string
        }
        if (
          failure?.code === undefined ||
          !hasBusinessErrorHandler(failure.code)
        ) {
          ElMessage.error(
            failure?.msg || failure?.message || '生成任务提交失败'
          )
        }
      }
      return 'failed'
    } finally {
      pending.value = false
    }
  }

  const resume = async () => {
    const subjectId = projectId()
    if (subjectId) await store.resume(subjectId)
  }

  return {
    pending,
    disabled,
    buttonText,
    matchesCurrentScope,
    generate,
    resume
  }
}
