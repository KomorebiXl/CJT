export type SecurityMeasureListSearchParams = {
  measureName?: string
}

export type SecurityMeasureListData = {
  measureName: string
  measureType: string
  measureTypeLabel: string
  measureDescription: string
  measureMethod: string
  measureMethodLabel: string
  measureResult: string
  measureResultLabel: string
} & CommonTableData

export type SecurityMeasureListFormData = {
  measureName: string
  measureType: string
  measureDescription: string
  measureMethod: Array<string>
  measureResult: string
}
