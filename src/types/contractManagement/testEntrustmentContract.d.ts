export type BusinessContractProjectDetailsList = {
  projectName: string
  testContent: string
  quantity: number | string
  remark: string
}

export type TestEntrustmentContractSearchParams = {
  contractNo?: string
  title?: string
}

export type TestEntrustmentContractData = {
  contractTypeLabel?: string
  contractNo: string
  title: string
  projectName: string
  customer: string
  customerTypeLabel?: string
  customerAddress: string
  customerLinkman: string
  customerPhone: string
  customerDepositBank: string
  customerAccountNumber: string
  customerClearingNumber: string
  contractingUnitLabel?: string
  trusteeLinkmanName: string
  trusteePhone: string
  signingAddress: string
  signingDate: string
  testBasis: string | Array<string>
  testContent: string
  contractAmount: number
  paymentMethodLabel?: string
  firstRatio: string
  firstAmount: number
  finalRatio: number | string
  finalAmount: string
  testMethodLabel?: string
  includeTravelExpenseLabel?: string
  deadline: string
  contractNumber: string
  customerContractNumber: number | string
  reportNumber: string
  remark: string
  businessContractProjectDetailVos?: Array<BusinessContractProjectDetailsList>
} & CommonTableData

export type TestEntrustmentContractFormData = {
  contractType: string
  contractNo: string
  title: string
  projectName: string
  customer: string
  customerType: string
  customerAddress: string
  customerLinkman: string
  customerPhone: string
  customerDepositBank: string
  customerAccountNumber: string
  customerClearingNumber: string
  contractingUnit: string
  trusteeLinkman: string
  trusteePhone: string
  signingAddress: string
  signingDate: string
  testBasis: string | Array<string>
  testContent: string
  contractAmount: number
  paymentMethod: string
  firstRatio: string
  firstAmount: number
  finalRatio: number | string
  finalAmount: string
  testMethod: string
  includeTravelExpense: string
  deadline: string
  contractNumber: string
  customerContractNumber: number | string
  reportNumber: string
  endcustomer: string
  businessContractProjectDetails: Array<BusinessContractProjectDetailsList>
  remark: string
}
