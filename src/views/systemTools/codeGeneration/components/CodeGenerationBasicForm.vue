<script setup lang="ts">
import type { CodeGenerationBasicFormData } from '@/types/systemTools/codeGeneration'
import { codeGenerationBasicFormItems } from '../config'
import type { ScBaseFormInstance } from '@/components/ScBaseForm/types/scBaseForm.ts'

defineProps<{ modelValue: CodeGenerationBasicFormData }>()
const formRef = ref<ScBaseFormInstance>()
defineExpose({ validate: () => formRef.value?.validate() })
</script>

<template>
  <ScBaseForm ref="formRef" :model-value="modelValue" :form-items="codeGenerationBasicFormItems" :columns="2" />
</template>
