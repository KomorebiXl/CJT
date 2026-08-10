export type UserState = {
  token: string
  name: string
  avatar: string
  roles: string[]
  permissions: string[]
  nickName: string
  loginTime: string
  username: string
}

/**
 * @description 登录表单
 */
export type LoginFormData = {
  username: string
  password: string
  symmetricKey?: string
  iv?: string
  code?: string
  uuid?: string
}

/**
 * @description 用户信息
 */
export type UserInfo = {
  permissions: Array<string>
  roles: Array<string>
  user: User
} & BaseResponse
export type User = {
  avatar: string | null
  userName: string
  nickName: string
}
