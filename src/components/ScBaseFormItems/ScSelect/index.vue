<script setup lang="ts">
import type {
  ScSelectEmits,
  ScSelectModelValue,
  ScSelectOption,
  ScSelectProps
} from './scSelect.ts'
import { getDictOptions } from '@/utils/dict.ts'
import type { DictOption } from '@/types/system/dict'
import type { SelectInstance } from 'element-plus'
import { DocumentDelete } from '@element-plus/icons-vue'

const props = withDefaults(defineProps<ScSelectProps>(), {
  modelValue: undefined,
  options: () => [],
  dictField: '',
  size: 'default',
  placeholder: '请选择',
  clearable: true,
  disabled: false,
  filterable: true,
  multiple: false,
  collapseTags: false,
  collapseTagsTooltip: false,
  multipleLimit: 0,
  loadingText: '加载中...',
  noDataText: '暂无数据',
  noMatchText: '无匹配数据',
  labelMaxWidth: undefined,
  customConfig: () => ({
    label: 'label',
    value: 'value'
  })
})

const emit = defineEmits<ScSelectEmits>()

const value = computed({
  get: () => props.modelValue,
  set: (val: ScSelectModelValue) => emit('update:modelValue', val)
})

const tempOptions = ref<Array<ScSelectOption> | Array<DictOption>>([])

// 字段配置
const selectField = computed(() => ({
  label: props.customConfig.label || 'label',
  value: props.customConfig.value || 'value',
  disabled: props.customConfig?.disabled || 'disabled',
  options: props.customConfig.options || 'options'
}))

// 获取选项 label
const getOptionLabel = (item: any): string => {
  const labelConfig = selectField.value.label
  if (typeof labelConfig === 'function') {
    return labelConfig(item)
  }
  return item[labelConfig]
}

// 获取选项 disabled 状态
const getOptionDisabled = (item: any): boolean => {
  const disabledConfig = selectField.value.disabled
  if (typeof disabledConfig === 'function') {
    return disabledConfig(item)
  }
  const key =
    (typeof disabledConfig === 'string' && disabledConfig) || 'disabled'
  return !!item[key]
}

// 判断是否为分组项
const isGroup = (item: any): boolean => {
  const optionsField = item[selectField.value.options]
  return Array.isArray(optionsField) && optionsField.length > 0
}

// 获取选项的 key 值，优先用 value 字段，fallback 到 index（由调用方传入）
const getOptionKey = (item: any, index: number) => {
  return (
    item[selectField.value.value as any] ?? item.value ?? `fallback-${index}`
  )
}

const loading = ref<boolean>(false)

const initOptions = async () => {
  try {
    loading.value = true
    if (props.dictField) {
      const dictData = await getDictOptions(props.dictField)
      tempOptions.value =
        Array.isArray(dictData) && dictData.length !== 0 ? dictData : []
    } else {
      tempOptions.value = props.options?.length ? props.options : []
    }
  } catch (error) {
    console.error('获取选项失败====>', error)
    // dictField 接口失败时降级使用 props.options
    tempOptions.value = props.options?.length ? props.options : []
  } finally {
    loading.value = false
  }
}

// 监听 options 引用和 dictField，而非 length，避免内容变化但长度相同时检测不到
watch(
  () => [props.options, props.dictField] as const,
  async () => {
    await initOptions()
  },
  { immediate: true, deep: false }
)

const selectRef = useTemplateRef<SelectInstance>('selectRef')

const slots = useSlots()

const otherSlots = computed(() => {
  const allSlots = { ...slots }
  delete allSlots.default
  return allSlots
})

// label 截断样式，由 labelMaxWidth prop 驱动
const labelEllipsisStyle = computed(() => {
  if (!props.labelMaxWidth) return undefined
  return {
    display: 'inline-block',
    maxWidth:
      typeof props.labelMaxWidth === 'number'
        ? `${props.labelMaxWidth}px`
        : props.labelMaxWidth,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    verticalAlign: 'middle'
  }
})

const handleChange = (value: any) => emit('change', value)
const handleVisibleChange = (visible: boolean) =>
  emit('visible-change', visible)
