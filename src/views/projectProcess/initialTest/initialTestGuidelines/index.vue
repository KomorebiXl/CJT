<script setup lang="ts">
import { useVisible } from '@/hooks/useVisible.ts'
import { StepGuide, type StepItems } from '../../components'
import GenerateExecutionRecordDialog from './components/GenerateExecutionRecordDialog.vue'
import GenerateTestLogDialog from './components/GenerateTestLogDialog.vue'
import InitialTestStatisticsTable from './components/InitialTestStatisticsTable.vue'

const router = useRouter()

const { visible: recordVisible, setVisible: setRecordVisible } = useVisible()
const { visible: selectVisible, setVisible: setSelectVisible } = useVisible()
const { visible: testLogVisible, setVisible: setTestLogVisible } = useVisible()

const steps: StepItems = [
  {
    title: '生成执行记录表',
    desc: ['导入完成后，生成方案执行记录表以供归档'],
    permission: 'asset:plan:batch:export',
    action: {
      text: '生成执行记录表',
      handler: () => setRecordVisible(true)
    }
  },
  {
    title: '特性测试',
    desc: ['选择指定的子特性进行查看'],
    permission: 'asset:security:featureNavigation',
    action: {
      text: '跳转子特性页面',
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
  { label: '功能性', value: 'InitialTestFunctionality' },
  { label: '信息安全性', value: 'InfoSecurityInitialTest' },
  { label: '兼容性', value: 'CompatibilityInitialTest' },
  { label: '可靠性', value: 'ReliabilityInitialTest' },
  { label: '易用性', value: 'EaseOfUseInitialTest' },
  { label: '可移植性', value: 'PortabilityInitialTest' },
  { label: '维护性', value: 'MaintainabilityInitialTest' },
  { label: '用户文档集', value: 'UserDocumentationInitial' },
  { label: '性能效率', value: 'PerformanceEfficiencyInitialTest' }
]

const selected = ref<string>('')

const handleRoutePage = () => router.push({ name: `${selected.value}` })
</script>

<template>
  <div class="page-card h-viewport">
    <StepGuide
      title="首轮编制指引"
      subtitle="通过标准化流程完成数据的批量导入与记录生成"
      default-expanded
      :steps="steps"
    />
    <div class="table-content">
      <InitialTestStatisticsTable />
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
    <GenerateExecutionRecordDialog v-model="recordVisible" />
    <GenerateTestLogDialog v-model="testLogVisible" flg-first />
  </div>
</template>

<style lang="scss" scoped>
.page-card {
  overflow-x: hidden;
  scrollbar-width: thin;
  scrollbar-color: rgba(31, 45, 61, 0.2) transparent;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(31, 45, 61, 0.2);
    border-radius: 6px;

    &:hover {
      background: rgba(31, 45, 61, 0.35);
    }
  }
}

.table-content {
  flex: 1;
  min-height: 320px;
  margin-top: 10px;
  display: flex;
  flex-direction: column;
}
</style>
