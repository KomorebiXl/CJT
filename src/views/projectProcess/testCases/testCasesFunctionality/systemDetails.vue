<!--测试用例功能性-子系统测试项（只读视图 + AI 扩写展示/重新生成）-->
<script setup lang="ts">
import { ElMessage } from 'element-plus'
import { RefreshRight } from '@element-plus/icons-vue'
import type { DynamicFileColumn } from '@/types/projectProcess/projectProcessCommon'
import type {
  TestCaseFnItemResult,
  TestCaseFnItemSearchParams
} from '@/types/projectProcess/testCases'
import {
  downloadAiTestCaseAPI,
  getTestCaseFnItemListAPI,
  regenerateAiTestCaseAPI
} from '@/api/projectProcess/testCases-api'
import { downloadFile } from '@/utils/file'
import { getProcessProjectDetail } from '@/utils/processProject'
import { useScConfirm } from '@/hooks/useScConfirmDialog.ts'
import { useIfUsePlanStealer } from '@/hooks/useProcessProjectFlags.ts'
import { mergeDynamicAfterAnchor } from '@/views/projectProcess/projectProcessUtils.ts'
import { OperateButtonGroup } from '../../components'
import { runAiTestCaseTask } from './aiTask'
import {
  TEST_CASE_FN_FLAT_BUTTONS,
  TEST_CASE_FN_SEARCHBAR_ITEMS,
  TEST_CASE_FN_TABLE_COLUMNS,
  createTestCaseFnExtraParams
} from './testCasesFunctionality.config'

const props = defineProps<{
  systemId: string
  systemName: string
}>()

const emit = defineEmits<{
  (e: 'back'): void
}>()

const { scConfirm } = useScConfirm()
const ifUsePlanStealer = useIfUsePlanStealer()

const scResourcePageRef = useTemplateRef<PageInstance>('scResourcePageRef')

const searchbarItems = reactive<SearchbarItems<TestCaseFnItemSearchParams>>(
  TEST_CASE_FN_SEARCHBAR_ITEMS
)

const dynamicData = ref<DynamicFileColumn[]>([])

// 基础列 + 动态文件列（插在「测试项说明」或「测试项」之后）
const columns = computed<TableColumns>(() => {
  let list: TableColumns = [...TEST_CASE_FN_TABLE_COLUMNS]
  if (ifUsePlanStealer.value) {
    list = list.filter(col => col.prop !== 'itemDescription')
  }
  return mergeDynamicAfterAnchor(list, dynamicData.value, item => ({
    label: item.name,
    prop: item.field,
    width: 150
  }))
})

const pageConfig: PageConfig<TestCaseFnItemResult> = {
  searchConfig: { searchbarItems },
  operateConfig: {
    defaultButtons: []
  },
  tableConfig: {
    get tableColumns() {
      return columns.value
    },
    showDefaultButtons: false,
    showPagination: false,
    rowClassName: ({ row }) =>
      [row.enable === 0 ? 'row-deleted' : '', row.titleFlag === '1' ? 'row-title' : '']
        .filter(Boolean)
        .join(' ')
  },
  fetchData: async params => {
    const { data } = await getTestCaseFnItemListAPI({
      ...params,
      ...createTestCaseFnExtraParams(props.systemId)
    })
    dynamicData.value = data?.files ?? []
    return {
      rows: data?.result?.rows ?? [],
      total: data?.result?.total ?? 0
    }
  },
  treeConfig: { children: 'child', rowKey: 'id', showExpandButton: true }
}

// ---- 单项重新生成（展开区按钮） ----
const regeneratingRows = reactive(new Set<string>())

const regenerateOne = async (row: TestCaseFnItemResult) => {
  regeneratingRows.add(row.id)
  try {
    const { data } = await regenerateAiTestCaseAPI({ resultIds: [row.id] })
    const item = data?.[0]
    if (!item || item.status === 3) {
      ElMessage.error(item?.message || '重新生成失败')
      return
    }
    if (item.status === 2) {
      ElMessage.warning('AI 调用失败，已按原文回填')
    } else {
      ElMessage.success('重新生成完成')
    }
    await scResourcePageRef.value?.refresh()
  } finally {
    regeneratingRows.delete(row.id)
  }
}

// ---- 平铺按钮分发 ----
const getSubjectScope = async () => {
  const detail = await getProcessProjectDetail()
  if (!detail?.id) {
    ElMessage.error('未获取到项目信息')
    return null
  }
  return detail
}

