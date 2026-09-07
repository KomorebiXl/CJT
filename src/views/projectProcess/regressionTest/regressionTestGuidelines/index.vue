<script setup lang="ts">
import { useVisible } from '@/hooks/useVisible.ts'
import {
  StepGuide,
  GenerateTestLogDialog,
  type StepItems
} from '../../components'
import RegressionTestStatisticsTable from './components/RegressionTestStatisticsTable.vue'

const router = useRouter()

const { visible: selectVisible, setVisible: setSelectVisible } = useVisible()
const { visible: testLogVisible, setVisible: setTestLogVisible } = useVisible()

const steps: StepItems = [
  {
    title: '特性测试',
    desc: ['选择子特性跳转'],
    permission: 'asset:security:featureNavigation',
    action: {
      text: '跳转',
      handler: () => setSelectVisible(true)
    }
  },
  {
    title: '生成测试日志',
    desc: ['生成测试日志以供归档'],
    permission: 'acceptance:testLog:add',
    action: {
      text: '生成测试日志',
      handler: () => setTestLogVisible(true)
    }
  }
]

const subFeatureOptions: Array<{ label: string; value: string }> = [
  { label: '功能性', value: 'RegressionTestFunctionality' },
  { label: '信息安全性', value: 'InfoSecurityRegressionTest' },
  { label: '兼容性', value: 'CompatibilityRegressionTest' },
  { label: '可靠性', value: 'ReliabilityRegressionTest' },
  { label: '易用性', value: 'EaseOfUseRegressionTest' },
  { label: '可移植性', value: 'PortabilityRegressionTest' },
  { label: '维护性', value: 'MaintainabilityRegressionTest' },
  { label: '用户文档集', value: 'UserDocumentationRegressionTest' },
  { label: '性能效率', value: 'PerformanceEfficiencyRegressionTest' }
]

const selected = ref<string>('')

const handleRoutePage = () => router.push({ name: `${selected.value}` })
</script>

<template>
  <div class="page-card h-viewport">
    <StepGuide
      title="回归编制指引"
      subtitle="通过标准化流程完成数据的批量导入与记录生成"
      default-expanded
      :steps="steps"
    />
    <div class="table-content">
      <RegressionTestStatisticsTable />
    </div>
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
        <ScButton type="warning" @click="setSelectVisible(false)">
          取消
        </ScButton>
        <ScButton type="primary" :disabled="!selected" @click="handleRoutePage">
          前往
        </ScButton>
      </template>
    </ScDialog>
    <GenerateTestLogDialog v-model="testLogVisible" :flg-first="false" />
  </div>
</template>

<style lang="scss" scoped>
@use '@/views/projectProcess/projectProcess.scss';
</style>
