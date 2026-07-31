<script setup lang="ts">
import type { CodeGenerationColumn } from '@/types/systemTools/codeGeneration'
import {
  codeGenerationColumnColumns,
  htmlTypeOptions,
  javaTypeOptions,
  queryTypeOptions
} from '../config'

defineProps<{ modelValue: CodeGenerationColumn[] }>()
</script>

<template>
  <div class="column-editor">
    <ScTable
      :data="modelValue"
      :table-columns="codeGenerationColumnColumns"
      :show-action="false"
      :show-pagination="false"
    >
      <template #columnComment="{ row }">
        <ScInput v-model="row.columnComment" />
      </template>
      <template #javaType="{ row }">
        <ScSelect
          v-model="row.javaType"
          :options="javaTypeOptions.map(value => ({ label: value, value }))"
        />
      </template>
      <template #javaField="{ row }"
        ><ScInput v-model="row.javaField" />
      </template>
      <template #isInsert="{ row }">
        <ScSwitch v-model="row.isInsert" active-value="1" inactive-value="0" />
      </template>
      <template #isEdit="{ row }">
        <ScSwitch v-model="row.isEdit" active-value="1" inactive-value="0" />
      </template>
      <template #isList="{ row }"
        ><ScSwitch v-model="row.isList" active-value="1" inactive-value="0" />
      </template>
      <template #isQuery="{ row }">
        <ScSwitch v-model="row.isQuery" active-value="1" inactive-value="0" />
      </template>
      <template #isRequired="{ row }">
        <ScSwitch
          v-model="row.isRequired"
          active-value="1"
          inactive-value="0"
        />
      </template>
      <template #queryType="{ row }">
        <ScSelect
          v-model="row.queryType"
          :options="queryTypeOptions.map(value => ({ label: value, value }))"
        />
      </template>
      <template #htmlType="{ row }">
        <ScSelect
          v-model="row.htmlType"
          :options="htmlTypeOptions.map(value => ({ label: value, value }))"
        />
      </template>
      <template #dictType="{ row }">
        <ScInput v-model="row.dictType" />
      </template>
    </ScTable>
  </div>
</template>

<style scoped lang="scss">
.column-editor {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 300px);
  min-height: 360px;
}
</style>
