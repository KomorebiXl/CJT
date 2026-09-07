<script setup lang="ts">
import { downloadPlanTemplateAPI } from '@/api/projectProcess/planGuidelines-api.ts'
import { downloadFile } from '@/utils/file.ts'
import { safeRequest } from '@/utils/safeRequest.ts'
import { getProcessProjectDetail } from '@/utils/processProject'
import { ScMessage } from '@/utils/ElUtils'
import { useVisible } from '@/hooks/useVisible.ts'
import { StepGuide, type StepItems } from '../components'
import BatchImportDialog from './components/BatchImportDialog.vue'
import TestPlanStatisticsTable from './components/TestPlanStatisticsTable.vue'

const router = useRouter()
const { visible: importVisible, setVisible } = useVisible()

const handleRoutePage = (name: string) => {
  router.push({ name })
}

/** 模板文件名取项目编号与名称 */
const handleBatchDownloadTemplate = async () => {
  const detail = await getProcessProjectDetail()
  if (!detail) return
  const [err, res] = await safeRequest(
    downloadPlanTemplateAPI({ allTem: true }),
    { message: '文件下载失败' }
  )
  if (err || !res) return
  await downloadFile(res, `${detail.code}-${detail.name}-验收测评方案`)
  ScMessage.success('下载成功！')
}

const steps: StepItems = [
  {
    title: '需求来源配置',
    desc: [
      '进行需求来源的配置，确保后续方案模版可正确关联对应的测试需求依据。'
    ],
    action: {
      text: '前往配置',
      handler: () => handleRoutePage('RequirementSourceConfig')
    }
  },
  {
    title: '新建系统名称',
    desc: [
      '在测试需求中完成子系统的新建与命名，系统名称将作为方案模版的基础分类依据。'
    ],
    action: {
      text: '前往新建',
      handler: () => handleRoutePage('CreateSystemName')
    }
  },
  {
    title: '下载方案模版',
    desc: [
      '完成前置配置后，下载方案模版文件（压缩包），按模版格式编辑各子系统的 Excel 文件。'
    ],
    action: {
      text: '下载模版',
      handler: handleBatchDownloadTemplate
    },
    permission: 'asset:plan:template:export'
  },
  {
    title: '批量导入',
    desc: ['将填写完成的数据文件上传，系统将自动解析并录入（不支持压缩包）。'],
    action: {
      text: '立即导入',
      handler: () => setVisible(true)
    },
    permission: 'asset:plan:batch:import'
  }
]
</script>

<template>
  <div class="page-card h-viewport">
    <StepGuide
      title="方案编制指引"
      subtitle="通过标准化流程完成数据的批量导入与记录生成"
      defaultExpanded
      :steps="steps"
    />
    <div class="table-content">
      <TestPlanStatisticsTable />
    </div>
    <BatchImportDialog v-model:visible="importVisible" />
  </div>
</template>

<style lang="scss" scoped>
@use '../../guideline-page.scss';
</style>
