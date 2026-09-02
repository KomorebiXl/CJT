export interface ScBaseUploadProps {
  modelValue: boolean
  uploadConfig: ScUploadConfig
  templateConfig?: ScTemplateConfig
  title?: string
  uploadFn?: (files: Array<File>) => Promise<any>
  uploadExtraParams?: Record<string, any>
}

export interface ScBaseUploadEmits {
  (e: 'update:modelValue', val: boolean): void
  (e: 'uploadSuccess', response: any): void
}

export interface ScUploadConfig {
  uploadUrl: string
  headers?: Record<string, string>
  accept?: string[]
  multiple?: boolean
  successMsg?: string
  /**
   * 自定义成功反馈文案；
   * 返回非空字符串 → 弹窗保留、以反馈区展示，等待用户手动关闭；
   * 返回空串 / 未配置 → 走默认自动关闭 + ScMessage 提示。
   */
  formatSuccessMessage?: (response: any) => string
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

export type FeedbackType = 'success' | 'error'

export interface UploadFeedback {
  type: FeedbackType
  message: string
}
