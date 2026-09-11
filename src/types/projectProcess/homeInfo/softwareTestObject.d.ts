/** 软件被测对象搜索参数 */
export type SoftwareTestObjectSearchParams = {
  /** 承建单位 */
  belongingSystemAssetName: string
  /** 被测对象名称 */
  assetName: string
}

/** 软件被测对象行 */
export type SoftwareTestObjectData = {
  id: string
  /** 被测对象名称 */
  assetName: string
  /** 版本 */
  belongingSystemAssetNo: string
  /** 承建单位 */
  belongingSystemAssetName: string
  /** 部署环境 */
  assetAddress: string
}

/** 软件被测对象表单 */
export type SoftwareTestObjectFormData = {
  /** 被测对象名称 */
  assetName: string
  /** 版本 */
  belongingSystemAssetNo: string
  /** 承建单位 */
  belongingSystemAssetName: string
  /** 部署环境 */
  assetAddress: string
}
