import type { FileItem } from '@/types/common'

/** 漏洞地址行 */
export type PenetrationTestAddress = {
  /** 漏洞地址 */
  loopholeAddress: string
  /** 地址状态 */
  status: string
  /** 地址状态dict标签 */
  statusLabel: string
  step: string
}

export type PenetrationTestSearchParams = {
  /** 漏洞名称 */
  loopholeName?: string
  /** 资产名称 */
  assetName?: string
  /** 漏洞等级 */
  level?: string
}

export type PenetrationTestData = {
  /** 资产名称 */
  assetName: string
  /** 漏洞名称 */
  loopholeName: string
  /** 检查项 */
  itemLabel: string
  /** 漏洞等级（字典 label） */
  levelLabel: string
  /** 漏洞描述 */
  description: string
  /** 漏洞危害 */
  hazard: string
  /** 修复建议 */
  suggestion: string
  /** 测试过程 */
  result: string
  /** 漏洞地址列表 */
  addresses: Array<PenetrationTestAddress>
} & CommonTableData

export type PenetrationTestFormData = {
  /** 资产 id */
  assetId: string
  /** 漏洞 id */
  loopholeId: string
  /** 检查项（关联漏洞回填） */
  item: string
  /** 漏洞等级 */
  level: string
  /** 漏洞名称 */
  loopholeName: string
  /** 漏洞描述 */
  description: string
  /** 漏洞危害 */
  hazard: string
  /** 修复建议 */
  suggestion: string
  /** 漏洞地址列表 */
  addresses: Array<Omit<PenetrationTestAddress, 'statusLabel'>>
  /** 测试过程 */
  result: string
  /** 测试过程附件列表 */
  result_files: Array<FileItem>
  /** 项目流程固定参数 */
  step: string
}
