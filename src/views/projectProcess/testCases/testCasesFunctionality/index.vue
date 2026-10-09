<!--测试用例-功能性-->
<script setup lang="ts">
import { ElMessage } from 'element-plus'
import type {
  TestCaseFnSystemData,
  TestCaseFnSystemSearchParams
} from '@/types/projectProcess/testCases'
import { getTestCaseFnSystemListAPI } from '@/api/projectProcess/testCases-api'
import { getProcessProjectDetail } from '@/utils/processProject'
import { useScConfirm } from '@/hooks/useScConfirmDialog.ts'
import SystemDetails from './systemDetails.vue'
import { runAiTestCaseTask } from './aiTask'

const { scConfirm } = useScConfirm()

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

/** 外层「生成测试用例」：全子系统增量生成（已生成的跳过），完成后提供 Word 下载 */
const handleGenerateTestCases = async () => {
  try {
    await scConfirm({
      message: '将对本项目全部子系统生成 AI 测试用例（已有结果的项自动跳过），确认执行？'
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
    await runAiTestCaseTask({
      subjectId: String(detail.id),
      feature: '1',
      subFeature: '1'
    })
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '生成任务失败')
    return
  }
  ElMessage.success('AI 测试用例生成完成，可进入子系统查看或下载用例文档')
}

const pageConfig: PageConfig<TestCaseFnSystemData> = {
  searchConfig: { searchbarItems },
  operateConfig: {
    defaultButtons: [],
    customButtons: [
      {
        id: 'generateTestCases',
        name: '生成测试用例',
        type: 'primary',
        onClick: () => handleGenerateTestCases()
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
