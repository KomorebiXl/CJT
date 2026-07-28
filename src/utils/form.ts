import type { ScBaseFormItem } from '@/components/ScBaseForm/types/formItem.ts'
import type { FormItemRule } from 'element-plus'

type WithTypedProps<
  T extends Record<string, any>,
  Item
> = Item extends ScBaseFormItem
  ? {
      [K in keyof Item]: K extends 'prop'
        ? keyof T
        : K extends 'hide'
          ? (formData: T) => boolean
          : K extends 'label'
            ? string | ((formData: T) => string)
            : K extends 'rules'
              ? | FormItemRule
                | FormItemRule[]
                | ((formData: T) => FormItemRule | FormItemRule[])
              : Item[K]
    }
  : never

export const defineFormItems = <T extends Record<string, any>>(
  items: Array<WithTypedProps<T, ScBaseFormItem>>
): ScBaseFormItem[] => {
  return items as ScBaseFormItem[]
}
