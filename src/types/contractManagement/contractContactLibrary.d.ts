export type ContractContactLibrarySearchParams = {
  name: string
}

export type ContractContactLibraryData = {
  name: string
  phone: string
  extensionNumber: string
  remark: string
} & CommonTableData

export type ContractContactLibraryFormData = {
  name: string
  phone: string
  extensionNumber: string
  remark: string
}
