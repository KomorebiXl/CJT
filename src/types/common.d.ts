/* 通用文件类型 */
export interface FileItem {
  id: string
  file: File
  url: string
  formattedName: string
  originalName: string
  image?: string
  fileType?: string
}
