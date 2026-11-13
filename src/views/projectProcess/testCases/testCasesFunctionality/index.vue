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
      title: '提示',
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
      title: '提示',
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

// ---- 2026-11-13 生成/下载入口整合：类型选择弹窗 ----
const generateDialogVisible = ref(false)
const downloadDialogVisible = ref(false)

const pickGenerate = (caseType: 'detail' | 'simple') => {
  generateDialogVisible.value = false
  void handleGenerateTestCases(caseType)
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
        // 2026-11-13 整合：生成入口收敛为一个按钮，弹窗选择详细/常规版（功能点提取为生成前置）
        id: 'generateTestCases',
        get name() {
          const p = aiTaskStore.progress
          if (aiTaskStore.isRunning && p?.taskType !== 'extract') {
            return `生成中 ${p?.processed ?? 0}/${p?.total ?? 0}`
          }
          return '生成测试用例'
        },
        get disabled() {
          return aiTaskStore.isRunning
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
        name: '下载用例',
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

    <!-- 生成类型选择（2026-11-13 整合） -->
    <ScDialog
      v-model="generateDialogVisible"
      title="生成测试用例"
      dialog-width="480px"
      :show-footer-operate="false"
    >
      <div class="option-list">
        <div class="option-card" @click="pickGenerate('detail')">
          <div class="option-title">详细版测试用例</div>
          <div class="option-desc">
            按已确认功能点拆分成例（一功能点一条用例，多数据行）；生成前需先「提取功能点」并在详情中确认
          </div>
        </div>
        <div class="option-card" @click="pickGenerate('simple')">
          <div class="option-title">常规版测试用例</div>
          <div class="option-desc">
            一测试项一条用例，数据行含正用例与反用例，节省 Token；同样需先完成功能点提取与确认
          </div>
        </div>
      </div>
    </ScDialog>

    <!-- 下载范围/版本选择（2026-11-13 整合） -->
    <ScDialog
      v-model="downloadDialogVisible"
      title="下载用例文档"
      dialog-width="480px"
      :show-footer-operate="false"
    >
      <div class="option-list">
        <div class="option-card" @click="pickDownload('detail')">
          <div class="option-title">详细版（功能性）</div>
          <div class="option-desc">功能性全部子系统整合为一个 Word 文档</div>
        </div>
        <div class="option-card" @click="pickDownload('simple')">
          <div class="option-title">常规版（功能性）</div>
          <div class="option-desc">常规版记录整合文档（需已生成常规版）</div>
        </div>
        <div class="option-card" @click="pickDownload('all')">
          <div class="option-title">全部用例</div>
          <div class="option-desc">全部特性（1-7）合并一个文档，文末附用户文档集核查表</div>
        </div>
      </div>
    </ScDialog>
  </div>
</template>

<style scoped lang="scss">
.page-level {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.option-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 4px 2px;
}

.option-card {
  padding: 12px 14px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 6px;
  cursor: pointer;
  transition:
    border-color 0.2s,
    background-color 0.2s;

  &:hover {
    border-color: var(--el-color-primary);
    background-color: var(--el-color-primary-light-9);
  }

  .option-title {
    font-size: 14px;
    font-weight: 600;
    color: var(--el-text-color-primary);
    margin-bottom: 4px;
  }

  .option-desc {
    font-size: 12px;
    line-height: 1.5;
    color: var(--el-text-color-secondary);
  }
}
</style>
