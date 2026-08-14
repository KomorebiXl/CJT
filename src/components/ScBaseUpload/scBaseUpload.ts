export interface ScBaseUploadProps {
  modelValue: boolean
  uploadConfig: ScUploadConfig
  templateConfig?: ScTemplateConfig
  title?: string
  uploadFn?: (files: Array<File>) => Promise<void>
  uploadExtraParams?:Record<string, any>
}

export interface ScBaseUploadEmits {
  (e: 'update:modelValue', val: boolean): void
  (e: 'uploadSuccess'): void
}

export interface ScUploadConfig {
  uploadUrl: string
  headers?: Record<string, string>
  accept?: string[]
  multiple?: boolean
  successMsg?: string
}

export interface ScTemplateItem {
  /** 按钮文案 */
  label: string
  /** 下载保存的文件名，缺省时使用「弹窗标题 + 模板」 */
  fileName?: string
  /** 该模板独有的下载参数，与 uploadExtraParams 合并后发送 */
  extraParams?: Record<string, any>
}

export interface ScTemplateConfig {
  templateUrl: string
  requestMethod: 'GET' | 'POST'
  showTemplateDownload?: boolean
  /** 多模板下载列表；配置后模板栏渲染多个下载按钮，未配置时保持单个「下载模板」 */
  templates?: Array<ScTemplateItem>
}

export type UploadFileStatus = 'pending' | 'uploading' | 'success' | 'error'

export interface ScUploadFileItem {
  uid: number
  file: File
  name: string
  size: number
  status: UploadFileStatus
  errorMsg?: string
}
