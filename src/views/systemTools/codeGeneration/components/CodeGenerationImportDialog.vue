<script setup lang="ts">
import {
  getImportableTableListAPI,
  importCodeGenerationTablesAPI
} from '@/api/systemTools/codeGeneration-api.ts'
import type {
  ImportableTableRow,
  ImportTableSearchParams
} from '@/types/systemTools/codeGeneration'
import ScMessage from '@/utils/ElUtils/message.ts'

const modelValue = defineModel<boolean>({ default: false })
const emit = defineEmits<{ success: [] }>()
const resourcePageRef = useTemplateRef<PageInstance>('resourcePageRef')

const tableColumns: TableColumns = [
  { label: '表名称', prop: 'tableName' },
  { label: '表描述', prop: 'tableComment' },
  { label: '创建时间', prop: 'createTime' },
  { label: '更新时间', prop: 'updateTime' }
]

const handleOpen = async () => {
  modelValue.value = true
  await nextTick()
  await resourcePageRef.value?.refresh()
}
const handleConfirm = async () => {
  const selectedRows = (resourcePageRef.value?.getSelectedRows() ?? []) as ImportableTableRow[]
  if (!selectedRows.length) {
    ScMessage.warning('请选择要导入的数据库表')
    return
  }
  await importCodeGenerationTablesAPI(
    selectedRows.map(row => row.tableName).join(',')
  )
  ScMessage.success('导入成功')
  modelValue.value = false
  emit('success')
}

const pageConfig: PageConfig<ImportableTableRow> = {
  searchConfig: { searchbarItems: reactive<SearchbarItems<ImportTableSearchParams>>([
    { label: '表名称', prop: 'tableName', type: 'input', placeholder: '请输入表名称' },
    { label: '表描述', prop: 'tableComment', type: 'input', placeholder: '请输入表描述' }
  ]) },
  operateConfig: { defaultButtons: [] },
  tableConfig: {
    tableColumns,
    showSelection: true,
    showActionColumn: false,
    showDefaultButtons: false,
    pageSize: 10
  },
  fetchData: getImportableTableListAPI,
  treeConfig: { rowKey: 'tableName' }
}

defineExpose({ open: handleOpen })
</script>

<template>
  <ScDialog
    v-model="modelValue"
    title="导入数据库表"
    dialog-width="65%"
    auto-height
  >
    <div class="import-content">
      <ScResourcePage
        ref="resourcePageRef"
        :page-config="pageConfig"
      />
    </div>
    <template #footer>
      <ScButton @click="modelValue = false">取消</ScButton>
      <ScButton type="primary" @click="handleConfirm">
        确认导入
      </ScButton>
    </template>
  </ScDialog>
</template>

<style scoped lang="scss">
.import-content {
  display: flex;
  flex-direction: column;
  height: 520px;
  flex: 1;
  min-height: 0;
}
</style>
