<script setup lang="ts">
import type {
  ScSearchbarEmits,
  ScSearchbarItem,
  ScSearchbarProps
} from './scSearchbar.ts'
import type { Component } from 'vue'
import { useDebounceFn } from '@vueuse/core'
import { ArrowDown, Refresh, Search } from '@element-plus/icons-vue'
import {
  ScInput,
  ScSelect,
  ScDatePicker,
  ScTreeSelect
} from '../../ScBaseFormItems'
import ScDateRangeSelector from '../../ScSearchDateRangeSelector'

defineOptions({
  name: 'ScSearchbar',
  inheritAttrs: false
})

const props = withDefaults(defineProps<ScSearchbarProps>(), {
  cols: 7,
  showReset: true,
  truncate: false,
  showCollapse: false,
  searchText: '搜索',
  resetText: '重置',
  size: 'default',
  gap: 16,
  loading: false,
  debounceDelay: 300
})

const emit = defineEmits<ScSearchbarEmits>()

const componentMap: Record<string, Component> = {
  input: ScInput,
  select: ScSelect,
  date: ScDatePicker,
  dateRange: ScDateRangeSelector,
  treeSelect: ScTreeSelect
}

const getComponent = (type: string): Component | undefined => {
  if (!componentMap[type]) {
    console.warn(`[ScSearchbar] Unknown component type: "${type}"`)
  }
  return componentMap[type]
}

const updateField = (prop: string, value: any) => {
  props.modelValue[prop] = value
  // emit('update:modelValue', { ...props.modelValue })
}

const getComponentProps = (item: ScSearchbarItem): Record<string, any> => {
  const prop = item.prop as string
  const base: Record<string, any> = {
    modelValue: props.modelValue[prop],
    clearable: item.clearable ?? true,
    disabled: item.disabled,
    size: props.size
  }
  switch (item.type) {
    case 'input':
      base.placeholder = item.placeholder ?? `请输入${item.label ?? ''}`
      base.type = item.inputType ?? 'text'
      break
    case 'select': {
      base.placeholder = item.placeholder ?? `请选择${item.label ?? ''}`
      base.options = item.options
      base.dictField = item.dictField
      base.filterable = item.filterable
      base.multiple = item.multiple
      break
    }
    case 'date': {
      base.placeholder = item.placeholder ?? `请选择${item.label ?? ''}`
      base.type = item.dateType ?? 'date'
      base.format = item.format
      base.valueFormat = item.valueFormat
      break
    }
    case 'dateRange': {
      base.type = item.dateType ?? 'daterange'
      base.format = item.format
      base.valueFormat = item.valueFormat
      base.startPlaceholder = item.startPlaceholder ?? `开始${item.label ?? ''}`
      base.endPlaceholder = item.endPlaceholder ?? `结束${item.label ?? ''}`
      base.rangeSeparator = item.rangeSeparator
      break
    }
    case 'treeSelect': {
      base.placeholder = item.placeholder ?? `请选择${item.label ?? ''}`
      base.options = item.options
      base.multiple = item.multiple
      base.checkStrictly = item.checkStrictly
      base.nodeKey = item.nodeKey
      base.fieldNames = item.fieldNames
      base.filterable = item.filterable
      base.defaultExpandAll = item.defaultExpandAll
      break
    }
  }
  return { ...base, ...(item.componentProps ?? {}) }
}

const getComponentEvents = (item: ScSearchbarItem) => ({
  'update:modelValue': (value: any) => updateField(item.prop as string, value),
  ...(item.type === 'input'
    ? {
        keyup: (e: KeyboardEvent) => {
          if (e.key === 'Enter') handleSearch()
        }
      }
    : {})
})

const handleSearch = useDebounceFn(() => {
  emit('search', { ...props.modelValue })
}, props.debounceDelay)

const handleReset = () => {
  props.searchbarItems.forEach(item => {
    const prop = item.prop as string
    // dateRange 是 [string, string] | undefined；treeSelect 多选时值是数组，置 null 会导致组件内部数组操作报错
    if (item.type === 'dateRange') {
      props.modelValue[prop] = undefined
    } else if (item.type === 'treeSelect' && item.multiple) {
      props.modelValue[prop] = []
    } else {
      props.modelValue[prop] = null
    }
  })
  // emit('update:modelValue', { ...props.modelValue })
  emit('reset')
}

const isExpanded = ref(false)

const toggleExpand = () => {
  isExpanded.value = !isExpanded.value
}

const collapseIndex = computed(() => {
  if (!props.truncate) return props.searchbarItems.length
  const available = props.cols - 1
  let used = 0
  for (let i = 0; i < props.searchbarItems.length; i++) {
    const span = props.searchbarItems[i].span ?? 1
    if (used + span > available) return i
    used += span
  }
  return props.searchbarItems.length
})

const hasCollapsible = computed(
  () => collapseIndex.value < props.searchbarItems.length
)

const visibleItems = computed(() =>
  !props.truncate || isExpanded.value
    ? props.searchbarItems
    : props.searchbarItems.slice(0, collapseIndex.value)
)
</script>

<template>
  <div class="search-bar">
    <div
      class="search-grid"
      :style="{
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gap: `${gap}px`
      }"
    >
      <div
        v-for="item in visibleItems"
        :key="item.prop"
        class="search-item"
        :style="
          item.span && item.span > 1 ? { gridColumn: `span ${item.span}` } : {}
        "
      >
        <component
          :is="getComponent(item.type)"
          v-bind="getComponentProps(item)"
          v-on="getComponentEvents(item)"
        />
      </div>
      <div v-if="searchbarItems.length > 0" class="search-actions">
        <ScButton
          type="primary"
          :icon="Search"
          :size="size"
          :loading="loading"
          @click="handleSearch"
        >
          {{ searchText }}
        </ScButton>
        <ScButton
          v-if="showReset"
          :icon="Refresh"
          :size="size"
          @click="handleReset"
        >
          {{ resetText }}
        </ScButton>
        <ScButton
          v-if="truncate && showCollapse && hasCollapsible"
          type="primary"
          link
          :size="size"
          @click="toggleExpand"
        >
          {{ isExpanded ? '收起' : '展开' }}
          <el-icon :class="['collapse-icon', { 'is-expanded': isExpanded }]">
            <ArrowDown />
          </el-icon>
        </ScButton>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.search-bar {
  border-radius: 4px;
  .search-grid {
    display: grid;
    align-items: start;
  }
  .search-item {
    min-width: 0;
  }
  .search-actions {
    display: flex;
    gap: 8px;
    align-items: center;
    white-space: nowrap;
  }
  .collapse-icon {
    transition: transform 0.25s ease;
    &.is-expanded {
      transform: rotate(180deg);
    }
  }
  @media (max-width: 1200px) {
    .search-grid {
      grid-template-columns: repeat(2, 1fr) !important;
    }
  }
  @media (max-width: 768px) {
    padding: 16px;
    .search-grid {
      grid-template-columns: 1fr !important;
    }
    .search-actions {
      flex-direction: column;
      align-items: stretch;

      button {
        width: 100%;
      }
    }
  }
}
</style>
