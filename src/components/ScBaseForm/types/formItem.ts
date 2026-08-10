import type { FormItemRule } from 'element-plus'
import type {
  ScFormCheckboxProps,
  ScFormDateProps,
  ScFormDateRangeProps,
  ScFormInputProps,
  ScFormRadioProps,
  ScFormSelectProps,
  ScFormSwitchProps,
  ScFormTreeSelectProps,
  ScFormTreeProps
} from './componentProps.ts'

interface ScBaseFormItemBase {
  prop: string
  label?: string | ((formData: Record<string, any>) => string)
  rules?:
    | FormItemRule
    | FormItemRule[]
    | ((formData: Record<string, any>) => FormItemRule | FormItemRule[])
  customSlot?: string
  hide?: (formData: Record<string, any>) => boolean
  groupName?: string
  colSpan?: number
  onChange?: (value: any, formData: Record<string, any>) => void
}

export interface ScBaseFormInputItem extends ScBaseFormItemBase {
  type: 'input'
  componentProps?: ScFormInputProps
}

export interface ScBaseFormSelectItem extends ScBaseFormItemBase {
  type: 'select'
  componentProps?: ScFormSelectProps
}

export interface ScBaseFormDateItem extends ScBaseFormItemBase {
  type: 'date'
  componentProps?: ScFormDateProps
}

export interface ScBaseFormDateRangeItem extends ScBaseFormItemBase {
  type: 'dateRange'
  componentProps?: ScFormDateRangeProps
}

export interface ScBaseFormRadioItem extends ScBaseFormItemBase {
  type: 'radio'
  componentProps?: ScFormRadioProps
}

export interface ScBaseFormCheckboxItem extends ScBaseFormItemBase {
  type: 'checkbox'
  componentProps?: ScFormCheckboxProps
}

export interface ScBaseFormSwitchItem extends ScBaseFormItemBase {
  type: 'switch'
  componentProps?: ScFormSwitchProps
}

export interface ScBaseFormTreeSelectItem extends ScBaseFormItemBase {
  type: 'treeSelect'
  componentProps?: ScFormTreeSelectProps
}

export interface ScBaseFormCustomItem extends ScBaseFormItemBase {
  type?: never
  customSlot: string
}

export interface ScBaseFormTreeItem extends ScBaseFormItemBase {
  type: 'tree'
  componentProps?: ScFormTreeProps
}

export type ScBaseFormItem =
  | ScBaseFormInputItem
  | ScBaseFormSelectItem
  | ScBaseFormDateItem
  | ScBaseFormDateRangeItem
  | ScBaseFormRadioItem
  | ScBaseFormCheckboxItem
  | ScBaseFormSwitchItem
  | ScBaseFormTreeSelectItem
  | ScBaseFormTreeItem
  | ScBaseFormCustomItem
