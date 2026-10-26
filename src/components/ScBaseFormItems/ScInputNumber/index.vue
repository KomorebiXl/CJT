<script setup lang="ts">
import type { ScInputNumberEmits, ScInputNumberProps } from './scInputNumber.ts'

defineOptions({ name: 'ScInputNumber' })

const props = withDefaults(defineProps<ScInputNumberProps>(), {
  placeholder: '',
  min: -Infinity,
  max: Infinity,
  step: 1,
  precision: undefined,
  stepStrictly: false,
  controls: true,
  disabled: false
})

const emit = defineEmits<ScInputNumberEmits>()

const numberValue = computed<number | null | undefined>({
  get: () => props.modelValue,
  set: val => emit('update:modelValue', val ?? null)
})
</script>

<template>
  <el-input-number
    v-model="numberValue"
    :placeholder="placeholder"
    :min="min"
    :max="max"
    :step="step"
    :precision="precision"
    :step-strictly="stepStrictly"
    :controls="controls"
    :disabled="disabled"
    class="sc-input-number"
  />
</template>

<style scoped lang="scss">
.sc-input-number {
  width: 100%;
}
</style>
