/** 测试对象文档搜索参数 */
export type TestObjectDocumentSearchParams = {
  /** 文档名称 */
  documentName: string
  /** 递交方式（字典 submission_method） */
  submitMethod: string
  /** 文档类型（字典 document_type） */
  type: string
}

/** 测试对象文档行 */
export type TestObjectDocumentData = {
  id: string
  /** 文档名称 */
  documentName: string
  /** 递交方式（字典 submission_method） */
  submitMethod: string
  /** 递交方式展示值（源类型未声明，按接口返回补齐） */
  submitMethodLabel?: string
  /** 文档类型（字典 document_type） */
  type: string
  /** 文档类型展示值（源类型未声明，按接口返回补齐；remark 有值时列展示优先 remark） */
  typeLabel?: string
  /** 备注（文档类型为 '500' 时填写） */
  remark?: string
  /** 文档排序（行内编辑后为字符串，随源行为原样提交） */
  sort: number | string
}

/** 测试对象文档表单 */
export type TestObjectDocumentFormData = {
  /** 文档名称 */
  documentName: string
  /** 文档排序 */
  sort: number
  /** 递交方式（字典 submission_method） */
  submitMethod: string
  /** 文档类型（字典 document_type） */
  type: string
  /** 备注（仅文档类型为 '500' 时显示） */
  remark: string
}

/** 测试对象文档更新入参（弹窗表单提交或排序失焦传整行） */
export type TestObjectDocumentUpdatePayload = {
  id: string
  /** 文档名称 */
  documentName: string
  /** 递交方式（字典 submission_method） */
  submitMethod: string
  /** 文档类型（字典 document_type） */
  type: string
  /** 行内编辑后可能为字符串，随源行为原样提交 */
  sort: number | string
  /** 备注 */
  remark?: string
}
