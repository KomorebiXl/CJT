export type HostScanSearchParams = {
  /** 漏洞名称 */
  loopholeName?: string
  /** 资产名称 */
  assetName?: string
  /** 漏洞等级 */
  level?: string
}

export type HostScanData = {
  /** 资产名称 */
  assetName: string
  /** IP 地址 */
  ipAddress?: string
  /** 端口 */
  loopholeAddress: string
  /** 协议 */
  agreement: string
  /** 漏洞名称 */
  loopholeName: string
  /** 漏洞等级（字典 label） */
  levelLabel: string
  /** 状态（字典 label） */
  statusLabel: string
  /** 详细描述 */
  reason: string
  /** 解决办法 */
  suggestion: string
} & CommonTableData

export type HostScanFormData = {
  /** 资产 id */
  assetId: string
  /** 端口 */
  loopholeAddress: string
  /** 协议 */
  agreement: string
  /** 漏洞名称 */
  loopholeName: string
  /** 漏洞等级 */
  level: string
  /** 详细描述 */
  reason: string
  /** 解决方案 */
  suggestion: string
  /** 状态 */
  status: string
  step: string
}
