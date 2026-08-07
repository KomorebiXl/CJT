import type {
  TestEntrustmentContractFormData,
  TestEntrustmentContractSearchParams
} from '@/types/contractManagement/testEntrustmentContract'
import { defineFormItems } from '@/utils/form.ts'

export const searchbarItems: SearchbarItems<TestEntrustmentContractSearchParams> =
  [
    { label: '合同编号', prop: 'contractNo', type: 'input' },
    { label: '合同标题', prop: 'title', type: 'input' }
  ]

export const tableColumns: TableColumns = [
  { label: '合同类型', prop: 'contractTypeLabel' },
  { label: '合同编号', prop: 'contractNo', minWidth: '120' },
  { label: '合同标题', prop: 'title' },
  { label: '项目名称', prop: 'projectName', minWidth: '120' },
  { label: '委托方', prop: 'customer', minWidth: '120' },
  { label: '委托方类型', prop: 'customerType Label' },
  {
    label: '委托方邮寄地址',
    prop: 'customerAddress',
    showOverflowTooltip: true
  },
  { label: '委托方联系人', prop: 'customerLinkman' },
  { label: '委托方电话', prop: 'customerPhone' },
  { label: '委托方开户行', prop: 'customerDepositBank' },
  { label: '委托方银行账号', prop: 'customerAccountNumber' },
  { label: '委托方联行号', prop: 'customerClearingNumber' },
  { label: '受托方（乙方）', prop: 'contractingUnitLabel' },
  { label: '受托方联系人', prop: 'trusteeLinkmanName' },
  { label: '受托方电话', prop: 'trusteePhone' },
  { label: '签定地点', prop: 'signingAddress' },
  { label: '签定日期', prop: 'signingDate' },
  { label: '测试依据', prop: 'testBasis', showOverflowTooltip: true },
  { label: '测试内容', prop: 'testContent' },
  { label: '合同金额', prop: 'contractAmount' },
  { label: '支付方式', prop: 'paymentMethodLabel' },
  { label: '首款比例', prop: 'firstRatio' },
  { label: '首款金额', prop: 'firstAmount' },
  { label: '尾款比例', prop: 'finalRatio' },
  { label: '尾款金额', prop: 'finalAmount' },
  { label: '测试方式', prop: 'testMethodLabel' },
  { label: '是否包含差旅费', prop: 'includeTravelExpenseLabel' },
  { label: '测试完成期限', prop: 'deadline' },
  { label: '合同份数', prop: 'contractNumber' },
  { label: '委托方合同份数', prop: 'customerContractNumber' },
  { label: '报告份数', prop: 'reportNumber' },
  { label: '备注', prop: 'remark' }
]

export const defaultFormData: TestEntrustmentContractFormData = {
  contractType: '',
  contractNo: '',
  title: '',
  projectName: '',
  customer: '',
  customerType: '',
  customerAddress: '',
  customerLinkman: '',
  customerPhone: '',
  customerDepositBank: '',
  customerAccountNumber: '',
  customerClearingNumber: '',
  contractingUnit: '',
  trusteeLinkman: '',
  trusteePhone: '',
  signingAddress: '',
  signingDate: '',
  testBasis: [],
  testContent: '',
  contractAmount: 0,
  paymentMethod: '',
  firstRatio: '',
  firstAmount: 0,
  finalRatio: '',
  finalAmount: '',
  testMethod: '',
  includeTravelExpense: '',
  deadline: '',
  contractNumber: '',
  customerContractNumber: '',
  reportNumber: '',
  endcustomer: '',
  businessContractProjectDetails: [
    { projectName: '', testContent: '', quantity: 1, remark: '' }
  ],
  remark: ''
}

