/** 用户个人 AI 配置-当前人配置（掩码视图，后端不回明文密钥） */
export type AiUserConfigCurrentData = {
  /** 是否已配置个人密钥 */
  configured: boolean
  /** 密钥掩码（如 sk-****ab12） */
  apiKeyMasked?: string
  /** 可选私有化端点（空=用全局） */
  baseUrl?: string
  /** 备注 */
  remark?: string
  /** 更新时间 */
  updateTime?: string
}

/** 用户个人 AI 配置-保存入参 */
export type AiUserConfigSaveParams = {
  /** API Key 明文（仅本次请求，后端加密落库） */
  apiKey: string
  /** 可选私有化端点 */
  baseUrl?: string
  /** 备注 */
  remark?: string
}

/** 密钥连通性测试结果 */
export type AiUserConfigTestResult = {
  ok: boolean
  message: string
}

/** 管理页-用户密钥状态行（join sys_user，未配置用户也返回） */
export type AiUserConfigStatusData = {
  /** 用户id */
  userId: string
  /** 登录账号 */
  userName: string
  /** 用户昵称 */
  nickName: string
  /** 是否已配置个人密钥 */
  configured: boolean
  /** 密钥掩码（未配置为 null） */
  apiKeyMasked: string | null
  /** 可选私有化端点 */
  baseUrl: string | null
  /** 更新时间 */
  updateTime: string | null
} & CommonTableData

/** 管理页-全局兜底密钥状态 */
export type AiUserConfigGlobalStatus = {
  /** 全局 deepseek.api-key 是否已配置（未配个人密钥的用户是否可用取决于它） */
  configured: boolean
}
