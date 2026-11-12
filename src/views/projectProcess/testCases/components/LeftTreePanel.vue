<!--测试用例-左树导航（过滤/选中/刷新后按 id 恢复选中；
    无 child 数据时 el-tree 自然退化为平铺列表）-->
<script setup lang="ts">
import type { TreeInstance } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import type { TestCaseFnItemResult } from '@/types/projectProcess/testCases'

const props = defineProps<{
  /** 全量树形数据 */
  rows: TestCaseFnItemResult[]
  loading?: boolean
}>()

const emit = defineEmits<{
  (e: 'select', row: TestCaseFnItemResult | null): void
}>()

const treeRef = useTemplateRef<TreeInstance>('treeRef')

const isLeafRow = (row: TestCaseFnItemResult) => String(row.titleFlag) !== '1'

const findFirstLeaf = (
  rows: TestCaseFnItemResult[]
): TestCaseFnItemResult | null => {
  for (const row of rows) {
    if (isLeafRow(row)) return row
    const hit = findFirstLeaf(row.child ?? [])
    if (hit) return hit
  }
  return null
}

const findRowById = (
  rows: TestCaseFnItemResult[],
  id: string
): TestCaseFnItemResult | null => {
  for (const row of rows) {
    if (row.id === id) return row
    const hit = findRowById(row.child ?? [], id)
    if (hit) return hit
  }
  return null
}

/** 数据加载/刷新后恢复选中：优先按 id 保持原选中，否则回落到第一个叶子行 */
const syncSelectionAfterFetch = async () => {
  await nextTick()
  const currentKey = treeRef.value?.getCurrentKey() as string | undefined
  const kept =
    (currentKey && findRowById(props.rows, currentKey)) ||
    findFirstLeaf(props.rows)
  if (kept) {
    // setCurrentKey 只设高亮不触发 node-click，选中结果需主动抛给父级
    treeRef.value?.setCurrentKey(kept.id)
    emit('select', kept)
  } else {
    emit('select', null)
    treeRef.value?.setCurrentKey(null)
  }
}

watch(
  () => props.rows,
  () => {
    void syncSelectionAfterFetch()
  }
)

// 树过滤：单输入框匹配序号或测试项
const filterText = ref('')
watch(filterText, keyword => treeRef.value?.filter(keyword))
const filterNode = (value: string, data: any) => {
  const row = data as TestCaseFnItemResult
  if (!value?.trim()) return true
  return `${row.serialNumber}${row.item}`.includes(value.trim())
}

const handleNodeClick = (data: TestCaseFnItemResult) => {
  emit('select', data)
}
</script>

<template>
  <div class="tree-panel">
    <el-input
      v-model="filterText"
      class="tree-filter"
      placeholder="输入序号 / 测试项过滤"
      clearable
      :prefix-icon="Search"
    />
    <div v-loading="props.loading" class="tree-body">
      <el-tree
        ref="treeRef"
        :data="props.rows"
        :props="{ children: 'child' }"
        node-key="id"
        :filter-node-method="filterNode"
        default-expand-all
        highlight-current
        :expand-on-click-node="false"
        empty-text="暂无测试项"
        @node-click="handleNodeClick"
      >
        <template #default="{ data }">
          <span
            class="tree-node"
            :class="{ 'node-deleted': Number(data.enable) === 0 }"
            :title="`${data.serialNumber} ${data.item}`"
          >
            {{ data.serialNumber }} {{ data.item }}
          </span>
        </template>
      </el-tree>
    </div>
  </div>
</template>

<style scoped lang="scss">
.tree-panel {
  width: 280px;
  flex-shrink: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 10px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 5px;
  background-color: var(--card-bg, #fff);
  overflow: hidden;

  .tree-filter {
    flex-shrink: 0;
  }

  .tree-body {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
  }

  .tree-node {
    font-size: 13px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;

    &.node-deleted {
      color: var(--el-text-color-placeholder);
      text-decoration: line-through;
    }
  }
}
</style>
