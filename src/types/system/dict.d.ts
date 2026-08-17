/**
 * 字典选项
 */
export type DictOption = {
  label: string
  value: string
  remark?: string
  disabled?: boolean
}

/**
 * 字典返回类型
 */
export type DictData = {
  dictLabel: string
  dictValue: string
  isDefault?: string
  status?: string
  dictCode: string | number
  dictType?: string
  dictSort?: number
  cssClass?: string
  remark?: string
  listClass?: string
  disabled?: boolean
  createTime?: string
}

export type DictTypeSearchParams = {
  dictName: string
  dictType: string
  status: string
}

export type DictTypeData = {
  dictId: number
  dictName: string
  dictType: string
  status: string
  remark?: string
  createTime: string
}

export type DictTypeFormData = {
  dictName: string
  dictType: string
  status: string
  remark: string
}

export type DictDataSearchParams = {
  dictType: string
  dictLabel: string
  status: string
}

export type DictDataFormData = {
  dictType: string
  dictLabel: string
  dictValue: string
  cssClass: string
  dictSort: number
  listClass: string
  status: string
  remark: string
}
