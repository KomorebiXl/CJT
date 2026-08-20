<script setup lang="ts">
import type { ScBaseFormInstance, ScBaseFormProps } from './types/scBaseForm.ts'
import type { FormInstance, FormRules } from 'element-plus'
import {
  ScInput,
  ScSelect,
  ScRadio,
  ScCheckbox,
  ScSwitch,
  ScDatePicker,
  ScDateRangePicker,
  ScTreeSelect,
  ScTree,
  ScCascader
} from '../ScBaseFormItems'
import { ArrowUp } from '@element-plus/icons-vue'
import type { ScBaseFormItem } from '@/components/ScBaseForm/types/formItem.ts'

defineOptions({ name: 'ScBaseForm' })

const props = withDefaults(defineProps<ScBaseFormProps>(), {
  labelWidth: '110px',
  inline: false,
  isGroup: false,
  columns: 2
})

// 表单规则
const formRules = computed<FormRules>(() => {
  return props.formItems.reduce((acc, item) => {
    if (item.rules) {
      const resolvedRules =
        typeof item.rules === 'function'
          ? item.rules(props.modelValue)
          : item.rules
      acc[item.prop] = Array.isArray(resolvedRules)
        ? resolvedRules
        : [resolvedRules]
    }
    return acc
  }, {} as FormRules)
})

// 组件映射表
const componentMap = {
  input: ScInput,
  select: ScSelect,
  date: ScDatePicker,
  dateRange: ScDateRangePicker,
  radio: ScRadio,
  checkbox: ScCheckbox,
  switch: ScSwitch,
  treeSelect: ScTreeSelect,
  tree: ScTree,
  cascader: ScCascader
} as const

const scBaseFormRef = useTemplateRef<FormInstance>('scBaseFormRef')

// 分组聚合
const DEFAULT_GROUP = '基本信息'

// 计算分组表单项
const groupedItems = computed(() => {
  if (!props.isGroup) return null
  const map = new Map<string, typeof props.formItems>()
  props.formItems.forEach(item => {
    const key = item.groupName ?? DEFAULT_GROUP
    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(item)
  })
  return map
})

// 折叠状态
const collapsedMap = reactive<Record<string, boolean>>({})

// 初始化展开/收缩
const initCollapsedMap = () => {
  if (!groupedItems.value) return
  groupedItems.value.forEach((_, groupName) => {
    if (!(groupName in collapsedMap)) {
      collapsedMap[groupName] = false
    }
  })
}

watch(groupedItems, initCollapsedMap, { immediate: true })

const toggleGroup = (groupName: string) => {
  collapsedMap[groupName] = !collapsedMap[groupName]
}

const isItemVisible = (item: ScBaseFormItem) => {
  return !item.hide?.(props.modelValue)
}

const hasVisibleItems = (items: ScBaseFormItem[]) => {
  return items.some(isItemVisible)
}

// 表单校验处理
const handleValidate = async () => {
  try {
    return await scBaseFormRef.value!.validate()
  } catch (errors: any) {
    Object.keys(errors).forEach(prop => {
      const item = props.formItems.find(i => i.prop === prop)
      const key = item?.groupName ?? DEFAULT_GROUP
      if (key in collapsedMap) {
        collapsedMap[key] = false
      }
    })
    throw errors
  }
}

// 收集每个表单项对应的组件实例
const itemRefs = reactive<Record<string, any>>({})

const setItemRef = (prop: string, el: any) => {
  if (el) {
    itemRefs[prop] = el
  } else {
    delete itemRefs[prop]
  }
}

const getItemRef = <T = any,>(prop: string): T => itemRefs[prop]

// 解析label
const resolveLabel = (item: ScBaseFormItem) => {
  return typeof item.label === 'function'
    ? item.label(props.modelValue)
    : item.label
}

const INPUT_LIKE_TYPES = ['input'] as const
const SELECT_LIKE_TYPES = [
  'select',
  'date',
  'dateRange',
  'tree',
  'cascader'
] as const

// 解析placeholder
const resolvePlaceholder = (item: ScBaseFormItem) => {
  const existing = (item as any).componentProps?.placeholder
  if (existing) return existing

  const label = resolveLabel(item)
  if (!label) return undefined

  if (INPUT_LIKE_TYPES.includes(item.type as any)) {
    return `请输入${label}`
  }
  if (SELECT_LIKE_TYPES.includes(item.type as any)) {
    return `请选择${label}`
  }
  return undefined
}

