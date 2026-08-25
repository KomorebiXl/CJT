import type { ButtonType } from 'element-plus'

export interface ScButtonProps {
  type?: ButtonType
  size?: 'large' | 'default' | 'small'
  plain?: boolean
  text?: boolean
  bg?: boolean
  link?: boolean
  round?: boolean
  circle?: boolean
  disabled?: boolean
  icon?: string | object
  loadingIcon?: string | object
  autofocus?: boolean
  nativeType?: 'button' | 'submit' | 'reset'
  autoInsertSpace?: boolean
  color?: string
  dark?: boolean
  tag?: string | object
  stop?: boolean
  /** 返回 Promise 时按钮自动进入 loading，其余返回值被忽略 */
  onClick?: (e: MouseEvent) => unknown
}