const handleRegenerateAll = async () => {
  try {
    await scConfirm({
      message: `将重新生成「${props.systemName}」下全部测试项的 AI 扩写内容（覆盖已有结果），确认执行？`
    })
  } catch {
    return
  }
  const detail = await getSubjectScope()
  if (!detail) return
  try {
    await runAiTestCaseTask({
      ...createTestCaseFnExtraParams(props.systemId),
      subjectId: String(detail.id),
      mode: 'overwrite'
    })
    ElMessage.success('重新生成完成')
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '重新生成失败')
    return
  }
  await scResourcePageRef.value?.refresh()
}

const handleDownloadWord = async () => {
  const detail = await getSubjectScope()
  if (!detail) return
  const response = await downloadAiTestCaseAPI({
    subjectId: String(detail.id),
    feature: '1',
    subFeature: '1'
  })
  await downloadFile(response, `测试用例-${detail.code}.docx`)
}

const handleFlatClick = async (btnId: string) => {
  if (btnId === 'back') emit('back')
  if (btnId === 'regenerateAll') await handleRegenerateAll()
  if (btnId === 'downloadWord') await handleDownloadWord()
}
</script>

<template>
  <ScResourcePage ref="scResourcePageRef" :page-config="pageConfig">
    <template #operate-button-slot>
      <OperateButtonGroup
        :flat-buttons="TEST_CASE_FN_FLAT_BUTTONS"
        @flat-click="handleFlatClick"
      />
    </template>
    <template #extra-operate-left>
      <el-tag>{{ props.systemName }}</el-tag>
    </template>
    <template #aiExpand="{ row }">
      <div v-if="row.titleFlag !== '1'" class="ai-expand">
        <template v-if="row.aiExpansion">
          <el-descriptions :column="2" border size="small" class="ai-expand-desc">
            <el-descriptions-item label="依据（与产品说明书的追踪关系）" :span="2">
              {{ row.aiExpansion.basis || '--' }}
            </el-descriptions-item>
            <el-descriptions-item label="需求描述" :span="2">
              {{ row.aiExpansion.requirementDesc || '--' }}
            </el-descriptions-item>
            <el-descriptions-item label="前提条件（初始化）" :span="2">
              <span class="pre-wrap">{{ row.aiExpansion.precondition || '--' }}</span>
            </el-descriptions-item>
            <el-descriptions-item label="步骤" :span="2">
              <span class="pre-wrap">{{ row.aiExpansion.step || '--' }}</span>
            </el-descriptions-item>
            <el-descriptions-item label="优先级别">
              {{ row.aiExpansion.priority || '--' }}
            </el-descriptions-item>
          </el-descriptions>
          <el-table
            v-if="row.aiExpansion.dataRows?.length"
            :data="row.aiExpansion.dataRows"
            border
            size="small"
            class="ai-expand-rows"
          >
            <el-table-column prop="no" label="编号" width="70" align="center" />
            <el-table-column prop="input" label="输入" min-width="180" />
            <el-table-column prop="expected" label="预期结果" min-width="220" />
          </el-table>
          <div v-else class="ai-expand-hint">无测试数据行（AI 降级或未生成数据）</div>
        </template>
        <div v-else class="ai-expand-hint">暂无 AI 扩写内容</div>
        <el-button
          type="primary"
          size="small"
          plain
          :icon="RefreshRight"
          :loading="regeneratingRows.has(row.id)"
          class="ai-expand-btn"
          @click="regenerateOne(row as TestCaseFnItemResult)"
        >
          重新生成
        </el-button>
      </div>
    </template>
  </ScResourcePage>
</template>

<style scoped lang="scss">
:deep(.row-deleted) {
  background-color: #fee;

  td {
    background-color: #fee;
  }
}

:deep(.row-title) {
  .el-table__expand-icon {
    display: none;
  }
}

.ai-expand {
  padding: 8px 12px;

  .ai-expand-desc {
    margin-bottom: 10px;
  }

  .ai-expand-rows {
    margin-bottom: 10px;
  }

  .ai-expand-hint {
    color: var(--el-text-color-secondary);
    font-size: 13px;
    margin-bottom: 10px;
  }

  .ai-expand-btn {
    margin-top: 2px;
  }

  .pre-wrap {
    white-space: pre-wrap;
  }
}
</style>
