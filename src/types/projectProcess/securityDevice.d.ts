/** 安全设备 - 搜索参数 */
export type SecurityDeviceSearchParams = {
  /** 系统资产名称 */
  assetName?: string
  /** IP 地址 */
  ipAddress?: string
}

/** 安全设备 - 列表数据 */
export type SecurityDeviceData = {
  /** 系统名称 */
  assetName: string
  /** 型号 */
  brandModel: string
  /** 物理位置 */
  assetAddress: string
  /** 所属网络区域 */
  storageDevice: string
  /** IP 地址 */
  ipAddress: string
  /** 系统及运行平台 */
  belongingSystemAssetName: string
  /** 测试账号密码 */
  highAccount: string
  /** 是否热备 */
  highAvailableLabel?: string
  /** 备注 */
  remark: string
} & CommonTableData

/** 安全设备 - 表单数据 */
export type SecurityDeviceFormData = {
  /** 系统名称 */
  assetName: string
  /** 型号 */
  brandModel: string
  /** 物理位置 */
  assetAddress: string
  /** 所属网络区域 */
  storageDevice: string
  /** IP 地址 */
  ipAddress: string
  /** 系统及运行平台 */
  belongingSystemAssetName: string
  /** 测试账号密码 */
  highAccount: string
  /** 是否热备 */
  highAvailable?: string
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
  /** 资产三级分类（固定传 3） */
  assetThirdType?: string
}
