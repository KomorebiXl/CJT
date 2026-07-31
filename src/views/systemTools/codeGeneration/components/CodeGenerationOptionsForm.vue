<script setup lang="ts">
import type { CodeGenerationOptionsFormData } from '@/types/systemTools/codeGeneration'
import { codeGenerationOptionsFormItems } from '../config'
import type { ScBaseFormInstance } from '@/components/ScBaseForm/types/scBaseForm.ts'
import { findFormItem } from '@/utils/formItemUtils.ts'
import type { TreeMenuData } from '@/types/system/menu'

const props = defineProps<{
  modelValue: CodeGenerationOptionsFormData
  menuOptions: TreeMenuData[]
}>()
const formRef = ref<ScBaseFormInstance>()
const formItemsWithMenuOptions = computed(() => {
  const items = [...codeGenerationOptionsFormItems]
  const parentMenuItem = findFormItem<
    'treeSelect',
    CodeGenerationOptionsFormData
  >(items, 'parentMenuId', 'treeSelect')
  if (parentMenuItem) {
    parentMenuItem.componentProps = {
      ...parentMenuItem.componentProps,
      options: props.menuOptions
    }
  }
  return items
})
defineExpose({ validate: () => formRef.value?.validate() })
</script>

<template>
  <ScBaseForm
    ref="formRef"
    :model-value="props.modelValue"
    :form-items="formItemsWithMenuOptions"
    :columns="2"
  />
</template>
