import { reactive } from 'vue'
import type {
  ProjectManagementFormData,
  ProjectManagementSearchParams
} from '@/types/projectManagement'
import { defineFormItems } from '@/utils/form.ts'
import { findFormItem } from '@/utils/formItemUtils.ts'
import { getDictOptions } from '@/utils/dict.ts'
import type { ScFormInputProps } from '@/components/ScBaseForm/types/componentProps.ts'

const BASE_TEXTAREA_CONFIG: ScFormInputProps = {
  type: 'textarea',
  showWordLimit: true,
  maxLength: 2000,
  rows: 5
}

const required = (message: string, trigger: 'blur' | 'change' = 'blur') => ({
  required: true,
  message,
  trigger
})

export const searchbarItems: SearchbarItems<ProjectManagementSearchParams> = [
  {
    prop: 'code',
    label: '项目编号',
    type: 'input',
    placeholder: '请输入项目编号'
  },
  {
    prop: 'name',
    label: '项目名称',
    type: 'input',
    placeholder: '请输入项目名称'
  },
  {
    prop: 'largeType',
    label: '项目大类',
    type: 'select',
    dictField: 'background_subject_type'
  },
  {
    prop: 'type',
    label: '项目类型',
    type: 'select',
    dictField: 'background_subject_second_type'
  }
]

export const tableColumns: TableColumns = [
  { label: '项目编号', prop: 'code', minWidth: 160 },
  { label: '项目名称', prop: 'name', minWidth: 100 },
  { label: '测试地址', prop: 'assessAddress', minWidth: 100 },
  { label: '测试方式', prop: 'assessMethodLabel', minWidth: 100 },
  { label: '项目类型', prop: 'typeLabel', minWidth: 100 },
  { label: '报告编制人', prop: 'reportCreatorName', minWidth: 100 },
  { label: '报告编制时间', prop: 'reportTime', minWidth: 100 }
]

export const defaultFormData: ProjectManagementFormData = {
  code: '',
  name: '',
  largeType: '',
  type: [],
  ifUsePlanStealer: null,
  ifUseResultStealer: null,
  accordanceFileType: [],
  reportType: '',
  scene: '',
  seal: '',
  assessMethod: [],
  designUnit: '',
  validatePlan: '1',
  projectStatus: '',
  subjectRoleUsers: [{ subjectRoleId: '', userId: '' }],
  testTimes: [{ testStart: '', testEnd: '' }],
  reportCreator: '',
  reportTime: '',
  assessAddress: '',
  planCreator: '',
  planTime: '',
  supervisionUnit: '',
  constructionDept: '',
  contractorName: '',
  commissionUnitName: '',
  commissionUnitAddress: ''
}

export const loadReportTypeOptions = async (largeType: string | number) => {
  const options = await getDictOptions('background_report_type')
  const reportTypeItem = findFormItem(formItems, 'reportType', 'select')
  if (!reportTypeItem) return
  reportTypeItem.componentProps = {
    ...reportTypeItem.componentProps,
    options: options.filter(
      item =>
        item.value === '0' ||
        item.value.startsWith(String(largeType ?? '') + '-')
    )
  }
}

