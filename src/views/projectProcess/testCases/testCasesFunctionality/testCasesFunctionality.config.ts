import type { AiTaskMeta } from '@/store/modules/ai-task-store'

/** 测试用例功能性-固定范围（特性=功能性 / 子特性），外层生成、下载共用；里层范围由 TestCaseSplitView 组装 */
export const TEST_CASE_FN_SCOPE = { feature: '1', subFeature: '1' } as const

/**
 * AI 生成任务元信息（右下角卡片范围说明 + 完成后下载）：
 * 不传 system = 全项目整合文档；传 system = 仅该子系统；
 * caseType = 用例版本（detail 详细-默认 / simple 常规版，2026-11-12 反馈4，两版各自生成互不覆盖）
 */
export const createTestCaseFnTaskMeta = (
  project: { id: number | string; code: string; name: string },
  system?: { id: string; name: string },
  caseType: 'detail' | 'simple' = 'detail'
): AiTaskMeta => ({
  subjectId: String(project.id),
  scopeLabel: `${project.name} · ${system ? system.name : '全部子系统'}${caseType === 'simple' ? ' · 常规版' : ''}`,
  downloadParams: {
    subjectId: String(project.id),
    ...TEST_CASE_FN_SCOPE,
    ...(system ? { subsystem: system.id } : {}),
    caseType
  },
  fileName: system
    ? `测试用例-${caseType === 'simple' ? '常规版-' : ''}${project.code}-${system.name}.docx`
    : `测试用例-${caseType === 'simple' ? '常规版-' : ''}${project.code}.docx`
})
