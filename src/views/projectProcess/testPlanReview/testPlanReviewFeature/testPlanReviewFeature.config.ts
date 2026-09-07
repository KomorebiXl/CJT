import type { ScBaseFormItem } from '@/components/ScBaseForm/types/formItem.ts'
import type { FeatureReviewFormData } from '@/types/projectProcess/testPlanReview'
import { defineFormItems } from '@/utils/form.ts'

/** 特性方案Excel导入地址 */
export const FEATURE_IMPORT_URL = '/asset/plan/importSoftwareInfo'

/** 特性方案页导入模板下载地址 */
export const FEATURE_TEMPLATE_URL = '/asset/plan/template'

/** 特性方案页默认导出地址 */
export const FEATURE_EXPORT_URL = '/asset/plan/resultExportSoftWare'

/** 用户文档集导出地址 */
export const USER_DOC_EXPORT_URL = '/asset/plan/export'

/** 用户文档集导出文件名前缀 */
export const TEST_PLAN_FILE_NAME = '首轮测试结果记录表'

/** 特性方案页默认表格列 */
const FEATURE_COLUMNS: TableColumns = [
  { label: '子特性', prop: 'subFeatureLabel' },
  { label: '序号', prop: 'serialNumber' },
  { label: '测试项', prop: 'item' },
  { label: '测试项说明', prop: 'itemDescription', showOverflowTooltip: true },
  { label: '是否为测试用例', prop: 'hasTestCase', slot: 'hasTestCase' },
  { label: '相关测试项', prop: 'relatedItem' },
  { label: '备注', prop: 'remark' }
]

/** 用户文档集覆盖列 */
const USER_DOC_COLUMNS: TableColumns = [
  { label: '序号', prop: 'serialNumber' },
  { label: '核查项', prop: 'item' },
  { label: '核查内容说明', prop: 'itemDescription' },
  { label: '相关核查项', prop: 'relatedItem' },
  { label: '备注', prop: 'remark' }
]

/** 默认表单项 */
const createDefaultFormItems = () =>
  defineFormItems<FeatureReviewFormData>([
    {
      label: '子特性',
      prop: 'subFeature',
      type: 'select',
      componentProps: { options: [], disabled: false }
    },
    {
      label: '序号',
      prop: 'serialNumber',
      type: 'input',
      componentProps: { disabled: false }
    },
    {
      label: '测试项',
      prop: 'item',
      type: 'input',
      componentProps: { disabled: false }
    },
    { label: '测试项结果', prop: 'itemResult', type: 'input' },
    { label: '相关核查项', prop: 'relatedItem', type: 'input' },
    {
      label: '是否为测试用例',
      prop: 'hasTestCase',
      type: 'switch',
      componentProps: { activeValue: '1', inactiveValue: '0' }
    },
    {
      label: '测试项说明',
      prop: 'itemDescription',
      type: 'input',
      componentProps: { type: 'textarea' },
      colSpan: 2
    },
    {
      label: '备注',
      prop: 'remark',
      type: 'input',
      componentProps: { type: 'textarea', rows: 5 },
      colSpan: 2
    }
  ])

/** 用户文档集覆盖表单项 */
const createUserDocFormItems = () =>
  defineFormItems<FeatureReviewFormData>([
    {
      label: '序号',
      prop: 'serialNumber',
      type: 'input',
      componentProps: { disabled: false }
    },
    {
      label: '核查项',
      prop: 'item',
      type: 'input',
      componentProps: { disabled: false }
    },
    { label: '核查内容说明', prop: 'itemDescription', type: 'input' },
    { label: '相关核查项', prop: 'relatedItem', type: 'input' },
    {
      label: '备注',
      prop: 'remark',
      type: 'input',
      componentProps: { type: 'textarea', rows: 5 },
      colSpan: 2
    }
  ])

export type FeatureKey = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9'

export interface FeaturePageConfig {
  /** 业务名（编辑弹窗标题） */
  name: string
  /** 表格列 */
  columns: TableColumns
  /** 表单项工厂（每次返回全新数组，页面持有后安全做 disabled 副作用） */
  createFormItems: () => Array<ScBaseFormItem>
  /** 导出地址 */
  exportUrl: string
  /** 导出文件名（仅用户文档集，点击导出时计算时间戳） */
  buildExportFileName?: () => string
  /** 导出按钮权限码 */
  exportPermission: string
  /** 方案未启用时隐藏「测试项说明」列 */
  hideDescription: boolean
}

const createDefaultFeatureConfig = (name: string): FeaturePageConfig => ({
  name,
  columns: FEATURE_COLUMNS,
  createFormItems: createDefaultFormItems,
  exportUrl: FEATURE_EXPORT_URL,
  exportPermission: 'asset:plan:softWare:export',
  hideDescription: false
})

export const FEATURE_CONFIG: Record<FeatureKey, FeaturePageConfig> = {
  '2': createDefaultFeatureConfig('信息安全性'),
  '3': { ...createDefaultFeatureConfig('兼容性'), hideDescription: true },
  '4': createDefaultFeatureConfig('可靠性'),
  '5': createDefaultFeatureConfig('易用性'),
  '6': createDefaultFeatureConfig('可移植性'),
  '7': createDefaultFeatureConfig('维护性'),
  '8': {
    name: '用户文档集',
    columns: USER_DOC_COLUMNS,
    createFormItems: createUserDocFormItems,
    exportUrl: USER_DOC_EXPORT_URL,
    buildExportFileName: () =>
      `${TEST_PLAN_FILE_NAME}_用户文档集_${new Date().getTime()}`,
    exportPermission: 'asset:plan:export',
    hideDescription: false
  },
  '9': createDefaultFeatureConfig('性能效率')
}
