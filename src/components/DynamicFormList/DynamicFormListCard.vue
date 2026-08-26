<script setup lang="ts" generic="T extends Record<string, any>">
import { Delete, Edit } from '@element-plus/icons-vue'
import type { DynamicFormListItem } from './dynamicFormList.ts'
import ClampText from './ClampText.vue'
import { getDictLabel, getDictOptions } from '@/utils/dict.ts'

const props = defineProps<{
  row: T
  items: DynamicFormListItem<T>[]
  index: number
}>()

const emit = defineEmits<{
  edit: []
  remove: []
}>()

const slots = useSlots()

const isEmptyValue = (value: unknown) =>
  value === '' || value === null || value === undefined
/** 只读展示文案：select 需把 value 翻译成 label（options 优先，其次字典，均未命中回退原始值） */
const getDisplayValue = (item: DynamicFormListItem<T>): string => {
  const value = props.row[item.prop]
  if (item.type !== 'select') return String(value ?? '')
  if (item.options?.length) {
    return (
      item.options.find(o => String(o.value) === String(value))?.label ??
      String(value)
    )
  }
  if (item.dictField) return getDictLabel(item.dictField, value)
  return String(value)
}

/** 只读截断行数：textarea 默认 3，其余默认 1 */
const getClampLines = (item: DynamicFormListItem<T>) =>
  item.viewClamp ?? (item.type === 'textarea' ? 3 : 1)

// 预热字典缓存，让 getDictLabel 能翻译出 label
onMounted(() => {
  props.items.forEach(item => {
    if (item.type === 'select' && item.dictField && !item.options?.length) {
      void getDictOptions(item.dictField)
    }
  })
})
</script>

<template>
  <div class="dynamic-form-list-card">
    <div class="dynamic-form-list-card__header">
      <slot
        v-if="slots.header"
        name="header"
        :row="row"
        :index="index"
        :on-edit="() => emit('edit')"
        :on-remove="() => emit('remove')"
      />
      <template v-else>
        <span class="dynamic-form-list-card__no">#{{ index + 1 }}</span>
        <slot name="header-extra" :row="row" :index="index" />
        <span class="dynamic-form-list-card__actions">
          <ScButton text :icon="Edit" @click="emit('edit')" />
          <ScButton text type="danger" :icon="Delete" @click="emit('remove')" />
        </span>
      </template>
    </div>
    <div class="dynamic-form-list-card__body">
      <div
        v-for="item in items"
        :key="item.prop"
        class="dynamic-form-list-card__field"
      >
        <span class="dynamic-form-list-card__label">{{ item.label }}</span>
        <div class="dynamic-form-list-card__value">
          <slot
            v-if="slots[`view-${item.prop}`]"
            :name="`view-${item.prop}`"
            :row="row"
            :index="index"
            :value="row[item.prop]"
            :item="item"
          />
          <span
            v-else-if="isEmptyValue(row[item.prop])"
            class="dynamic-form-list-card__empty"
          >
            --
          </span>
          <ClampText
            v-else
            :content="getDisplayValue(item)"
            :lines="getClampLines(item)"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.dynamic-form-list-card {
  padding: 12px 16px;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-light);
  border-radius: 8px;
  transition: box-shadow 0.2s;

  &:hover {
    box-shadow: var(--el-box-shadow-lighter);
  }

  &__header {
    display: flex;
    align-items: center;
    gap: 8px;
    padding-bottom: 8px;
    margin-bottom: 12px;
    border-bottom: 1px solid var(--el-border-color-lighter);
  }

  &__no {
    font-weight: 600;
    color: var(--el-text-color-secondary);
  }

  &__actions {
    display: flex;
    gap: 4px;
    margin-left: auto;
  }

  &__body {
    display: grid;
    grid-template-columns: 80px 1fr;
    column-gap: 12px;
    row-gap: 8px;
  }

  &__field {
    display: contents;
  }

  &__label {
    color: var(--el-text-color-secondary);
    line-height: 1.6;
  }

  &__value {
    min-width: 0;
    color: var(--el-text-color-primary);
  }

  &__empty {
    color: var(--el-text-color-placeholder);
  }
}
</style>
