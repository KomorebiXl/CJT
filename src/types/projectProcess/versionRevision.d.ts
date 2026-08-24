export type VersionRevisionData = {
  /** 版本号 */
  versionNum: string
  /** 修改内容摘要 */
  operateContent: string
  /** 修改人 */
  operatorName: string
  /** 修改日期 */
  operateDate: string
} & CommonTableData

export type VersionRevisionFormData = {
  /** 版本号 */
  versionNum: string
  /** 修改内容摘要 */
  operateContent: string
  /** 修改人（用户 id） */
  operator: string
  /** 修改日期 */
  operateDate: string
}
