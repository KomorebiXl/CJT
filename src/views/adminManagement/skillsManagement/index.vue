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
import { useDialogForm } from '@/hooks/useDialogForm.ts'
import { useDeleteAction } from '@/hooks/useDeleteAction.ts'
import { useScConfirm } from '@/hooks/useScConfirmDialog.ts'

const { scConfirm } = useScConfirm()

const searchbarItems = reactive<SearchbarItems<SkillsManagementSearchParams>>([
  { label: '技能编码', prop: 'skillCode', type: 'input' },
  { label: '技能名称', prop: 'name', type: 'input' }
])

/** 模板必含的三个核心占位符（后端保存时强校验） */
const PROMPT_PLACEHOLDER_TIP =
  '模板须包含占位符 ${item}、${precondition}、${step}（可选 ${subjectName}、${subsystemName}），生成时以真实数据替换'

const tableColumns = reactive<TableColumns>([
  { label: '技能编码', prop: 'skillCode', minWidth: 160 },
  { label: '技能名称', prop: 'name', minWidth: 140 },
  { label: '指定模型', prop: 'model', width: 120 },
  { label: '状态', prop: 'enable', slot: 'enable', width: 80 },
  { label: '提示词模板', prop: 'promptTemplate', minWidth: 220, showOverflowTooltip: true },
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
  skillCode: '',
  name: '',
  promptTemplate: '',
  model: '',
  paramsJson: '',
  enable: 1,
  remark: ''
})

const formItems = defineFormItems<SkillsManagementFormData>([
  {
    label: '技能编码',
    prop: 'skillCode',
    type: 'input',
    componentProps: { placeholder: '如 test_case_expand' },
    rules: [{ required: true, message: '未填写技能编码', trigger: 'blur' }]
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
    componentProps: { type: 'textarea', rows: 10, placeholder: PROMPT_PLACEHOLDER_TIP },
    rules: [{ required: true, message: '未填写提示词模板', trigger: 'blur' }]
  },
  {
    label: '指定模型',
    prop: 'model',
    type: 'input',
    componentProps: { placeholder: '留空使用系统配置模型' }
  },
  {
    label: '附加参数',
    prop: 'paramsJson',
    type: 'input',
    componentProps: { type: 'textarea', rows: 2, placeholder: 'JSON，如 {"temperature":0.5}，可留空' }
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
    componentProps: { type: 'textarea', rows: 2 }
  }
])

const scResourcePageRef = useTemplateRef<PageInstance>('scResourcePageRef')

const handlePageClick = (row: SkillsManagementData | undefined = undefined) => open(row)

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
