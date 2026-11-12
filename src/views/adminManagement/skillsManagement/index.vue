<script setup lang="ts">
import { ElMessage } from 'element-plus'
import type {
  SkillsManagementSearchParams,
  SkillsManagementData,
  SkillsManagementFormData
} from '@/types/adminManagement/skillsManagement'
import {
  createSkillsManagementAPI,
  deleteSkillsManagementAPI,
  getSkillsManagementDataAPI,
  getSkillsManagementDetailAPI,
  resetSkillTemplateAPI,
  updateSkillsManagementAPI
} from '@/api/adminManagement/skillsManagement-api.ts'
import { defineFormItems } from '@/utils/form.ts'
import { getDictOptions } from '@/utils/dict.ts'
import { useDialogForm } from '@/hooks/useDialogForm.ts'
import { useDeleteAction } from '@/hooks/useDeleteAction.ts'
import { useScConfirm } from '@/hooks/useScConfirmDialog.ts'

const { scConfirm } = useScConfirm()

const searchbarItems = reactive<SearchbarItems<SkillsManagementSearchParams>>([
  {
    label: '触发点',
    prop: 'triggerPoint',
    type: 'select',
    dictField: 'ai_trigger_point'
  },
  { label: '技能名称', prop: 'name', type: 'input' }
])

/** 模板必含占位符按触发点区分（与后端 AiTriggerPoints 注册表同步维护；未登记触发点无强制占位符） */
const PROMPT_PLACEHOLDER_TIP_MAP: Record<string, string> = {
  '10': '模板须包含占位符 ${item}、${precondition}、${step}（可选 ${subjectName}、${subsystemName}），生成时以真实数据替换',
  '20': '模板须包含占位符 ${item}（可选 ${subjectName}、${subsystemName}），提取时以测试项素材替换'
}
const PROMPT_PLACEHOLDER_TIP_DEFAULT =
  '该触发点无强制占位符，模板占位符以对应功能约定为准'

const tableColumns = reactive<TableColumns>([
  { label: '触发点', prop: 'triggerPoint', slot: 'triggerPoint', width: 120 },
  { label: '技能名称', prop: 'name', minWidth: 140 },
  { label: '采样温度', prop: 'temperature', width: 90 },
  { label: 'top_p', prop: 'topP', width: 80 },
  { label: '最大tokens', prop: 'maxTokens', width: 100 },
  { label: '状态', prop: 'enable', slot: 'enable', width: 80 },
  {
    label: '提示词模板',
    prop: 'promptTemplate',
    minWidth: 220,
    showOverflowTooltip: true
  },
  { label: '备注', prop: 'remark', minWidth: 120, showOverflowTooltip: true },
  { label: '更新时间', prop: 'updateTime', width: 160 }
])

const pageConfig: PageConfig<SkillsManagementData> = {
  searchConfig: { searchbarItems },
  operateConfig: {
    defaultButtonsConfig: { add: { permission: 'system:aiSkill:add' } }
  },
  tableConfig: {
    tableColumns,
    defaultButtonsConfig: {
      edit: { permission: 'system:aiSkill:edit' },
      delete: { permission: 'system:aiSkill:remove' }
    },
    customActionButtons: [
      {
        name: '恢复默认',
        type: 'warning',
        text: true,
        permission: 'system:aiSkill:edit',
        onClick: (row: SkillsManagementData) => handleResetTemplate(row)
      }
    ]
  },
  fetchData: getSkillsManagementDataAPI
}

const dialogFormData = reactive<SkillsManagementFormData>({
  triggerPoint: '',
  name: '',
  promptTemplate: '',
  temperature: null,
  topP: null,
  maxTokens: null,
  enable: 1,
  remark: ''
})

