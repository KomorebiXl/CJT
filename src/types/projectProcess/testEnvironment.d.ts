export type TestEnvironmentSearchParams = {
  /** 名称 */
  name?: string
  /** 操作系统 */
  system?: string
  /** 运行环境 */
  env?: string
}

export type TestEnvironmentData = {
  /** 名称 */
  name: string
  /** 操作系统 */
  system: string
  /** 运行环境 */
  env: string
} & CommonTableData

export type TestEnvironmentFormData = {
  /** 常用环境 id，选中后联动覆盖 name/system/env */
  common: string
  /** 名称 */
  name: string
  /** 操作系统 */
  system: string
  /** 运行环境 */
  env: string
}
