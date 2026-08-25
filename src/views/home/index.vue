<script setup lang="ts">
import { defineFormItems } from '@/utils/form.ts'
import { useTemplateRef } from 'vue'
import type { ScBaseFormInstance } from '@/components/ScBaseForm'
import type { ScDialogFormConfig } from '@/components/ScDialogForm'

type FormData = {
  inputValue1: string
  inputValue2: number
  customInputValue: string
  textareaValue: string
  selectValue1: string
  checkboxValue: Array<string>
  radioValue: string | undefined
  dateValue: string
  dateRangeValue: [string, string] | undefined
  switchValue: boolean
}

const formData = reactive<FormData>({
  inputValue1: '',
  inputValue2: 0,
  customInputValue: '',
  textareaValue: '',
  selectValue1: '',
  checkboxValue: [],
  radioValue: undefined,
  dateValue: '',
  dateRangeValue: undefined,
  switchValue: false
})

const formItems = defineFormItems<FormData>([
  {
    label: '输入框',
    prop: 'inputValue1',
    type: 'input',
    groupName: '分组1'
  },
  {
    label: '数字框',
    prop: 'inputValue2',
    type: 'input',
    componentProps: {
      type: 'number'
    },
    hide: (data: FormData) => data.selectValue1 === '5',
    groupName: '分组1'
  },
  {
    label: '自定义文本框',
    prop: 'customInputValue',
    customSlot: 'cInput',
    groupName: '分组1'
  },
  {
    label: '文本域',
    prop: 'textareaValue',
    type: 'input',
    componentProps: {
      type: 'textarea'
    },
    groupName: '分组2'
  },
  {
    label: '选择框',
    prop: 'selectValue1',
    type: 'select',
    componentProps: {
      dictField: 'background_subject_type'
    },
    groupName: '分组2'
  },
  {
    label: '多选框',
    prop: 'checkboxValue',
    type: 'checkbox',
    componentProps: {
      dictField: 'background_subject_type'
    },
    rules: [{ required: true }],
    groupName: '分组3'
  },
  {
    label: '单选框',
    prop: 'radioValue',
    type: 'radio',
    componentProps: {
      dictField: 'background_subject_type'
    },
    rules: [{ required: true }],
    groupName: '分组3'
  },
  {
    label: '日期选择',
    prop: 'dateValue',
    type: 'date',
    groupName: '分组3'
  },
  {
    label: '日期范围选择',
    prop: 'dateRangeValue',
    type: 'dateRange'
  },
  {
    label: 'switch',
    prop: 'switchValue',
    type: 'switch'
  }
])

const scBaseFormRef = useTemplateRef<ScBaseFormInstance>('scBaseFormRef')
const handleClick = async () => {
  await scBaseFormRef.value?.validate()
  console.log(formData)
}

const handleClick1 = async () => {
  scBaseFormRef.value?.clearValidate()
  scBaseFormRef.value?.resetFields()
}

const dialogVisible = ref<boolean>(false)
const dialogConfig: ScDialogFormConfig = {
  formItems,
  // onSubmit: () => new Promise(resolve => resolve()),
  // dialogWidth: '80%'
}
</script>

<template>
  <div class="page-card">
    <el-button @click="handleClick" class="m-t-10">submit</el-button>
    <el-button @click="handleClick1" class="m-t-10">submit</el-button>
    <el-button @click="dialogVisible = true" class="m-t-10">s</el-button>
  </div>
  <ScDialogForm v-model="dialogVisible" :form-data="formData" :config="dialogConfig" />
</template>

<style scoped></style>
