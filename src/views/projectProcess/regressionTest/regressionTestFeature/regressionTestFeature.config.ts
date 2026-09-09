import { Refresh } from '@element-plus/icons-vue'
import type { PageButton } from '@/components/ScBaseComponents/ScResourcePage/types/operateConfig.ts'
import type { ScBaseFormItem } from '@/components/ScBaseForm/types/formItem.ts'
import type { RegressionTestFeatureFormData } from '@/types/projectProcess/regressionTest'
import { defineFormItems } from '@/utils/form.ts'
import { USER_DOC_COLUMNS } from '@/views/projectProcess/constants.ts'
import {
  performanceFormItemsFrom,
  reliabilityFormItemsFrom,
  userDocFormItemsFrom
} from '@/views/projectProcess/projectProcessUtils.ts'

/** 回归测试特性页-常规导入地址 */
export const FEATURE_IMPORT_URL = '/asset/acceptance/result/importSoftware'

/** 回归测试特性页-测试截图记录上传地址 */
export const FEATURE_SCREENSHOT_UPLOAD_URL =
  '/asset/acceptance/result/importScreenshot'

/** 回归测试特性页-回归（全部记录）导出地址 */
export const FEATURE_EXPORT_URL =
  '/asset/acceptance/result/resultExportSoftWare'

/** 回归测试特性页-回归（未通过记录）导出地址 */
export const FEATURE_REGRESS_EXPORT_URL =
  '/asset/acceptance/result/resultRegressExportSoftWare'

/** 用户文档集-回归（全部记录）导出地址 */
export const USER_DOC_EXPORT_URL = '/asset/plan/export'

/** 特性页默认表格列 */
const FEATURE_COLUMNS: TableColumns = [
  { label: '序号', prop: 'serialNumber', width: 200, fixed: 'left' },
  { label: '子特性', prop: 'subFeatureLabel', minWidth: 130, fixed: 'left' },
  { label: '测试项', prop: 'item', minWidth: 130 },
  {
    label: '测试项说明',
    prop: 'itemDescription',
    minWidth: 150,
    showOverflowTooltip: true
  },
  { label: '前提条件', prop: 'precondition', minWidth: 200 },
  { label: '测试步骤', prop: 'step', minWidth: 150 },
  { label: '首轮测试结果', prop: 'firstResult', minWidth: 150 },
  { label: '首轮问题描述', prop: 'firstProblem', minWidth: 150 },
  { label: '首次测试人员', prop: 'firstTester', minWidth: 150 },
  { label: '首次测试时间', prop: 'firstTestTime', minWidth: 150 },
  { label: '缺陷严重等级', prop: 'defectLevelLabel', minWidth: 150 },
  { label: '回归验证结果', prop: 'regressionResult', minWidth: 150 },
  { label: '回归验证问题描述', prop: 'regressionProblem', minWidth: 150 },
  { label: '回归测试人员', prop: 'regressionTester', minWidth: 150 },
  { label: '回归测试时间', prop: 'regressionTestTime', minWidth: 150 },
  { label: '测试环境', prop: 'envLabel', minWidth: 150 },
  { label: '备注', prop: 'remark', width: 100 }
]

