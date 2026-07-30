export type CpuInfo = {
  cpuNum: number
  total: number
  sys: number
  used: number
  wait: number
  free: number
}

export type MemoryInfo = {
  total: number
  used: number
  free: number
  usage: number
}

export type JvmInfo = {
  total: number
  max: number
  free: number
  used: number
  usage: number
  name: string
  version: string
  startTime: string
  runTime: string
  home: string
  inputArgs: string[]
}

export type SystemInfo = {
  computerName: string
  computerIp: string
  osName: string
  osArch: string
  userDir: string
}

export type SystemFileInfo = {
  dirName: string
  sysTypeName: string
  typeName: string
  total: string
  free: string
  used: string
  usage: number
}

export type ServerStatus = {
  cpu: CpuInfo
  mem: MemoryInfo
  jvm: JvmInfo
  sys: SystemInfo
  sysFiles: SystemFileInfo[]
}

export type ServerStatusResponse = DataResponse<ServerStatus>
