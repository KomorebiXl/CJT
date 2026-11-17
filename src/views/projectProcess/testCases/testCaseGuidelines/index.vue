<script setup lang="ts">
import { StepGuide, type StepItems } from '../../components'
import { useAllTestCasesDownload } from '../useAllTestCasesDownload'
import { useGenerateProcessRouterStore } from '@/store/modules/router-store'
import { parseComponentPath } from '@/utils/routeQuery'
import type { RouterData } from '@/router'

const router = useRouter()
const selectVisible = ref(false)
const selected = ref('')
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
    title: '下载全部测试用例',
    desc: [
      '将当前项目九特性的现有测试用例汇总为一个详细版 Word 文档。',
      '用户文档集、性能效率各自保留专用表格格式。'
    ],
    permission: 'acceptance:result:aiTestCase:download',
    action: {
      text: downloadingAll.value ? '正在生成文档…' : '下载全部测试用例',
      disabled: downloadingAll.value,
      handler: handleDownloadAllTestCases
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
      subtitle="查看、完善各特性测试用例，并集中下载完整用例文档"
      default-expanded
      :steps="steps"
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
