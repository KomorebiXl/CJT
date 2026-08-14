/** 数据库管理 - 搜索参数 */
export type DatabaseManagementSearchParams = {
  /** 数据库类型 */
  assetName?: string
  /** IP 地址 */
  ipAddress?: string
}

/** 数据库管理 - 列表数据 */
export type DatabaseManagementData = {
  /** 数据库类型 */
  assetName: string
  /** 版本号 */
  brandModel: string
  /** IP 地址 */
  ipAddress: string
  /** 所属业务应用系统/平台名称 */
  belongingSystemAssetName: string
} & CommonTableData

/** 数据库管理 - 表单数据 */
export type DatabaseManagementFormData = {
  /** 数据库类型 */
  assetName: string
  /** 版本号 */
  brandModel: string
  /** IP 地址 */
  ipAddress: string
  /** 所属业务应用系统/平台名称 */
  belongingSystemAssetName: string
  /** 是否基线检查（1 是 / 0 否） */
  baseline: number
  /** 是否漏洞扫描（1 是 / 0 否） */
  scan: number
  /** 是否渗透测试（1 是 / 0 否） */
  penetrate: number
  /** 资产类型（固定传 4） */
  assetType?: string
  /** 资产二级分类（固定传 42） */
  assetSecondType?: string
  /** 资产三级分类（固定传 6） */
  assetThirdType?: string
}
