export type AssetAssignmentSearchParams = {
  /** 业务编号 */
  assetNo?: string
  /** 业务名称 */
  assetName?: string
}

export type AssetAssignmentData = {
  /** 业务编号 */
  assetNo: string
  /** 业务名称 */
  assetName: string
  /** 属性（用途描述） */
  usageDescription: string
  /** 定位 */
  usagePosition: string
  /** 完整性 */
  integrity: string
  /** 完整性展示（字典 label） */
  integrityLabel: string
  /** 关联资产列表 */
  relevanceVos?: Array<{
    assetNo: string
    assetName: string
  }>
} & CommonTableData

export type AssetAssignmentFormData = {
  /** 业务编号 */
  assetNo: string
  /** 业务名称 */
  assetName: string
  /** 属性 */
  usageDescription: string
  /** 定位 */
  usagePosition: string
  /** 完整性 */
  integrity: string
  /** 关联资产 id 列表 */
  relevanceAssets: Array<string>
  /** 系统资产类型（固定传 2，业务资产） */
  systemAssetType?: string
}

/** 系统资产选项（关联资产下拉） */
export type AssetSystemOption = {
  id: string
  assetNo: string
  assetName: string
  ipAddress: string
}