const formItems = defineFormItems<SkillsManagementFormData>([
  {
    label: '触发点',
    prop: 'triggerPoint',
    type: 'select',
    componentProps: {
      dictField: 'ai_trigger_point',
      placeholder: '选择技能挂在哪个 AI 功能上'
    },
    rules: [{ required: true, message: '未选择触发点', trigger: 'change' }]
  },
  {
    label: '技能名称',
    prop: 'name',
    type: 'input',
    rules: [{ required: true, message: '未填写技能名称', trigger: 'blur' }]
  },
  {
    label: '提示词模板',
    prop: 'promptTemplate',
    type: 'input',
    componentProps: {
      type: 'textarea',
      rows: 10,
      placeholder: PROMPT_PLACEHOLDER_TIP_DEFAULT
    },
    rules: [{ required: true, message: '未填写提示词模板', trigger: 'blur' }],
    colSpan: 2
  },
  {
    label: '采样温度',
    prop: 'temperature',
    type: 'inputNumber',
    componentProps: {
      min: 0,
      max: 2,
      step: 0.1,
      placeholder: '留空=1.0；越高越发散'
    }
  },
  {
    label: 'top_p',
    prop: 'topP',
    type: 'inputNumber',
    componentProps: {
      min: 0,
      max: 1,
      step: 0.1,
      placeholder: '留空=1.0；一般不动'
    }
  },
  {
    label: '最大tokens',
    prop: 'maxTokens',
    type: 'inputNumber',
    componentProps: {
      min: 1,
      max: 8192,
      step: 256,
      placeholder: '留空=4096；过小截断'
    }
  },
  {
    label: '状态',
    prop: 'enable',
    type: 'select',
    componentProps: {
      options: [
        { label: '启用', value: 1 },
        { label: '停用', value: 0 }
      ]
    },
    rules: [{ required: true, message: '未选择状态', trigger: 'change' }]
  },
  {
    label: '备注',
    prop: 'remark',
    type: 'input',
    componentProps: { type: 'textarea', rows: 2 },
    colSpan: 2
  }
])

// 模板输入框占位符随触发点联动（formItems 为静态数组，直接改对应项的 componentProps 即可生效）
const templateFormItem = formItems.find(
  item => item.prop === 'promptTemplate'
) as { componentProps: Record<string, unknown> } | undefined
watch(
  () => dialogFormData.triggerPoint,
  triggerPoint => {
    if (templateFormItem) {
      templateFormItem.componentProps.placeholder =
        (triggerPoint && PROMPT_PLACEHOLDER_TIP_MAP[triggerPoint]) ||
        PROMPT_PLACEHOLDER_TIP_DEFAULT
    }
  }
)

const scResourcePageRef = useTemplateRef<PageInstance>('scResourcePageRef')

/** 触发点字典值 → 标签（表格列展示用；字典缺失时回显原值） */
const triggerPointMap = ref<Record<string, string>>({})
getDictOptions('ai_trigger_point').then(options => {
  triggerPointMap.value = options.reduce(
    (acc, item) => ({ ...acc, [String(item.value)]: item.label }),
    {} as Record<string, string>
  )
})
const triggerPointLabel = (value: string) => triggerPointMap.value[value] ?? value

const handlePageClick = (row: SkillsManagementData | undefined = undefined) =>
  open(row)

/** 恢复出厂默认模板（改坏了的退路） */
const handleResetTemplate = async (row: SkillsManagementData) => {
  try {
    await scConfirm({
      message: `将「${row.name}」的提示词模板恢复为出厂默认，当前模板会被覆盖，确认执行？`
    })
  } catch {
    return
  }
  await resetSkillTemplateAPI(row.id)
  ElMessage.success('已恢复默认模板')
  scResourcePageRef.value?.refresh()
}

const { handleDelete } = useDeleteAction<SkillsManagementData>(
  ids => deleteSkillsManagementAPI({ ids }),
  {
    message: '确定删除该技能吗？删除后对应功能将回退到代码内置模板。',
    onSuccess: () => scResourcePageRef.value?.refresh()
  }
)

const { visible, formData, confirmLoading, open, handleConfirm, dialogTitle } =
  useDialogForm<SkillsManagementFormData>({
    defaultFormData: dialogFormData,
    title: '技能管理',
    fetchDetail: id => getSkillsManagementDetailAPI(id),
    onCreate: data => createSkillsManagementAPI(data),
    onUpdate: data => updateSkillsManagementAPI(data),
    onSuccess: () => scResourcePageRef.value?.refresh()
  })

const pageDialogConfig = computed<DialogFormConfig>(() => ({
  formItems,
  title: dialogTitle.value
}))
</script>

<template>
  <div class="page-card">
    <ScResourcePage
      ref="scResourcePageRef"
      :page-config="pageConfig"
      @add="handlePageClick"
      @edit="handlePageClick"
      @delete="handleDelete"
    >
      <template #column-triggerPoint="{ row }">
        {{ triggerPointLabel(row.triggerPoint) }}
      </template>
      <template #column-enable="{ row }">
        <el-tag :type="row.enable === 1 ? 'success' : 'info'">
          {{ row.enable === 1 ? '启用' : '停用' }}
        </el-tag>
      </template>
    </ScResourcePage>
    <ScDialogForm
      v-model="visible"
      :form-data="formData"
      :config="pageDialogConfig"
      :confirm-loading="confirmLoading"
      @success="scResourcePageRef?.refresh()"
      @confirm="handleConfirm"
    />
  </div>
</template>

<style scoped lang="scss"></style>
