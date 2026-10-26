export interface ScInputNumberProps {
  modelValue?: number | null
  placeholder?: string
  min?: number
  max?: number
  step?: number
  /** 小数位精度（如 2） */
  precision?: number
  /** 仅允许输入 step 的整数倍 */
  stepStrictly?: boolean
  /** 显示左右增减按钮 */
  controls?: boolean
  disabled?: boolean
}

export interface ScInputNumberEmits {
  (e: 'update:modelValue', value: number | null): void
}
