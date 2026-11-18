<!--测试用例-左树导航 + 右侧 AI 扩写详情共享骨架（功能性里层与六个特性页共用）：
    本组件只负责范围编排（范围参数/批量任务按钮/数据获取），
    左树见 LeftTreePanel，右栏详情见 CaseDetailPanel，功能点评审见 FunctionPointPanel-->
<script setup lang="ts">
import { ElMessage } from 'element-plus'
import { Back } from '@element-plus/icons-vue'
import type {
  TestCaseAiDocSetRecord,
  TestCaseFnItemResult
} from '@/types/projectProcess/testCases'
import {
  downloadAiTestCaseAPI,
  getDocSetAPI,
  getTestCaseFnItemListAPI
} from '@/api/projectProcess/testCases-api'
import LeftTreePanel from './LeftTreePanel.vue'
import CaseDetailPanel from './CaseDetailPanel.vue'
import TestCaseVersionDialog from './TestCaseVersionDialog.vue'
import {
  useTestCaseGeneration,
  isStandardFeature,
  type CaseType,
  type GenerateMode
} from '../useTestCaseGeneration'
import { PROCESS_PROJECT_ID_KEY } from '@/constant/globalVariables'
import { sessionStorage } from '@/utils/storage'
import { downloadFile } from '@/utils/file'
import { getProcessProjectDetail } from '@/utils/processProject'
import type { DynamicFileColumn } from '@/types/projectProcess/projectProcessCommon'
import { useScConfirm } from '@/hooks/useScConfirmDialog.ts'
import { OperateButtonGroup } from '../../components'
import { useAiTaskStore } from '@/store/modules/ai-task-store'

const props = withDefaults(
  defineProps<{
    /** 特性码（功能性=1，六个特性=2..7） */
    feature: string
    /** 特性中文名（Tag 展示 / 生成确认文案 / 任务卡片与文件命名） */
    featureName: string
    /** 子特性码（功能性固定 1；六个特性不传=不限） */
    subFeature?: string
    /** 所属子系统（功能性里层传；六个特性为项目级不传） */
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
const aiTaskStore = useAiTaskStore()

/** 生成/下载共用范围参数 */
const scopeParams = computed(() => ({
  feature: props.feature,
  ...(props.subFeature ? { subFeature: props.subFeature } : {}),
  ...(props.subsystem ? { subsystem: props.subsystem.id } : {})
}))

/** 用户文档集（feature=8，2026-11-12 需求6.2）：整特性一张用例表，
 *  生成=单次 AI 步骤扩写（触发点40），不走逐项提取/生成/重新生成 */
const isDocSet = computed(() => props.feature === '8')

/** 性能效率（feature=9，2026-11-13 需求6.4）：纯规则提取（测试准备/测试策略/事务说明直取原值），无生成步骤，仅下载 */
const isPerformance = computed(() => props.feature === '9')

/** 范围名：子系统名（功能性）或特性名（六个特性），用于 Tag / 确认文案 / 文件命名 */
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

// ---- 数据获取（树 + 动态文件列） ----
const loading = ref(false)
const treeRows = ref<TestCaseFnItemResult[]>([])
const dynamicData = ref<DynamicFileColumn[]>([])
/** 当前选中行（由左树抛出） */
const currentRow = ref<TestCaseFnItemResult | null>(null)

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

// ---- 用户文档集：整体特性 AI 核查步骤（生成后页面直接可见，不必下载文档核对） ----
const docSetStep = ref<TestCaseAiDocSetRecord | null>(null)
const fetchDocSetStep = async () => {
  if (!isDocSet.value) return
  const detail = await getProcessProjectDetail()
  if (!detail?.id) return
  try {
    const { data } = await getDocSetAPI(String(detail.id))
    docSetStep.value = data ?? null
  } catch {
    docSetStep.value = null
  }
}

// ---- 平铺按钮（提取/生成/重新生成/下载） ----
const getSubjectScope = async () => {
  const detail = await getProcessProjectDetail()
  if (!detail?.id) {
    ElMessage.error('未获取到项目信息')
    return null
  }
  return detail
}

/** 「提取功能点」：当前范围批量提取（素材未变更且已有清单的项自动跳过） */
const handleExtractAll = async () => {
  try {
    await scConfirm({
      title: '提示',
      message: `将对「${scopeName.value}」提取功能点（素材未变更且已有清单的项自动跳过；说明已变更项的人工编辑将被覆盖），确认执行？`,
      confirmText: '确认提取'
    })
  } catch {
    return
  }
  const detail = await getSubjectScope()
  if (!detail) return
  try {
    await aiTaskStore.start(
      { subjectId: String(detail.id), ...scopeParams.value },
      makeTaskMeta(detail, scopeName.value),
      'extract'
    )
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '提取任务提交失败')
  }
}

/** 「生成文档集用例」：整特性一次 AI 调用扩写核查步骤（用户文档集专用，需求6.2） */
const handleGenerateDocSet = async () => {
  try {
    await scConfirm({
      title: '提示',
      message: `将基于测试对象文档与核查项清单，AI 扩写「${scopeName.value}」核查步骤（约一次调用，完成后可直接下载用例文档），确认执行？`,
      confirmText: '确认生成'
    })
  } catch {
    return
  }
  const detail = await getSubjectScope()
  if (!detail) return
  try {
    await aiTaskStore.start(
      { subjectId: String(detail.id) },
      makeTaskMeta(detail, scopeName.value),
      'docset'
    )
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '生成任务提交失败')
  }
}

