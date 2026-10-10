import { Back } from '@element-plus/icons-vue'
import type { PageButton } from '@/components/ScBaseComponents/ScResourcePage/types/operateConfig.ts'
import type { TestCaseFnItemSearchParams } from '@/types/projectProcess/testCases'
import type { AiTaskMeta } from '@/store/modules/ai-task-store'

/** 测试用例功能性-固定范围（特性=功能性 / 子特性），生成、下载、列表共用 */
export const TEST_CASE_FN_SCOPE = { feature: '1', subFeature: '1' } as const

/**
 * AI 生成任务元信息（右下角卡片范围说明 + 完成后下载）：
 * 不传 system = 全项目整合文档；传 system = 仅该子系统
 */
export const createTestCaseFnTaskMeta = (
  project: { id: number | string; code: string; name: string },
  system?: { id: string; name: string }
): AiTaskMeta => ({
  subjectId: String(project.id),
  scopeLabel: `${project.name} · ${system ? system.name : '全部子系统'}`,
  downloadParams: {
    subjectId: String(project.id),
    ...TEST_CASE_FN_SCOPE,
    ...(system ? { subsystem: system.id } : {})
  },
  fileName: system
    ? `测试用例-${project.code}-${system.name}.docx`
    : `测试用例-${project.code}.docx`
})

/** 测试用例功能性-列表固定参数（subsystem 由页面按当前系统传入） */
export const createTestCaseFnExtraParams = (subsystem: string) => ({
  ...TEST_CASE_FN_SCOPE,
  dataType: '2',
  subsystem
})

/** 测试用例功能性-测试项搜索项 */
export const TEST_CASE_FN_SEARCHBAR_ITEMS: SearchbarItems<TestCaseFnItemSearchParams> =
  [
    { prop: 'serialNumber', type: 'input', placeholder: '请输入序号' },
    { prop: 'item', type: 'input', placeholder: '请输入测试项' }
  ]

/** 测试用例功能性-测试项静态列（AI 扩写改弹窗展示：行展开列与 EP 树形展开语义冲突，破坏树形渲染） */
export const TEST_CASE_FN_TABLE_COLUMNS: TableColumns = [
  { label: '序号', prop: 'serialNumber', minWidth: 200, fixed: 'left' },
  { label: '测试项', prop: 'item', width: 250, fixed: 'left' },
  {
    label: '测试项说明',
    prop: 'itemDescription',
    width: 180,
    showOverflowTooltip: true
  },
  { label: '前提条件', prop: 'precondition', width: 110 },
  { label: '测试步骤', prop: 'step', width: 110 },
  { label: '优先级', prop: 'aiExpansion.priority', width: 80 },
  // { label: '首轮测试结果', prop: 'firstResult', width: 110 },
  // { label: '首轮问题描述', prop: 'firstProblem', width: 110 },
  { label: '首次测试人员', prop: 'firstTester', width: 110 },
  { label: '首次测试时间', prop: 'firstTestTime', width: 110 },
  // { label: '缺陷严重等级', prop: 'defectLevelLabel', width: 110 },
  // { label: '回归测试结果', prop: 'regressionResult', width: 110 },
  // { label: '回归验证问题描述', prop: 'regressionProblem', width: 110 },
  { label: '回归测试人员', prop: 'regressionTester', width: 110 },
  { label: '回归测试时间', prop: 'regressionTestTime', width: 110 },
  { label: '备注', prop: 'remark', width: 110 }
]

/** 测试用例功能性-平铺操作按钮（页面侧直接分发点击；id 必填供分发） */
export const TEST_CASE_FN_FLAT_BUTTONS: Array<PageButton & { id: string }> = [
  { id: 'back', name: '返回', type: 'info', icon: Back },
  {
    id: 'regenerateAll',
    name: '重新生成',
    type: 'warning',
    permission: 'acceptance:result:aiTestCase:generate'
  },
  {
    id: 'downloadWord',
    name: '下载用例文档',
    type: 'success',
    permission: 'acceptance:result:aiTestCase:download'
  }
]
