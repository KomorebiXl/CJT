<script setup lang="ts" generic="T extends Record<string, any>">
import type { DynamicFormListItem } from './dynamicFormList.ts'

const props = withDefaults(
  defineProps<{
    modelValue: boolean
    mode: 'add' | 'edit'
    /** 编辑时的初始值；新增时传 null */
    initialRow: T | null
    items: DynamicFormListItem<T>[]
    createRow?: () => T
    title?: string
    width?: string | number
  }>(),
  { width: '600px' }
)

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  confirm: [row: T]
}>()

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (val: boolean) => emit('update:modelValue', val)
})

// 用 Record 承载内部表单数据：泛型 T 在 ref 解包后无法按 keyof T 索引，
// 提交时再整体交还给调用方的 T
const formData = ref<Record<string, any>>({})

// 兜底构建：仅覆盖 items 里声明过的字段，as T 只是让类型系统闭嘴
const buildDefaultRow = (): T => {
  if (props.createRow) return props.createRow()

  return props.items.reduce(
    (acc, item) => {
      acc[item.prop] = item.defaultValue
      return acc
    },
    {} as Record<string, any>
  ) as T
}

// 打开时初始化内部数据（编辑深拷贝，避免弹窗内改动直接反映到列表）；关闭时清空
watch(
  () => props.modelValue,
  open => {
    if (!open) {
      formData.value = {}
      return
    }
    formData.value =
      props.mode === 'edit' && props.initialRow
        ? structuredClone(toRaw(props.initialRow))
        : buildDefaultRow()
  },
  { immediate: true }
)

const handleConfirm = () => {
  emit('confirm', formData.value as T)
  dialogVisible.value = false
}
</script>

<template>
  <ScDialog
    v-model="dialogVisible"
    :title="title"
    :dialog-width="width"
    :close-on-click-modal="false"
    @confirm="handleConfirm"
  >
    <el-form label-position="top" class="dynamic-form-list-dialog__form">
      <el-form-item v-for="item in items" :key="item.prop" :label="item.label">
        <ScInput
          v-if="item.type === 'input'"
          v-model="formData[item.prop]"
          :placeholder="item.placeholder"
        />
        <ScInput
          v-else-if="item.type === 'textarea'"
          v-model="formData[item.prop]"
          type="textarea"
          :rows="item.rows ?? 4"
          :placeholder="item.placeholder"
        />
        <ScSelect
          v-else-if="item.type === 'select'"
          v-model="formData[item.prop]"
          :options="item.options"
          :dict-field="item.dictField"
          :placeholder="item.placeholder"
        />
      </el-form-item>
    </el-form>
  </ScDialog>
</template>

<style scoped lang="scss">
.dynamic-form-list-dialog__form {
  :deep(.el-form-item) {
    margin-bottom: 16px;
    &:last-child {
      margin-bottom: 0;
    }
  }
  :deep(.el-form-item__label) {
    padding-bottom: 4px;
  }
}
</style>