export const formItems = reactive(
  defineFormItems<ProjectManagementFormData>([
    {
      prop: 'code',
      label: '项目编号',
      type: 'input',
      rules: [required('项目编号不能为空')]
    },
    {
      prop: 'name',
      label: '项目名称',
      type: 'input',
      rules: [required('项目名称不能为空')]
    },
    {
      prop: 'largeType',
      label: '项目大类',
      type: 'select',
      componentProps: { dictField: 'background_subject_type' },
      rules: [required('项目大类不能为空', 'change')],
      onChange: val => loadReportTypeOptions(val)
    },
    {
      prop: 'type',
      label: '项目类型',
      type: 'select',
      componentProps: {
        dictField: 'background_subject_second_type',
        multiple: true
      },
      rules: [{ required: true, message: '未选择项目类型', trigger: 'change' }]
    },
    {
      prop: 'ifUsePlanStealer',
      label: '是否启用方案合并列',
      type: 'select',
      hide: data => data.largeType !== '10',
      rules: data =>
        data.largeType === '10'
          ? [required('未选择是否启用方案合并列', 'change')]
          : [],
      componentProps: { dictField: 'merge_columns' }
    },
    {
      prop: 'ifUseResultStealer',
      label: '是否启用报告合并列',
      type: 'select',
      hide: data => data.largeType !== '10',
      rules: data =>
        data.largeType === '10'
          ? [required('未选择是否启用报告合并列', 'change')]
          : [],
      componentProps: { dictField: 'merge_columns' }
    },
    {
      prop: 'accordanceFileType',
      label: '依据文件类型',
      type: 'select',
      hide: data => data.largeType !== '10',
      componentProps: {
        dictField: 'according_document',
        multiple: true,
        collapseTags: true
      }
    },
    {
      prop: 'reportType',
      label: '报告类型',
      type: 'select',
      componentProps: { options: [] },
      rules: [required('报告类型不能为空', 'change')]
    },
    {
      prop: 'scene',
      label: '使用场景',
      type: 'select',
      componentProps: { dictField: 'background_subject_scene' },
      rules: [required('使用场景不能为空', 'change')]
    },
    {
      prop: 'seal',
      label: '盖章',
      type: 'select',
      componentProps: { dictField: 'background_subject_seal' },
      rules: [required('未选择盖章类型', 'change')]
    },
    {
      prop: 'assessMethod',
      label: '测试方式',
      type: 'select',
      componentProps: {
        dictField: 'background_subject_test_method',
        multiple: true
      },
      rules: [
        {
          required: true,
          type: 'array',
          message: '测试方式不能为空',
          trigger: 'change'
        }
      ],
      onChange: async (val, formData) => {
        // 测试方式变化时，未填测试地址则自动补全
        if (Array.isArray(val) && val[0]) {
          const options = await getDictOptions('background_subject_test_method')
          const find = options.find(item => item.value === val[0])
          if (!formData.assessAddress || formData.assessAddress === '') {
            formData.assessAddress = find?.remark ?? ''
          }
        }
      }
    },
    {
      prop: 'designUnit',
      label: '设计单位',
      type: 'input',
      hide: data => data.largeType !== '10'
    },
    {
      prop: 'validatePlan',
      label: '是否校验方案',
      type: 'switch',
      rules: [required('未选择是否校验方案', 'change')],
      componentProps: {
        activeText: '校验',
        inactiveText: '不校验',
        activeValue: '1',
        inactiveValue: '0'
      }
    },
    {
      prop: 'projectStatus',
      label: '项目状态',
      type: 'select',
      rules: [required('未选择项目状态', 'change')],
      componentProps: { dictField: 'project_status' }
    },
    {
      prop: 'subjectRoleUsers',
      label: '用户/角色',
      customSlot: 'subjectRoleUsers',
      colSpan: 2,
      rules: [
        {
          required: true,
          type: 'array',
          message: '未选择用户/角色权限',
          trigger: 'change'
        }
      ]
    },
    {
      prop: 'testTimes',
      label: '评估时间',
      customSlot: 'testTimes',
      colSpan: 2,
      hide: data => data.largeType === '10'
    },
    {
      prop: 'reportCreator',
      label: '报告编制人',
      customSlot: 'reportCreator'
    },
    {
      prop: 'reportTime',
      label: '报告编制时间',
      type: 'date',
      componentProps: { valueFormat: 'YYYY-MM-DD', type: 'date' }
    },
    {
      prop: 'assessAddress',
      label: '测试地址',
      type: 'input',
      componentProps: { type: 'textarea', rows: 3 },
      colSpan: 2,
      rules: [required('测试地址不能为空')]
    },
    {
      prop: 'planCreator',
      label: '方案编制人',
      customSlot: 'planCreator'
    },
    {
      prop: 'planTime',
      label: '方案编制时间',
      type: 'date',
      componentProps: { valueFormat: 'YYYY-MM-DD', type: 'date' }
    },
    {
      prop: 'supervisionUnit',
      label: '监理单位',
      type: 'input',
      hide: data => data.largeType !== '10'
    },
    {
      prop: 'constructionDept',
      label: '建设单位',
      type: 'input',
      hide: data => data.largeType !== '10'
    },
    {
      prop: 'contractorName',
      label: '施工单位',
      type: 'input',
      hide: data => data.largeType !== '10'
    },
    {
      prop: 'commissionUnitName',
      label: '委托单位名称',
      type: 'input',
      colSpan: 2,
      rules: [required('委托单位名称不能为空')],
      componentProps: BASE_TEXTAREA_CONFIG
    },
    {
      prop: 'commissionUnitAddress',
      label: '委托单位地址',
      type: 'input',
      colSpan: 2,
      rules: [required('委托单位地址不能为空')],
      componentProps: BASE_TEXTAREA_CONFIG
    }
  ])
)
