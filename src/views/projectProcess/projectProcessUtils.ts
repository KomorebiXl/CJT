/**
 * 验收测评结果 FormData 构造器。
 * 两函数契约不同，勿互替、勿合并：
 * - buildResultFormData 提交
 * - convertToResultFormData 提交，
 *   回归测试模块落地后同此取用
 */

const isPlainObject = (val: unknown): val is Record<string, any> =>
  Object.prototype.toString.call(val) === '[object Object]'

const isEmptyValue = (val: unknown) =>
  val === null ||
  val === undefined ||
  (Array.isArray(val) && val.length === 0) ||
  (isPlainObject(val) && Object.keys(val).length === 0)

/**
 * objectToFormData 不等价，勿替换：
 * 空值整体跳过；File[] 同名重复追加；对象数组按 key[i].prop 展开且不回传
 * image（base64 仅用于回显）；其余值 String() 后追加
 */
export const buildResultFormData = (data: Record<string, any>): FormData => {
  const formData = new FormData()
  const appendValue = (key: string, value: unknown) => {
    if (value instanceof File) {
      formData.append(key, value)
    } else {
      formData.append(key, String(value))
    }
  }
  Object.entries(data).forEach(([key, value]) => {
    if (isEmptyValue(value)) return
    if (value instanceof File) {
      appendValue(key, value)
      return
    }
    if (Array.isArray(value) && value.every(v => v instanceof File)) {
      value.forEach(file => appendValue(key, file))
      return
    }
    if (Array.isArray(value) && value.every(isPlainObject)) {
      value.forEach((item, index) => {
        Object.entries(item).forEach(([prop, propValue]) => {
          if (prop === 'image') return
          if (isEmptyValue(propValue)) return
          appendValue(`${key}[${index}].${prop}`, propValue)
        })
      })
      return
    }
    if (Array.isArray(value)) {
      value.forEach(item => {
        if (isEmptyValue(item)) return
        appendValue(key, item)
      })
      return
    }
    appendValue(key, value)
  })
  return formData
}

/**
 * 仅跳过 null/undefined（空串照传）；数组一律键名索引；fileProps 对象数组按
 * key[i].prop 展开且不回传 image（base64 仅用于回显）；普通对象按 key.prop 展开
 */
export const convertToResultFormData = (
  data: Record<string, any>,
  fileProps: string[]
): FormData => {
  const formData = new FormData()
  const appendToFormData = (
    key: string,
    value: any,
    isFileProp: boolean = false
  ) => {
    if (value === null || value === undefined) return
    if (value instanceof File) {
      formData.append(key, value)
      return
    }
    if (Array.isArray(value)) {
      if (value.length === 0) return
      value.forEach((item, index) => {
        if (isFileProp && isPlainObject(item)) {
          Object.keys(item).forEach(prop => {
            if (prop === 'image') return
            appendToFormData(`${key}[${index}].${prop}`, item[prop])
          })
        } else {
          appendToFormData(`${key}[${index}]`, item, false)
        }
      })
      return
    }
    if (isPlainObject(value)) {
      Object.keys(value).forEach(prop => {
        appendToFormData(`${key}.${prop}`, value[prop])
      })
      return
    }
    formData.append(key, String(value))
  }
  Object.keys(data).forEach(key => {
    appendToFormData(key, data[key], fileProps.includes(key))
  })
  return formData
}
