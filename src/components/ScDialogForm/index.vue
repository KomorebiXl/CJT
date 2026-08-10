<script setup lang="ts">
import type {
  ScDialogFormProps,
  ScDialogFormEmits,
  ScDialogFormInstance
} from './scDialogForm.ts'
import type { ScBaseFormInstance } from '@/components/ScBaseForm'

const props = defineProps<ScDialogFormProps>()
const emits = defineEmits<ScDialogFormEmits>()

const formRef = useTemplateRef<ScBaseFormInstance>('formRef')

const dialogVisible = computed({
  get: () => props.modelValue,
  set: val => emits('update:modelValue', val)
})

const handleConfirm = async () => {
  const valid = await formRef.value?.validate()
  if (!valid) return
  emits('confirm', props.formData)
}

defineExpose<ScDialogFormInstance>({
  validate: () => formRef.value!.validate(),
  resetFields: () => formRef.value!.resetFields(),
  clearValidate: (props?: string | string[]) =>
    formRef.value!.clearValidate(props),
  getItemRef: <T = any,>(prop: string) => formRef.value!.getItemRef<T>(prop)
})
</script>

<template>
  <ScDialog
    v-model="dialogVisible"
    :title="config.title"
    :confirm-text="config.confirmText"
    :cancel-text="config.cancelText"
    :dialog-width="config.dialogWidth"
    :draggable="config.draggable"
    :fullscreen="config.fullscreen"
    :confirm-loading="confirmLoading"
    @confirm="handleConfirm"
  >
    <ScBaseForm
      ref="formRef"
      :model-value="formData"
      :form-items="config.formItems"
      :label-width="config.labelWidth"
      :inline="config.inline"
      :columns="config.columns"
      :is-group="config.groupModel ?? true"
    >
      <template v-for="(_, name) in $slots" #[name]="slotProps">
        <slot :name="name" v-bind="slotProps ?? {}" />
      </template>
    </ScBaseForm>
  </ScDialog>
</template>
