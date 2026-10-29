<!--测试用例-左树导航 + 右侧 AI 扩写详情共享骨架（功能性里层与六特性页共用；
    无 child 数据时 el-tree 自然退化为平铺列表，两种形态零分支）-->
<script setup lang="ts">
import { ElMessage } from 'element-plus'
import type { TreeInstance } from 'element-plus'
import { Back, RefreshRight, Search } from '@element-plus/icons-vue'
import type { ScTableColumn } from '@/components/ScBaseComponents'
import type {
  TestCaseAiCase,
  TestCaseFnItemResult
} from '@/types/projectProcess/testCases'
import {
  downloadAiTestCaseAPI,
  getTestCaseFnItemListAPI,
  regenerateAiTestCaseAPI
} from '@/api/projectProcess/testCases-api'
import { downloadFile } from '@/utils/file'
import { getProcessProjectDetail } from '@/utils/processProject'
import type { DynamicFileColumn } from '@/types/projectProcess/projectProcessCommon'
import { useScConfirm } from '@/hooks/useScConfirmDialog.ts'
import { usePermission } from '@/components/ScBaseComponents/ScResourcePage/hooks/usePermission.ts'
import { getDictOptions } from '@/utils/dict'
import { OperateButtonGroup } from '../../components'
import { useAiTaskStore } from '@/store/modules/ai-task-store'

/** 右栏 AI 扩写数据行列（编号/输入/预期结果），各特性通用 */
const AI_DATA_COLUMNS: ScTableColumn[] = [
  { label: '编号', prop: 'no', width: 70, align: 'center' },
  { label: '输入', prop: 'input', minWidth: 180 },
  { label: '预期结果', prop: 'expected', minWidth: 220 }
]

const props = withDefaults(
  defineProps<{
    /** 特性码（功能性=1，六特性=2..7） */
    feature: string
    /** 特性中文名（Tag 展示 / 生成确认文案 / 任务卡片与文件命名） */
    featureName: string
    /** 子特性码（功能性固定 1；六特性不传=不限） */
    subFeature?: string
    /** 所属子系统（功能性里层传；六特性为项目级不传） */
    subsystem?: { id: string; name: string }
    /** 显示「返回」按钮（功能性里层回外层用） */
    showBack?: boolean
  }>(),
  { showBack: false }
)

const emit = defineEmits<{
  (e: 'back'): void
}>()

const { scConfirm } = useScConfirm()
const { hasPermission } = usePermission()
const aiTaskStore = useAiTaskStore()

/** 生成/下载共用范围参数 */
const scopeParams = computed(() => ({
  feature: props.feature,
  ...(props.subFeature ? { subFeature: props.subFeature } : {}),
  ...(props.subsystem ? { subsystem: props.subsystem.id } : {})
}))

/** 范围名：子系统名（功能性）或特性名（六特性），用于 Tag / 确认文案 / 文件命名 */
const scopeName = computed(() => props.subsystem?.name ?? props.featureName)

/** 右下角任务卡片元信息（scopeName 传空 = 来源不明恢复，范围按本页特性维度） */
const makeTaskMeta = (
  project: { id: number | string; code: string; name: string },
  scope?: string
) => ({
  subjectId: String(project.id),
  scopeLabel: `${project.name} · ${scope ?? '全部子系统'}`,
  downloadParams: {
    subjectId: String(project.id),
    ...scopeParams.value
  },
  fileName: scope
    ? `测试用例-${project.code}-${scope}.docx`
    : `测试用例-${project.code}.docx`
})

// ---- 左树 ----
const treeRef = useTemplateRef<TreeInstance>('treeRef')
const loading = ref(false)
/** 全量树形数据 */
const treeRows = ref<TestCaseFnItemResult[]>([])
/** 动态文件列定义 */
const dynamicData = ref<DynamicFileColumn[]>([])
/** 当前选中行 */
const currentRow = ref<TestCaseFnItemResult | null>(null)

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

