export type ArchiveMaterialsSearchParams = {
  /** 归档资料名称 */
  name: string
}

export type ArchiveMaterialsData = {
  /** 归档资料名称（作为下载文件名） */
  name: string
  /** 生成人 */
  createByName: string
} & CommonTableData

/** 生成归档资料响应：confirmStep 存在表示服务端要求二次确认，msg 为确认提示 */
export type GenerateArchiveResponse = BaseResponse & {
  confirmStep?: number
  /** 生成的归档文件路径 */
  reportPath?: string
}
