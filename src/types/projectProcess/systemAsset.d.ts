/** 系统资产 - 搜索参数 */
export type SystemAssetSearchParams = {
  /** 资产编号 */
  assetNo?: string
  /** 资产名称 */
  assetName?: string
}

/** 系统资产 - 列表数据 */
export type SystemAssetData = {
  /** 资产编号 */
  assetNo: string
  /** 资产名称 */
  assetName: string
  /** 资产二级分类 */
  assetSecondType: string
  /** 资产二级分类展示 */
  assetSecondTypeLabel?: string
  /** 资产位置 */
  assetAddress: string
  /** 资产 IP 地址 */
  ipAddress: string
  /** 所属部门 */
  responsibleDept: string
  /** 责任人 */
  responsibleUser: string
  /** 重要程度 */
  importLevel: string
  /** 系统资产价值赋值 */
  assetValue: string
  /** 保密性 */
  confidentiality: string
  /** 完整性 */
  integrity: string
  /** 可用性 */
  usability: string
  /** 业务承载性赋值 */
  businessAssignment: string
  /** 指导书名称 */
  guideName: string
} & CommonTableData

/** 系统资产 - 表单数据 */
export type SystemAssetFormData = {
  /** 系统资产编号 */
  assetNo: string
  /** 系统资产名称 */
  assetName: string
  /** 系统资产分类（二级） */
  assetSecondType: string
  /** 资产位置 */
  assetAddress: string
  /** 资产 IP 地址 */
  ipAddress: string
  /** 所属部门 */
  responsibleDept: string
  /** 责任人 */
  responsibleUser: string
  /** 保密性 */
  confidentiality: string
  /** 完整性 */
  integrity: string
  /** 可用性 */
  usability: string
  /** 业务承载性赋值 */
  businessAssignment: string
  /** 指导书 id */
  guideId: string
  /** 系统资产类型（固定传 3） */
  assetType?: string
}

/** 指导书下拉选项（getGuideOption 返回数据） */
export type GuideOption = {
  id: string
  guideName: string
  securityAspect: string
  standardId: string
  attribute: string
  standardType: string
  importanceLevel: string
  weight: string
  securityPoint: string
  evaluationItem: string
  evaluationContent: string
  checkMethod: string
  recommendedValue: string
  judgmentCriteria: string
}