/** 特性页默认表单项工厂（每次返回全新数组，页面 computed 持有后安全注入选项） */
const createDefaultFormItems = () =>
  defineFormItems<RegressionTestFeatureFormData>([
    {
      label: '子特性',
      prop: 'subFeature',
      type: 'select',
      componentProps: { placeholder: '请选择子特性' }
    },
    {
      label: '序号',
      prop: 'serialNumber',
      type: 'input',
      componentProps: { disabled: true, placeholder: '请输入序号' }
    },
    {
      label: '测试项',
      prop: 'item',
      type: 'input',
      componentProps: { disabled: true, placeholder: '请输入测试项' }
    },
    {
      label: '是否删除测试项',
      prop: 'enable',
      type: 'switch',
      componentProps: {
        activeValue: 0,
        inactiveValue: 1,
        activeText: '已删除',
        inactiveText: '未删除'
      }
    },
    {
      label: '相关测试项',
      prop: 'relatedItem',
      type: 'input',
      componentProps: { placeholder: '请输入相关测试项' }
    },
    {
      label: '首轮测试结果',
      prop: 'firstResult',
      type: 'select',
      componentProps: {
        dictField: 'first_test_result',
        placeholder: '请选择首轮测试结果'
      }
    },
    {
      label: '首次测试人员',
      prop: 'firstTester',
      type: 'input',
      componentProps: { placeholder: '请输入首次测试人员' }
    },
    {
      label: '首次测试时间',
      prop: 'firstTestTime',
      type: 'date',
      componentProps: {
        type: 'date',
        format: 'YYYY-MM-DD',
        valueFormat: 'YYYY-MM-DD',
        placeholder: '请选择首次测试时间'
      }
    },
    {
      label: '缺陷严重等级',
      prop: 'defectLevel',
      type: 'select',
      componentProps: {
        dictField: 'severity_level',
        placeholder: '请选择缺陷严重等级'
      }
    },
    {
      label: '回归验证结果',
      prop: 'regressionResult',
      type: 'select',
      componentProps: {
        dictField: 'first_test_result',
        placeholder: '请选择回归验证结果'
      }
    },
    {
      label: '回归验证问题描述',
      prop: 'regressionProblem',
      type: 'input',
      componentProps: { placeholder: '请输入回归验证问题描述' }
    },
    {
      label: '回归测试人员',
      prop: 'regressionTester',
      type: 'input',
      componentProps: { placeholder: '请输入回归测试人员' }
    },
    {
      label: '回归测试时间',
      prop: 'regressionTestTime',
      type: 'date',
      componentProps: {
        type: 'date',
        format: 'YYYY-MM-DD',
        valueFormat: 'YYYY-MM-DD',
        placeholder: '请选择回归测试时间'
      }
    },
    {
      label: '测试环境',
      prop: 'env',
      type: 'select',
      componentProps: {
        dictField: 'test_environment',
        placeholder: '请选择测试环境'
      }
    },
    {
      label: '前提条件',
      prop: 'precondition',
      type: 'input',
      componentProps: {
        type: 'textarea',
        rows: 5,
        placeholder: '请输入前提条件'
      },
      colSpan: 2
    },
    {
      label: '测试步骤',
      prop: 'step',
      type: 'input',
      componentProps: {
        type: 'textarea',
        rows: 5,
        placeholder: '请输入测试步骤'
      },
      colSpan: 2
    },
    {
      label: '首轮问题描述',
      prop: 'firstProblem',
      type: 'input',
      componentProps: {
        type: 'textarea',
        rows: 5,
        placeholder: '请输入首轮问题描述'
      },
      colSpan: 2
    },
    {
      label: '测试项说明',
      prop: 'itemDescription',
      type: 'input',
      componentProps: {
        type: 'textarea',
        rows: 5,
        placeholder: '请输入测试项说明'
      },
      colSpan: 2
    },
    {
      label: '备注',
      prop: 'remark',
      type: 'input',
      componentProps: { type: 'textarea', rows: 5, placeholder: '请输入备注' },
      colSpan: 2
    },
    {
      label: '测试用例',
      prop: 'testCase',
      type: 'input',
      componentProps: { placeholder: '请输入测试用例' }
    },
    {
      label: '测试准备',
      prop: 'preparation',
      type: 'input',
      componentProps: {
        type: 'textarea',
        rows: 5,
        placeholder: '请输入测试准备'
      },
      colSpan: 2
    },
    {
      label: '测试策略',
      prop: 'strategy',
      type: 'input',
      componentProps: {
        type: 'textarea',
        rows: 5,
        placeholder: '请输入测试策略'
      },
      colSpan: 2
    },
    {
      label: '事务说明',
      prop: 'transactionDescription',
      type: 'input',
      componentProps: {
        type: 'textarea',
        rows: 5,
        placeholder: '请输入事务说明'
      },
      colSpan: 2
    },
    {
      label: '详细结果',
      prop: 'resultDetail',
      type: 'input',
      componentProps: {
        type: 'textarea',
        rows: 5,
        placeholder: '请输入详细结果'
      },
      colSpan: 2
    },
    {
      label: '首轮测试截图',
      prop: 'firstScreenshot',
      customSlot: 'firstScreenshot',
      colSpan: 2
    },
    {
      label: '回归测试截图',
      prop: 'regressionScreenshot',
      customSlot: 'regressionScreenshot',
      colSpan: 2
    }
  ])

export type FeatureKey = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9'

export interface FeatureImportConfig {
  /** 可选文件扩展名 */
  accept: string[]
  /** 是否允许多文件 */
  multiple: boolean
  /** 至多文件数（超出时上传前拦截提示） */
  maxFiles?: number
  /** 文件 → FormData 字段名映射；缺省走公共默认上传（单文件固定 file 字段） */
  fileField?: (file: File) => string
}

export interface FeaturePageConfig {
  /** 业务名（编辑弹窗标题） */
  name: string
  /** 表格列 */
  columns: TableColumns
  /** 表单项工厂 */
  createFormItems: () => Array<ScBaseFormItem>
  /** FormData 文件字段 */
  fileProps: string[]
  /** 回归（全部记录）导出地址 */
  exportUrl: string
  /** 导出按钮权限码 */
  exportPermission: string
  /** 回归（未通过记录）导出地址 */
  regressExportUrl: string
  /** 未通过记录导出权限码 */
  regressExportPermission: string
  /** 导出文件名工厂（仅用户文档集） */
  buildExportFileName?: (projectCode: string) => string
  /** 是否展示「导入回归测试截图记录」入口 */
  showScreenshotImport: boolean
  /** 常规导入变体配置 */
  importConfig: FeatureImportConfig
  /** 强制隐藏「测试项说明」列 */
  hideDescription: boolean
}

