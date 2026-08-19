import type {
  BaselineCheckFormData,
  BaselineCheckSearchParams
} from '@/types/projectProcess/baselineCheck'
import { defineFormItems } from '@/utils/form.ts'

export const searchbarItems: SearchbarItems<BaselineCheckSearchParams> = [
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

export const createBaselineCheckTableColumns = (
  step: '1' | '2'
): TableColumns => [
  { label: '资产名称', prop: 'assetName', slot: 'assetName' },
  { label: '测评指标', prop: 'point', slot: 'point' },
  { label: '测评项', prop: 'item' },
  {
    label: '检查结果',
    prop: step === '1' ? 'resultDescription' : 'regressionDescription'
  },
  {
    label: '是否符合规范',
    prop: step === '1' ? 'resultLabel' : 'regressionResultLabel'
  },
  {
    label: '整改建议',
    prop: step === '1' ? 'suggestion' : 'regressionSuggestion'
  }
]

const baselineCheckCommonFormData: BaselineCheckFormData = {
  assetId: '',
  attribute: '',
  level: '',
  point: '',
  item: ''
}

export const createBaselineCheckFormData = (
  step: '1' | '2'
): BaselineCheckFormData =>
  step === '1'
    ? {
        ...baselineCheckCommonFormData,
        resultDescription: '',
        resultDescription_files: [],
        result: '',
        suggestion: ''
      }
    : {
        ...baselineCheckCommonFormData,
        regressionDescription: '',
        regressionDescription_files: [],
        regressionResult: '',
        regressionSuggestion: ''
      }

export const firstTestFormItems = defineFormItems<BaselineCheckFormData>([
  {
    label: '检查结果',
    prop: 'resultDescription',
    customSlot: 'resultDescription',
    rules: [{ required: true, message: '请输入检查结果', trigger: 'blur' }]
  },
  {
    label: '是否符合规范',
    prop: 'result',
    type: 'select',
    rules: [{ required: true, message: '请选择是否符合规范', trigger: 'blur' }],
    componentProps: { dictField: 'background_point_result' }
  },
  {
    label: '整改建议',
    prop: 'suggestion',
    type: 'input',
    componentProps: { type: 'textarea', rows: 3 }
  }
])

export const regressionFormItems = defineFormItems<BaselineCheckFormData>([
  {
    label: '复测结果',
    prop: 'regressionDescription',
    customSlot: 'regressionDescription',
    rules: [{ required: true, message: '请输入复测结果', trigger: 'blur' }]
  },
  {
    label: '是否符合规范',
    prop: 'regressionResult',
    type: 'select',
    rules: [{ required: true, message: '请选择是否符合规范', trigger: 'blur' }],
    componentProps: { dictField: 'background_point_result' }
  },
  {
    label: '整改建议',
    prop: 'regressionSuggestion',
    type: 'input',
    componentProps: { type: 'textarea', rows: 3 }
  }
])

export const createBaselineCheckCommonFormItems = () =>
  defineFormItems<BaselineCheckFormData>([
    {
      label: '资产名称',
      prop: 'assetId',
      type: 'select',
      rules: [{ required: true, message: '请选择资产名称', trigger: 'blur' }],
      componentProps: { options: [] }
    },
    {
      label: '属性',
      prop: 'attribute',
      type: 'select',
      componentProps: { dictField: 'background_attribute' }
    },
    {
      label: '等级',
      prop: 'level',
      type: 'select',
      componentProps: { dictField: 'background_point_grade' }
    },
    {
      label: '测评指标',
      prop: 'point',
      type: 'input',
      rules: [{ required: true, message: '请输入测评指标', trigger: 'blur' }]
    },
    {
      label: '测评项',
      prop: 'item',
      type: 'input',
      rules: [{ required: true, message: '请输入测评项', trigger: 'blur' }]
    }
  ])
