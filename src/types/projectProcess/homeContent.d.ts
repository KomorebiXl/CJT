/**
 * 主页内容表单类型。
 * 源类型的 testTimes 字段（测试日期区间）渲染与增删逻辑均为注释死代码，不迁移。
 * assessMethod 源类型误标为 string，同端点既有类型 ProjectManagementData 声明为 string[]，已定案为数组。
 */
export type HomeContentForm = {
  /** 项目名称 */
  name: string
  /** 测试类别（默认文案「验收测试」仅在为空时填充） */
  testCategory: string
  /** 委托单位名称 */
  commissionUnitName: string
  /** 委托单位地址 */
  commissionUnitAddress: string
  /** 建设单位 */
  constructionDept: string
  /** 施工单位 */
  contractorName: string
  /** 设计单位 */
  designUnit: string
  /** 监理单位 */
  supervisionUnit: string
  /** 测试地址 */
  assessAddress: string
  /** 测试方式（字典 background_subject_test_method，多选；类型按同端点 ProjectManagementData 契约定案 string[]） */
  assessMethod: string[]
  /** 项目描述（仅 largeType === '10' 显示） */
  description: string
  /** 测试结论（仅 largeType === '10' 显示） */
  assessResult: string
  /** 报告时间（YYYY-MM-DD） */
  reportTime: string
  /** 报告编制人（选项来自 /system/user/list/option） */
  reportCreator: string
  /** 测试报告（默认文案恒置「测 试 报 告」） */
  reportName: string
  /** 软件版本号（仅 reportType === '10-2' 显示） */
  version: string
  /** 使用场景（字典 background_subject_scene，仅 largeType !== '10' 显示） */
  scene: string
  /** 注意事项（按报告类型两套默认文案，||= 不覆盖已有内容） */
  precautions: string
  /** 测试内容及方法（默认文案含项目名称） */
  assessContent: string
  /** 业务大类（字段显隐驱动，不渲染为表单项） */
  largeType?: string
  /** 报告类型（默认文案与显隐驱动，不渲染为表单项） */
  reportType: string
  /** 测试日期只读展示（页头标签，空值显示「无」） */
  showTestDate: string
}
