/** 漏洞详情行 */
export type WebScanDetail = {
  /** 漏洞地址 */
  loopholeAddress: string
  /** 漏洞等级 */
  level: string
  levelLabel: string
  /** 地址状态 */
  status: string
  statusLabel: string
  /** 项目流程固定参数 */
  step: string
}

export type WebScanSearchParams = {
  /** 漏洞名称 */
  loopholeName?: string
  /** 资产名称 */
  assetName?: string
  /** 漏洞等级 */
  level?: string
}

export type WebScanData = {
  /** 资产名称 */
  assetName: string
  /** 漏洞名称 */
  loopholeName: string
  /** 漏洞详情列表 */
  details: Array<WebScanDetail>
  /** 漏洞数量 */
  loopholeNum: number
} & CommonTableData

export type WebScanFormData = {
  /** 资产 id */
  assetId: string
  /** 漏洞名称 */
  loopholeName: string
  /** 详细描述 */
  description: string
  /** 解决办法 */
  suggestion: string
  /** 漏洞详情列表 */
  details: Array<Omit<WebScanDetail, 'levelLabel' | 'statusLabel'>>
  /** 项目流程固定参数 */
  step: string
}
