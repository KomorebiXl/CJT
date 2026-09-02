/**
 * 列表响应动态文件列定义（files 项）：
 */
export type DynamicFileColumn = {
  id?: string
  name: string
  field: string
  enable?: string
}

/**
 * 带动态文件列的列表响应
 */
export type DynamicFileListResponse<TRow> = DataResponse<{
  files: Array<DynamicFileColumn>
  result: ListResponse<TRow>
}>
