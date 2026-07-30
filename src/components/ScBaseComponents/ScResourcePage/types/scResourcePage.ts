import type { SearchConfig, OperateConfig, TableConfig } from './index.ts'

export interface ScResourcePageProps {
  pageConfig: ScResourcePageConfig
  exportConfig?: ExportConfig
}

export interface ScResourcePageConfig<TRow = any> {
  searchConfig: SearchConfig
  operateConfig?: OperateConfig
  tableConfig: TableConfig<TRow>
  fetchData: (params: any) => Promise<FetchTableData>
  pageExtraParams?: Record<string, any>
  treeConfig?: TreeConfig
}

export interface FetchTableData<TRow = any> {
  rows: Array<TRow>
  total?: number
}

export interface TreeConfig {
  children?: string
  hasChildren?: string
  rowKey?: string
  showExpandButton?: boolean
  defaultExpandAll?: boolean
}

export interface ExportConfig {
  exportUrl: string
  exportExtraParams?: Record<string, any>
  fileName?: string
  /** 导出前钩子函数，返回false为取消 */
  beforeExport?: () => Promise<boolean> | boolean
  /** 导出后钩子函数 */
  afterExport?: (success: boolean) => void
}

export interface ScResourcePageEmits<TRow = any> {
  add: []
  edit: [row: TRow]
  delete: [row: TRow]
  import: []
  export: []
  /** 自定义按钮点击，传出按钮 id */
  operateClick: [btnId: string | undefined]
  'selection-change': [selection: TRow[]]
}

// 组件实例
export interface ScResourcePageInstance<TRow = any> {
  refresh: () => Promise<void>
  getSearchParams: () => Record<string, any>
  resetSearch: () => Promise<void>
  getSelectedRows: () => TRow[]
  clearSelection: () => void
}