const fetchTreeData = async () => {
  loading.value = true
  try {
    const { data } = await getTestCaseFnItemListAPI({
      // 接口实际不分页，参数类型必填分页与搜索字段，传哑参数（同 menu list 先例）；搜索改为前端树过滤
      pageNum: 1,
      pageSize: 30,
      serialNumber: '',
      item: '',
      dataType: '2',
      ...scopeParams.value
    })
    treeRows.value = data?.result?.rows ?? []
    dynamicData.value = data?.files ?? []
  } finally {
    loading.value = false
  }
}

/** 数据加载/刷新后恢复选中：优先按 id 保持原选中，否则回落到第一个叶子行 */
const syncSelectionAfterFetch = async () => {
  await nextTick()
  const kept =
    (currentRow.value?.id &&
      findRowById(treeRows.value, currentRow.value.id)) ||
    findFirstLeaf(treeRows.value)
  if (kept) {
    // setCurrentKey 只设高亮不触发 node-click，currentRow 需手动同步
    treeRef.value?.setCurrentKey(kept.id)
    currentRow.value = kept
  } else {
    currentRow.value = null
    treeRef.value?.setCurrentKey(null)
  }
}

watch(treeRows, () => {
  void syncSelectionAfterFetch()
})

// 树过滤：单输入框匹配序号或测试项
const filterText = ref('')
watch(filterText, keyword => treeRef.value?.filter(keyword))
const filterNode = (value: string, data: any) => {
  const row = data as TestCaseFnItemResult
  if (!value?.trim()) return true
  return `${row.serialNumber}${row.item}`.includes(value.trim())
}

const handleNodeClick = (data: TestCaseFnItemResult) => {
  currentRow.value = data
}

// ---- 右栏详情 ----
/** 有效用例列表（问题6 功能点拆分）：新结构 cases 优先；旧数据/无扩写包装为单条（原文回落） */
const effectiveCases = computed<Array<TestCaseAiCase>>(() => {
  const row = currentRow.value
  const ai = row?.aiExpansion
  if (ai?.cases?.length) return ai.cases
  return [
    {
      caseName: '',
      requirementDesc: ai?.requirementDesc ?? '',
      precondition: ai?.precondition ?? row?.precondition ?? '',
      step: ai?.step ?? row?.step ?? '',
      priority: ai?.priority ?? '',
      dataRows: ai?.dataRows ?? []
    }
  ]
})

const PRIORITY_TAG_TYPES: Record<string, 'danger' | 'warning' | 'info'> = {
  高: 'danger',
  中: 'warning',
  低: 'info'
}

const priorityTagType = (priority?: string) =>
  PRIORITY_TAG_TYPES[(priority || '').trim()] ?? 'info'

/** 用例块标题：功能点名称，旧数据/未命名回落测试项名称 */
const caseBlockTitle = (item: TestCaseAiCase) =>
  item.caseName?.trim() || currentRow.value?.item || '未命名用例'

/** 折叠区展开状态；切换节点自动收起（避免上一篇长内容干扰阅读） */
const detailExpanded = ref<string[]>([])
watch(currentRow, () => {
  detailExpanded.value = []
})

const showDetail = computed(
  () => !!currentRow.value && isLeafRow(currentRow.value)
)

const dash = (v?: string | null) => (v && v.trim() ? v : '--')

/** 子特性码 → 标签映射（六特性折叠区展示用；字典缺失回退码值，异步加载完自动生效） */
const subFeatureLabels = ref<Record<string, string>>({})
getDictOptions('sub_property')
  .then(options => {
    subFeatureLabels.value = Object.fromEntries(
      options.map(o => [o.value, o.label])
    )
  })
  .catch(() => {})

/**
 * 折叠区共享字段：依据/测试项说明/首次与回归结果结论（问题7 对照展示）；
 * 前提条件/测试步骤/需求描述系用例级字段，随功能点用例块展示（见 effectiveCases）；
 * 子特性仅六特性有值（功能性 subFeature=1 为占位码不显示）；
 * 动态文件字段运行时存在于行数据上，类型未声明——同动态列方案
 */
