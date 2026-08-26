import type { FileItem } from '@/types/common'
import type { AssetSystemOption } from '@/types/projectProcess/assetAssignment'

/** 资产选项（国网形态按 applicationMode 切换 BS/CS 检查项字典，/asset/system/option 返回含该字段） */
export type PenetrationTestAssetOption = AssetSystemOption & {
  applicationMode?: string
}

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
  /** 具体漏洞类型（漏洞库名称，展示字段） */
  loopholeCategory?: string
  /** 漏洞等级（字典 label） */
  levelLabel: string
  /** 漏洞描述 */
  description: string
  /** 漏洞危害 */
  hazard: string
  /** 修复建议 */
  suggestion: string
  /** 测试过程（首次测试形态字段） */
  result?: string
  /** 测试过程（回归测试形态字段） */
  regressionResult?: string
  /** 漏洞地址列表 */
  addresses: Array<PenetrationTestAddress>
} & CommonTableData

export type PenetrationTestFormData = {
  /** 资产 id */
  assetId: string
  /** 漏洞 id */
  loopholeId: string
  /** 检查项（常规形态关联漏洞回填，展示字段） */
  item?: string
  /** 具体漏洞类型（常规形态展示字段，详情带回） */
  loopholeCategory?: string
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
  /** 项目流程固定参数 */
  step: string
} & Partial<PenetrationTestFirstFormData> &
  Partial<PenetrationTestRegressionFormData>

export type PenetrationTestFirstFormData = {
  /** 首轮测试过程 */
  result: string
  /** 首轮测试过程附件列表 */
  result_files: Array<FileItem>
}

export type PenetrationTestRegressionFormData = {
  /** 回归测试过程 */
  regressionResult: string
  /** 回归测试过程附件列表 */
  regressionResult_files: Array<FileItem>
}
