<script setup lang="ts">
import type { ScRadioEmits, ScRadioOption, ScRadioProps } from './scRadio.ts'
import { getDictOptions } from '@/utils/dict.ts'
import type { DictOption } from '@/types/system/dict'

defineOptions({ name: 'ScRadio' })

const props = withDefaults(defineProps<ScRadioProps>(), {
  disabled: false,
  size: 'default',
  radioOptions: () => [],
  fieldNames: () => ({ label: 'label', value: 'value' }),
  border: false
})

const emit = defineEmits<ScRadioEmits>()

const radioValue = computed({
  get: () => props.modelValue,
  set: val => emit('update:modelValue', val)
})

const radioOptions = ref<Array<ScRadioOption>>([])

const formatterDictData = (dictData: Array<DictOption>) => {
  return dictData.map((item: any) => ({
    label: item[props.fieldNames.label],
    value: item[props.fieldNames.value],
    disabled: item.disabled
  }))
}

// 初始化radio选项
const initRadioOptions = async () => {
  if (props.dictField) {
    const dictData = await getDictOptions(props.dictField)
    if (dictData && dictData.length > 0) {
      radioOptions.value = formatterDictData(dictData)
      return
    }
  }
  // 没有 dictField，或字典没取到数据，统一走这里
  radioOptions.value = props.radioOptions ?? []
}

watch(
  () => [props.radioOptions, props.dictField, props.fieldNames],
  () => {
    initRadioOptions()
  },
  { deep: true }
)

onMounted(() => {
  initRadioOptions()
})
</script>

<template>
  <el-radio-group
    v-model="radioValue"
    v-bind="$attrs"
    :disabled="disabled"
    :size="size"
  >
    <el-radio
      v-for="(r, i) in radioOptions"
      :key="i"
      :disabled="r.disabled"
      :value="r.value"
      :border="border"
    >
      {{ r.label }}
    </el-radio>
  </el-radio-group>
</template>

<style scoped lang="scss"></style>
