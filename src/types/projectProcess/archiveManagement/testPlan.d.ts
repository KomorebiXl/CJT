/** 测试方案搜索参数 */
export type TestPlanSearchParams = {
  /** 测试方案名称 */
  name: string
}

/** 测试方案行 */
export type TestPlanData = {
  /** 测试方案名称（作为下载文件名） */
  name: string
  /** 生成人 */
  createByName: string
} & CommonTableData

/** 测试方案列表响应：language 为语言类型回显（弹窗回填与操作栏 Tag 展示） */
export type TestPlanListResponse = DataResponse<Array<TestPlanData>> & {
  language?: Array<string>
}

/** 生成测试方案响应：confirmStep 存在表示服务端要求二次确认，msg 为确认提示 */
export type GenerateTestPlanResponse = BaseResponse & {
  confirmStep?: number
  /** 生成的方案文件路径 */
  reportPath?: string
}

/** 语言类型设置参数 */
export type UpdateSubjectPlanLanguageParams = {
  subjectId: string
  /** 语言类型多选数组 */
  testCategory: Array<string>
}
