export type OnlineUserSearchParams = {
  ipaddr?: string
  userName?: string
}

export type OnlineUserData = {
  tokenId: string
  userName: string
  deptName?: string | null
  ipaddr: string
  loginLocation: string
  os: string
  browser: string
  loginTime: string | number
}
