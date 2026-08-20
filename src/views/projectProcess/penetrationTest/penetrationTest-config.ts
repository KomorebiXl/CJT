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

export const createPenetrationTestTableColumns = (step: '1' | '2'): TableColumns => [
  { label: '资产名称', prop: 'assetName' },
  { label: '漏洞名称', prop: 'loopholeName' },
  { label: '检查项', prop: 'itemLabel' },
  { label: '漏洞等级', prop: 'levelLabel' },
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
  item: '',
  level: '',
  loopholeName: '',
  description: '',
  hazard: '',
  suggestion: '',
  step,
  addresses: [createDefaultAddressFormData(step)]
})

export const createPenetrationTestFormData = (
  step: '1' | '2'
): PenetrationTestFormData =>
  step == '1'
    ? {
        ...penetrationTestCommonFormData(step),
        result: '',
        result_files: []
      }
    : {
        ...penetrationTestCommonFormData(step),
        regressionResult: '',
        regressionResult_files: []
      }

export const createPenetrationTestFormItems = () =>
  defineFormItems<PenetrationTestFormData>([
    {
      label: '资产名称',
      prop: 'assetId',
      type: 'select',
      rules: [{ required: true, message: '请选择资产名称', trigger: 'blur' }],
      componentProps: {
        options: []
      }
    },
    {
      label: '关联测试项',
      prop: 'loopholeId',
      customSlot: 'loopholeId'
    },
    {
      label: '检查项',
      prop: 'item',
      type: 'input',
      componentProps: {
        disabled: true,
        placeholder: '选择漏洞后自动回填'
      }
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
