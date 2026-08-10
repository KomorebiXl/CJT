/**
 * @description 用户/角色关联项
 */
export type SubjectRoleUser = {
  subjectRoleId: string
  userId: string
}

/**
 * @description 评估时间项
 */
export type TestTimeItem = {
  testStart: string
  testEnd: string
}

/**
 * @description 项目管理数据
 */
export type ProjectManagementData = {
  id: number
  code: string
  name: string
  assessAddress: string
  assessMethodLabel: string
  typeLabel: string
  reportCreatorName: string
  assessResult: string
  commissionUnitAddress: string
  accordanceFileType: string[]
  assessContent: string
  assessMethod: string[]
  commissionUnitName: string
  constructionDept: string
  contractorName: string
  description: string
  designUnit: string
  ifUsePlanStealer: string
  ifUseResultStealer: string
  largeType: string
  planCreatorName: string
  precautions: string
  reportName: string
  reportTime: string
  reportType: string
  reportTypeLabel: string
  scene: string
  supervisionUnit: string
  testCategory: string
  type: string[]
  validatePlan: string
}

/**
 * @description 项目管理搜索参数
 */
export type ProjectManagementSearchParams = {
  code: string
  name: string
  largeType: string
  type: string
}

/**
 * @description 项目管理表单数据
 */
export type ProjectManagementFormData = {
  code: string
  name: string
  largeType: string
  type: string[]
  ifUsePlanStealer: string | null
  ifUseResultStealer: string | null
  accordanceFileType: string[]
  reportType: string
  scene: string
  seal: string
  assessMethod: string[]
  designUnit: string
  validatePlan: string
  projectStatus: string
  subjectRoleUsers: SubjectRoleUser[]
  testTimes: TestTimeItem[]
  reportCreator: string
  reportTime: string
  assessAddress: string
  planCreator: string
  planTime: string
  supervisionUnit: string
  constructionDept: string
  contractorName: string
  commissionUnitName: string
  commissionUnitAddress: string
}
