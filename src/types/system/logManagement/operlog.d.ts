export type OperlogSearchParams = {
  operIp?: string
  title?: string
  operName?: string
  businessType?: string | number
  status?: string | number
}

export type OperlogData = {
  operId: string | number
  title?: string
  businessType?: string | number
  operName?: string
  operIp?: string
  status?: string | number
  operTime?: string
  costTime?: string | number
  operUrl?: string
  method?: string
  requestMethod?: string
  operParam?: string
  jsonResult?: string
  operLocation?: string
  deptName?: string
  errorMsg?: string
}
