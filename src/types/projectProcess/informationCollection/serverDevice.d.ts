/** 服务器设备 - 搜索参数 */
export type ServerDeviceSearchParams = {
  /** 系统资产名称 */
  assetName?: string
  /** IP 地址 */
  ipAddress?: string
}

/** 服务器设备 - 列表数据 */
export type ServerDeviceData = {
  /** 系统名称 */
  assetName: string
  /** 所属业务应用系统/平台 id */
  parentId?: string
  /** 所属业务应用系统/平台名称 */
  belongingSystemAssetName: string
  /** 物理位置 */
  assetAddress: string
  /** 服务器类型（型号） */
  brandModel: string
  /** IP 地址 */
  ipAddress: string
  /** 操作系统版本及补丁 */
  systemVersion: string
  /** 安装的数据库系统 */
  dbSystemVersion: string
  /** 中间件及版本 */
  middlewareVersion: string
  /** 重要程度（字典展示值） */
  importanceLevelLabel?: string
  /** 访问方式 */
  accessMethod: string
  /** 是否热备（字典展示值） */
  highAvailableLabel?: string
  /** 运行环境 */
  usagePosition: string
} & CommonTableData

/** 服务器设备 - 表单数据 */
export type ServerDeviceFormData = {
  /** 系统名称 */
  assetName: string
  /** 所属业务应用系统/平台 id */
  parentId: string
  /** 物理位置 */
  assetAddress: string
  /** 服务器类型（型号） */
  brandModel: string
  /** IP 地址 */
  ipAddress: string
  /** 操作系统版本及补丁 */
  systemVersion: string
  /** 安装的数据库系统 */
  dbSystemVersion: string
  /** 中间件及版本 */
  middlewareVersion: string
  /** 重要程度 */
  importanceLevel?: string
  /** 访问方式 */
  accessMethod: string
  /** 是否热备 */
  highAvailable?: string
  /** 运行环境 */
  usagePosition: string
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
  /** 资产三级分类（固定传 1） */
  assetThirdType?: string
}