const detailFields = computed(() => {
  const row = currentRow.value
  const ai = row?.aiExpansion
  const fields: Array<{ label: string; value: string }> = []
  if (row?.subFeature && row.subFeature !== '1') {
    fields.push({
      label: '子特性',
      value: dash(subFeatureLabels.value[row.subFeature] || row.subFeature)
    })
  }
  fields.push(
    { label: '依据（与产品说明书的追踪关系）', value: dash(ai?.basis) },
    { label: '首次测试结果', value: dash(row?.firstResult) },
    { label: '首次结论', value: dash(row?.firstConclusion) },
    { label: '回归验证结果', value: dash(row?.regressionResult) },
    { label: '回归结论', value: dash(row?.regressionConclusion) },
    { label: '测试项说明', value: dash(row?.itemDescription) },
    { label: '备注', value: dash(row?.remark) }
  )
  dynamicData.value.forEach(d =>
    fields.push({
      label: d.name,
      value: dash((row as any)?.[d.field])
    })
  )
  return fields
})

const panelTitle = computed(() =>
  currentRow.value
    ? `${currentRow.value.serialNumber} ${currentRow.value.item}`
    : '未选择测试项'
)

const emptyDescription = computed(() => {
  if (!currentRow.value) return '请在左侧选择测试项'
  if (!isLeafRow(currentRow.value)) return '当前为分类行，请选择具体测试项'
  return '暂无 AI 扩写内容，可点击右上角按钮生成'
})

/** 当前选中行可生成（叶子行且有权限） */
const canRegenerate = computed(
  () =>
    !!currentRow.value &&
    isLeafRow(currentRow.value) &&
    hasPermission('acceptance:result:aiTestCase:regenerate')
)

/** 右栏「生成/重新生成」：同步接口，完成后刷新树并按 id 保持选中 */
const regenerating = ref(false)
const regenerateCurrent = async () => {
  const row = currentRow.value
  if (!row || regenerating.value) return
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
    await fetchTreeData()
  } finally {
    regenerating.value = false
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

/** 「生成测试用例」：当前范围增量生成（已有结果的项自动跳过，问题1 六特性一键生成入口） */
const handleGenerateAll = async () => {
  try {
    await scConfirm({
      message: `将对「${scopeName.value}」生成 AI 测试用例（已有结果的项自动跳过），确认执行？`,
      confirmText: '确认生成'
    })
  } catch {
    return
  }
  const detail = await getSubjectScope()
  if (!detail) return
  try {
    await aiTaskStore.start(
      { subjectId: String(detail.id), ...scopeParams.value, mode: 'increment' },
      makeTaskMeta(detail, scopeName.value)
    )
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '生成任务提交失败')
  }
}

/** 「重新生成」：覆盖当前范围全部扩写，进度在右下角卡片展示，不锁屏 */
const handleRegenerateAll = async () => {
  try {
    await scConfirm({
      message: `将重新生成「${scopeName.value}」下全部测试项的 AI 扩写内容（覆盖已有结果），确认执行？`,
      confirmText: '确认生成'
    })
  } catch {
    return
  }
  const detail = await getSubjectScope()
  if (!detail) return
  try {
    await aiTaskStore.start(
      { subjectId: String(detail.id), ...scopeParams.value, mode: 'overwrite' },
      makeTaskMeta(detail, scopeName.value)
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
      ...scopeParams.value
    })
    await downloadFile(response, `测试用例-${detail.code}-${scopeName.value}.docx`)
  } catch {
    ElMessage.error('用例文档下载失败，请稍后重试')
  } finally {
    downloading.value = false
  }
}

