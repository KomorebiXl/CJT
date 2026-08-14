/** 网络设备 - 搜索参数 */
export type NetworkDeviceSearchParams = {
  /** 系统资产名称 */
  assetName?: string
  /** IP 地址 */
  ipAddress?: string
}

/** 网络设备 - 列表数据 */
export type NetworkDeviceData = {
  /** 系统名称 */
  assetName: string
  /** 主要用途 */
  usageDescription: string
  /** 型号 */
  brandModel: string
  /** 物理位置 */
  assetAddress: string
  /** 所属网络区域 */
  storageDevice: string
  /** IP 地址 */
  ipAddress: string
  /** 访问方式 */
  accessMethod: string
  /** 测试账号密码 */
  highAccount: string
  /** 是否热备 */
  highAvailableLabel?: string
  /** 重要程度 */
  importanceLevelLabel?: string
  /** 备注 */
  remark: string
} & CommonTableData

/** 网络设备 - 表单数据 */
export type NetworkDeviceFormData = {
  /** 系统名称 */
  assetName: string
  /** 主要用途 */
  usageDescription: string
  /** 型号 */
  brandModel: string
  /** 物理位置 */
  assetAddress: string
  /** 所属网络区域 */
  storageDevice: string
  /** IP 地址 */
  ipAddress: string
  /** 访问方式 */
  accessMethod: string
  /** 测试账号密码 */
  highAccount: string
  /** 是否热备 */
  highAvailable?: string
  /** 重要程度 */
  importanceLevel?: string
  /** 备注 */
  remark: string
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
  /** 资产三级分类（固定传 4） */
  assetThirdType?: string
}