const generation = useTestCaseGeneration({
  scope: () =>
    isStandardFeature(props.feature)
      ? {
          feature: props.feature,
          featureName: props.featureName,
          subFeature: props.subFeature,
          subsystem: props.subsystem
        }
      : null,
  beforeGenerate: async () =>
    (await detailPanelRef.value?.ensureSaved()) ?? false
})
const generateDialogVisible = ref(false)
const downloadDialogVisible = ref(false)
const generateMode = ref<GenerateMode>('increment')
const openGenerate = (mode: GenerateMode) => {
  if (generation.disabled.value) return
  generateMode.value = mode
  generateDialogVisible.value = true
}
const pickGenerate = (caseType: CaseType) => {
  void generation.generate({ caseType, mode: generateMode.value })
}
const openDownload = () => {
  if (isDocSet.value || isPerformance.value) void handleDownloadWord('detail')
  else downloadDialogVisible.value = true
}

const downloading = ref(false)
const handleDownloadWord = async (caseType: CaseType) => {
  if (downloading.value) return
  downloading.value = true
  const subjectId = sessionStorage.get<string>(PROCESS_PROJECT_ID_KEY)
  const downloadScope = { ...scopeParams.value }
  const downloadScopeName = scopeName.value
  try {
    const detail = await getProcessProjectDetail()
    if (!subjectId || !detail || String(detail.id) !== subjectId)
      throw new Error('未获取到点击时的项目信息')
    const response = await downloadAiTestCaseAPI({
      subjectId,
      ...downloadScope,
      caseType
    })
    await downloadFile(
      response,
      `测试用例-${caseType === 'simple' ? '常规版-' : ''}${detail.code}-${downloadScopeName}.docx`
    )
  } catch {
    ElMessage.error('用例文档下载失败，请稍后重试')
  } finally {
    downloading.value = false
  }
}

