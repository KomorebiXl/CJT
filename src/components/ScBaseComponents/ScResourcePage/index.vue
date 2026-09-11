<script setup lang="ts">
import type {
  ScResourcePageProps,
  ScResourcePageEmits,
  ScResourcePageInstance
} from './types'
import { useOperateButtons } from './hooks/useOperateButtons.ts'
import { useExport } from '@/components/ScBaseComponents/ScResourcePage/hooks/useExport.ts'
import { useTreeExpand } from '@/components/ScBaseComponents/ScResourcePage/hooks/useTreeExpand.ts'
import { useTableData } from '@/components/ScBaseComponents/ScResourcePage/hooks/useTableData.ts'
import { useTemplateRef } from 'vue'
import type { TableInstance } from 'element-plus'
import {
  ArrowDown,
  ArrowUp,
  RefreshLeft,
  Setting
} from '@element-plus/icons-vue'
import { useColumnConfig } from '@/components/ScBaseComponents/ScResourcePage/hooks/useColumnConfig.ts'
import { useActionButtons } from '@/components/ScBaseComponents/ScResourcePage/hooks/useActionButtons.ts'

defineOptions({
  name: 'ScResourcePage'
})

const props = defineProps<ScResourcePageProps>()

const emit = defineEmits<ScResourcePageEmits>()

// 通过searchbarItems自动生成表单数据
const initSearchFormData = (): Record<string, any> => {
  const formData: Record<string, any> = {}
  props.pageConfig.searchConfig.searchbarItems.forEach(i => {
    formData[i.prop] = i.type === 'dateRange' ? undefined : null
  })
  return { ...formData, ...props.pageConfig.searchConfig.searchExtraParams }
}

// 搜索表单
const searchFormData = ref<Record<string, any>>(initSearchFormData())

// 搜索
const handleSearch = () => {
  fetchTableData()
}

// 刷新
const handleRefresh = () => {
  fetchTableData()
}

const { handleExport } = useExport(
  () => props.exportConfig,
  () => searchFormData.value
)

// 操作栏按钮
const { allButtons, handleBtnClick } = useOperateButtons(
  () => props.pageConfig.operateConfig,
  () => emit('add'),
  () => emit('import'),
  handleExport,
  id => emit('operateClick', id)
)

const tableRef = useTemplateRef<TableInstance>('tableRef')

// 表格配置
const { tableData, tableTotal, loading, fetchTableData, handlePageChange } =
  useTableData(
    () => props.pageConfig,
    () => searchFormData.value
  )

// 树形操作
const { isAllExpanded, toggleExpandAll, expandAllRows } = useTreeExpand(
  () => props.pageConfig.treeConfig,
  () => tableData.value,
  tableRef
)

// 列配置
const {
  selectedColumns,
  showActionColumn,
  visibleColumns,
  initSelectedColumns
} = useColumnConfig(
  () => props.pageConfig.tableConfig.tableColumns,
  () => props.pageConfig.tableConfig.showActionColumn
)

// 操作列按钮
const { allActionButtons, isButtonDisabled, resolveButtonName } =
  useActionButtons(
    () => props.pageConfig.tableConfig.customActionButtons,
    () => props.pageConfig.tableConfig.showDefaultButtons,
    row => emit('edit', row),
    row => emit('delete', row),
    () => props.pageConfig.tableConfig.defaultButtonsConfig
  )

onMounted(async () => {
  initSelectedColumns()
  await fetchTableData()
  // 首次加载后，若配置了默认展开全部
  if (props.pageConfig.treeConfig?.defaultExpandAll) {
    isAllExpanded.value = true
    await expandAllRows()
  }
})

// 多选数据
const selectedRows = ref<Array<Record<string, any>>>([])

// 多选回调函数
const handleSelectionChange = (selection: Array<Record<string, any>>) => {
  selectedRows.value = selection
}

// 获取选中行
const getSelectedRows = () => {
  return selectedRows.value
}

// 清空选中行数据
const clearSelection = () => {
  tableRef.value?.clearSelection()
  selectedRows.value = []
}

// 按行对象勾选/取消勾选（转发 ScTable，配合 reserveSelection 恢复选中）
const toggleRowSelection = (row: Record<string, any>, selected: boolean) => {
  tableRef.value?.toggleRowSelection(row, selected)
}

