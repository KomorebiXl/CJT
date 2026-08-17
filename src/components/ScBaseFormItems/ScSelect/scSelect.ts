import type { DictOption } from '@/types/system/dict'

export interface ScSelectProps {
  modelValue: ScSelectModelValue
  options?: Array<ScSelectOption> | Array<DictOption>
  dictField?: string
  customConfig?: CustomConfig
  disabled?: boolean
  size?: 'large' | 'small' | 'default'
  placeholder?: string
  clearable?: boolean
  filterable?: boolean
  multiple?: boolean
  collapseTags?: boolean
  collapseTagsTooltip?: boolean
  multipleLimit?: number
  loadingText?: string
  noDataText?: string
  noMatchText?: string
  labelMaxWidth?: number | string
}

export type ScSelectModelValue =
  | string
  | number
  | boolean
  | object
  | Array<string | number | boolean | object>

export interface ScSelectOption {
  label: string
  value: string | number
  disabled?: boolean
  options?: Array<ScSelectOption>
}

export interface CustomConfig {
  label?: string | ((item: any) => string)
  value?: string
  disabled?: boolean | ((item: any) => boolean)
  options?: string
}

export interface ScSelectEmits {
  (e: 'update:modelValue', value: ScSelectModelValue): void
  (e: 'change', value: any): void
  (e: 'visible-change', visible: boolean): void
  (e: 'remove-tag', value: any): void
  (e: 'clear'): void
  (e: 'blur', event: FocusEvent): void
  (e: 'focus', event: FocusEvent): void
}
