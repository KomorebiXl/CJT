<!--测试用例-功能性-->
<script setup lang="ts">
import { ElMessage } from 'element-plus'
import type {
  TestCaseFnSystemData,
  TestCaseFnSystemSearchParams
} from '@/types/projectProcess/testCases'
import {
  downloadAiTestCaseAPI,
  getTestCaseFnSystemListAPI
} from '@/api/projectProcess/testCases-api'
import { downloadFile } from '@/utils/file'
import { getProcessProjectDetail } from '@/utils/processProject'
import { useScConfirm } from '@/hooks/useScConfirmDialog.ts'
import { useAiTaskStore } from '@/store/modules/ai-task-store'
import SystemDetails from './systemDetails.vue'
import {
  TEST_CASE_FN_SCOPE,
  createTestCaseFnTaskMeta
} from './testCasesFunctionality.config'
import { useAllTestCasesDownload } from '../useAllTestCasesDownload'
import {
  useTestCaseGeneration,
  type CaseType,
  type GenerateMode
} from '../useTestCaseGeneration'
import TestCaseVersionDialog from '../components/TestCaseVersionDialog.vue'
import type { ScResourcePageInstance } from '@/components/ScBaseComponents/ScResourcePage/types'
import { PROCESS_PROJECT_ID_KEY } from '@/constant/globalVariables'
import { sessionStorage } from '@/utils/storage'

const { scConfirm } = useScConfirm()
const aiTaskStore = useAiTaskStore()
const generation = useTestCaseGeneration({
  scope: { ...TEST_CASE_FN_SCOPE, featureName: '功能性' }
})
const resourcePageRef =
  useTemplateRef<ScResourcePageInstance>('resourcePageRef')
watch(
  () => aiTaskStore.finishSeq,
  () => {
    if (
      aiTaskStore.meta?.subjectId ===
      sessionStorage.get<string>(PROCESS_PROJECT_ID_KEY)
    ) {
      void resourcePageRef.value?.refresh()
    }
  }
)

const searchbarItems = reactive<SearchbarItems<TestCaseFnSystemSearchParams>>([
  { prop: 'name', type: 'input', placeholder: '请输入名称' }
])

const tableColumns = reactive<TableColumns>([
  { label: '名称', prop: 'name', align: 'left' },
  { label: '未完成数量', prop: 'unfinishedTotal', width: 110 }
])

const currentSystem = ref<{ id: string; name: string } | null>(null)

const openSystem = (row: TestCaseFnSystemData) => {
  currentSystem.value = { id: row.id, name: row.name }
}

const fetchData = (params: ListQuery<TestCaseFnSystemSearchParams>) =>
  getTestCaseFnSystemListAPI(params)

/** 全子系统提取：默认跳过未变化项；overwrite 强制重新提取。 */
const extractPending = ref(false)
let extractionActive = true
onBeforeUnmount(() => {
  extractionActive = false
})
const extractionDisabled = computed(
  () =>
    extractPending.value ||
    aiTaskStore.isBusy ||
    generation.pending.value ||
    !!aiTaskStore.progress?.cleanupPending
)
const handleExtractFunctionPoints = async (
  mode: GenerateMode = 'increment'
) => {
  if (extractionDisabled.value) return
  extractPending.value = true
  const subjectId = sessionStorage.get<string>(PROCESS_PROJECT_ID_KEY)
  try {
    try {
      await scConfirm({
        title: mode === 'overwrite' ? '重新提取功能点' : '提示',
        message:
          mode === 'overwrite'
            ? '将重新提取本项目全部子系统中所有测试项的功能点，不跳过已有清单。重提成功后将覆盖该项原清单及人工编辑，并使详细版和常规版 AI 用例失效，需重新生成。停止任务会作废本批已提取结果，不恢复被覆盖的旧清单。确认执行？'
            : '将对本项目全部子系统提取功能点（素材未变更且已有清单的项自动跳过；说明已变更项的人工编辑将被覆盖，已有 AI 用例将失效），确认执行？',
        confirmText: mode === 'overwrite' ? '确认重新提取' : '确认提取'
      })
    } catch {
      return
    }
    if (!extractionActive) return
    const detail = await getProcessProjectDetail()
    if (!extractionActive) return
    if (
      !subjectId ||
      !detail?.id ||
      String(detail.id) !== subjectId ||
      sessionStorage.get<string>(PROCESS_PROJECT_ID_KEY) !== subjectId
    ) {
      ElMessage.error('项目信息已变化，请重新操作')
      return
    }
    await aiTaskStore.start(
      { subjectId, ...TEST_CASE_FN_SCOPE, mode },
      createTestCaseFnTaskMeta(detail),
      'extract'
    )
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '提取任务提交失败')
  } finally {
    extractPending.value = false
  }
}

