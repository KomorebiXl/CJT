/** 技能管理-搜索参数 */
export type SkillsManagementSearchParams = {
  /** 技能编码 */
  skillCode?: string
  /** 技能名称 */
  name?: string
}

/** 技能管理-行数据（ai_skill） */
export type SkillsManagementData = {
  /** 技能编码（如 test_case_expand） */
  skillCode: string
  /** 技能名称 */
  name: string
  /** 提示词模板（占位符：${item}/${precondition}/${step}/${subjectName}/${subsystemName}） */
  promptTemplate: string
  /** 采样温度（0-2，空=用 DeepSeek 端默认） */
  temperature: number | null
  /** 核采样 top_p（0-1，空=用 DeepSeek 端默认） */
  topP: number | null
  /** 最大输出 tokens（1-8192，空=用 DeepSeek 端默认） */
  maxTokens: number | null
  /** 启用标志（1启用 0停用） */
  enable: number
  /** 备注 */
  remark: string
  /** 更新时间 */
  updateTime: string
} & CommonTableData

/** 技能管理-表单数据 */
export type SkillsManagementFormData = {
  skillCode: string
  name: string
  promptTemplate: string
  temperature?: number | null
  topP?: number | null
  maxTokens?: number | null
  enable: number
  remark?: string
}
