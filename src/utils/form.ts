import type { ScBaseFormItem } from '@/components/ScBaseForm/types/formItem.ts'
import type { FormItemRule } from 'element-plus'

interface ScFormItemOverrides<T extends Record<string, any>> {
  prop: keyof T
  hide?: (formData: T) => boolean
  label?: string | ((formData: T) => string)
  rules?:
    | FormItemRule
    | FormItemRule[]
    | ((formData: T) => FormItemRule | FormItemRule[])
  onChange?: (value: any, formData: T) => void
}

type WithTypedProps<
  T extends Record<string, any>,
  Item
> = Item extends ScBaseFormItem
  ? {
      [K in keyof Item]: K extends keyof ScFormItemOverrides<T>
        ? ScFormItemOverrides<T>[K]
        : Item[K]
    }
  : never

export const defineFormItems = <T extends Record<string, any>>(
  items: Array<WithTypedProps<T, ScBaseFormItem>>
): ScBaseFormItem[] => {
  return items as ScBaseFormItem[]
}