// 插槽
const slots = useSlots()

const renderField = (item: ScBaseFormItem) => {
  if (item.customSlot) {
    return slots[`custom-${item.customSlot}`]?.({
      item,
      data: props.modelValue
    })
  }
  if (item.type && componentMap[item.type as keyof typeof componentMap]) {
    return h(componentMap[item.type as keyof typeof componentMap], {
      ref: (el: any) => setItemRef(item.prop, el),
      ...(item as any).componentProps,
      placeholder: resolvePlaceholder(item),
      modelValue: props.modelValue[item.prop],
      'onUpdate:modelValue': (val: any) => (props.modelValue[item.prop] = val),
      onChange: (val: any) => item.onChange?.(val, props.modelValue)
    })
  }
  return null
}

const fieldRendererCache = new Map<string, () => any>()

const getFieldRenderer = (item: ScBaseFormItem) => {
  let renderer = fieldRendererCache.get(item.prop)
  if (!renderer) {
    renderer = () => renderField(item)
    fieldRendererCache.set(item.prop, renderer)
  }
  return renderer
}

defineExpose<ScBaseFormInstance>({
  validate: handleValidate,
  resetFields: () => scBaseFormRef.value!.resetFields(),
  clearValidate: props => scBaseFormRef.value!.clearValidate(props),
  getItemRef
})
</script>

<template>
  <el-form
    ref="scBaseFormRef"
    :model="modelValue"
    :label-width="labelWidth"
    :inline="inline"
    :rules="formRules"
  >
    <!-- 分组模式 -->
    <template v-if="isGroup && groupedItems">
      <div
        v-for="[groupName, items] in groupedItems"
        :key="groupName"
        class="form-group"
        v-show="hasVisibleItems(items)"
      >
        <div class="form-group__header" @click="toggleGroup(groupName)">
          <span class="form-group__title">{{ groupName }}</span>
          <el-icon
            class="form-group__icon"
            :class="{ 'is-collapsed': collapsedMap[groupName] }"
          >
            <ArrowUp />
          </el-icon>
        </div>
        <div
          v-show="!collapsedMap[groupName]"
          class="form-group__body"
          :style="{ '--form-columns': columns }"
        >
          <el-form-item
            v-for="item in items"
            v-show="isItemVisible(item)"
            :key="item.prop"
            :label="resolveLabel(item)"
            :prop="item.prop"
            :style="
              item.colSpan ? { 'grid-column': `span ${item.colSpan}` } : {}
            "
          >
            <div class="form-item-content">
              <slot
                :name="`before-${item.prop}`"
                :item="item"
                :data="modelValue"
              />
              <component :is="getFieldRenderer(item)" />
            </div>
          </el-form-item>
        </div>
      </div>
    </template>

    <!-- 非分组模式 -->
    <template v-else>
      <div class="form-body" :style="{ '--form-columns': columns }">
        <el-form-item
          v-for="item in formItems"
          v-show="isItemVisible(item)"
          :key="item.prop"
          :label="resolveLabel(item)"
          :prop="item.prop"
          :style="item.colSpan ? { 'grid-column': `span ${item.colSpan}` } : {}"
        >
          <div class="form-item-content">
            <slot
              :name="`before-${item.prop}`"
              :item="item"
              :data="modelValue"
            />
            <component :is="getFieldRenderer(item)" />
          </div>
        </el-form-item>
      </div>
    </template>
  </el-form>
</template>

<style scoped lang="scss">
.form-group {
  margin-bottom: 8px;

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 12px;
    margin-bottom: 12px;
    border-left: 3px solid var(--el-color-primary);
    background-color: var(--el-fill-color-light);
    cursor: pointer;
    user-select: none;
  }

  &__title {
    font-size: 14px;
    font-weight: 600;
    color: var(--el-text-color-primary);
  }

  &__icon {
    transition: transform 0.2s;

    &.is-collapsed {
      transform: rotate(180deg);
    }
  }

  &__body {
    padding: 0 12px;
  }
}

.form-body,
.form-group__body {
  display: grid;
  grid-template-columns: repeat(var(--form-columns, 2), 1fr);
  column-gap: 16px;
  align-items: start;
}

.form-item-content {
  display: flex;
  flex-direction: column;
  width: 100%;
}
</style>
