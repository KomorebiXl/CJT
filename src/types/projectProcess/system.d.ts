/** 系统 - 搜索参数 */
export type SystemSearchParams = {
  /** 系统资产名称 */
  unitComponentAssetName?: string
  /** 承载业务 */
  businessApplication?: string
}

/** 系统 - 列表数据 */
export type SystemData = {
  /** 系统名称 */
  assetName: string
  /** Hash */
  belongingSystemAssetNo: string
  /** 代码包 */
  belongingSystemAssetName: string
} & CommonTableData

/** 系统 - 表单数据 */
export type SystemFormData = {
  /** 系统名称 */
  assetName: string
  /** Hash */
  belongingSystemAssetNo: string
  /** 代码包 */
  belongingSystemAssetName: string
  /** 系统资产类型（固定传 3） */
  assetType?: string
}
