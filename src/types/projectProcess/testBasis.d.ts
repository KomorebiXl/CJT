export type TestBasisSearchParams = {
  standardNo?: string
  standardName?: string
  useType?: string
}

export type TestBasisData = {
  standardId: string
  standardName: string
  standardNo: string
  useType: string
  useTypeLabel: string
  otherReferences: string
  promulgationDate: string
  implementationDate: string
  promulgationDept: string
} & CommonTableData

export type TestBasisFormData = {
  standardId: string
  useType: string
  otherReferences: string
}
