import type { FileItem } from '@/types/common'

export type TopologyDiagramSearchParams = {}

export type TopologyDiagramData = {
  /** 环境 */
  type: string
  /** 内容描述 */
  content: string
} & CommonTableData

export type TopologyDiagramFormData = {
  /** 环境 */
  type: string | null
  /** 内容描述 */
  content: string
  /** 图片文件及占位符元数据 */
  files: Array<FileItem>
}

/** 测试环境分类树节点（/ras/category/list） */
export type TopologyDiagramCategoryData = {
  /** 分类名称 */
  name: string
  /** 子级分类 */
  child?: Array<TopologyDiagramCategoryData>
} & CommonTableData
