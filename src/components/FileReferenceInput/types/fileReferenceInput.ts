export interface Props {
  modelValue: string
  placeholder?: string
  rows?: number
  disabled?: boolean
}

export interface Emit {
  (e: 'update:modelValue', value: string): void
}
