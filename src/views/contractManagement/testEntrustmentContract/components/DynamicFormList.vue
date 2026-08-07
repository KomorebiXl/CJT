<script setup lang="ts">
import type { BusinessContractProjectDetailsList } from '@/types/contractManagement/testEntrustmentContract'
import ScButton from '@/components/ScBaseComponents/ScButton'
import ScInput from '@/components/ScBaseFormItems/ScInput'

const props = defineProps<{
  modelValue: Array<BusinessContractProjectDetailsList>
}>()

const emit = defineEmits<{
  'update:modelValue': [value: Array<BusinessContractProjectDetailsList>]
}>()

const createEmptyItem = (): BusinessContractProjectDetailsList => ({
  projectName: '',
  testContent: '',
  quantity: 1,
  remark: ''
})

const updateItem = (
  index: number,
  key: keyof BusinessContractProjectDetailsList,
  value: string | number
) => {
  const items = props.modelValue.map((item, itemIndex) =>
    itemIndex === index ? { ...item, [key]: value } : item
  )
  emit('update:modelValue', items)
}

const addItem = () => {
  emit('update:modelValue', [...props.modelValue, createEmptyItem()])
}

const removeItem = (index: number) => {
  if (props.modelValue.length <= 1) return
  emit(
    'update:modelValue',
    props.modelValue.filter((_, itemIndex) => itemIndex !== index)
  )
}
</script>

<template>
  <div class="dynamic-form-list">
    <div
      v-for="(item, index) in modelValue"
      :key="index"
      class="dynamic-form-list__row"
    >
      <ScInput
        :model-value="item.projectName"
        placeholder="请输入项目名称"
        @update:model-value="updateItem(index, 'projectName', $event)"
      />
      <ScInput
        :model-value="item.testContent"
        placeholder="请输入测试内容"
        @update:model-value="updateItem(index, 'testContent', $event)"
      />
      <ScInput
        :model-value="item.quantity"
        type="number"
        placeholder="请输入数量"
        @update:model-value="updateItem(index, 'quantity', $event)"
      />
      <ScInput
        :model-value="item.remark"
        placeholder="请输入备注"
        @update:model-value="updateItem(index, 'remark', $event)"
      />
      <ScButton type="danger" text @click="removeItem(index)"> 删除 </ScButton>
    </div>
    <ScButton type="primary" plain @click="addItem">新增明细</ScButton>
  </div>
</template>

<style scoped lang="scss">
.dynamic-form-list {
  width: 100%;

  &__row {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr)) auto;
    gap: 8px;
    align-items: center;
    margin-bottom: 8px;
  }
}
</style>
