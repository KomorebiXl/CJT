import { Back } from '@element-plus/icons-vue'
import type { PageButton } from '@/components/ScBaseComponents/ScResourcePage/types/operateConfig.ts'
import type { TestCaseFnItemSearchParams } from '@/types/projectProcess/testCases'

/** 测试用例功能性-列表固定参数（subsystem 由页面按当前系统传入） */
export const createTestCaseFnExtraParams = (subsystem: string) => ({
  feature: '1',
  subFeature: '1',
  dataType: '2',
  subsystem
})

/** 测试用例功能性-测试项搜索项 */
export const TEST_CASE_FN_SEARCHBAR_ITEMS: SearchbarItems<TestCaseFnItemSearchParams> =
  [
    { prop: 'serialNumber', type: 'input', placeholder: '请输入序号' },
    { prop: 'item', type: 'input', placeholder: '请输入测试项' }
  ]

/** 测试用例功能性-测试项静态列（首列为 AI 扩写行展开列） */
export const TEST_CASE_FN_TABLE_COLUMNS: TableColumns = [
  {
    label: '',
    prop: 'aiExpand',
    type: 'expand',
    slot: 'aiExpand',
    width: 50
  },
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
  { label: '优先级', prop: 'step', width: 110 },
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
  { id: 'regenerateAll', name: '重新生成', type: 'warning' },
  { id: 'downloadWord', name: '下载用例文档', type: 'success' }
]