const FLAT_BUTTONS = computed(() => {
  const list: Array<{
    id: string
    name: string
    type: any
    icon?: any
    permission?: string
  }> = []
  if (props.showBack) {
    list.push({ id: 'back', name: '返回', type: 'info', icon: Back })
  }
  if (isDocSet.value) {
    // 用户文档集：整特性单表语义，仅单次步骤生成 + 下载
    list.push(
      {
        id: 'generateDocSet',
        name: '生成文档集用例',
        type: 'primary',
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
  }
  if (isPerformance.value) {
    // 性能效率：纯规则提取（无生成步骤），仅下载
    list.push({
      id: 'downloadWord',
      name: '下载用例文档',
      type: 'success',
      permission: 'acceptance:result:aiTestCase:download'
    })
    return list
  }
  list.push(
    {
      id: 'extractAll',
      name: '提取功能点',
      type: 'primary',
      permission: 'acceptance:result:aiTestCase:generate'
    },
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

// 平铺按钮随任务状态更新：进行中对应按钮显示进度、其余操作按钮禁用，下载中防重复点击
const flatButtons = computed(() =>
  FLAT_BUTTONS.value.map(btn => {
    const isAction = [
      'extractAll',
      'generateAll',
      'regenerateAll',
      'generateDocSet'
    ].includes(btn.id)
    if (
      isAction &&
      (aiTaskStore.isBusy ||
        generation.pending.value ||
        aiTaskStore.progress?.cleanupPending)
    ) {
      const p = aiTaskStore.progress
      const sameScope =
        p?.subjectId === sessionStorage.get<string>(PROCESS_PROJECT_ID_KEY) &&
        p?.feature === props.feature &&
        (p?.subFeature || '') === (props.subFeature || '') &&
        (p?.subsystem || '') === (props.subsystem?.id || '')
      const showTaskProgress =
        aiTaskStore.isRunning &&
        sameScope &&
        ((btn.id === 'extractAll' && p?.taskType === 'extract') ||
          (btn.id === 'generateDocSet' && p?.taskType !== 'extract'))
      return {
        ...btn,
        name: showTaskProgress
          ? `${p?.taskType === 'extract' ? '提取' : '生成'}中 ${p?.processed ?? 0}/${p?.total ?? 0}`
          : btn.id === 'generateAll'
            ? generation.buttonText.value
            : btn.name,
        disabled: true
      }
    }
    if (btn.id === 'downloadWord' && downloading.value) {
      return { ...btn, disabled: true }
    }
    return btn
  })
)

const handleFlatClick = async (btnId: string) => {
  if (btnId === 'back') emit('back')
  if (btnId === 'extractAll') await handleExtractAll()
  if (btnId === 'generateAll') openGenerate('increment')
  if (btnId === 'regenerateAll') openGenerate('overwrite')
  if (btnId === 'generateDocSet') await handleGenerateDocSet()
  if (btnId === 'downloadWord') openDownload()
}

// 任务结束后刷新树与功能点清单（不在进行中逐次刷新：避免展开状态被反复重置）
const detailPanelRef = useTemplateRef<{
  refreshFunctionPoints: () => void
  ensureSaved: () => Promise<boolean>
}>('detailPanelRef')
watch(
  () => aiTaskStore.finishSeq,
  () => {
    if (
      aiTaskStore.meta?.subjectId !==
      sessionStorage.get<string>(PROCESS_PROJECT_ID_KEY)
    )
      return
    void fetchTreeData()
    detailPanelRef.value?.refreshFunctionPoints()
    void fetchDocSetStep()
  }
)

onMounted(async () => {
  await fetchTreeData()
  void fetchDocSetStep()
  // 进入页面时探测本项目任务，真实范围与版本由服务端快照恢复。
  await generation.resume()
})
</script>

<template>
  <div class="system-details">
    <TestCaseVersionDialog
      v-model="generateDialogVisible"
      :title="
        generateMode === 'overwrite' ? '重新生成测试用例' : '生成测试用例'
      "
      action="generate"
      :context-key="JSON.stringify(scopeParams)"
      :disabled="generation.disabled.value"
      @select="pickGenerate"
    />
    <TestCaseVersionDialog
      v-model="downloadDialogVisible"
      title="下载用例文档"
      action="download"
      :context-key="JSON.stringify(scopeParams)"
      :disabled="downloading"
      @select="handleDownloadWord"
    />
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
      <LeftTreePanel
        :rows="treeRows"
        :loading="loading"
        @select="currentRow = $event"
      />
      <div class="right-column">
        <!-- 用户文档集：整特性 AI 核查步骤（项目级一份，生成后此卡片直接可见） -->
        <div v-if="isDocSet" class="docset-step-card">
          <div class="step-card-header">
            <span>AI 核查步骤（整特性一份，导出文档“步骤”列取此内容）</span>
            <el-tag
              v-if="docSetStep"
              :type="docSetStep.status === 2 ? 'warning' : 'success'"
              size="small"
            >
              {{ docSetStep.status === 2 ? '降级-固定步骤' : '已生成' }}
            </el-tag>
          </div>
          <pre v-if="docSetStep?.step" class="step-card-body">{{
            docSetStep.step
          }}</pre>
          <div v-else class="step-card-empty">
            尚未生成，点击上方「生成文档集用例」基于测试对象文档与核查项清单扩写核查步骤
          </div>
        </div>
        <CaseDetailPanel
          ref="detailPanelRef"
          :row="currentRow"
          :dynamic-columns="dynamicData"
          :hide-ai-actions="isDocSet || isPerformance"
          @regenerated="fetchTreeData()"
          @saved="fetchTreeData()"
        />
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.system-details {
  flex: 1;
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
  overflow: hidden;
}

.details-header {
  flex-shrink: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: space-between;
  align-items: center;

  .header-buttons {
    min-width: 0;
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
  }
}

.details-body {
  flex: 1;
  min-height: 0;
  display: flex;
  gap: 12px;
  overflow: hidden;
}

/* 用户文档集右栏：步骤卡片（项目级一份）+ 行级详情纵向排布 */
.right-column {
  flex: 1;
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
  overflow: hidden;
}

.docset-step-card {
  flex-shrink: 0;
  min-height: 0;
  max-height: 40%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 5px;
  background-color: var(--card-bg, #fff);
  padding: 10px 12px;
  overflow: auto;
}

.step-card-header {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 6px;
}

.step-card-body {
  margin: 0;
  flex: 1;
  min-height: 0;
  overflow: auto;
  overscroll-behavior-y: contain;
  white-space: pre-wrap;
  word-break: break-all;
  font-family: inherit;
  font-size: 13px;
  line-height: 1.6;
  color: var(--el-text-color-regular);
}

.step-card-empty {
  min-height: 0;
  padding: 14px 0;
  overflow: auto;
  font-size: 13px;
  color: var(--el-text-color-secondary);
  text-align: center;
}
</style>
