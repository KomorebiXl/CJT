import type { UploadFile } from 'element-plus'

export interface ScUploadDraggerProps {
  /** 接受的文件扩展名数组，如 ['.xlsx', '.pdf']；缺省时给一套常用默认 */
  accept?: string[]
  multiple?: boolean
  /** 自定义提示文案；缺省时基于 accept 自动生成「仅支持 xxx 格式」 */
  hint?: string
}

export interface ScUploadDraggerEmits {
  /**
   * 转发 el-upload 的 on-change 完整签名 —
   * 单参数消费者取第一个即可，需要文件列表全貌的消费者用第二个
   */
  (e: 'change', file: UploadFile, fileList: UploadFile[]): void
}

/** 通过 defineExpose 转发的 el-upload 常用方法 */
export interface ScUploadDraggerInstance {
  clearFiles: () => void
  handleRemove: (file: UploadFile) => void
}