export const formItems = defineFormItems<TestEntrustmentContractFormData>([
  {
    label: '合同类型',
    prop: 'contractType',
    type: 'select',
    componentProps: { dictField: 'business_contract_type' },
    rules: [{ required: true, message: '请选择合同类型', trigger: 'change' }]
  },
  {
    label: '合同编号',
    prop: 'contractNo',
    type: 'input',
    rules: [{ required: true, message: '请输入合同编号', trigger: 'blur' }]
  },
  { label: '合同标题', prop: 'title', type: 'input' },
  {
    label: '项目名称',
    prop: 'projectName',
    type: 'input',
    rules: [{ required: true, message: '请输入项目名称', trigger: 'blur' }]
  },
  {
    label: '委托方（甲方）',
    prop: 'customer',
    type: 'input',
    rules: [{ required: true, message: '请输入委托方', trigger: 'blur' }]
  },
  {
    label: '委托方类型',
    prop: 'customerType',
    type: 'select',
    componentProps: { dictField: 'client_type' },
    rules: [{ required: true, message: '请选择委托方类型', trigger: 'change' }]
  },
  {
    label: '委托方邮寄地址',
    prop: 'customerAddress',
    type: 'input',
    rules: [
      { required: true, message: '请输入委托方邮寄地址', trigger: 'blur' }
    ]
  },
  {
    label: '委托方联系人',
    prop: 'customerLinkman',
    type: 'input',
    rules: [{ required: true, message: '请输入委托方联系人', trigger: 'blur' }]
  },
  {
    label: '委托方电话',
    prop: 'customerPhone',
    type: 'input',
    rules: [{ required: true, message: '请输入委托方电话', trigger: 'blur' }]
  },
  { label: '委托方开户行', prop: 'customerDepositBank', type: 'input' },
  { label: '委托方银行账号', prop: 'customerAccountNumber', type: 'input' },
  { label: '委托方联行号', prop: 'customerClearingNumber', type: 'input' },
  {
    label: '受托方（乙方）',
    prop: 'contractingUnit',
    type: 'select',
    componentProps: { options: [], filterable: true },
    rules: [{ required: true, message: '请选择受托方', trigger: 'change' }]
  },
  {
    label: '受托方联系人',
    prop: 'trusteeLinkman',
    type: 'select',
    componentProps: { options: [], filterable: true },
    rules: [
      { required: true, message: '请选择受托方联系人', trigger: 'change' }
    ]
  },
  {
    label: '受托方电话',
    prop: 'trusteePhone',
    type: 'input',
    componentProps: { disabled: true }
  },
  {
    label: '签定地点',
    prop: 'signingAddress',
    type: 'input',
    rules: [{ required: true, message: '请输入签定地点', trigger: 'blur' }]
  },
  {
    label: '签定日期',
    prop: 'signingDate',
    type: 'date',
    componentProps: {
      type: 'month',
      format: 'YYYY年MM月',
      valueFormat: 'YYYY年MM月'
    },
    rules: [{ required: true, message: '请选择签定日期', trigger: 'change' }]
  },
  {
    label: '测试依据',
    prop: 'testBasis',
    type: 'select',
    componentProps: { options: [], multiple: true, collapseTags: true },
    rules: [{ required: true, message: '请选择测试依据', trigger: 'change' }]
  },
  {
    label: '测试内容',
    prop: 'testContent',
    type: 'input',
    rules: [{ required: true, message: '请输入测试内容', trigger: 'blur' }]
  },
  {
    label: '合同金额',
    prop: 'contractAmount',
    type: 'input',
    componentProps: { type: 'number' },
    rules: [{ min: 0, message: '合同金额不能小于0', trigger: 'blur' }]
  },
  {
    label: '支付方式',
    prop: 'paymentMethod',
    type: 'select',
    componentProps: { dictField: 'payment_method' },
    rules: [{ required: true, message: '请选择支付方式', trigger: 'change' }]
  },
  {
    label: '首款比例',
    prop: 'firstRatio',
    type: 'input',
    hide: (data: TestEntrustmentContractFormData) => data.paymentMethod !== '2',
    componentProps: { type: 'number' },
    rules: [{ min: 0, max: 100, message: '首款比例应为0-100', trigger: 'blur' }]
  },
  {
    label: '首款金额',
    prop: 'firstAmount',
    type: 'input',
    hide: (data: TestEntrustmentContractFormData) => data.paymentMethod !== '2',
    componentProps: { type: 'number', disabled: true }
  },
  {
    label: '尾款比例',
    prop: 'finalRatio',
    type: 'input',
    hide: (data: TestEntrustmentContractFormData) => data.paymentMethod !== '2',
    componentProps: { type: 'number', disabled: true }
  },
  {
    label: '尾款金额',
    prop: 'finalAmount',
    type: 'input',
    hide: (data: TestEntrustmentContractFormData) => data.paymentMethod !== '2',
    componentProps: { type: 'number', disabled: true }
  },
  {
    label: '测试方式',
    prop: 'testMethod',
    type: 'select',
    componentProps: { dictField: 'background_subject_test_method' },
    rules: [{ required: true, message: '请选择测试方式', trigger: 'change' }]
  },
  {
    label: '是否包含差旅费',
    prop: 'includeTravelExpense',
    type: 'select',
    componentProps: { dictField: 'sys_yes_no' },
    rules: [
      { required: true, message: '请选择是否包含差旅费', trigger: 'change' }
    ]
  },
  {
    label: '测试完成期限',
    prop: 'deadline',
    type: 'input',
    componentProps: { type: 'number' },
    rules: [{ min: 0, message: '测试完成期限不能小于0', trigger: 'blur' }]
  },
  {
    label: '合同份数',
    prop: 'contractNumber',
    type: 'input',
    componentProps: { type: 'number' },
    rules: [{ min: 0, message: '合同份数不能小于0', trigger: 'blur' }]
  },
  {
    label: '委托方合同份数',
    prop: 'customerContractNumber',
    type: 'input',
    componentProps: { type: 'number' },
    rules: [{ min: 0, message: '委托方合同份数不能小于0', trigger: 'blur' }]
  },
  {
    label: '报告份数',
    prop: 'reportNumber',
    type: 'input',
    componentProps: { type: 'number' },
    rules: [{ min: 0, message: '报告份数不能小于0', trigger: 'blur' }]
  },
  { label: '最终用户', prop: 'endcustomer', type: 'input' },
  {
    label: '项目明细',
    prop: 'businessContractProjectDetails',
    customSlot: 'projectDetails',
    colSpan: 2,
    hide: (data: TestEntrustmentContractFormData) => data.contractType !== '10'
  },
  {
    label: '备注',
    prop: 'remark',
    type: 'input',
    componentProps: { type: 'textarea', rows: 3 },
    colSpan: 2
  }
])

export const exportConfig: ExportConfig = {
  exportUrl: '/asset/business/testEntrustmentContract/export',
  fileName: '测试委托合同'
}

export const uploadConfig: UploadConfig = {
  uploadUrl: '/asset/business/testEntrustmentContract/import',
  accept: ['.xls', '.xlsx']
}

export const templateConfig: TemplateConfig = {
  templateUrl: '/asset/business/testEntrustmentContract/template',
  requestMethod: 'POST',
  showTemplateDownload: true
}