const FLAT_BUTTONS = computed(() => {
  const list: Array<{ id: string; name: string; type: any; icon?: any; permission?: string }> = []
  if (props.showBack) {
    list.push({ id: 'back', name: '返回', type: 'info', icon: Back })
  }
  list.push(
    {
      id: 'generateAll',
      name: '生成测试用例',
      type: 'primary',
      permission: 'acceptance:result:aiTestCase:generate'
    },
    {
      id: 'regenerateAll',
      name: '重新生成',
      type: 'warning',
      permission: 'acceptance:result:aiTestCase:generate'
    },
    {
      id: 'downloadWord',
      name: '下载用例文档',
      type: 'success',
      permission: 'acceptance:result:aiTestCase:download'
    }
  )
  return list
})

// 平铺按钮随任务状态更新：进行中禁用「生成/重新生成」并显示进度，下载中防重复点击
const flatButtons = computed(() =>
  FLAT_BUTTONS.value.map(btn => {
    if (
      (btn.id === 'generateAll' || btn.id === 'regenerateAll') &&
      aiTaskStore.isRunning
    ) {
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

// 任务结束后刷新树（不在进行中逐次刷新：避免展开状态被反复重置）
watch(
  () => aiTaskStore.finishSeq,
  () => fetchTreeData()
)

onMounted(async () => {
  await fetchTreeData()
  // 进入页面时接上本项目进行中的任务（来源不明时按全项目范围恢复）
  const detail = await getProcessProjectDetail()
  if (detail?.id) await aiTaskStore.resume(String(detail.id), makeTaskMeta(detail))
})

const handleFlatClick = async (btnId: string) => {
  if (btnId === 'back') emit('back')
  if (btnId === 'generateAll') await handleGenerateAll()
  if (btnId === 'regenerateAll') await handleRegenerateAll()
  if (btnId === 'downloadWord') await handleDownloadWord()
}
</script>

<template>
  <div class="system-details">
    <div class="details-header">
      <div class="header-buttons">
        <OperateButtonGroup
          :flat-buttons="flatButtons"
          @flat-click="handleFlatClick"
        />
      </div>
      <el-tag>{{ scopeName }}</el-tag>
    </div>
    <div class="details-body">
      <div class="tree-panel">
        <el-input
          v-model="filterText"
          class="tree-filter"
          placeholder="输入序号 / 测试项过滤"
          clearable
          :prefix-icon="Search"
        />
        <div v-loading="loading" class="tree-body">
          <el-tree
            ref="treeRef"
            :data="treeRows"
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
      <div class="detail-panel">
        <div class="panel-header">
          <div class="panel-title" :title="panelTitle">{{ panelTitle }}</div>
          <el-button
            v-if="canRegenerate"
            type="primary"
            :icon="RefreshRight"
            :loading="regenerating"
            @click="regenerateCurrent"
          >
            {{ currentRow?.aiExpansion ? '重新生成' : '生成' }}
          </el-button>
        </div>
        <template v-if="showDetail">
          <div class="summary-bar">
            <div class="s-item">
              <span class="s-label">首次测试</span>
              <span class="s-value">
                {{ currentRow!.firstTester || '--' }}
                {{ currentRow!.firstTestTime || '' }}
              </span>
            </div>
            <div class="s-item">
              <span class="s-label">回归测试</span>
              <span class="s-value">
                {{ currentRow!.regressionTester || '--' }}
                {{ currentRow!.regressionTestTime || '' }}
              </span>
            </div>
          </div>
          <div class="detail-collapse">
            <el-collapse v-model="detailExpanded">
              <el-collapse-item title="更多详情" name="detail">
                <el-descriptions
                  :column="2"
                  border
                  size="small"
                  class="detail-desc"
                >
                  <el-descriptions-item
                    v-for="field in detailFields"
                    :key="field.label"
                    :label="field.label"
                    :span="2"
                  >
                    {{ field.value }}
                  </el-descriptions-item>
                </el-descriptions>
              </el-collapse-item>
            </el-collapse>
          </div>
        </template>
        <div class="panel-body">
          <template v-if="showDetail">
            <div
              v-for="(item, index) in effectiveCases"
              :key="index"
              class="case-block"
            >
              <div class="case-header">
                <span class="case-title" :title="caseBlockTitle(item)">
                  {{ caseBlockTitle(item) }}
                </span>
                <el-tag
                  v-if="(item.priority || '').trim()"
                  :type="priorityTagType(item.priority)"
                  size="small"
                >
                  {{ item.priority }}
                </el-tag>
              </div>
              <el-descriptions
                :column="1"
                border
                size="small"
                class="case-desc"
              >
                <el-descriptions-item label="需求描述">
                  {{ item.requirementDesc || '--' }}
                </el-descriptions-item>
                <el-descriptions-item label="前提条件">
                  {{ item.precondition || '--' }}
                </el-descriptions-item>
                <el-descriptions-item label="测试步骤">
                  {{ item.step || '--' }}
                </el-descriptions-item>
              </el-descriptions>
              <div class="case-table">
                <ScTable
                  :data="item.dataRows"
                  :table-columns="AI_DATA_COLUMNS"
                  size="small"
                  :show-action="false"
                  :show-pagination="false"
                >
                  <template #empty>
                    <el-empty
                      :image-size="80"
                      description="暂无测试数据行（AI 降级或未生成数据）"
                    />
                  </template>
                </ScTable>
              </div>
            </div>
          </template>
          <el-empty v-else :image-size="100" :description="emptyDescription" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.system-details {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.details-header {
  display: flex;
  justify-content: space-between;
  align-items: center;

  .header-buttons {
    display: flex;
    gap: 20px;
  }
}

.details-body {
  flex: 1;
  min-height: 0;
  display: flex;
  gap: 12px;
}

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

.detail-panel {
  flex: 1;
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 5px;
  background-color: var(--card-bg, #fff);
  overflow: hidden;

  .panel-header {
    flex-shrink: 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    padding: 10px 12px;
    border-bottom: 1px solid var(--el-border-color-lighter);

    .panel-title {
      flex: 1;
      min-width: 0;
      font-weight: 600;
      font-size: 14px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }

  .summary-bar {
    flex-shrink: 0;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 6px 24px;
    padding: 8px 12px;
    border-bottom: 1px solid var(--el-border-color-lighter);

    .s-item {
      display: flex;
      align-items: center;
      gap: 6px;
      min-width: 0;
    }

    .s-label {
      color: var(--el-text-color-secondary);
      font-size: 13px;
      white-space: nowrap;
    }

    .s-value {
      font-size: 13px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }

  .detail-collapse {
    flex-shrink: 0;
    border-bottom: 1px solid var(--el-border-color-lighter);

    :deep(.el-collapse) {
      border-top: none;

      .el-collapse-item__header {
        padding: 0 12px;
        height: 36px;
        line-height: 36px;
        font-size: 13px;
        color: var(--el-text-color-secondary);
        background-color: transparent;
        border-bottom: none;
      }

      .el-collapse-item__wrap {
        border-bottom: none;
      }

      .el-collapse-item__content {
        padding: 0 12px 10px;
        // 长文本限高内部滚动，避免展开后挤压数据行表格
        max-height: 240px;
        overflow-y: auto;
      }
    }
  }

  .detail-desc {
    :deep(.el-descriptions__label) {
      width: 110px;
      min-width: 110px;
    }

    // AI 扩写文本含换行，默认 normal 会丢行
    :deep(.el-descriptions__content) {
      white-space: pre-wrap;
      word-break: break-word;
    }
  }

  .panel-body {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 10px 12px;
    overflow-y: auto;

    .case-block {
      flex-shrink: 0;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .case-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
    }

    .case-title {
      flex: 1;
      min-width: 0;
      font-weight: 600;
      font-size: 13px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    // AI 扩写文本含换行，默认 normal 会丢行
    .case-desc :deep(.el-descriptions__content) {
      white-space: pre-wrap;
      word-break: break-word;
    }
  }
}
</style>
