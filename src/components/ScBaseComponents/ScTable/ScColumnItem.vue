<script setup lang="ts">
import type { ScTableColumn } from './scTable.ts'

const props = defineProps<{
  columnItem: ScTableColumn
}>()

const { columnItem } = toRefs(props)

const calcMinWidth = (label: string) => {
  // 中文约14px，英文约8px，加padding预留32px
  const charWidth = /[\u4e00-\u9fa5]/.test(label) ? 14 : 8
  return label.length * charWidth + 32
}

const columnMinWidth = computed(() => {
  if (props.columnItem.width) return undefined
  if (props.columnItem.minWidth) return props.columnItem.minWidth
  return calcMinWidth(props.columnItem.label)
})
</script>

<template>
  <el-table-column
    :type="columnItem.type"
    :prop="columnItem.prop"
    :label="columnItem.label"
    :width="columnItem.width"
    :min-width="columnMinWidth"
    :fixed="columnItem.fixed"
    :align="columnItem.align || 'center'"
  >
    <template #default="scope">
      <slot
        v-if="columnItem.slot"
        :name="columnItem.slot"
        :row="scope.row"
        :column="columnItem"
        :$index="scope.$index"
      />
      <template v-else-if="columnItem.showOverflowTooltip">
        <el-tooltip
          :content="String(scope.row[columnItem.prop] ?? '--')"
          placement="left"
          popper-class="sc-table-tooltip"
        >
          <span class="cell-ellipsis">{{ scope.row[columnItem.prop] ?? '--' }}</span>
        </el-tooltip>
      </template>
      <span v-else>{{ scope.row[columnItem.prop] ?? '--' }}</span>
    </template>
  </el-table-column>
</template>

<style lang="scss" scoped>
.cell-ellipsis {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  word-break: break-all;
  line-height: 1.5;
}

:global(.sc-table-tooltip) {
  max-width: 300px;
  word-break: break-all;
  white-space: normal;
}
</style>
