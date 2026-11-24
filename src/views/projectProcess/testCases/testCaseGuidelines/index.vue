<script setup lang="ts">
import { StepGuide, type StepItems } from '../../components'
import { useAllTestCasesDownload } from '../useAllTestCasesDownload'
import { useAllTestCasesWorkflow } from '../useAllTestCasesWorkflow'
import TestCaseVersionDialog from '../components/TestCaseVersionDialog.vue'
import { useGenerateProcessRouterStore } from '@/store/modules/router-store'
import { parseComponentPath } from '@/utils/routeQuery'
import type { RouterData } from '@/router'

const router = useRouter()
const selectVisible = ref(false)
const selected = ref('')
const generateDialogVisible = ref(false)
const downloadDialogVisible = ref(false)
const workflow = useAllTestCasesWorkflow()
const processRouterStore = useGenerateProcessRouterStore()
const { downloadingAll, downloadError, handleDownloadAllTestCases } =
  useAllTestCasesDownload()

const steps = computed<StepItems>(() => [
  {
    title: '查看与完善测试用例',
    desc: ['选择特性页面，查看并完善当前项目的测试用例。'],
    action: {
      text: '前往特性页面',
      handler: () => {
        selectVisible.value = true
      }
    }
  },
  {
    title: '提取功能点',
    desc: [
      '对当前项目全部普通特性、全部子系统统一提取功能点，无需逐个进入特性页面。',
      workflow.extractionComplete.value
        ? '全部特性功能点已提取完成，可以继续生成测试用例。'
        : '请等待全部提取成功后再执行第三步；失败或停止时，可重新提取补齐。用户文档集、性能效率沿用专用规则。'
    ],
    permission: 'acceptance:result:aiTestCase:generate',
    action: {
      text: workflow.extractionText.value,
      disabled: workflow.extractionDisabled.value,
      handler: workflow.extract
    }
  },
  {
    title: '测试用例生成',
    desc: [
      '完成第二步后，选择生成详细版或常规版测试用例，版本规则与各特性页面一致。',
      '统一生成当前项目全部普通特性的测试用例，并按需生成用户文档集核查步骤。性能效率保留专用规则。'
    ],
    permission: 'acceptance:result:aiTestCase:generate',
    action: {
      text: workflow.generationText.value,
      disabled: workflow.generationDisabled.value,
      handler: () => {
        if (!workflow.generationDisabled.value)
          generateDialogVisible.value = true
      }
    }
  },
  {
    title: '下载全部测试用例',
    desc: [
      '选择下载详细版或常规版，将当前项目九特性的现有测试用例汇总为一个 Word 文档。',
      '用户文档集、性能效率各自保留专用表格格式。'
    ],
    permission: 'acceptance:result:aiTestCase:download',
    action: {
      text: downloadingAll.value ? '正在生成文档…' : '下载全部测试用例',
      disabled: downloadingAll.value,
      handler: () => {
        if (!downloadingAll.value) downloadDialogVisible.value = true
      }
    }
  }
])

// 从当前项目已授权菜单解析真实路由名，兼容各环境功能性菜单 path 的差异。
const subFeatureOptions = computed(() => {
  const menus: RouterData[] = []
  const collect = (items: RouterData[]) =>
    items.forEach(item => {
      menus.push(item)
      if (item.children) collect(item.children)
    })
  collect(processRouterStore.sidebarRouters)
  const labels = [
    '功能性',
    '信息安全性',
    '兼容性',
    '可靠性',
    '易用性',
    '可移植性',
    '维护性',
    '用户文档集',
    '性能效率'
  ]
  return labels.flatMap((label, index) => {
    const menu = menus.find(item => {
      const { componentPath, query } = parseComponentPath(item.component)
      return index === 0
        ? componentPath ===
            'projectProcess/testCases/testCasesFunctionality/index'
        : componentPath === 'projectProcess/testCases/testCaseFeature/index' &&
            query?.feature === String(index + 1)
    })
    return menu?.name && router.hasRoute(menu.name)
      ? [
          {
            label,
            value: menu.name,
            query: parseComponentPath(menu.component).query
          }
        ]
      : []
  })
})

const handleRoutePage = async () => {
  const option = subFeatureOptions.value.find(
    item => item.value === selected.value
  )
  if (!option) return
  await router.push({
    name: option.value,
    query: {
      ...router.currentRoute.value.query,
      feature: undefined,
      ...option.query
    }
  })
  selectVisible.value = false
}
</script>

<template>
  <div class="page-card h-viewport">
    <StepGuide
      title="测试用例指引"
      subtitle="查看与完善、提取功能点、生成测试用例，并集中下载完整用例文档"
      default-expanded
      :steps="steps"
    />
    <TestCaseVersionDialog
      v-model="generateDialogVisible"
      title="选择生成版本（全部特性）"
      action="generate"
      :disabled="workflow.generationDisabled.value"
      @select="workflow.generate"
    />
    <TestCaseVersionDialog
      v-model="downloadDialogVisible"
      title="选择下载版本（全部特性）"
      action="download"
      :disabled="downloadingAll"
      @select="handleDownloadAllTestCases"
    />
    <el-alert
      v-if="downloadError"
      :title="downloadError"
      type="error"
      :closable="false"
      show-icon
    >
      <ScButton text type="primary" @click="selectVisible = true">
        前往特性页面
      </ScButton>
    </el-alert>
    <ScDialog
      v-model="selectVisible"
      title="子特性选择"
      dialog-width="25%"
      auto-height
      align-center
      @cancel="selected = ''"
    >
      <ScRadio
        v-model="selected"
        :radio-options="subFeatureOptions"
        placeholder="请选择子特性"
      />
      <template #footer>
        <ScButton type="warning" @click="selectVisible = false">取消</ScButton>
        <ScButton type="primary" :disabled="!selected" @click="handleRoutePage">
          前往
        </ScButton>
      </template>
    </ScDialog>
  </div>
</template>

<style lang="scss" scoped>
@use '@/views/projectProcess/projectProcess.scss';
</style>
