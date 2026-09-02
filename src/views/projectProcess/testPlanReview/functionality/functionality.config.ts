/** 功能性（feature='1'）Excel 导入地址 */
export const FUNCTIONALITY_IMPORT_URL = '/asset/plan/import'

/** 功能性导入模板下载地址 */
export const FUNCTIONALITY_TEMPLATE_URL = '/asset/plan/template'

/** 功能性树页导出地址 */
export const FUNCTIONALITY_EXPORT_URL = '/asset/plan/resultExport'

/** 功能性导入/模板下载附加参数 */
export const FUNCTIONALITY_IMPORT_EXTRA_PARAMS = {
  feature: '1',
  subFeature: '1'
}

/** 树页统计列 */
export const FUNCTIONALITY_STAT_COLUMNS: TableColumns = [
  { label: '总数量', prop: 'planTotal' },
  { label: '已完成', prop: 'done' },
  { label: '完成率', prop: 'done1' }
]
