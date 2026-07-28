<script setup lang="ts">
import {
  getLocalSvgIcons,
  getElementPlusIcons,
  encodeIconValue,
  decodeIconValue,
  type IconOption
} from '@/utils/icons.ts'

interface IconPanelProps {
  modelValue: string
  width?: number
}

const props = withDefaults(defineProps<IconPanelProps>(), { width: 280 })

const emit = defineEmits<{
  select: [value: string]
}>()

// 两个数据源是静态的，组件创建时取一次就够，不用包 ref
const localIcons = getLocalSvgIcons()
const elementIcons = getElementPlusIcons()

const activeSource = ref<'svg' | 'element'>(
  props.modelValue ? decodeIconValue(props.modelValue).type : 'svg'
)
const searchKeyword = ref('')

// 切换来源时清空搜索词，避免上一个来源的关键字带到新来源里
const handleSwitchSource = (source: 'svg' | 'element') => {
  activeSource.value = source
  searchKeyword.value = ''
}

const currentIcons = computed(() =>
  activeSource.value === 'svg' ? localIcons : elementIcons
)

const filteredIcons = computed(() => {
  const keyword = searchKeyword.value.trim().toLowerCase()
  if (!keyword) return currentIcons.value
  return currentIcons.value.filter(icon =>
    icon.name.toLowerCase().includes(keyword)
  )
})

const isActive = (icon: IconOption) =>
  encodeIconValue(icon.type, icon.name) === props.modelValue

const handleSelect = (icon: IconOption) => {
  emit('select', encodeIconValue(icon.type, icon.name))
}
</script>

<template>
  <div class="icon-panel" :style="{ width: `${width}px` }">
    <el-radio-group
      :model-value="activeSource"
      size="small"
      @change="handleSwitchSource"
    >
      <el-radio-button value="svg">本地图标</el-radio-button>
      <el-radio-button value="element">Element Plus</el-radio-button>
    </el-radio-group>

    <ScInput
      v-model="searchKeyword"
      placeholder="搜索图标名称"
      clearable
      class="icon-panel__search"
    />

    <div class="icon-panel__grid">
      <div
        v-for="icon in filteredIcons"
        :key="icon.name"
        class="icon-panel__item"
        :class="{ 'is-active': isActive(icon) }"
        :title="icon.name"
        @click="handleSelect(icon)"
      >
        <SvgIcon v-if="icon.type === 'svg'" :name="icon.name" size="1em" />
        <el-icon v-else><component :is="icon.component" /></el-icon>
      </div>

      <div v-if="filteredIcons.length === 0" class="icon-panel__empty">
        没有匹配的图标
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.icon-panel {
  display: flex;
  flex-direction: column;
  gap: 12px;
  box-sizing: border-box;
  padding: 12px;

  &__grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(36px, 1fr));
    gap: 8px;
    max-height: 240px;
    overflow-y: auto;
    padding: 4px;
  }

  &__item {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 36px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 18px;
    color: var(--el-text-color-regular);
    transition:
      background-color 0.2s,
      color 0.2s;

    &:hover {
      background-color: var(--el-fill-color-light);
    }

    &.is-active {
      background-color: var(--el-color-primary-light-9);
      color: var(--el-color-primary);
    }
  }

  &__empty {
    grid-column: 1 / -1;
    text-align: center;
    color: var(--el-text-color-placeholder);
    padding: 24px 0;
    font-size: 13px;
  }
}
</style>
