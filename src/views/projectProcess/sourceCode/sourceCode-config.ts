import type {
  SourceCodeDetail,
  SourceCodeFormData,
  SourceCodeSearchParams
} from '@/types/projectProcess/sourceCode'
import { defineFormItems } from '@/utils/form.ts'

export type SourceCodeStep = '1' | '2'

export const searchbarItems: SearchbarItems<SourceCodeSearchParams> = [
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
  },
  {
    label: '漏洞状态',
    prop: 'detailStatus',
    type: 'select',
    dictField: 'background_code_status'
  }
]

export const tableColumns: TableColumns = [
  { label: '资产', prop: 'assetName' },
  { label: '标准大类', prop: 'languageTypeLabel' },
  { label: '类型', prop: 'categoryName' },
  { label: '漏洞名称', prop: 'loopholeName' },
  { label: '漏洞等级', prop: 'levelLabel' },
  { label: '缺陷描述', prop: 'description', showOverflowTooltip: true },
  { label: '详细描述', prop: 'detail', showOverflowTooltip: true },
  { label: '个数', prop: 'loopholeNum' },
  { label: '已修复数量', prop: 'repairNum' },
  { label: '解决方案', prop: 'suggestion', showOverflowTooltip: true }
]

export const createSourceCodeDetailRow = (
  step: SourceCodeStep
): SourceCodeDetail =>
  step === '1'
    ? { content: '', entryPoint: '' }
    : { content: '', entryPoint: '', status: '', repairContent: '' }

export const createSourceCodeFormData = (
  step: SourceCodeStep
): SourceCodeFormData => ({
  assetId: '',
  categoryId: '',
  level: '',
  loopholeNum: 0,
  loopholeName: '',
  description: '',
  suggestion: '',
  detail: '',
  details: [createSourceCodeDetailRow(step)],
  step,
  ...(step === '2' ? { repairNum: 0 } : {})
})

const createSourceCodeBaseItems = () =>
  defineFormItems<SourceCodeFormData>([
    {
      label: '资产',
      prop: 'assetId',
      type: 'select',
      rules: [{ required: true, message: '请选择资产', trigger: 'blur' }],
      componentProps: { options: [] }
    },
    {
      label: '漏洞类型',
      prop: 'categoryId',
      type: 'select',
      componentProps: { options: [] }
    },
    {
      label: '漏洞等级',
      prop: 'level',
      type: 'select',
      rules: [{ required: true, message: '请选择漏洞等级', trigger: 'blur' }],
      componentProps: { dictField: 'background_loophole_level' }
    },
    {
      label: '漏洞个数',
      prop: 'loopholeNum',
      type: 'input',
      rules: [{ required: true, message: '请输入漏洞个数', trigger: 'blur' }],
      componentProps: { type: 'number' }
    }
  ])

const sourceCodeRegressionItems = defineFormItems<SourceCodeFormData>([
  {
    label: '修复个数',
    prop: 'repairNum',
    type: 'input',
    rules: [{ required: true, message: '请输入修复个数', trigger: 'blur' }],
    componentProps: { type: 'number' }
  }
])

const createSourceCodeDescriptionItems = () =>
  defineFormItems<SourceCodeFormData>([
    {
      label: '漏洞名称',
      prop: 'loopholeName',
      type: 'input',
      rules: [{ required: true, message: '请输入漏洞名称', trigger: 'blur' }],
      colSpan: 2
    },
    {
      label: '缺陷描述',
      prop: 'description',
      type: 'input',
      rules: [{ required: true, message: '请输入缺陷描述', trigger: 'blur' }],
      componentProps: { type: 'textarea' },
      colSpan: 2
    },
    {
      label: '解决方案',
      prop: 'suggestion',
      type: 'input',
      rules: [{ required: true, message: '请输入解决方案', trigger: 'blur' }],
      componentProps: { type: 'textarea' },
      colSpan: 2
    },
    {
      label: '详细描述',
      prop: 'detail',
      type: 'input',
      componentProps: { type: 'textarea' },
      colSpan: 2
    },
    {
      label: '详细描述内容',
      prop: 'details',
      customSlot: 'details',
      colSpan: 2
    }
  ])

export const createSourceCodeFormItems = (step: SourceCodeStep) => [
  ...createSourceCodeBaseItems(),
  ...(step === '2' ? sourceCodeRegressionItems : []),
  ...createSourceCodeDescriptionItems()
]
