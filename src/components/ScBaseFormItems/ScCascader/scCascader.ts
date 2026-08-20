import type {
  CascaderProps as ElCascaderProps,
  CascaderValue
} from 'element-plus'

export type ScCascaderModelValue = CascaderValue | null | undefined

export interface ScCascaderOption {
  label: string
  value: string | number
  disabled?: boolean
  children?: ScCascaderOption[]
  [key: string]: any
}

export interface ScCascaderFieldNames {
  value?: string
  label?: string
  children?: string
  disabled?: string
}

export interface ScCascaderProps {
  modelValue: ScCascaderModelValue

  // 数据源（二选一，options 优先）
  options?: ScCascaderOption[] | Array<Record<string, any>>
  request?: () => Promise<ScCascaderOption[] | Array<Record<string, any>>>

  // 字段映射
  fieldNames?: ScCascaderFieldNames

  // 常用行为提升到顶层
  multiple?: boolean
  checkStrictly?: boolean
  emitPath?: boolean
  showAllLevels?: boolean

  // 交互
  placeholder?: string
  clearable?: boolean
  filterable?: boolean
  disabled?: boolean
  size?: 'large' | 'default' | 'small'
  collapseTags?: boolean
  collapseTagsTooltip?: boolean

  // 逃生舱：兜底透传给 el-cascader 的 props 对象
  cascaderProps?: Partial<ElCascaderProps>
}

export interface ScCascaderEmits {
  (e: 'update:modelValue', value: ScCascaderModelValue): void
  (e: 'change', value: ScCascaderModelValue): void
  (e: 'expand-change', value: CascaderValue): void
  (e: 'blur', event: FocusEvent): void
  (e: 'focus', event: FocusEvent): void
  (e: 'visible-change', visible: boolean): void
  (e: 'remove-tag', value: any): void
  (e: 'clear'): void
}
