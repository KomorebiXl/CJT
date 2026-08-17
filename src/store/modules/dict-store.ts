import { ref } from 'vue'
import { defineStore } from 'pinia'
import { getDictDataByDictType } from '@/api/system/dict-api.ts'
import type { DictData, DictOption } from '@/types/system/dict'

export const useDictStore = defineStore('dict', () => {
  const cache = ref<Record<string, DictOption[]>>({})

  /**
   * 将 DictData 数组映射为 label/value 格式
   */
  const mapDictData = (data: DictData[]): DictOption[] => {
    return data.map(item => ({
      label: item.dictLabel,
      value: item.dictValue,
      remark: item.remark,
      disabled: item.disabled
    }))
  }

  /**
   * 根据字典类型获取字典选项列表
   * 优先从缓存中读取，缓存未命中时发起请求
   */
  const fetchDictOptions = async (dictType: string): Promise<DictOption[]> => {
    if (cache.value[dictType]) {
      return cache.value[dictType]
    }

    const res = await getDictDataByDictType(dictType)
    const options = mapDictData(res.data)

    cache.value[dictType] = options
    return options
  }

  /**
   * 清除指定字典类型的缓存，不传参则清除全部
   */
  const clearDictCache = (dictType?: string) => {
    if (dictType) {
      delete cache.value[dictType]
    } else {
      cache.value = {}
    }
  }

  return { cache, fetchDictOptions, clearDictCache }
})
