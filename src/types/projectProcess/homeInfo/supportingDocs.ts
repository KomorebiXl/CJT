/** 支持性文件搜索参数 */
export type SupportingDocsSearchParams = {
  /** 文件名 */
  fileName: string
}

/** 支持性文件行 */
export type SupportingDocsData = {
  id: string
  /** 文件名 */
  fileName: string
  /** 文件别名 */
  nickName: string
  /** 文件大小（字节） */
  fileSize: number
  /** 上传时间 */
  createTime: string
}

/** 支持性文件别名编辑表单 */
export type SupportingDocsFormData = {
  /** 文件别名 */
  nickName: string
}

/** 关联问题搜索参数 */
export type SupportingDocsQuestionSearchParams = {
  /** 序号 */
  serialNumber: string
  /** 测试项 */
  item: string
  /** 特性（字典 parent_property 值） */
  feature: string
  /** 子特性（字典 sub_property 值） */
  subFeature: string
  /** 子系统名称 */
  subsystemName: string
}

/** 关联问题行 */
export type SupportingDocsQuestionData = {
  id: string
  /** 序号 */
  serialNumber: string
  /** 测试项 */
  item: string
  /** 特性 */
  featureLabel: string
  /** 子特性 */
  subFeatureLabel: string
  /** 子系统名称 */
  subsystemName: string
  /** 首次问题描述 */
  firstProblem: string
}

/** 子系统下拉选项 */
export type SupportingDocsSubsystemOption = {
  id: string
  /** 子系统名称 */
  name: string
}

/** 保存关联问题参数 */
export type SaveSupportingDocsRelationParams = {
  /** 选中的问题行 id 集合 */
  assetAcceptanceResultIds: Array<string>
  /** 支持性文件 id */
  fileId: string
}
