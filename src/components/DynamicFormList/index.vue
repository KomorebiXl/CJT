<!-- src/components/DynamicFormList/index.vue -->
<script setup lang="ts" generic="T extends Record<string, any>">
import { Delete, Plus } from '@element-plus/icons-vue'
import type { DynamicFormListItem } from './dynamicFormList.ts'

const props = defineProps<{
  modelValue: T[]
  items: DynamicFormListItem<T>[]
  /**
   * 可选。不传时组件按 items 自动构建新行（仅覆盖 items 声明过的字段）。
   * 若 T 上存在 items 未覆盖的字段（如 id、隐藏字段），必须显式传入，
   * 否则自动构建出的对象对这些字段而言是残缺的。
   */
  createRow?: () => T
}>()

const emit = defineEmits<{
  'update:modelValue': [value: T[]]
}>()

// 用 WeakMap 给每个行对象分配稳定 key，不污染 T 本身结构
const rowKeyMap = new WeakMap<object, number>()
let keyCounter = 0
const getRowKey = (row: T) => {
  if (!rowKeyMap.has(row)) {
    rowKeyMap.set(row, keyCounter++)
  }
  return rowKeyMap.get(row)!
}

// 兜底构建：仅覆盖 items 里声明过的字段，as T 只是让类型系统闭嘴，
// 不代表运行时对象在 T 的字段集合上是完整的。
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

const handleAdd = () => {
  props.modelValue.push(buildDefaultRow())
  emit('update:modelValue', props.modelValue)
}

const handleRemove = (index: number) => {
  props.modelValue.splice(index, 1)
  emit('update:modelValue', props.modelValue)
}
</script>

<template>
  <div class="dynamic-form-list">
    <div
      v-for="(row, index) in modelValue"
      :key="getRowKey(row)"
      class="dynamic-form-list-row"
    >
      <div
        v-for="item in items"
        :key="item.prop"
        class="dynamic-form-list-item"
      >
        <span v-if="item.label" class="dynamic-form-list-item__label">{{
          item.label
        }}</span>

        <!--
          item.prop 在这里始终是 keyof T & string 这个宽泛类型，
          即便 v-if 收窄了 item 的分支，row[item.prop] 仍拿不到具体字段的类型，
          这是「数组驱动的多态渲染」在 vue-tsc 模板检查下的已知天花板，非笔误。
        -->
        <ScInput
          v-if="item.type === 'input'"
          v-model="row[item.prop] as any"
          :placeholder="item.placeholder"
        />
        <ScInput
          v-else-if="item.type === 'textarea'"
          v-model="row[item.prop] as any"
          type="textarea"
          :rows="item.rows"
          :placeholder="item.placeholder"
        />
        <ScSelect
          v-else-if="item.type === 'select'"
          v-model="row[item.prop] as any"
          :dict-field="item.dictField"
          :options="item.options"
          :placeholder="item.placeholder"
        />
      </div>

      <ScButton
        type="danger"
        text
        :icon="Delete"
        @click="handleRemove(index)"
      />
    </div>

    <ScButton type="primary" :icon="Plus" @click="handleAdd">添加</ScButton>
  </div>
</template>

<style scoped lang="scss">
.dynamic-form-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.dynamic-form-list-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.dynamic-form-list-item {
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>