/** 特性页平铺操作按钮 */
export const REGRESSION_TEST_FEATURE_FLAT_BUTTONS: Array<
  PageButton & { id: string }
> = [
  {
    id: 'refreshNum',
    name: '重构序号',
    type: 'primary',
    icon: Refresh,
    permission: 'acceptance:result:rebuildSerial'
  }
]

/** 特性页表单初始值 */
export const createRegressionTestFeatureFormData =
  (): RegressionTestFeatureFormData => ({
    subFeature: '',
    serialNumber: '',
    item: '',
    subsystem: '',
    feature: '',
    enable: '0',
    relatedItem: '',
    firstResult: '',
    firstTester: '',
    firstTestTime: '',
    defectLevel: '',
    regressionResult: '',
    regressionProblem: '',
    regressionTester: '',
    regressionTestTime: '',
    env: '',
    itemDescription: '',
    precondition: '',
    step: '',
    firstProblem: '',
    remark: '',
    testCase: '',
    preparation: '',
    strategy: '',
    transactionDescription: '',
    resultDetail: '',
    firstScreenshot: '',
    firstScreenshotFiles: [],
    regressionScreenshot: '',
    regressionScreenshotFiles: [],
    processScreenshot: '',
    files: [],
    caseTableType: '',
    assetAcceptanceTimeAnalysisList: []
  })

const createDefaultFeatureConfig = (name: string): FeaturePageConfig => ({
  name,
  columns: FEATURE_COLUMNS,
  createFormItems: createDefaultFormItems,
  fileProps: ['firstScreenshotFiles', 'regressionScreenshotFiles'],
  exportUrl: FEATURE_EXPORT_URL,
  exportPermission: 'acceptance:result:softWare:all:export',
  regressExportUrl: FEATURE_REGRESS_EXPORT_URL,
  regressExportPermission: 'acceptance:result:softWare:regress:export',
  showScreenshotImport: true,
  importConfig: { accept: ['.xls', '.xlsx'], multiple: false },
  hideDescription: false
})

export const FEATURE_CONFIG: Record<FeatureKey, FeaturePageConfig> = {
  '2': createDefaultFeatureConfig('信息安全性'),
  '3': { ...createDefaultFeatureConfig('兼容性'), hideDescription: true },
  '4': {
    ...createDefaultFeatureConfig('可靠性'),
    createFormItems: reliabilityFormItemsFrom(createDefaultFormItems),
    fileProps: ['firstScreenshotFiles', 'regressionScreenshotFiles', 'files'],
    importConfig: {
      accept: ['.xls', '.xlsx', '.docx'],
      multiple: true,
      maxFiles: 2,
      // Excel 走 file 字段、Word 走 80 字段
      fileField: file => {
        const name = file.name.toLowerCase()
        return name.endsWith('.xls') || name.endsWith('.xlsx') ? 'file' : '80'
      }
    }
  },
  '5': createDefaultFeatureConfig('易用性'),
  '6': createDefaultFeatureConfig('可移植性'),
  '7': createDefaultFeatureConfig('维护性'),
  '8': {
    name: '用户文档集',
    columns: USER_DOC_COLUMNS,
    createFormItems: userDocFormItemsFrom(createDefaultFormItems),
    fileProps: ['regressionScreenshotFiles'],
    exportUrl: USER_DOC_EXPORT_URL,
    // 源仅覆盖全部导出地址与文件名，导出权限与未通过导出仍走默认（区别于首轮用户文档集双覆盖）
    exportPermission: 'acceptance:result:softWare:all:export',
    regressExportUrl: FEATURE_REGRESS_EXPORT_URL,
    regressExportPermission: 'acceptance:result:softWare:regress:export',
    buildExportFileName: projectCode => `用户文档集-${projectCode}-回归`,
    showScreenshotImport: false,
    importConfig: { accept: ['.xls', '.xlsx'], multiple: false },
    hideDescription: false
  },
  '9': {
    ...createDefaultFeatureConfig('性能效率'),
    createFormItems: performanceFormItemsFrom(createDefaultFormItems),
    fileProps: [
      'regressionScreenshotFiles',
      'files',
      'assetAcceptanceTimeAnalysisList'
    ],
    showScreenshotImport: false,
    importConfig: {
      accept: ['.doc', '.docx'],
      multiple: false,
      // 性能效率导入以 250 为文件字段名
      fileField: () => '250'
    }
  }
}
