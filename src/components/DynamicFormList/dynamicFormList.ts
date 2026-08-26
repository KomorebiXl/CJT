interface DynamicFormListItemBase<T> {
  /** 绑定字段 */
  prop: keyof T & string
  /** 不传则不展示 label */
  label?: string
  placeholder?: string
  /**
   * 未传 createRow 时,组件内部自动构建新行会用到这个默认值。
   * 仅覆盖 items 中声明过的字段,T 上其余字段不受此影响。
   */
  defaultValue?: any
  /** 保留字段:横向布局下的列宽权重,当前卡片+弹窗模式不使用,供后续横向布局复用 */
  span?: number
  /**
   * 只读展示时的截断行数。
   * - textarea 未传时默认 3 行
   * - input / select 未传时默认 1 行
   * - 传 false 表示不截断
   */
  viewClamp?: number | false
}

interface DynamicFormListInputItem<T> extends DynamicFormListItemBase<T> {
  type: 'input'
}

interface DynamicFormListTextareaItem<T> extends DynamicFormListItemBase<T> {
  type: 'textarea'
  rows?: number
}

interface DynamicFormListSelectItem<T> extends DynamicFormListItemBase<T> {
  type: 'select'
  dictField?: string
  options?: { label: string; value: string | number }[]
}

export type DynamicFormListItem<T> =
  | DynamicFormListInputItem<T>
  | DynamicFormListTextareaItem<T>
  | DynamicFormListSelectItem<T>
