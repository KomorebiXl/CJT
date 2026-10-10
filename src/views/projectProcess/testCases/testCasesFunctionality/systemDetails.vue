<!--测试用例功能性-子系统测试项-->
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
import { usePermission } from '@/components/ScBaseComponents/ScResourcePage/hooks/usePermission.ts'
import { mergeDynamicAfterAnchor } from '@/views/projectProcess/projectProcessUtils.ts'
import { OperateButtonGroup } from '../../components'
import { useAiTaskStore } from '@/store/modules/ai-task-store'
import {
  TEST_CASE_FN_FLAT_BUTTONS,
  TEST_CASE_FN_SEARCHBAR_ITEMS,
  TEST_CASE_FN_SCOPE,
  TEST_CASE_FN_TABLE_COLUMNS,
  createTestCaseFnExtraParams,
  createTestCaseFnTaskMeta
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
const { hasPermission } = usePermission()
const aiTaskStore = useAiTaskStore()

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

const aiDialogVisible = ref(false)
const aiDialogRow = ref<TestCaseFnItemResult | null>(null)
const regenerating = ref(false)

const openAiDialog = (row: TestCaseFnItemResult) => {
  aiDialogRow.value = row
  aiDialogVisible.value = true
}

const regenerateOne = async () => {
  const row = aiDialogRow.value
  if (!row) return
  regenerating.value = true
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
    aiDialogVisible.value = false
    await scResourcePageRef.value?.refresh()
  } finally {
    regenerating.value = false
  }
}

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
    customActionButtons: [
      {
        name: 'AI 扩写',
        type: 'primary',
        text: true,
        show: row => row.titleFlag !== '1',
        onClick: openAiDialog
      }
    ],
    rowClassName: ({ row }) => (row.enable === 0 ? 'row-deleted' : '')
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

// ---- 平铺按钮分发 ----
const getSubjectScope = async () => {
  const detail = await getProcessProjectDetail()
  if (!detail?.id) {
    ElMessage.error('未获取到项目信息')
    return null
  }
  return detail
}

/** 里层「重新生成」：覆盖当前子系统全部扩写，进度在右下角卡片展示，不锁屏 */
const handleRegenerateAll = async () => {
  try {
    await scConfirm({
      message: `将重新生成「${props.systemName}」下全部测试项的 AI 扩写内容（覆盖已有结果），确认执行？`,
      confirmText: '确认生成'
    })
  } catch {
    return
  }
  const detail = await getSubjectScope()
  if (!detail) return
  try {
    await aiTaskStore.start(
      {
        subjectId: String(detail.id),
        ...TEST_CASE_FN_SCOPE,
        subsystem: props.systemId,
        mode: 'overwrite'
      },
      createTestCaseFnTaskMeta(detail, {
        id: props.systemId,
        name: props.systemName
      })
    )
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '生成任务提交失败')
  }
}

const downloading = ref(false)
const handleDownloadWord = async () => {
  if (downloading.value) return
  const detail = await getSubjectScope()
  if (!detail) return
  downloading.value = true
  try {
    const response = await downloadAiTestCaseAPI({
      subjectId: String(detail.id),
      ...TEST_CASE_FN_SCOPE,
      subsystem: props.systemId
    })
    await downloadFile(
      response,
      `测试用例-${detail.code}-${props.systemName}.docx`
    )
  } catch {
    ElMessage.error('用例文档下载失败，请稍后重试')
  } finally {
    downloading.value = false
  }
}

// 平铺按钮随任务状态更新：进行中禁用「重新生成」并显示进度，下载中防重复点击
const flatButtons = computed(() =>
  TEST_CASE_FN_FLAT_BUTTONS.map(btn => {
    if (btn.id === 'regenerateAll' && aiTaskStore.isRunning) {
      const p = aiTaskStore.progress
      return {
        ...btn,
        name: `生成中 ${p?.processed ?? 0}/${p?.total ?? 0}`,
        disabled: true
      }
    }
    if (btn.id === 'downloadWord' && downloading.value) {
      return { ...btn, disabled: true }
    }
    return btn
  })
)

