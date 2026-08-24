import type { FileItem } from '@/types/common'

export type InformationSecuritySearchParams = {
  /** 安全类别 */
  securityType?: string
  /** 检测结果 */
  result?: string
}

export type InformationSecurityData = {
  /** 安全类别（字典 label） */
  securityTypeLabel: string
  /** 检测要求 */
  require: string
  /** 检测过程 */
  process: string
  /** 检测结果（字典 label） */
  resultLabel: string
} & CommonTableData

export type InformationSecurityFormData = {
  /** 安全类别 */
  securityType: string
  /** 检测结果 */
  result: string
  /** 检测过程 */
  process: string
  /** 检测过程图片及占位符元数据 */
  process_files: Array<FileItem>
}
