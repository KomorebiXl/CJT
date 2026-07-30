<script setup lang="ts">
import type { TableInstance } from 'element-plus'
import type { ScTableInstance, ScTableProps } from './scTable.ts'
import ScColumnItem from './ScColumnItem.vue'

defineOptions({
  name: 'ScTable',
  inheritAttrs: false
})

const tableRef = useTemplateRef<TableInstance>('tableRef')
const attrs = useAttrs()

const props = withDefaults(defineProps<ScTableProps>(), {
  loading: false,
  border: true,
  stripe: false,
  showSelection: false,
  showIndex: false,
  showAction: true,
  actionWidth: 150,
  actionFixed: 'right',
  highlightCurrentRow: true,
  showPagination: true,
  total: 0,
  pageSize: 30,
  pageSizes: () => [30, 60, 90, 120],
  paginationLayout: 'total, sizes, prev, pager, next, jumper',
  treeConfig: () => ({})
})

const emit = defineEmits<{
  pageChange: [page: number, size: number]
  'selection-change': [selection: any[]]
  'current-change': [
    currentRow: Record<string, any> | null,
    oldRow: Record<string, any> | null
  ]
}>()

// ---- attrs 透传 ----
const tableAttrs = computed(() => {
  const { style, class: _class, ...rest } = attrs
  return rest
})

const tableEvents = computed(() => {
  const events: Record<string, any> = {}
  for (const key in attrs) {
    if (key.startsWith('on')) {
      events[key.slice(2).toLowerCase()] = attrs[key]
    }
  }
  return events
})

// ---- 树形配置合并默认值 ----
const resolvedTreeConfig = computed(() => ({
  rowKey: 'id',
  treeProps: { children: 'children' },
  defaultExpandAll: false,
  ...props.treeConfig
}))

// ---- 分页状态 ----
const currentPage = ref(1)
const currentPageSize = ref(props.pageSize)

// 同步外部 pageSize 变化
watch(
  () => props.pageSize,
  val => {
    currentPageSize.value = val
  }
)

const indexMethod = (index: number) => {
  return (currentPage.value - 1) * currentPageSize.value + index + 1
}

const handleSizeChange = (size: number) => {
  currentPage.value = 1
  emit('pageChange', currentPage.value, size)
}

const handleCurrentChange = (page: number) => {
  emit('pageChange', page, currentPageSize.value)
}

// 单选行变化，转发给使用方
const handleCurrentRowChange = (
  currentRow: Record<string, any> | null,
  oldRow: Record<string, any> | null
) => {
  emit('current-change', currentRow, oldRow)
}

// ---- 暴露方法 ----
// 展开单行方法
const toggleRowExpansion = (row: any, expanded: boolean) => {
  tableRef.value?.toggleRowExpansion(row, expanded)
}

// 递归收起
const collapseAll = (rows: any[], table: any) => {
  rows.forEach((row: any) => {
    table.toggleRowExpansion(row, false)
    if (row.children && row.children.length > 0) {
      collapseAll(row.children, table)
    }
  })
}

// el-table多选数据
const toggleRowSelection = (row: any, selected: boolean) => {
  tableRef.value?.toggleRowSelection(row, selected)
}

// 供单选场景使用：手动设置/取消高亮行
const setCurrentRow = (row: Record<string, any> | undefined) => {
  tableRef.value?.setCurrentRow(row)
}

defineExpose<ScTableInstance>({
  toggleRowExpansion,
  toggleRowSelection,
  setCurrentRow
})
</script>

<template>
  <div class="sc-table-list">
    <div class="sc-table-wrapper">
      <el-table
        ref="tableRef"
        v-loading="loading"
        v-bind="tableAttrs"
        v-on="tableEvents"
        class="sc-table"
        :data="data"
        :border="border"
        :stripe="stripe"
        :row-key="resolvedTreeConfig.rowKey"
        :tree-props="resolvedTreeConfig.treeProps"
        :default-expand-all="resolvedTreeConfig.defaultExpandAll"
        :row-class-name="rowClassName"
        :highlight-current-row="highlightCurrentRow"
        height="100%"
        @selection-change="emit('selection-change', $event)"
        @current-change="handleCurrentRowChange"
      >
        <!-- 选择列 -->
        <el-table-column
          v-if="showSelection"
          type="selection"
          width="50"
          fixed="left"
          align="center"
        />
        <!-- 序号列 -->
        <el-table-column
          v-if="showIndex"
          type="index"
          label="序号"
          width="80"
          align="center"
          :index="indexMethod"
        />
        <!-- 数据列 -->
        <template v-for="column in tableColumns" :key="column.prop">
          <sc-column-item :columnItem="column">
            <template v-for="(_, name) in $slots" #[name]="slotProps">
              <slot :name="name" v-bind="slotProps" />
            </template>
          </sc-column-item>
        </template>
        <!-- 操作列 -->
        <el-table-column
          v-if="showAction && tableColumns.length !== 0"
          label="操作"
          :width="actionWidth"
          :fixed="actionFixed"
          align="center"
        >
          <template #default="scope">
            <slot name="action" :row="scope.row" :$index="scope.$index" />
          </template>
        </el-table-column>
        <!-- 空状态 -->
        <template #empty>
          <div class="table-empty">
            <slot name="empty">
              <el-empty :image-size="120" description="暂无数据" />
            </slot>
          </div>
        </template>
      </el-table>
    </div>
    <div v-if="showPagination && data.length !== 0" class="pagination-content">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="currentPageSize"
        :total="total"
        :page-sizes="pageSizes"
        :layout="paginationLayout"
        :background="true"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
@mixin flex-col {
  display: flex;
  flex-direction: column;
}

.sc-table-list {
  @include flex-col;
  flex: 1;
  min-height: 0;
  border-radius: 5px;
  overflow: hidden;
  gap: 5px;

  .sc-table-wrapper {
    flex: 1;
    min-height: 0;
    position: relative;

    .sc-table {
      position: absolute;
      inset: 0;
    }
  }

  .pagination-content {
    flex-shrink: 0;
    padding: 10px;
    display: flex;
    justify-content: flex-end;
    align-items: center;
  }
}
</style>
