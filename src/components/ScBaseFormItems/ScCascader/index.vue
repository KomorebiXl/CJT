<script setup lang="ts">
import type {
  CascaderInstance,
  CascaderProps as ElCascaderProps,
  CascaderValue
} from 'element-plus'
import type {
  ScCascaderProps,
  ScCascaderEmits,
  ScCascaderModelValue
} from './scCascader'

const props = withDefaults(defineProps<ScCascaderProps>(), {
  fieldNames: () => ({}),
  multiple: false,
  checkStrictly: false,
  emitPath: true,
  showAllLevels: true,
  placeholder: '请选择',
  clearable: true,
  filterable: true,
  disabled: false,
  size: 'default',
  collapseTags: false,
  collapseTagsTooltip: false,
  cascaderProps: () => ({})
})

const emit = defineEmits<ScCascaderEmits>()

const cascaderRef = ref<CascaderInstance>()
const innerOptions = ref<any[]>([])
const loading = ref(false)

const innerValue = computed({
  get: () => props.modelValue,
  set: val => emit('update:modelValue', val)
})

// 拼装成 el-cascader 需要的 props 对象；cascaderProps 最后 merge，保证能覆盖上面所有默认
const cascaderPropsComputed = computed<Partial<ElCascaderProps>>(() => ({
  value: props.fieldNames?.value ?? 'value',
  label: props.fieldNames?.label ?? 'label',
  children: props.fieldNames?.children ?? 'children',
  disabled: props.fieldNames?.disabled ?? 'disabled',
  multiple: props.multiple,
  checkStrictly: props.checkStrictly,
  emitPath: props.emitPath,
  ...props.cascaderProps
}))

const initOptions = async () => {
  if (props.options) {
    innerOptions.value = props.options
    return
  }
  if (!props.request) return

  loading.value = true
  try {
    const data = await props.request()
    innerOptions.value = data ?? []
  } catch (err) {
    // 失败兜底，避免 UI 卡在 loading
    innerOptions.value = []
    console.error('[ScCascader] request failed:', err)
  } finally {
    loading.value = false
  }
}

// 监听外部 options 引用变化（不是 length，血泪教训）
watch(
  () => props.options,
  val => {
    if (val) innerOptions.value = val
  }
)

const handleChange = (val: ScCascaderModelValue) => {
  emit('change', val)
}
const handleExpandChange = (v: CascaderValue) => emit('expand-change', v)
const handleBlur = (e: FocusEvent) => emit('blur', e)
const handleFocus = (e: FocusEvent) => emit('focus', e)
const handleVisibleChange = (v: boolean) => emit('visible-change', v)
const handleRemoveTag = (v: any) => emit('remove-tag', v)
const handleClear = () => emit('clear')

onMounted(initOptions)

defineExpose({
  refresh: initOptions,
  getCheckedNodes: (leafOnly = false) =>
    cascaderRef.value?.getCheckedNodes(leafOnly),
  clearCheckedNodes: () =>
    cascaderRef.value?.cascaderPanelRef?.clearCheckedNodes(),
  cascaderRef
})
</script>

<template>
  <el-cascader
    ref="cascaderRef"
    v-model="innerValue"
    :options="innerOptions"
    :props="cascaderPropsComputed"
    :placeholder="placeholder"
    :clearable="clearable"
    :filterable="filterable"
    :show-all-levels="showAllLevels"
    :disabled="disabled"
    :size="size"
    :collapse-tags="collapseTags"
    :collapse-tags-tooltip="collapseTagsTooltip"
    :loading="loading"
    class="sc-cascader"
    @change="handleChange"
    @expand-change="handleExpandChange"
    @blur="handleBlur"
    @focus="handleFocus"
    @visible-change="handleVisibleChange"
    @remove-tag="handleRemoveTag"
    @clear="handleClear"
  >
    <template v-if="$slots.default" #default="{ node, data }">
      <slot :node="node" :data="data" />
    </template>
  </el-cascader>
</template>

<style scoped lang="scss">
.sc-cascader {
  width: 100%;
}
</style>
