export type LoginLogSearchParams = {
  ipaddr?: string
  userName?: string
  status?: string | number
}

export type LoginLogData = {
  infoId: number
  userName: string
  status: string
  ipaddr: string
  loginLocation: string
  browser: string
  os: string
  msg: string
  loginTime: string
}
