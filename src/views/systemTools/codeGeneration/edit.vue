<script setup lang="ts">
import {
  getCodeGenerationDetailAPI,
  updateCodeGenerationAPI
} from '@/api/systemTools/codeGeneration'
import { getMenuTreeData } from '@/api/system/menu-api.ts'
import type {
  CodeGenerationColumn,
  CodeGenerationOptionsFormData
} from '@/types/systemTools/codeGeneration'
import type { TreeMenuData } from '@/types/system/menu'
import { defaultBasicFormData, defaultOptionsFormData } from './config'
import CodeGenerationBasicForm from './components/CodeGenerationBasicForm.vue'
import CodeGenerationColumnEditor from './components/CodeGenerationColumnEditor.vue'
import CodeGenerationOptionsForm from './components/CodeGenerationOptionsForm.vue'
import ScMessage from '@/utils/ElUtils/message.ts'

defineOptions({ name: 'CodeGenerationEditPage' })
const route = useRoute()
const router = useRouter()
const tableId = computed(() => route.params.tableId as string | undefined)
const activeTab = ref('basic')
const loading = ref(false)
const submitting = ref(false)
const basicForm = reactive({ ...defaultBasicFormData })
const optionsForm = reactive<CodeGenerationOptionsFormData>({
  ...defaultOptionsFormData
})
const columns = ref<CodeGenerationColumn[]>([])
const menuOptions = ref<TreeMenuData[]>([])
const basicFormRef = useTemplateRef<{ validate: () => Promise<boolean> }>(
  'basicFormRef'
)
const optionsFormRef = useTemplateRef<{ validate: () => Promise<boolean> }>(
  'optionsFormRef'
)
const loadDetail = async () => {
  if (!tableId.value) {
    ScMessage.error('缺少代码生成表 ID')
    return
  }
  loading.value = true
  try {
    const [detailResponse, menuResponse] = await Promise.all([
      getCodeGenerationDetailAPI(tableId.value),
      getMenuTreeData()
    ])
    const detail = detailResponse.data
    Object.assign(basicForm, detail.info)
    Object.assign(optionsForm, detail.info)
    columns.value = detail.rows ?? []
    menuOptions.value = menuResponse.data
  } finally {
    loading.value = false
  }
}
const goBack = () => router.push('/system-tools/code-generation')
const handleSubmit = async () => {
  const [basicValid, optionsValid] = await Promise.all([
    basicFormRef.value?.validate(),
    optionsFormRef.value?.validate()
  ])
  if (basicValid === false || optionsValid === false) return
  submitting.value = true
  try {
    await updateCodeGenerationAPI({
      ...basicForm,
      ...optionsForm,
      columns: columns.value,
      params: {
        treeCode: optionsForm.treeCode,
        treeName: optionsForm.treeName,
        treeParentCode: optionsForm.treeParentCode,
        parentMenuId: optionsForm.parentMenuId
      },
      tplWebType: 'lmw'
    })
    ScMessage.success('保存成功')
    await goBack()
  } finally {
    submitting.value = false
  }
}
onMounted(loadDetail)
</script>

<template>
  <div v-loading="loading" class="page-card code-generation-edit">
    <div class="edit-header">
      <h2>代码生成配置</h2>
      <div>
        <ScButton @click="goBack">返回</ScButton>
        <ScButton type="primary" :loading="submitting" @click="handleSubmit">
          保存
        </ScButton>
      </div>
    </div>
    <el-tabs v-model="activeTab">
      <el-tab-pane label="基本信息" name="basic" lazy>
        <CodeGenerationBasicForm ref="basicFormRef" :model-value="basicForm" />
      </el-tab-pane>
      <el-tab-pane label="字段信息" name="columns" lazy>
        <CodeGenerationColumnEditor v-model="columns" />
      </el-tab-pane>
      <el-tab-pane label="生成信息" name="options" lazy>
        <CodeGenerationOptionsForm
          ref="optionsFormRef"
          :model-value="optionsForm"
          :menu-options="menuOptions"
        />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<style scoped lang="scss">
.code-generation-edit {
  padding: 20px;
}
.edit-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}
.edit-header h2 {
  margin: 0;
  font-size: 18px;
}
</style>
