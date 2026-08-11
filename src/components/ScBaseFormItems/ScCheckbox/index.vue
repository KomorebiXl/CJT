<script setup lang="ts">
import type { ScCheckboxEmits, ScCheckboxOption, ScCheckboxProps } from './scCheckbox.ts'
import { getDictOptions } from '@/utils/dict.ts'
import type { DictOption } from '@/api/system/dict'

defineOptions({ name: 'ScCheckbox', inheritAttrs: false })

const props = withDefaults(defineProps<ScCheckboxProps>(), {
  disabled: false,
  checkboxOptions: () => [],
  fieldNames: () => ({ label: 'label', value: 'value' })
})

const emit = defineEmits<ScCheckboxEmits>()

const checkboxValue = computed({
  get: () => props.modelValue,
  set: val => emit('update:modelValue', val)
})

const inputValue = defineModel<string>('inputValue', { default: '' })

const checkboxOptions = ref<Array<ScCheckboxOption>>([])

const formatterDictData = (dictData: Array<DictOption>) => {
  return dictData.map((item: any) => ({
    label: item[props.fieldNames.label],
    value: item[props.fieldNames.value],
    disabled: item.disabled
  }))
}

const initCheckboxOptions = async () => {
  // 如果使用字典字典，优先从数据字典获取数据
  if (props.dictField) {
    const dictData = await getDictOptions(props.dictField)
    if (dictData && dictData.length > 0) {
      checkboxOptions.value = formatterDictData(dictData)
    } else {
      // 使用options字段传入作为选项数据来源
      checkboxOptions.value = props.checkboxOptions
    }
  }
}

// 判断是否展示输入框
const showInput = computed(() => {
  if (!props.showInput || props.showInput.length === 0) return false
  const selectedValues = checkboxValue.value || []
  // 在选中的数组中找对应条件的值，存在即显示输入框
  return props.showInput.some(val => selectedValues.includes(val))
})

watch(
  () => [props.checkboxOptions, props.dictField, props.fieldNames],
  () => {
    initCheckboxOptions()
  },
  { deep: true }
)

onMounted(() => {
  initCheckboxOptions()
})
</script>

<template>
  <el-checkbox-group v-model="checkboxValue" v-bind="$attrs" :disabled="disabled">
    <el-checkbox
      v-for="(c, i) in checkboxOptions"
      :key="`${c.value}_${i}`"
      :label="c.label"
      :disabled="c.disabled"
      :value="c.value"
    >
      {{ c.label }}
    </el-checkbox>
  </el-checkbox-group>
  <ScInput v-model="inputValue" v-bind="$attrs" v-if="showInput" />
</template>

<style scoped lang="scss"></style>
