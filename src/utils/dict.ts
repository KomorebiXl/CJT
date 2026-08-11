import { useDictStore } from '@/store/modules/dict-store.ts'
import type { DictOption } from '@/api/system/dict'

/**
 * 根据字典类型获取字典选项列表
 * @param dictType 字典类型
 * @returns DictOption[]
 */
export const getDictOptions = async (dictType: string) => {
  const dictStore = useDictStore()
  return dictStore.fetchDictOptions(dictType)
}

/**
 * 批量获取多个字典类型的选项列表
 * 并发请求，已缓存的字典不会重复发起请求
 * @param dictTypes 字典类型数组
 * @returns 以 dictType 为 key 的选项 Map
 *
 * @example
 * const map = await getDictOptionsMap(['sys_user_sex', 'sys_normal_disable'])
 * map['sys_user_sex']        // DictOption[]
 * map['sys_normal_disable']  // DictOption[]
 */
export const getDictOptionsMap = async (
  dictTypes: string[]
): Promise<Record<string, DictOption[]>> => {
  const results = await Promise.allSettled(dictTypes.map(type => getDictOptions(type)))
  return Object.fromEntries(
    dictTypes.map((type, i) => {
      const result = results[i]
      if (result.status === 'rejected') {
        console.warn(`[dict] 获取字典失败: ${type}`, result.reason)
        return [type, []]
      }
      return [type, result.value]
    })
  )
}

/**
 * 根据已缓存的字典类型和字典值获取对应的 label
 * 未匹配时回退返回原始 value，适合在模板中直接调用
 * @param dictType 字典类型
 * @param value 字典值
 */
export const getDictLabel = (dictType: string, value: unknown): string => {
  const dictStore = useDictStore()
  const fallback =
    value === undefined || value === null || value === '' ? '--' : String(value)
  const options = dictStore.cache[dictType]
  return (
    options?.find(item => String(item.value) === String(value))?.label ??
    fallback
  )
}

/**
 * 获取字典选项后再返回对应 label，适合非模板的异步场景
 */
export const getDictLabelAsync = async (
  dictType: string,
  value: string
): Promise<string> => {
  const options = await getDictOptions(dictType)
  return options.find(item => item.value === value)?.label ?? value
}

/**
 * 手动清除字典缓存
 * 适用于字典数据更新后需要强制刷新的场景
 * @param dictType 字典类型，不传则清除全部缓存
 */
export const clearDictCache = (dictType?: string) => {
  const dictStore = useDictStore()
  dictStore.clearDictCache(dictType)
}
