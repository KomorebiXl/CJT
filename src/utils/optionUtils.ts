import type { ScSelectOption } from '@/components/ScBaseFormItems/ScSelect'

export interface SelectOptionMapping<T> {
  /** label 取值：单字段名 / 多字段名（非空值以 joinWith 拼接）/ 自定义函数 */
  label: keyof T | Array<keyof T> | ((item: T) => string)
  /** value 取值字段名，要求该字段类型为 string | number */
  value: { [K in keyof T]: T[K] extends string | number ? K : never }[keyof T]
  /** 多字段拼接分隔符，默认空格 */
  joinWith?: string
}

/**
 * 将接口返回的原始数组按字段映射转换为下拉选项（ScSelect / ScSearchbar 通用）
 *
 * label 为多字段名时自动跳过 null/undefined/空字符串后以 joinWith 拼接；
 * label 为自定义函数时格式完全由调用方控制。
 *
 * @template T - 原始数组的元素类型
 * @param list - 接口返回的原始数组，允许 null/undefined
 * @param mapping - 字段映射规则
 * @returns ScSelect 与 ScSearchbar 均可直接使用的 {label, value} 选项数组
 *
 * @example
 * // 多字段拼接：`${item.standardNo} ${item.standardName}`
 * mapSelectOptions(data, { label: ['standardNo', 'standardName'], value: 'id' })
 * @example
 * // 单字段：label 取 name
 * mapSelectOptions(data, { label: 'name', value: 'id' })
 */
export const mapSelectOptions = <T>(
  list: Array<T> | null | undefined,
  mapping: SelectOptionMapping<T>
): Array<ScSelectOption> => {
  const { label, value, joinWith = ' ' } = mapping
  return (list ?? []).map(item => ({
    label:
      typeof label === 'function'
        ? label(item)
        : (Array.isArray(label) ? label : [label])
            .map(key => item[key])
            .filter(part => part !== null && part !== undefined && part !== '')
            .join(joinWith),
    value: item[value] as ScSelectOption['value']
  }))
}
