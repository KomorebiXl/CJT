<!--测试用例-功能性-->
<script setup lang="ts">
import { ElMessage } from 'element-plus'
import type {
  TestCaseFnSystemData,
  TestCaseFnSystemSearchParams
} from '@/types/projectProcess/testCases'
import { downloadAiTestCaseAPI, getTestCaseFnSystemListAPI } from '@/api/projectProcess/testCases-api'
import { downloadFile } from '@/utils/file'
import { getProcessProjectDetail } from '@/utils/processProject'
import { useScConfirm } from '@/hooks/useScConfirmDialog.ts'
import { useAiTaskStore } from '@/store/modules/ai-task-store'
import SystemDetails from './systemDetails.vue'
import { TEST_CASE_FN_SCOPE, createTestCaseFnTaskMeta } from './testCasesFunctionality.config'

const { scConfirm } = useScConfirm()
const aiTaskStore = useAiTaskStore()

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

/** 外层「提取功能点」：全子系统批量提取（两段式第一步；素材未变更且已有清单的项自动跳过） */
const handleExtractFunctionPoints = async () => {
  try {
    await scConfirm({
      message:
        '将对本项目全部子系统提取功能点（素材未变更且已有清单的项自动跳过；说明已变更项的待评审编辑将被覆盖），确认执行？',
      confirmText: '确认提取'
    })
  } catch {
    return
  }
  const detail = await getProcessProjectDetail()
  if (!detail?.id) {
    ElMessage.error('未获取到项目信息')
    return
  }
  try {
    await aiTaskStore.start(
      { subjectId: String(detail.id), ...TEST_CASE_FN_SCOPE },
      createTestCaseFnTaskMeta(detail),
      'extract'
    )
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '提取任务提交失败')
  }
}

/** 外层「生成测试用例」：全子系统增量生成（已有成功结果的跳过，降级/失败项自动重试） */
const handleGenerateTestCases = async (caseType: 'detail' | 'simple' = 'detail') => {
  const versionLabel = caseType === 'simple' ? '常规版（一测试项一用例，含正反用例）' : '详细版（按功能点拆分成例）'
  try {
    await scConfirm({
      message:
        `将对本项目全部子系统生成${versionLabel} AI 测试用例（同版本已有成功结果的项自动跳过，降级/失败项自动重试），确认执行？`,
      confirmText: '确认生成'
    })
  } catch {
    return
  }
  const detail = await getProcessProjectDetail()
  if (!detail?.id) {
    ElMessage.error('未获取到项目信息')
    return
  }
  try {
    await aiTaskStore.start(
      { subjectId: String(detail.id), ...TEST_CASE_FN_SCOPE, caseType },
      createTestCaseFnTaskMeta(detail, undefined, caseType)
    )
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '生成任务提交失败')
  }
}

/** 外层「下载测试用例」：功能性全子系统整合为一个 Word 文档（按用例版本下载，默认详细版） */
const downloading = ref(false)
const handleDownloadTestCases = async (caseType: 'detail' | 'simple' = 'detail') => {
  if (downloading.value) return
  const detail = await getProcessProjectDetail()
  if (!detail?.id) {
    ElMessage.error('未获取到项目信息')
    return
  }
  downloading.value = true
  try {
    const response = await downloadAiTestCaseAPI({
      subjectId: String(detail.id),
      ...TEST_CASE_FN_SCOPE,
      caseType
    })
    await downloadFile(response, `测试用例-${caseType === 'simple' ? '常规版-' : ''}${detail.code}.docx`)
  } catch {
    ElMessage.error('用例文档下载失败，请稍后重试')
  } finally {
    downloading.value = false
  }
}

/** 外层「下载全部用例」（问题2）：全部特性（1-7）合并为一个 Word 文档，单特性下载入口保留 */
const downloadingAll = ref(false)
const handleDownloadAllTestCases = async () => {
  if (downloadingAll.value) return
  const detail = await getProcessProjectDetail()
  if (!detail?.id) {
    ElMessage.error('未获取到项目信息')
    return
  }
  downloadingAll.value = true
  try {
    const response = await downloadAiTestCaseAPI({ subjectId: String(detail.id) })
    await downloadFile(response, `测试用例-${detail.code}.docx`)
  } catch {
    ElMessage.error('用例文档下载失败，请稍后重试')
  } finally {
    downloadingAll.value = false
  }
}

// 进入页面时接上本项目进行中的任务（刷新/换设备/他人发起均可恢复进度卡片）
onMounted(async () => {
  const detail = await getProcessProjectDetail()
  if (detail?.id) aiTaskStore.resume(String(detail.id), createTestCaseFnTaskMeta(detail))
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
          if (aiTaskStore.isRunning && p?.taskType === 'extract') {
            return `提取中 ${p?.processed ?? 0}/${p?.total ?? 0}`
          }
          return '提取功能点'
        },
        get disabled() {
          return aiTaskStore.isRunning
        },
        type: 'primary',
        permission: 'acceptance:result:aiTestCase:generate',
        onClick: () => handleExtractFunctionPoints()
      },
      {
        id: 'generateTestCases',
        // getter：随任务进度实时更新按钮文案与禁用态（提取任务进行中仅禁用不换文案）
        get name() {
          const p = aiTaskStore.progress
          if (aiTaskStore.isRunning && p?.taskType !== 'extract') {
            return `生成中 ${p?.processed ?? 0}/${p?.total ?? 0}`
          }
          return '生成详细测试用例'
        },
        get disabled() {
          return aiTaskStore.isRunning
        },
        type: 'primary',
        permission: 'acceptance:result:aiTestCase:generate',
        onClick: () => handleGenerateTestCases('detail')
      },
      {
        // 常规版（2026-11-12 反馈4）：一测试项一用例（含正反用例），节省 Token；与详细版各自落库互不覆盖
        id: 'generateSimpleTestCases',
        name: '生成常规测试用例',
        get disabled() {
          return aiTaskStore.isRunning
        },
        type: 'primary',
        permission: 'acceptance:result:aiTestCase:generate',
        onClick: () => handleGenerateTestCases('simple')
      },
      {
        id: 'downloadTestCases',
        name: '下载功能性用例',
        get disabled() {
          return downloading.value
        },
        type: 'success',
        permission: 'acceptance:result:aiTestCase:download',
        onClick: () => handleDownloadTestCases('detail')
      },
      {
        // 常规版下载：导出「生成常规测试用例」落库的常规版记录（未生成时后端按测试项原文导出）
        id: 'downloadSimpleTestCases',
        name: '下载常规用例',
        get disabled() {
          return downloading.value
        },
        type: 'success',
        permission: 'acceptance:result:aiTestCase:download',
        onClick: () => handleDownloadTestCases('simple')
      },
      {
        id: 'downloadAllTestCases',
        name: '下载全部用例',
        get disabled() {
          return downloadingAll.value
        },
        type: 'success',
        permission: 'acceptance:result:aiTestCase:download',
        onClick: () => handleDownloadAllTestCases()
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
  <div class="page-card">
    <div v-show="!currentSystem" class="page-level">
      <ScResourcePage :page-config="pageConfig" />
    </div>
    <SystemDetails
      v-if="currentSystem"
      :system-id="currentSystem.id"
      :system-name="currentSystem.name"
      @back="currentSystem = null"
    />
  </div>
</template>

<style scoped lang="scss">
.page-level {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}
</style>
