export type ReferenceBasisSearchParams = {
  /** 标准编号 */
  standardNo?: string
  /** 标准名称 */
  standardName?: string
  /** 使用类型 */
  useType?: string
}

export type ReferenceBasisData = {
  /** 标准 id */
  standardId: string
  /** 标准编号 */
  standardNo: string
  /** 标准名称 */
  standardName: string
  /** 颁布部门 */
  promulgationDept: string
  /** 颁布时间 */
  promulgationDate: string
  /** 实施时间 */
  implementationDate: string
  /** 使用类型 */
  useType: string
  /** 使用类型标签 */
  useTypeLabel: string
} & CommonTableData

export type ReferenceBasisFormData = {
  /** 标准 id */
  standardId: string
  /** 使用类型 */
  useType: string
}
