export type ContractingOrgLibrarySearchParams = {
  companyName: string
}

export type ContractingOrgLibraryData = {
  companyName: string
  address: string
  accountName: string
  depositBank: string
  accountNumber: string
  clearingNumber: string
  remark: string
} & CommonTableData

export type ContractingOrgLibraryFormData = {
  companyName: string
  address: string
  accountName: string
  depositBank: string
  accountNumber: string
  clearingNumber: string
  remark: string
}
