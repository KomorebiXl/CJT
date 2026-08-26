import type {
  PenetrationTestAddress,
  PenetrationTestFormData,
  PenetrationTestSearchParams
} from '@/types/projectProcess/penetrationTest'
import { defineFormItems } from '@/utils/form.ts'

export const searchbarItems: SearchbarItems<PenetrationTestSearchParams> = [
  {
    label: '漏洞名称',
    prop: 'loopholeName',
    type: 'input',
    placeholder: '请输入漏洞名称'
  },
  {
    label: '资产名称',
    prop: 'assetName',
    type: 'input',
    placeholder: '请输入资产名称'
  },
  {
    label: '漏洞等级',
    prop: 'level',
    type: 'select',
    dictField: 'background_loophole_level'
  }
]

export const createPenetrationTestTableColumns = (
  step: '1' | '2'
): TableColumns => [
  { label: '资产名称', prop: 'assetName' },
  { label: '漏洞名称', prop: 'loopholeName' },
  { label: '检查项', prop: 'itemLabel' },
  { label: '漏洞等级', prop: 'levelLabel', showOverflowTooltip: true },
  { label: '漏洞描述', prop: 'description', showOverflowTooltip: true },
  { label: '漏洞危害', prop: 'hazard', showOverflowTooltip: true },
  { label: '修复建议', prop: 'suggestion', showOverflowTooltip: true },
  { label: '测试过程', prop: step === '1' ? 'result' : 'regressionResult' },
  { label: '漏洞位置', prop: 'loopholeAddress', slot: 'loopholeAddress' }
]

export const createDefaultAddressFormData = (
  step: '1' | '2'
): Omit<PenetrationTestAddress, 'statusLabel'> => ({
  loopholeAddress: '',
  status: '',
  step
})

const penetrationTestCommonFormData = (
  step: '1' | '2'
): PenetrationTestFormData => ({
  assetId: '',
  loopholeId: '',
  level: '',
  loopholeName: '',
  description: '',
  hazard: '',
  suggestion: '',
  step,
  addresses: [createDefaultAddressFormData(step)]
})

export const createPenetrationTestFormData = (
  step: '1' | '2',
  stateGrid: boolean
): PenetrationTestFormData =>
  step == '1'
    ? {
        ...penetrationTestCommonFormData(step),
        ...(stateGrid ? {} : { item: '', loopholeCategory: '' }),
        result: '',
        result_files: []
      }
    : {
        ...penetrationTestCommonFormData(step),
        ...(stateGrid ? {} : { item: '', loopholeCategory: '' }),
        regressionResult: '',
        regressionResult_files: []
      }

export const createPenetrationTestFormItems = (stateGrid: boolean) =>
  defineFormItems<PenetrationTestFormData>([
    {
      label: '资产',
      prop: 'assetId',
      type: 'select',
      rules: [{ required: true, message: '请选择资产', trigger: 'blur' }],
      componentProps: {
        options: [],
        clearable: stateGrid
      }
    },
    {
      label: stateGrid ? '测试项' : '关联测试项',
      prop: 'loopholeId',
      customSlot: 'loopholeId'
    },
    {
      label: '漏洞等级',
      prop: 'level',
      type: 'select',
      rules: [{ required: true, message: '请选择漏洞等级', trigger: 'blur' }],
      componentProps: {
        dictField: 'background_loophole_level'
      }
    },
    {
      label: '漏洞名称',
      prop: 'loopholeName',
      type: 'input',
      rules: [{ required: true, message: '请输入漏洞名称', trigger: 'blur' }]
    },
    {
      label: '漏洞描述',
      prop: 'description',
      type: 'input',
      componentProps: {
        type: 'textarea',
        rows: 3
      },
      colSpan: 2,
      rules: [{ required: true, message: '请输入漏洞描述', trigger: 'blur' }]
    },
    {
      label: '漏洞危害',
      prop: 'hazard',
      type: 'input',
      componentProps: {
        type: 'textarea',
        rows: 3
      },
      colSpan: 2,
      rules: [{ required: true, message: '请输入漏洞危害', trigger: 'blur' }]
    },
    {
      label: '修复建议',
      prop: 'suggestion',
      type: 'input',
      componentProps: {
        type: 'textarea',
        rows: 3
      },
      colSpan: 2,
      rules: [{ required: true, message: '请输入修复建议', trigger: 'blur' }]
    },
    {
      label: '漏洞地址',
      prop: 'addresses',
      customSlot: 'addresses',
      colSpan: 2,
      rules: [{ required: true, message: '请添加漏洞地址', trigger: 'blur' }]
    }
  ])

/** 常规形态独有展示字段：测试项（关联漏洞回填）、具体漏洞类型（详情带回），均不提交后端 */
export const penetrationTestRegularItem =
  defineFormItems<PenetrationTestFormData>([
    {
      label: '测试项',
      prop: 'item',
      type: 'input',
      componentProps: {
        disabled: true,
        placeholder: '选择漏洞后自动回填'
      }
    },
    {
      label: '具体漏洞类型',
      prop: 'loopholeCategory',
      type: 'input',
      componentProps: {
        disabled: true
      }
    }
  ])

export const penetrationTestFirstItem =
  defineFormItems<PenetrationTestFormData>([
    {
      label: '测试过程',
      prop: 'result',
      customSlot: 'result',
      colSpan: 2,
      rules: [{ required: true, message: '请输入测试过程', trigger: 'blur' }]
    }
  ])

export const penetrationTestRegressionItem =
  defineFormItems<PenetrationTestFormData>([
    {
      label: '测试过程',
      prop: 'regressionResult',
      customSlot: 'regressionResult',
      colSpan: 2,
      rules: [{ required: true, message: '请输入测试过程', trigger: 'blur' }]
    }
  ])
