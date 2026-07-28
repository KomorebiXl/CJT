<script setup lang="ts">
import IconPanel from './IconPanel.vue'
import { decodeIconValue } from '@/utils/icons.ts'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import { CircleClose, ArrowDown } from '@element-plus/icons-vue'
import { useCloseOnOverlayHide } from '@/hooks/useCloseOnOverlayHide'

interface ScIconPickerProps {
  modelValue: string
  placeholder?: string
  clearable?: boolean
}

const props = withDefaults(defineProps<ScIconPickerProps>(), {
  clearable: true
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  change: [value: string]
}>()

const visible = ref(false)
const triggerRef = ref<HTMLElement>()
const popoverWidth = ref(320)
const panelKey = ref(0)

useCloseOnOverlayHide(visible)

const updateWidth = () => {
  if (triggerRef.value) {
    popoverWidth.value = triggerRef.value.offsetWidth
  }
}

onMounted(updateWidth)
watch(visible, val => {
  if (val) updateWidth() // 每次打开都重新量一遍，避免窗口尺寸变化后宽度不同步
})

const decoded = computed(() =>
  props.modelValue ? decodeIconValue(props.modelValue) : null
)

const handleSelect = (value: string) => {
  emit('update:modelValue', value)
  emit('change', value)
  visible.value = false
}

const handleClear = (e: MouseEvent) => {
  e.stopPropagation()
  emit('update:modelValue', '')
  emit('change', '')
}
</script>

<template>
  <el-popover
    v-model:visible="visible"
    placement="bottom-start"
    trigger="click"
    popper-class="icon-picker__popper"
    :width="popoverWidth"
    @after-leave="panelKey++"
  >
    <template #reference>
      <div ref="triggerRef" class="icon-picker__trigger">
        <template v-if="decoded">
          <el-icon v-if="decoded.type === 'element'" class="icon-picker__icon">
            <component
              :is="(ElementPlusIconsVue as Record<string, any>)[decoded.name]"
            />
          </el-icon>
          <SvgIcon
            v-else
            class="icon-picker__icon"
            :name="decoded.name"
            size="1em"
          />
          <span class="icon-picker__name" :title="decoded.name">
            {{ decoded.name }}
          </span>
        </template>
        <span v-else class="icon-picker__placeholder">
          {{ placeholder ?? '请选择图标' }}
        </span>
        <el-icon
          v-if="clearable && modelValue"
          class="icon-picker__clear"
          @click="handleClear"
        >
          <CircleClose />
        </el-icon>
        <el-icon v-else class="icon-picker__arrow">
          <ArrowDown />
        </el-icon>
      </div>
    </template>

    <IconPanel
      :model-value="modelValue"
      :width="popoverWidth"
      :key="panelKey"
      @select="handleSelect"
    />
  </el-popover>
</template>

<style scoped lang="scss">
.icon-picker {
  &__trigger {
    display: flex;
    align-items: center;
    gap: 6px;
    height: 32px;
    padding: 0 12px;
    border: 1px solid var(--el-border-color);
    border-radius: 4px;
    cursor: pointer;
    background-color: var(--el-fill-color-blank);
    transition: border-color 0.2s;

    &:hover {
      border-color: var(--el-border-color-hover);
    }
  }

  &__icon {
    font-size: 16px;
  }

  &__placeholder {
    flex: 1;
    color: var(--el-text-color-placeholder);
    font-size: 14px;
  }
  &__name {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: var(--el-text-color-regular);
    font-size: 14px;
  }

  &__clear,
  &__arrow {
    margin-left: auto;
    color: var(--el-text-color-placeholder);
    font-size: 14px;
  }
}
</style>

<!-- 弹出的 popper 内容是被 teleport 到 body 外面的，scoped 样式对它不生效， -->
<!-- 这块要放在不带 scoped 的 style 里，跟当初 ScDateRangeSelector 的处理方式一致 -->
<style lang="scss">
.icon-picker__popper {
  padding: 0 !important;
}
</style>
