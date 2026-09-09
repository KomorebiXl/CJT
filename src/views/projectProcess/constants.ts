import type { ScBaseFormItem } from '@/components/ScBaseForm/types/formItem.ts'

/**
 * projectProcess 跨模块共享常量
 */

/**
 * sub_property 字典按 feature 过滤白名单（照源 acceptanceTest/constant/index.ts DICT_FILTER_MAP）。
 * 特性编码 2-9：信息安全性/兼容性/可靠性/易用性/可移植性/维护性/用户文档集/性能效率；
 * testPlanReview、initialTest 的特性页共用，回归测试模块落地后同样由此取用。
 */
export const DICT_FILTER_MAP: Record<string, string[]> = {
  '2': ['10', '20', '30', '40'],
  '3': ['50', '60', '70'],
  '4': ['80', '90', '100', '110'],
  '5': ['120', '130', '140', '150', '160', '170'],
  '6': ['180', '190', '200'],
  '7': ['210', '220', '230', '240'],
  '8': ['245'],
  '9': ['250']
}

/**
 * 用户文档集特性页覆盖列（照源 userDoc 入口 customTableColumn，首轮/回归特性页共用；
 * enable 列按原值 0/1 展示——源声明 slot:'enable' 但基础页无插槽实现，属源原样行为）。
 */
export const USER_DOC_COLUMNS: TableColumns = [
  { label: '序号', prop: 'serialNumber' },
  { label: '子特性', prop: 'subFeatureLabel', minWidth: 150 },
  { label: '核查项', prop: 'item' },
  { label: '是否删除测试项', prop: 'enable', width: 150 },
  { label: '核查内容说明', prop: 'itemDescription' },
  { label: '首轮测试结果', prop: 'firstResult' },
  { label: '首轮问题描述', prop: 'firstProblem' },
  { label: '缺陷严重等级', prop: 'defectLevelLabel' },
  { label: '首次测试人员', prop: 'firstTester', width: 110 },
  { label: '首次测试时间', prop: 'firstTestTime', width: 110 },
  { label: '备注', prop: 'remark' }
]

/**
 * 特性页-过程截图表单项（可靠性在默认表单后追加；性能效率同时替代首轮测试截图）。
 */
export const PROCESS_SCREENSHOT_ITEM: ScBaseFormItem = {
  label: '过程截图',
  prop: 'processScreenshot',
  customSlot: 'processScreenshot',
  colSpan: 2
}

/**
 * 特性页-时间特性分析表单项（性能效率专用）。
 */
export const TIME_ANALYSIS_ITEM: ScBaseFormItem = {
  label: '时间特性分析',
  prop: 'caseTableType',
  customSlot: 'caseTableType',
  colSpan: 2
}
