/** 系统组件与单元资产 - 搜索参数 */
export type SystemComponentAndUnitAssetSearchParams = {
  /** 资产编号 */
  assetNo?: string
  /** 资产名称 */
  assetName?: string
}

/** 系统组件与单元资产 - 列表数据 */
export type SystemComponentAndUnitAssetData = {
  /** 资产编号 */
  assetNo: string
  /** 资产名称 */
  assetName: string
  /** 资产二级分类 */
  assetSecondType: string
  /** 资产二级分类展示 */
  assetSecondTypeLabel?: string
  /** 资产三级分类 */
  assetThirdType: string
  /** 资产三级分类展示 */
  assetThirdTypeLabel?: string
  /** 资产位置 */
  assetAddress: string
  /** 资产 IP 地址 */
  ipAddress: string
  /** 所属部门 */
  responsibleDept: string
  /** 责任人 */
  responsibleUser: string
  /** 系统资产价值赋值 */
  assetValue: string
  /** 重要程度 */
  importLevel: string
  /** 保密性 */
  confidentiality: string
  /** 完整性 */
  integrity: string
  /** 可用性 */
  usability: string
  /** 指导书名称 */
  guideName: string
} & CommonTableData

/** 系统组件与单元资产 - 表单数据 */
export type SystemComponentAndUnitAssetFormData = {
  /** 资产二级分类（由页面 radio 选择，随请求自动携带） */
  assetSecondType?: string
  /** 资产三级分类 */
  assetThirdType: string
  /** 资产编号 */
  assetNo: string
  /** 资产名称 */
  assetName: string
  /** 资产位置 */
  assetAddress: string
  /** 保密性 */
  confidentiality: string
  /** 完整性 */
  integrity: string
  /** 可用性 */
  usability: string
  /** 指导书 id */
  guideId: string
  /** 系统组件与单元资产类型（固定传 4） */
  assetType?: string
}

/** 指导书下拉选项（getGuideOption 返回数据） */
export type GuideOption = {
  id: string
  guideName: string
}