// 任务结束后刷新列表（不在进行中逐次刷新：避免树形展开状态被反复重置）
watch(
  () => aiTaskStore.finishSeq,
  () => scResourcePageRef.value?.refresh()
)

// 进入子系统时接上本项目进行中的任务（来源不明时按全项目范围恢复）
onMounted(async () => {
  const detail = await getProcessProjectDetail()
  if (detail?.id)
    aiTaskStore.resume(String(detail.id), createTestCaseFnTaskMeta(detail))
})

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
        :flat-buttons="flatButtons"
        @flat-click="handleFlatClick"
      />
    </template>
    <template #extra-operate-left>
      <el-tag>{{ props.systemName }}</el-tag>
    </template>
  </ScResourcePage>

  <el-dialog
    v-model="aiDialogVisible"
    :title="`AI 扩写内容 — ${aiDialogRow?.serialNumber ?? ''} ${aiDialogRow?.item ?? ''}`"
    width="860px"
    top="8vh"
    destroy-on-close
  >
    <template v-if="aiDialogRow">
      <template v-if="aiDialogRow.aiExpansion">
        <el-descriptions :column="2" border size="small" class="ai-dialog-desc">
          <el-descriptions-item
            label="依据（与产品说明书的追踪关系）"
            :span="2"
          >
            {{ aiDialogRow.aiExpansion.basis || '--' }}
          </el-descriptions-item>
          <el-descriptions-item label="需求描述" :span="2">
            {{ aiDialogRow.aiExpansion.requirementDesc || '--' }}
          </el-descriptions-item>
          <el-descriptions-item label="前提条件（初始化）" :span="2">
            <span class="pre-wrap">{{
              aiDialogRow.aiExpansion.precondition || '--'
            }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="步骤" :span="2">
            <span class="pre-wrap">{{
              aiDialogRow.aiExpansion.step || '--'
            }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="优先级别">
            {{ aiDialogRow.aiExpansion.priority || '--' }}
          </el-descriptions-item>
          <el-descriptions-item label="用例名称">
            {{ aiDialogRow.item || '--' }}
          </el-descriptions-item>
        </el-descriptions>
        <el-table
          v-if="aiDialogRow.aiExpansion.dataRows?.length"
          :data="aiDialogRow.aiExpansion.dataRows"
          border
          size="small"
          class="ai-dialog-rows"
        >
          <el-table-column prop="no" label="编号" width="70" align="center" />
          <el-table-column prop="input" label="输入" min-width="180" />
          <el-table-column prop="expected" label="预期结果" min-width="220" />
        </el-table>
        <div v-else class="ai-dialog-hint">
          无测试数据行（AI 降级或未生成数据）
        </div>
      </template>
      <div v-else class="ai-dialog-hint">
        暂无 AI 扩写内容，可点击下方按钮生成
      </div>
    </template>
    <template #footer>
      <el-button
        v-if="hasPermission('acceptance:result:aiTestCase:regenerate')"
        type="primary"
        :icon="RefreshRight"
        :loading="regenerating"
        @click="regenerateOne"
      >
        重新生成
      </el-button>
      <el-button @click="aiDialogVisible = false">关 闭</el-button>
    </template>
  </el-dialog>
</template>

<style scoped lang="scss">
:deep(.row-deleted) {
  background-color: #fee;

  td {
    background-color: #fee;
  }
}

.ai-dialog-desc {
  margin-bottom: 12px;
}

.ai-dialog-rows {
  margin-bottom: 6px;
}

.ai-dialog-hint {
  color: var(--el-text-color-secondary);
  font-size: 13px;
  padding: 8px 0 12px;
}

.pre-wrap {
  white-space: pre-wrap;
}
</style>
