import type { ScTableColumn } from '@/components/ScBaseComponents/ScTable'
import type { ButtonType } from 'element-plus'

export interface TableConfig<TRow = Record<string, any>> {
  tableColumns: Array<ScTableColumn>
  /** 是否显示操作列，默认为true */
  showActionColumn?: boolean
  /** 操作列自定义按钮 */
  customActionButtons?: Array<ActionButton<TRow>>
  /** 是否显示默认编辑/删除按钮，默认为true */
  showDefaultButtons?: boolean
  /** 默认编辑/删除按钮配置 */
  defaultButtonsConfig?: {
    edit?: DefaultButtonsConfig<TRow>
    delete?: DefaultButtonsConfig<TRow>
  }
  /** 是否显示分页，默认为true */
  showPagination?: boolean
  /** 每页条数 */
  pageSize?: number
  /** 行类名 */
  rowClassName?: string | ((data: { row: TRow; rowIndex: number }) => string)
  /** 是否显示多选框 */
  showSelection?: boolean
  /** 多选时是否在数据刷新后保留选中项（转发 ScTable，依赖 row-key） */
  reserveSelection?: boolean
  /** 是否显示序号 */
  showIndex?: boolean
}

export interface ActionButton<TRow> {
  name: string | ((row: TRow) => string)
  type: ButtonType
  text?: boolean
  disabled?: boolean | ((row: TRow) => boolean)
  icon?: Component
  order?: number
  permission?: string | Array<string>
  show?: (row: TRow) => boolean
  onClick: (row: TRow) => void
}

export interface DefaultButtonsConfig<TRow> {
  disabled?: boolean | ((row: TRow) => boolean)
  order?: number
  permission?: string | Array<string>
  show?: (row: TRow) => boolean
}
