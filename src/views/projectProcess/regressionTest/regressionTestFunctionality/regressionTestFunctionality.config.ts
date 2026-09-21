import type { Component } from 'vue'
import { Back, Download, Refresh, UploadFilled } from '@element-plus/icons-vue'
import type { PageButton } from '@/components/ScBaseComponents/ScResourcePage/types/operateConfig.ts'
import { defineFormItems } from '@/utils/form.ts'
import type {
  RegressionTestFnSubsystemFormData,
  RegressionTestFnSubsystemSearchParams
} from '@/types/projectProcess/regressionTest'

/** 回归测试功能性-Excel 导入地址 */
export const REGRESSION_TEST_FN_IMPORT_URL = '/asset/acceptance/result/import'

/** 回归测试功能性-导入模板下载地址 */
export const REGRESSION_TEST_FN_TEMPLATE_URL =
  '/asset/acceptance/result/template'

/** 回归测试功能性-测试截图记录（.docx）上传地址 */
export const REGRESSION_TEST_FN_SCREENSHOT_UPLOAD_URL =
  '/asset/acceptance/result/importScreenshot'

/**
 * 回归测试功能性-列表/导入/导出固定参数（subsystem 由页面按当前系统传入）；
 * rebuildSerial 源契约不带 dataType，页面单独传参勿用本函数
 */
export const createRegressionTestFnExtraParams = (subsystem: string) => ({
  feature: '1',
  subFeature: '1',
  dataType: '2',
  subsystem
})

/** 回归测试功能性-树页导出固定参数（全项目维度，不带 subsystem） */
export const REGRESSION_TEST_FN_TREE_EXPORT_PARAMS = {
  feature: '1',
  subFeature: '1',
  dataType: '2'
}

/**
 * 回归测试功能性-树页操作栏导出按钮（源 2026-09-11 新增）；
 * 权限码照源外层 softWare 系（与内层下拉 function 系及后端接口注解不同，照抄勿改）
 */
export const REGRESSION_TEST_FN_TREE_EXPORT_BUTTONS: Array<
  PageButton & { id: string }
> = [
  {
    id: 'failedExport',
    name: '回归（未通过记录）导出',
    type: 'danger',
    icon: Download,
    permission: 'acceptance:result:softWare:regress:export'
  },
  {
    id: 'allExport',
    name: '回归（全部记录）导出',
    type: 'danger',
    icon: Download,
    permission: 'acceptance:result:softWare:all:export'
  }
]

/** 回归测试功能性-子系统搜索项 */
export const REGRESSION_TEST_FN_SEARCHBAR_ITEMS: SearchbarItems<RegressionTestFnSubsystemSearchParams> =
  [
    { prop: 'serialNumber', type: 'input', placeholder: '请输入序号' },
    { prop: 'item', type: 'input', placeholder: '请输入测试项' }
  ]

/** 回归测试功能性-子系统静态列 */
export const REGRESSION_TEST_FN_TABLE_COLUMNS: TableColumns = [
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
  { label: '首轮测试结果', prop: 'firstResult', width: 110 },
  { label: '首轮问题描述', prop: 'firstProblem', width: 110 },
  { label: '首次测试人员', prop: 'firstTester', width: 110 },
  { label: '首次测试时间', prop: 'firstTestTime', width: 110 },
  { label: '缺陷严重等级', prop: 'defectLevelLabel', width: 110 },
  { label: '回归验证结果', prop: 'regressionResult', width: 110 },
  { label: '回归验证问题描述', prop: 'regressionProblem', width: 110 },
  { label: '回归测试人员', prop: 'regressionTester', width: 110 },
  { label: '回归测试时间', prop: 'regressionTestTime', width: 110 },
  { label: '备注', prop: 'remark', width: 110 }
]

/**
 * 回归测试功能性-「数据导入导出操作」下拉菜单项
 */
export const REGRESSION_TEST_FN_DROPDOWN_ITEMS: Array<{
  id: string
  name: string
  icon: Component
  permission?: string
}> = [
  {
    id: 'import',
    name: '回归（测试完成记录）导入',
    icon: UploadFilled,
    permission: 'acceptance:result:function:import'
  },
  {
    id: 'importScreenshot',
    name: '导入测试截图记录',
    icon: UploadFilled,
    permission: 'acceptance:result:import:screenshot'
  },
  {
    id: 'exportFailed',
    name: '回归（未通过记录）导出',
    icon: Download,
    permission: 'acceptance:result:function:regress:export'
  },
  {
    id: 'exportAll',
    name: '回归（全部记录）导出',
    icon: Download,
    permission: 'acceptance:result:function:all:export'
  }
]

/** 回归测试功能性-平铺操作按钮（渲染于下拉之后，页面侧直接分发点击；id 必填供分发） */
export const REGRESSION_TEST_FN_FLAT_BUTTONS: Array<
  PageButton & { id: string }
> = [
  {
    id: 'refreshNum',
    name: '重构序号',
    type: 'primary',
    icon: Refresh,
    permission: 'acceptance:result:rebuildSerial'
  },
  { id: 'back', name: '返回', type: 'info', icon: Back }
]

/** 回归测试功能性-子系统表单初始值 */
export const createRegressionTestFnSubsystemFormData =
  (): RegressionTestFnSubsystemFormData => ({
    serialNumber: '',
    item: '',
    itemDescription: '',
    enable: '0',
    remark: '',
    subsystem: '',
    feature: '1',
    subFeature: '1',
    dataType: '2',
    relatedItem: '',
    precondition: '',
    step: '',
    firstResult: '',
    firstProblem: '',
    firstTester: '',
    firstTestTime: '',
    defectLevel: '',
    regressionResult: '',
    regressionProblem: '',
    regressionTester: '',
    regressionTestTime: '',
    env: '',
    firstScreenshot: '',
    firstScreenshotFiles: [],
    regressionScreenshot: '',
    regressionScreenshotFiles: []
  })

/**
 * 回归测试功能性-子系统静态表单项（动态文件字段运行时插入）；
 * 序号/测试项照源可编辑（区别于首轮功能性恒禁用）
 */
export const REGRESSION_TEST_FN_FORM_ITEMS =
  defineFormItems<RegressionTestFnSubsystemFormData>([
    {
      label: '序号',
      prop: 'serialNumber',
      type: 'input',
      componentProps: { placeholder: '请输入序号' },
      rules: [{ required: true, message: '未填写序号', trigger: 'blur' }]
    },
    {
      label: '测试项',
      prop: 'item',
      type: 'input',
      componentProps: { placeholder: '请输入测试项' },
      rules: [{ required: true, message: '未填写测试项', trigger: 'blur' }]
    },
    {
      label: '是否删除测试项',
      prop: 'enable',
      type: 'switch',
      componentProps: { activeValue: 0, inactiveValue: 1 }
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
      type: 'input',
      componentProps: { placeholder: '请输入回归验证结果' }
    },
    {
      label: '回归测试人员',
      prop: 'regressionTester',
      type: 'input',
      componentProps: { placeholder: '请输入回归测试人员' }
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
      label: '回归验证问题描述',
      prop: 'regressionProblem',
      type: 'input',
      componentProps: {
        type: 'textarea',
        rows: 5,
        placeholder: '请输入回归验证问题描述'
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
      componentProps: {
        type: 'textarea',
        rows: 5,
        placeholder: '请输入备注'
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
