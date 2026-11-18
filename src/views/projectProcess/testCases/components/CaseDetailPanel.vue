<!--测试用例-右栏详情（摘要条 + 功能点评审面板 + 折叠详情 + 按功能点用例块）；
    选中行由父组件传入，单项重新生成完成后 emit regenerated 由父组件刷新树-->
<script setup lang="ts">
import { ElMessage } from 'element-plus'
import { RefreshRight } from '@element-plus/icons-vue'
import type { ScTableColumn } from '@/components/ScBaseComponents'
import type {
  TestCaseAiCase,
  TestCaseFnItemResult
} from '@/types/projectProcess/testCases'
import { regenerateAiTestCaseAPI } from '@/api/projectProcess/testCases-api'
import type { DynamicFileColumn } from '@/types/projectProcess/projectProcessCommon'
import { usePermission } from '@/components/ScBaseComponents/ScResourcePage/hooks/usePermission.ts'
import { getDictOptions } from '@/utils/dict'
import FunctionPointPanel from './FunctionPointPanel.vue'

/** AI 扩写数据行列（编号/输入/预期结果），各特性通用 */
const AI_DATA_COLUMNS: ScTableColumn[] = [
  { label: '编号', prop: 'no', width: 70, align: 'center' },
  { label: '输入', prop: 'input', minWidth: 180 },
  { label: '预期结果', prop: 'expected', minWidth: 220 }
]

const props = defineProps<{
  /** 当前选中测试项（空=未选择） */
  row: TestCaseFnItemResult | null
  /** 动态文件列定义（折叠区展示） */
  dynamicColumns: DynamicFileColumn[]
  /** 隐藏单项 AI 动作（单项生成按钮+功能点面板）；用户文档集等整特性单表形态用（需求6.2） */
  hideAiActions?: boolean
}>()

const emit = defineEmits<{
  (e: 'regenerated'): void
  /** 功能点保存/单项提取成功：清单变更会使该项已有用例失效，父级刷新树（同 regenerated 口径） */
  (e: 'saved'): void
}>()

const { hasPermission } = usePermission()

const isLeafRow = (row: TestCaseFnItemResult) => String(row.titleFlag) !== '1'

const showDetail = computed(() => !!props.row && isLeafRow(props.row))

const dash = (v?: string | null) => (v && v.trim() ? v : '--')

const panelTitle = computed(() =>
  props.row ? `${props.row.serialNumber} ${props.row.item}` : '未选择测试项'
)

const emptyDescription = computed(() => {
  if (!props.row) return '请在左侧选择测试项'
  if (!isLeafRow(props.row)) return '当前为分类行，请选择具体测试项'
  return '暂无 AI 扩写内容，可点击右上角按钮生成'
})

// ---- 摘要行 + 折叠详情 ----

const detailScrollRef = useTemplateRef<HTMLDivElement>('detailScrollRef')

/** 仅切换测试项时收起详情并回顶；同项刷新保留阅读位置。 */
const detailExpanded = ref<string[]>([])
watch(
  () => props.row?.id,
  async () => {
    detailExpanded.value = []
    await nextTick()
    detailScrollRef.value?.scrollTo({ top: 0 })
  }
)

/** 子特性码 → 标签映射（六个特性折叠区展示用；字典缺失回退码值，异步加载完自动生效） */
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
 * 子特性仅六个特性有值（功能性 subFeature=1 为占位码不显示）；
 * 动态文件字段运行时存在于行数据上，类型未声明——同动态列方案
 */
const detailFields = computed(() => {
  const row = props.row
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
  props.dynamicColumns.forEach(d =>
    fields.push({
      label: d.name,
      value: dash((row as any)?.[d.field])
    })
  )
  return fields
})

// ---- 按功能点用例块 ----

/** 有效用例列表（问题6 功能点拆分）：新结构 cases 优先；旧数据/无扩写包装为单条（原文回落） */
const effectiveCases = computed<Array<TestCaseAiCase>>(() => {
  const row = props.row
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
  item.caseName?.trim() || props.row?.item || '未命名用例'

// ---- 单项重新生成 ----

/** 当前选中行可生成（叶子行且有权限） */
const canRegenerate = computed(
  () =>
    !!props.row &&
    isLeafRow(props.row) &&
    hasPermission('acceptance:result:aiTestCase:regenerate')
)

const regenerating = ref(false)
const regenerateCurrent = async () => {
  const row = props.row
  if (!row || regenerating.value) return
  regenerating.value = true
  try {
    if (!(await fpPanelRef.value?.ensureSaved()) || row.id !== props.row?.id)
      return
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
    emit('regenerated')
  } finally {
    regenerating.value = false
  }
}

// ---- 功能点面板（任务结束后由父组件经 refreshFunctionPoints 刷新） ----
const fpPanelRef = useTemplateRef<{
  refresh: () => Promise<void>
  ensureSaved: () => Promise<boolean>
}>('fpPanelRef')

defineExpose({
  refreshFunctionPoints: () => fpPanelRef.value?.refresh(),
  ensureSaved: () => fpPanelRef.value?.ensureSaved() ?? Promise.resolve(true)
})
</script>

<template>
  <div class="detail-panel">
    <div class="panel-header">
      <div class="panel-title" :title="panelTitle">{{ panelTitle }}</div>
      <ScButton
        v-if="canRegenerate && !props.hideAiActions"
        type="primary"
        :icon="RefreshRight"
        :on-click="() => regenerateCurrent()"
      >
        {{ props.row?.aiExpansion ? '重新生成' : '生成' }}
      </ScButton>
    </div>
    <div ref="detailScrollRef" class="panel-scroll">
      <template v-if="showDetail">
        <div class="summary-bar">
          <div class="s-item">
            <span class="s-label">首次测试</span>
            <span class="s-value">
              {{ props.row!.firstTester || '--' }}
              {{ props.row!.firstTestTime || '' }}
            </span>
          </div>
          <div class="s-item">
            <span class="s-label">回归测试</span>
            <span class="s-value">
              {{ props.row!.regressionTester || '--' }}
              {{ props.row!.regressionTestTime || '' }}
            </span>
          </div>
        </div>
        <FunctionPointPanel
          v-if="!props.hideAiActions"
          ref="fpPanelRef"
          :result-id="props.row?.id"
          @saved="emit('saved')"
        />
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
        <div class="panel-body">
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
            <el-descriptions :column="1" border size="small" class="case-desc">
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
        </div>
      </template>
      <el-empty v-else :image-size="100" :description="emptyDescription" />
    </div>
  </div>
</template>

<style scoped lang="scss">
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

  .panel-scroll {
    flex: 1;
    min-height: 0;
    overflow: auto;
    overscroll-behavior-y: contain;
    overflow-anchor: none;
  }

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
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 10px 12px;

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
