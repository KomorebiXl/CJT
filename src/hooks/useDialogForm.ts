import { ScMessage } from '@/utils/ElUtils'
import { assignObject } from '@/utils/object.ts'

export const useDialogForm = <
  T extends Record<string, any>,
  K extends string = 'id',
  IdType extends string | number = string,
  R = T & Partial<Record<K, IdType>>
>(options: {
  defaultFormData: T
  title: string
  idKey?: K
  fetchDetail?: (id: IdType) => Promise<any>
  /** 提交前将表单数据转换为实际请求体（如 FormData）；编辑场景在注入 id 之后执行，id 会随请求体一起发送 */
  transformRequest?: (data: T & Partial<Record<K, IdType>>) => R
  onCreate?: (data: R) => Promise<any>
  onUpdate: (data: R & Record<K, IdType>) => Promise<any>
  onSuccess?: () => void
  beforeOpen?: (formData: T, row?: any) => void | Promise<void>
}) => {
  const idKey = (options.idKey ?? 'id') as K
  const visible = ref(false)
  const formData = reactive<T>({ ...options.defaultFormData })
  const confirmLoading = ref(false)
  const currentId = ref<IdType>()

  const open = async (row?: any, presetData?: Partial<T>) => {
    assignObject(formData, JSON.parse(JSON.stringify(options.defaultFormData)))
    currentId.value = undefined
    if (row) {
      currentId.value = row[idKey]
      if (options.fetchDetail) {
        const { data } = await options.fetchDetail(row[idKey])
        assignObject(formData, data)
      } else {
        assignObject(formData, row)
      }
    }
    if (presetData) assignObject(formData, presetData)
    await options.beforeOpen?.(formData as T, row)
    visible.value = true
  }

  const handleConfirm = async (data: Record<string, any>) => {
    confirmLoading.value = true
    try {
      const params = data as T
      let submitData: T & Partial<Record<K, IdType>> = params
      if (currentId.value !== undefined) {
        submitData = { ...params, [idKey]: currentId.value }
      }
      const body = (
        options.transformRequest
          ? options.transformRequest(submitData)
          : submitData
      ) as R
      if (currentId.value !== undefined) {
        await options.onUpdate(body as R & Record<K, IdType>)
      } else {
        if (!options.onCreate) {
          throw new Error(
            '[useDialogForm] 当前是新增场景，但未提供 onCreate函数'
          )
        }
        await options.onCreate(body)
      }
      visible.value = false
      ScMessage.success(
        `${currentId.value !== undefined ? '修改' : '新增'}成功`
      )
      options.onSuccess?.()
    } finally {
      confirmLoading.value = false
    }
  }

  const dialogTitle = computed(() =>
    currentId.value !== undefined
      ? `编辑${options.title}`
      : `新增${options.title}`
  )

  return { visible, formData, confirmLoading, dialogTitle, open, handleConfirm }
}
