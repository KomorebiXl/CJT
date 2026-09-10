import type { ScSelectOption } from '@/components/ScBaseFormItems/ScSelect'
import type {
  TestBasisFormData,
  TestBasisSearchParams
} from '@/types/projectProcess/testBasis'
import { defineFormItems } from '@/utils/form.ts'

export const searchbarItems: SearchbarItems<TestBasisSearchParams> = [
  {
    label: '标准编号',
    prop: 'standardNo',
    type: 'input',
    placeholder: '请输入标准编号'
  },
  {
    label: '标准名称',
    prop: 'standardName',
    type: 'input',
    placeholder: '请输入标准名称'
  },
  {
    label: '使用类型',
    prop: 'useType',
    type: 'select',
    dictField: 'asset_standard_type',
    placeholder: '请选择使用类型'
  }
]

export const tableColumns: TableColumns = [
  { label: '标准编号', prop: 'standardNo' },
  { label: '标准名称', prop: 'standardName', minWidth: '180' },
  { label: '其他标准名称', prop: 'otherReferences' },
  { label: '颁布时间', prop: 'promulgationDate' },
  { label: '实施时间', prop: 'implementationDate' },
  { label: '颁布部门', prop: 'promulgationDept' },
  { label: '使用类型', prop: 'useTypeLabel' }
]

export const createTestBasisFormItems = (
  standardOptions: Array<ScSelectOption>
) =>
  defineFormItems<TestBasisFormData>([
    {
      label: '使用类型',
      prop: 'useType',
      type: 'select',
      componentProps: { dictField: 'asset_standard_type' },
      rules: [{ required: true, message: '使用类型不能为空', trigger: 'blur' }],
      onChange: (value, formData) => {
        if (value === '2') {
          formData.standardId = ''
          formData.otherReferences = ''
        } else {
          formData.otherReferences = ''
        }
      }
    },
    {
      label: '标准',
      prop: 'standardId',
      type: 'select',
      componentProps: { options: standardOptions },
      rules: formData => [
        {
          required: formData.useType !== '2',
          message: '标准不能为空',
          trigger: 'blur'
        }
      ],
      hide: formData => formData.useType === '2'
    },
    {
      label: '其他参考资料',
      prop: 'otherReferences',
      type: 'input',
      hide: formData => formData.useType !== '2'
    }
  ])