/** 外层「下载测试用例」：功能性全子系统整合为一个 Word 文档（按用例版本下载，默认详细版） */
const downloading = ref(false)
const handleDownloadTestCases = async (
  caseType: 'detail' | 'simple' = 'detail'
) => {
  if (downloading.value) return
  downloading.value = true
  const subjectId = sessionStorage.get<string>(PROCESS_PROJECT_ID_KEY)
  try {
    const detail = await getProcessProjectDetail()
    if (!subjectId || !detail || String(detail.id) !== subjectId)
      throw new Error('未获取到点击时的项目信息')
    const response = await downloadAiTestCaseAPI({
      subjectId: String(detail.id),
      ...TEST_CASE_FN_SCOPE,
      caseType
    })
    await downloadFile(
      response,
      `测试用例-${caseType === 'simple' ? '常规版-' : ''}${detail.code}.docx`
    )
  } catch {
    ElMessage.error('用例文档下载失败，请稍后重试')
  } finally {
    downloading.value = false
  }
}

/** 与指引页共用九特性详细版能力，单功能性版本下载保持原范围。 */
const { downloadingAll, handleDownloadAllTestCases } = useAllTestCasesDownload()

// ---- 2026-11-13 生成/下载入口整合：类型选择弹窗 ----
const generateDialogVisible = ref(false)
const downloadDialogVisible = ref(false)

const pickGenerate = (caseType: CaseType) => {
  void generation.generate({ caseType, mode: 'increment' })
}

const pickDownload = (mode: 'detail' | 'simple' | 'all') => {
  downloadDialogVisible.value = false
  if (mode === 'all') {
    void handleDownloadAllTestCases()
    return
  }
  void handleDownloadTestCases(mode)
}

// 进入页面时接上本项目进行中的任务（刷新/换设备/他人发起均可恢复进度卡片）
onMounted(async () => {
  await generation.resume()
})

const pageConfig: PageConfig<TestCaseFnSystemData> = {
  searchConfig: { searchbarItems },
  operateConfig: {
    defaultButtons: [],
    customButtons: [
      {
        id: 'extractFunctionPoints',
        // getter：随任务进度实时更新按钮文案与禁用态
        get name() {
          const p = aiTaskStore.progress
          if (
            aiTaskStore.isRunning &&
            generation.matchesCurrentScope.value &&
            p?.taskType === 'extract'
          ) {
            return `提取中 ${p?.processed ?? 0}/${p?.total ?? 0}`
          }
          return '提取功能点'
        },
        get disabled() {
          return extractionDisabled.value
        },
        type: 'primary',
        permission: 'acceptance:result:aiTestCase:generate',
        onClick: () => handleExtractFunctionPoints()
      },
      {
        id: 'reextractFunctionPoints',
        name: '重新提取功能点',
        get disabled() {
          return extractionDisabled.value
        },
        type: 'warning',
        permission: 'acceptance:result:aiTestCase:generate',
        onClick: () => handleExtractFunctionPoints('overwrite')
      },
      {
        // 2026-11-13 整合：生成入口收敛为一个按钮，弹窗选择详细/常规版（功能点提取为生成前置）
        id: 'generateTestCases',
        get name() {
          return generation.buttonText.value
        },
        get disabled() {
          return generation.disabled.value || extractPending.value
        },
        type: 'primary',
        permission: 'acceptance:result:aiTestCase:generate',
        onClick: () => {
          generateDialogVisible.value = true
        }
      },
      {
        // 2026-11-13 整合：下载入口收敛为一个按钮，弹窗选择版本/范围
        id: 'downloadTestCases',
        get name() {
          return downloadingAll.value ? '正在生成文档…' : '下载用例'
        },
        get disabled() {
          return downloading.value || downloadingAll.value
        },
        type: 'success',
        permission: 'acceptance:result:aiTestCase:download',
        onClick: () => {
          downloadDialogVisible.value = true
        }
      }
    ]
  },
  tableConfig: {
    tableColumns,
    showDefaultButtons: false,
    customActionButtons: [
      {
        name: '操作',
        type: 'primary',
        text: true,
        permission: 'asset:security:operate',
        show: row => !!row.child && row.child.length === 0,
        onClick: openSystem
      }
    ],
    showPagination: false
  },
  fetchData,
  treeConfig: { children: 'child', rowKey: 'id', showExpandButton: true }
}
</script>

<template>
  <div class="page-card h-viewport test-case-page">
    <div v-show="!currentSystem" class="page-level">
      <ScResourcePage ref="resourcePageRef" :page-config="pageConfig" />
    </div>
    <SystemDetails
      v-if="currentSystem"
      :system-id="currentSystem.id"
      :system-name="currentSystem.name"
      @back="currentSystem = null"
    />

    <!-- 生成类型选择（2026-11-13 整合） -->
    <TestCaseVersionDialog
      v-model="generateDialogVisible"
      title="生成测试用例"
      action="generate"
      :disabled="generation.disabled.value || extractPending"
      @select="pickGenerate"
    />

    <!-- 下载范围/版本选择（2026-11-13 整合） -->
    <TestCaseVersionDialog
      v-model="downloadDialogVisible"
      title="下载用例文档"
      action="download"
      allow-all
      :disabled="downloading || downloadingAll"
      @select="pickDownload"
      @all="pickDownload('all')"
    />
  </div>
</template>

<style scoped lang="scss">
.test-case-page {
  overflow: hidden;
}

.page-level {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}
</style>
