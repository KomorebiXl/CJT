type TableData = string | number | boolean | null

export type ScTableColumn = {
  prop: string
  label: string
  width?: string | number
  minWidth?: string | number
  fixed?: 'left' | 'right'
  align?: 'left' | 'right' | 'center'
  slot?: string
  isDict?: boolean
  showOverflowTooltip?: boolean
}

export type TreeConfig = {
  rowKey?: string
  treeProps?: {
    children?: string
    hasChildren?: string
  }
  defaultExpandAll?: boolean
}

export type ScTableProps = {
  // 基础配置
  data: Array<Record<string, TableData>>
  tableColumns: Array<ScTableColumn>
  loading?: boolean
  border?: boolean
  stripe?: boolean
  rowClassName?:
    | string
    | ((data: { row: Record<string, TableData>; rowIndex: number }) => string)

  // 功能列
  showSelection?: boolean
  showIndex?: boolean
  showAction?: boolean
  actionWidth?: number | string
  actionFixed?: 'left' | 'right'

  // 单选高亮
  highlightCurrentRow?: boolean

  // 分页
  showPagination?: boolean
  total?: number
  pageSize?: number
  pageSizes?: number[]
  paginationLayout?: string

  // 树形结构
  treeConfig?: TreeConfig
}

export type ScTableInstance = {
  toggleRowExpansion: (row: any, expanded: boolean) => void
  toggleRowSelection: (row: any, selected: boolean) => void
  setCurrentRow: (row: Record<string, TableData> | undefined) => void
}