// 转换带前缀的插槽名
const transformSlotName = (slotName: string | number): string => {
  const name = String(slotName)
  if (name.startsWith('column-')) {
    return name.replace('column-', '')
  }
  return name
}

// 判断是否为自定义插槽
const isCustomSlot = (slotName: string | number): boolean => {
  return (
    slotName !== 'operate-buttons' &&
    slotName !== 'operate-extra' &&
    slotName !== 'action-custom' &&
    slotName !== 'action'
  )
}

defineExpose<ScResourcePageInstance>({
  refresh: fetchTableData,
  getSearchParams: () => searchFormData.value,
  resetSearch: async () => {
    searchFormData.value = initSearchFormData()
    await fetchTableData()
  },
  getSelectedRows,
  clearSelection,
  toggleRowSelection
})
</script>

<template>
  <div class="sc-page-container">
    <div class="page-search-content">
      <ScSearchbar
        v-model="searchFormData"
        :searchbar-items="props.pageConfig.searchConfig.searchbarItems"
        @search="handleSearch"
      />
    </div>
    <div class="page-operate-content">
      <div class="base-btn-list">
        <div
          class="btn-item"
          v-for="item in allButtons"
          :key="item.id"
          :data-tour="item.tourId"
        >
          <ScButton
            :type="item.type"
            :text="item.text"
            :disabled="item.disabled"
            :icon="item.icon"
            @click="handleBtnClick(item)"
          >
            {{ item.name }}
          </ScButton>
        </div>
        <slot name="operate-button-slot" />
      </div>
      <div class="extra-operate">
        <slot name="extra-operate-left" />
        <!--  树形结构控制按钮  -->
        <ScButton
          v-if="props.pageConfig.treeConfig?.showExpandButton"
          :icon="isAllExpanded ? ArrowUp : ArrowDown"
          circle
          :title="isAllExpanded ? '全部收起' : '全部展开'"
          @click="toggleExpandAll"
        />
        <!--  列配置下拉菜单  -->
        <el-dropdown trigger="click">
          <ScButton :icon="Setting" circle />
          <template #dropdown>
            <el-dropdown-menu>
              <div class="column-setting-dropdown">
                <div class="dropdown-title">显示列</div>
                <!-- 普通列 -->
                <el-checkbox-group v-model="selectedColumns">
                  <div
                    class="column-checkbox-item"
                    v-for="col in props.pageConfig.tableConfig.tableColumns"
                    :key="col.prop"
                  >
                    <el-checkbox :label="col.prop">
                      {{ col.label }}
                    </el-checkbox>
                  </div>
                </el-checkbox-group>
                <!-- 操作列 -->
                <el-divider style="margin: 12px 0" />
                <div class="column-checkbox-item">
                  <el-checkbox v-model="showActionColumn">操作</el-checkbox>
                </div>
              </div>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
        <!-- 刷新按钮 -->
        <ScButton :icon="RefreshLeft" circle @click="handleRefresh" />
      </div>
    </div>
    <div class="page-table-content">
      <ScTable
        ref="tableRef"
        :data="tableData"
        :action-width="200"
        :table-columns="visibleColumns"
        :total="tableTotal"
        :loading="loading"
        :tree-config="props.pageConfig.treeConfig"
        :show-action="showActionColumn"
        :show-pagination="props.pageConfig.tableConfig.showPagination"
        :show-selection="props.pageConfig.tableConfig.showSelection"
        :reserve-selection="props.pageConfig.tableConfig.reserveSelection"
        :show-index="props.pageConfig.tableConfig.showIndex"
        @selection-change="handleSelectionChange"
        @page-change="handlePageChange"
      >
        <template #action="{ row }">
          <div class="action-content">
            <template v-for="btn in allActionButtons" :key="btn.name">
              <ScButton
                v-if="!btn.show || btn.show(row)"
                :text="btn.text"
                :type="btn.type"
                :icon="btn.icon"
                :disabled="isButtonDisabled(btn, row)"
                @click="btn.onClick(row)"
              >
                {{ resolveButtonName(btn, row) }}
              </ScButton>
            </template>
            <slot name="action-custom" />
          </div>
        </template>
        <template
          v-for="(_, slotName) in $slots"
          :key="slotName"
          #[transformSlotName(slotName)]="slotProps"
        >
          <slot
            v-if="isCustomSlot(slotName)"
            :name="slotName"
            v-bind="slotProps"
          />
        </template>
      </ScTable>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use './page.scss';
</style>
