import type { ScBaseFormItem } from '@/components/ScBaseForm/types/formItem.ts'
import type { ScBaseFormInstance } from '@/components/ScBaseForm'

export interface ScDialogFormConfig {
  title?: string
  confirmText?: string
  cancelText?: string
  dialogWidth?: string | number
  draggable?: boolean
  fullscreen?: boolean
  formItems: ScBaseFormItem[]
  labelWidth?: number | string
  inline?: boolean
  columns?: number
  groupModel?: boolean
  /** 关闭时销毁内容；表单含大数据树时可设 false 提升再次打开速度 */
  destroyOnClose?: boolean
}

export interface ScDialogFormProps {
  modelValue: boolean
  formData: Record<string, any>
  config: ScDialogFormConfig
  confirmLoading?: boolean
}

export interface ScDialogFormEmits {
  (e: 'update:modelValue', val: boolean): void
  (e: 'confirm', data: Record<string, any>): void
}

export interface ScDialogFormInstance extends ScBaseFormInstance {}
