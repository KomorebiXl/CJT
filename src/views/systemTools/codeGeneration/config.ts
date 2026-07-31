import type {
  CodeGenerationBasicFormData,
  CodeGenerationOptionsFormData,
  CodeGenerationSearchParams
} from '@/types/systemTools/codeGeneration'
import { defineFormItems } from '@/utils/form.ts'

export const codeGenerationSearchbarItems = reactive<
  SearchbarItems<CodeGenerationSearchParams>
>([
  {
    label: '表名称',
    prop: 'tableName',
    type: 'input',
    placeholder: '请输入表名称'
  },
  {
    label: '表描述',
    prop: 'tableComment',
    type: 'input',
    placeholder: '请输入表描述'
  }
])

export const codeGenerationTableColumns: TableColumns = [
  { label: '表名称', prop: 'tableName' },
  { label: '表描述', prop: 'tableComment' },
  { label: '实体', prop: 'className' },
  { label: '创建时间', prop: 'createTime' },
  { label: '更新时间', prop: 'updateTime' }
]

const requiredRule = (message: string) => [
  { required: true, message, trigger: 'blur' }
]

export const codeGenerationBasicFormItems =
  defineFormItems<CodeGenerationBasicFormData>([
    {
      label: '表名',
      prop: 'tableName',
      type: 'input',
      rules: requiredRule('请输入表名')
    },
    {
      label: '表描述',
      prop: 'tableComment',
      type: 'input',
      rules: requiredRule('请输入表描述')
    },
    {
      label: '实体类名',
      prop: 'className',
      type: 'input',
      rules: requiredRule('请输入实体类名')
    },
    {
      label: '作者',
      prop: 'functionAuthor',
      type: 'input',
      rules: requiredRule('请输入作者')
    },
    {
      label: '备注',
      prop: 'remark',
      type: 'input',
      colSpan: 2,
      componentProps: { type: 'textarea' }
    }
  ])

export const codeGenerationOptionsFormItems =
  defineFormItems<CodeGenerationOptionsFormData>([
    {
      label: '模板类型',
      prop: 'tplCategory',
      type: 'select',
      rules: requiredRule('请选择模板类型'),
      componentProps: {
        options: [
          { label: '单表', value: 'crud' },
          { label: '树表', value: 'tree' },
          { label: '主子表', value: 'sub' }
        ]
      }
    },
    {
      label: '包路径',
      prop: 'packageName',
      type: 'input',
      rules: requiredRule('请输入包路径')
    },
    {
      label: '模块名',
      prop: 'moduleName',
      type: 'input',
      rules: requiredRule('请输入模块名')
    },
    {
      label: '业务名',
      prop: 'businessName',
      type: 'input',
      rules: requiredRule('请输入业务名')
    },
    {
      label: '功能名',
      prop: 'functionName',
      type: 'input',
      rules: requiredRule('请输入功能名')
    },
    {
      label: '生成方式',
      prop: 'genType',
      type: 'radio',
      componentProps: {
        radioOptions: [
          { label: '下载 ZIP', value: '0' },
          { label: '自定义路径', value: '1' }
        ]
      }
    },
    {
      label: '生成路径',
      prop: 'genPath',
      type: 'input',
      hide: form => form.genType !== '1',
      componentProps: { placeholder: '请输入自定义生成路径' }
    },
    {
      label: '上级菜单',
      prop: 'parentMenuId',
      type: 'treeSelect',
      componentProps: {
        options: [],
        nodeKey: 'id',
        fieldNames: { label: 'label', children: 'children' }
      }
    },
    {
      label: '树编码字段',
      prop: 'treeCode',
      type: 'input',
      hide: form => form.tplCategory !== 'tree'
    },
    {
      label: '树父编码字段',
      prop: 'treeParentCode',
      type: 'input',
      hide: form => form.tplCategory !== 'tree'
    },
    {
      label: '树名称字段',
      prop: 'treeName',
      type: 'input',
      hide: form => form.tplCategory !== 'tree'
    },
    {
      label: '子表名称',
      prop: 'subTableName',
      type: 'input',
      hide: form => form.tplCategory !== 'sub'
    },
    {
      label: '子表外键',
      prop: 'subTableFkName',
      type: 'input',
      hide: form => form.tplCategory !== 'sub'
    }
  ])

export const codeGenerationColumnColumns: TableColumns = [
  { label: '字段名', prop: 'columnName' },
  { label: '字段描述', prop: 'columnComment', slot: 'columnComment' },
  { label: '物理类型', prop: 'columnType' },
  { label: 'Java 类型', prop: 'javaType', slot: 'javaType' },
  { label: 'Java 属性', prop: 'javaField', slot: 'javaField' },
  { label: '插入', prop: 'isInsert', slot: 'isInsert' },
  { label: '编辑', prop: 'isEdit', slot: 'isEdit' },
  { label: '列表', prop: 'isList', slot: 'isList' },
  { label: '查询', prop: 'isQuery', slot: 'isQuery' },
  { label: '必填', prop: 'isRequired', slot: 'isRequired' },
  { label: '查询方式', prop: 'queryType', slot: 'queryType' },
  { label: '显示类型', prop: 'htmlType', slot: 'htmlType' },
  { label: '字典类型', prop: 'dictType', slot: 'dictType' }
]

export const defaultBasicFormData: CodeGenerationBasicFormData = {
  tableName: '',
  tableComment: '',
  className: '',
  functionAuthor: '',
  remark: ''
}

export const defaultOptionsFormData: CodeGenerationOptionsFormData = {
  tplCategory: 'crud',
  packageName: '',
  moduleName: '',
  businessName: '',
  functionName: '',
  genType: '0'
}

export const javaTypeOptions = [
  'Long',
  'String',
  'Integer',
  'Double',
  'BigDecimal',
  'Date',
  'Boolean'
]
export const queryTypeOptions = [
  'EQ',
  'NE',
  'GT',
  'GTE',
  'LT',
  'LTE',
  'LIKE',
  'BETWEEN'
]
export const htmlTypeOptions = [
  'input',
  'textarea',
  'select',
  'radio',
  'checkbox',
  'inputNumber',
  'datetime'
]
