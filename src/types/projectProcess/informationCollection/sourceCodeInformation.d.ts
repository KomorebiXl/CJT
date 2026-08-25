/** 源代码信息 - 搜索参数 */
export type SourceCodeInformationSearchParams = {
  /** 系统名称 */
  assetName?: string
}

/** 源代码信息 - 列表数据 */
export type SourceCodeInformationData = {
  /** 系统名称 */
  assetName: string
  /** Hash */
  belongingSystemAssetNo: string
  /** 代码包 */
  belongingSystemAssetName: string
} & CommonTableData

/** 源代码信息 - 表单数据 */
export type SourceCodeInformationFormData = {
  /** 系统名称 */
  assetName: string
  /** Hash */
  belongingSystemAssetNo: string
  /** 代码包 */
  belongingSystemAssetName: string
  /** 系统资产类型（固定传 3） */
  assetType?: string
}
