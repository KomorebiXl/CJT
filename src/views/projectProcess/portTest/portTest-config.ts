import type {
  PortTestFormData,
  PortTestSearchParams
} from '@/types/projectProcess/portTest'
import { defineFormItems } from '@/utils/form.ts'

export type PortTestStep = '1' | '2'

export const searchbarItems: SearchbarItems<PortTestSearchParams> = [
  {
    label: '资产名称',
    prop: 'assetName',
    type: 'input',
    placeholder: '请输入资产名称'
  },
  {
    label: '测评指标',
    prop: 'point',
    type: 'input',
    placeholder: '请输入测评指标'
  },
  {
    label: '测评项',
    prop: 'item',
    type: 'input',
    placeholder: '请输入测评项'
  }
]

/** step：'1' 首次测试，'2' 回归测试（源 stateGrid/port/first 与 regression 双页收敛） */
export const createPortTestTableColumns = (
  step: PortTestStep
): TableColumns => [
  { label: '资产名称', prop: 'assetName', slot: 'assetName' },
  { label: '类别', prop: 'point', slot: 'point' },
  { label: '技术要求', prop: 'item', showOverflowTooltip: true },
  { label: '风险级别', prop: 'levelLabel', showOverflowTooltip: true },
  {
    label: '测试结果内容',
    prop: step === '1' ? 'resultDescription' : 'regressionDescription',
    showOverflowTooltip: true
  },
  {
    label: '单项结论',
    prop: step === '1' ? 'checkResultLabel' : 'regressionCheckResultLabel',
    showOverflowTooltip: true
  },
  {
    label: '结论',
    prop: step === '1' ? 'resultLabel' : 'regressionResultLabel',
    showOverflowTooltip: true
  }
]

const portTestCommonFormData = {
  assetId: '',
  level: '',
  point: '',
  item: ''
}

export const createPortTestFormData = (step: PortTestStep): PortTestFormData =>
  step === '1'
    ? {
        ...portTestCommonFormData,
        step,
        resultDescription: '',
        resultDescription_files: [],
        checkResult: '',
        result: ''
      }
    : {
        ...portTestCommonFormData,
        step,
        regressionDescription: '',
        regressionDescription_files: [],
        regressionCheckResult: '',
        regressionResult: ''
      }

const createPortTestCommonFormItems = () =>
  defineFormItems<PortTestFormData>([
    {
      label: '资产',
      prop: 'assetId',
      type: 'select',
      rules: [{ required: true, message: '请选择资产', trigger: 'blur' }],
      componentProps: { options: [] }
    },
    {
      label: '级别',
      prop: 'level',
      type: 'select',
      componentProps: { dictField: 'background_point_grade' }
    },
    {
      label: '类别',
      prop: 'point',
      type: 'input',
      rules: [{ required: true, message: '请输入类别', trigger: 'blur' }]
    },
    {
      label: '技术要求',
      prop: 'item',
      type: 'input',
      rules: [{ required: true, message: '请输入技术要求', trigger: 'blur' }]
    }
  ])

const createFirstTestFormItems = () =>
  defineFormItems<PortTestFormData>([
    {
      label: '测试结果内容',
      prop: 'resultDescription',
      customSlot: 'resultDescription',
      rules: [
        { required: true, message: '请输入测试结果内容', trigger: 'blur' }
      ]
    },
    {
      label: '单项结论',
      prop: 'checkResult',
      type: 'select',
      componentProps: { dictField: 'background_point_result' }
    },
    {
      label: '结论',
      prop: 'result',
      type: 'select',
      rules: [{ required: true, message: '请选择结论', trigger: 'blur' }],
      componentProps: { dictField: 'background_point_result' }
    }
  ])

const createRegressionFormItems = () =>
  defineFormItems<PortTestFormData>([
    {
      label: '测试结果内容',
      prop: 'regressionDescription',
      customSlot: 'regressionDescription',
      rules: [
        { required: true, message: '请输入测试结果内容', trigger: 'blur' }
      ]
    },
    {
      label: '单项结论',
      prop: 'regressionCheckResult',
      type: 'select',
      componentProps: { dictField: 'background_point_result' }
    },
    {
      label: '结论',
      prop: 'regressionResult',
      type: 'select',
      rules: [{ required: true, message: '请选择结论', trigger: 'blur' }],
      componentProps: { dictField: 'background_point_result' }
    }
  ])

export const createPortTestFormItems = (step: PortTestStep) => [
  ...createPortTestCommonFormItems(),
  ...(step === '1' ? createFirstTestFormItems() : createRegressionFormItems())
]