const handleRemoveTag = (value: any) => emit('remove-tag', value)
const handleClear = () => emit('clear')
const handleBlur = (event: FocusEvent) => emit('blur', event)
const handleFocus = (event: FocusEvent) => emit('focus', event)

defineExpose({
  /** 使选择框获得焦点 */
  focus: () => selectRef.value?.focus(),
  /** 使选择框失去焦点，并隐藏下拉框 */
  blur: () => selectRef.value?.blur(),
  /** 刷新选项数据 */
  refresh: initOptions,
  /** 获取当前选项数据 */
  getOptions: () => tempOptions.value,
  /** 获取原始 el-select 实例 */
  getSelectRef: () => selectRef.value
})
</script>

<template>
  <el-select
    ref="selectRef"
    v-model="value"
    v-bind="$attrs"
    :size="size"
    :placeholder="placeholder"
    :clearable="clearable"
    :disabled="disabled"
    :filterable="filterable"
    :multiple="multiple"
    :collapse-tags="collapseTags"
    :collapse-tags-tooltip="collapseTagsTooltip"
    :multiple-limit="multipleLimit"
    :loading="loading"
    :loading-text="loadingText"
    :no-data-text="noDataText"
    :no-match-text="noMatchText"
    @change="handleChange"
    @visible-change="handleVisibleChange"
    @remove-tag="handleRemoveTag"
    @clear="handleClear"
    @blur="handleBlur"
    @focus="handleFocus"
  >
    <!-- 优先使用外部默认插槽 -->
    <template v-if="$slots.default">
      <slot />
    </template>

    <template v-else>
      <template
        v-for="(item, index) in tempOptions"
        :key="getOptionKey(item, index)"
      >
        <!-- 分组选项 -->
        <el-option-group v-if="isGroup(item)" :label="getOptionLabel(item)">
          <el-option
            v-for="(subItem, subIndex) in (item as any)[selectField.options]"
            :key="getOptionKey(subItem, Number(subIndex))"
            :label="getOptionLabel(subItem)"
            :value="subItem[selectField.value]"
            :disabled="getOptionDisabled(subItem)"
          >
            <!-- label 超长省略：有 labelMaxWidth 时才开启 tooltip -->
            <template v-if="labelMaxWidth">
              <el-tooltip
                :content="getOptionLabel(subItem)"
                placement="right"
                :show-after="300"
              >
                <span :style="labelEllipsisStyle">{{
                  getOptionLabel(subItem)
                }}</span>
              </el-tooltip>
            </template>
          </el-option>
        </el-option-group>

        <!-- 普通选项 -->
        <el-option
          v-else
          :label="getOptionLabel(item)"
          :value="(item as any)[selectField.value]"
          :disabled="getOptionDisabled(item)"
        >
          <!-- label 超长省略：有 labelMaxWidth 时才开启 tooltip -->
          <template v-if="labelMaxWidth">
            <el-tooltip
              :content="getOptionLabel(item)"
              placement="right"
              :show-after="300"
            >
              <span :style="labelEllipsisStyle">{{
                getOptionLabel(item)
              }}</span>
            </el-tooltip>
          </template>
        </el-option>
      </template>
    </template>

    <!-- 动态透传其他具名插槽（除了 default） -->
    <template v-for="(_, name) in otherSlots" :key="name" #[name]="slotProps">
      <slot :name="name" v-bind="slotProps || {}" />
    </template>
    <!--  空数据状态  -->
    <template #empty>
      <div class="sc-select-empty">
        <div class="sc-select-empty__icon">
          <el-icon><DocumentDelete /></el-icon>
        </div>
        <span class="sc-select-empty__text">{{
          loading ? loadingText : noDataText
        }}</span>
      </div>
    </template>
  </el-select>
</template>

<style scoped lang="scss">
.sc-select-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px 0;
  gap: 8px;
  user-select: none;

  &__icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background-color: var(--el-fill-color-light);
    color: var(--el-text-color-placeholder);

    .el-icon {
      font-size: 20px;
    }
  }

  &__text {
    font-size: 13px;
    color: var(--el-text-color-placeholder);
    line-height: 1;
  }
}
</style>
