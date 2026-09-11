<!--主页信息-测试环境 -->
<script setup lang="ts">
import type { FormItemRule } from 'element-plus'
import { Back, Delete } from '@element-plus/icons-vue'
import type {
  TestEnvironmentDetailsDynamicForm,
  TestEnvironmentDetailsData,
  TestEnvironmentDetailsFormData,
  TestEnvironmentDetailsSearchParams
} from '@/types/projectProcess/homeInfo/testEnvironment'
import {
  addTestEnvironmentDetailsAPI,
  deleteTestEnvironmentDetailsAPI,
  getTestEnvironmentDetailsAPI,
  getTestEnvironmentDetailsDetailAPI,
  updateTestEnvironmentDetailsAPI
} from '@/api/projectProcess/homeInfo/testEnvironment-api.ts'
import { defineFormItems } from '@/utils/form.ts'
import { assignObject } from '@/utils/object.ts'
import { useDialogForm } from '@/hooks/useDialogForm.ts'
import { useDeleteAction } from '@/hooks/useDeleteAction.ts'
import { useUploadDialog } from '@/hooks/useUploadDialog.ts'

const props = defineProps<{ categoryId: string }>()

const emit = defineEmits<{ (e: 'back'): void }>()

const searchbarItems = reactive<
  SearchbarItems<TestEnvironmentDetailsSearchParams>
>([{ prop: 'name', type: 'input', placeholder: '请输入名称' }])

const tableColumns = reactive<TableColumns>([
  { label: '名称', prop: 'name', align: 'left' },
  { label: '配置', prop: 'system' },
  { label: '环境数量', prop: 'envTotal', slot: 'envTotal', width: 120 }
])

const scResourcePageRef = useTemplateRef<PageInstance>('scResourcePageRef')

const selection = ref<TestEnvironmentDetailsData[]>([])

const handleSelectionChange = (rows: TestEnvironmentDetailsData[]) => {
  selection.value = rows
}

const { handleDelete } = useDeleteAction<TestEnvironmentDetailsData>(
  ids => deleteTestEnvironmentDetailsAPI({ ids }),
  {
    message: '是否删除当前数据',
    onSuccess: () => scResourcePageRef.value?.refresh()
  }
)

const { handleDelete: handleBatchDelete } =
  useDeleteAction<TestEnvironmentDetailsData>(
    ids => deleteTestEnvironmentDetailsAPI({ ids }),
    {
      message: '是否删除所选数据？',
      onSuccess: () => scResourcePageRef.value?.refresh()
    }
  )

const pageConfig = computed<PageConfig<TestEnvironmentDetailsData>>(() => ({
  searchConfig: { searchbarItems },
  operateConfig: {
    defaultButtons: ['add', 'import'],
    defaultButtonsConfig: {
      add: { permission: 'asset:env:add' },
      import: { permission: 'asset:env:softwareEnv:import' }
    },
    customButtons: [
      {
        id: 'batchDelete',
        name: '批量删除',
        type: 'danger',
        icon: Delete,
        onClick: () => handleBatchDelete(selection.value),
        disabled: selection.value.length === 0,
        permission: 'asset:env:remove'
      },
      {
        id: 'back',
        name: '返回',
        type: 'info',
        icon: Back,
        onClick: () => emit('back')
      }
    ]
  },
  tableConfig: {
    tableColumns,
    showSelection: true,
    defaultButtonsConfig: {
      edit: { permission: 'asset:env:edit' },
      delete: { permission: 'asset:env:remove' }
    }
  },
  fetchData: getTestEnvironmentDetailsAPI,
  pageExtraParams: { categoryId: props.categoryId }
}))

/** 导入模板下载地址 */
const DETAILS_TEMPLATE_URL = '/asset/env/acceptanceEnvTemplate'

const { open: importOpen } = useUploadDialog({
  uploadConfig: {
    uploadUrl: '/asset/env/importSoftwareEnv',
    accept: ['.doc']
  },
  templateConfig: {
    templateUrl: DETAILS_TEMPLATE_URL,
    requestMethod: 'GET',
    showTemplateDownload: true
  },
  title: '测试环境导入',
  extraParams: { categoryId: props.categoryId },
  onSuccess: () => scResourcePageRef.value?.refresh()
})

/** 软件环境动态行字段 */
const ENV_SOFTWARE_FIELDS: Array<{
  label: string
  prop: keyof TestEnvironmentDetailsDynamicForm
  type: 'input' | 'select'
  rules: Array<FormItemRule>
}> = [
  {
    label: '软件名称',
    prop: 'name',
    type: 'input',
    rules: [{ required: true, message: '未填写软件名称', trigger: 'blur' }]
  },
  {
    label: '生产商/来源',
    prop: 'producer',
    type: 'input',
    rules: [{ required: true, message: '未填写生产商/来源', trigger: 'blur' }]
  },
  {
    label: '用途',
    prop: 'purpose',
    type: 'input',
    rules: [{ required: true, message: '未填写用途', trigger: 'blur' }]
  },
  {
    label: '软件环境类型',
    prop: 'type',
    type: 'select',
    rules: [
      { required: true, message: '未填写软件环境类型', trigger: 'change' }
    ]
  }
]

const createEmptyEnvSoftware = (): TestEnvironmentDetailsDynamicForm => ({
  name: '',
  producer: '',
  purpose: '',
  type: ''
})

const dialogFormData = reactive<TestEnvironmentDetailsFormData>({
  name: '',
  system: '',
  riskSubjectEnvSoftwareList: [createEmptyEnvSoftware()],
  categoryId: props.categoryId
})

const formItems = defineFormItems<TestEnvironmentDetailsFormData>([
  {
    label: '名称',
    prop: 'name',
    type: 'input',
    componentProps: { type: 'textarea', placeholder: '请输入名称' },
    rules: [{ required: true, message: '未填写名称', trigger: 'blur' }]
  },
  {
    label: '配置',
    prop: 'system',
    type: 'input',
    componentProps: { type: 'textarea', placeholder: '请输入配置' },
    rules: [{ required: true, message: '未填写配置', trigger: 'blur' }]
  },
  {
    label: '',
    prop: 'riskSubjectEnvSoftwareList',
    customSlot: 'riskSubjectEnvSoftwareList',
    colSpan: 2
  }
])

const handlePageClick = (
  row: TestEnvironmentDetailsData | undefined = undefined
) => open(row)

const {
  visible,
  formData,
  confirmLoading,
  open,
  handleConfirm,
  dialogTitle
} = useDialogForm<TestEnvironmentDetailsFormData>({
  defaultFormData: dialogFormData,
  title: '',
  fetchDetail: async id => {
    const { data } = await getTestEnvironmentDetailsDetailAPI(id)
    const detail: TestEnvironmentDetailsFormData = {
      ...dialogFormData,
      riskSubjectEnvSoftwareList: []
    }
    assignObject(detail, data, {
      riskSubjectEnvSoftwareList: 'riskSubjectEnvSoftwareVos'
    })
    return { data: detail }
  },
  onCreate: data => addTestEnvironmentDetailsAPI(data),
  onUpdate: data => updateTestEnvironmentDetailsAPI(data),
  onSuccess: () => scResourcePageRef.value?.refresh()
})

const addEnvSoftware = (data: TestEnvironmentDetailsFormData) => {
  data.riskSubjectEnvSoftwareList.push(createEmptyEnvSoftware())
}

const removeEnvSoftware = (
  data: TestEnvironmentDetailsFormData,
  index: number
) => {
  data.riskSubjectEnvSoftwareList.splice(index, 1)
}

const pageDialogConfig = computed<DialogFormConfig>(() => ({
  formItems,
  title: dialogTitle.value,
  dialogWidth: '90%',
  columns: 2
}))
</script>

<template>
  <ScResourcePage
    ref="scResourcePageRef"
    :page-config="pageConfig"
    @add="handlePageClick()"
    @edit="handlePageClick"
    @delete="handleDelete"
    @import="importOpen()"
    @selection-change="handleSelectionChange"
  >
    <template #column-envTotal="{ row }">
      {{ row.riskSubjectEnvSoftwareVos?.length ?? 0 }}
    </template>
  </ScResourcePage>
  <ScDialogForm
    v-model="visible"
    :form-data="formData"
    :config="pageDialogConfig"
    :confirm-loading="confirmLoading"
    @confirm="handleConfirm"
  >
    <template #custom-riskSubjectEnvSoftwareList="{ data }">
      <div class="env-software-list">
        <div
          v-for="(_, index) in data.riskSubjectEnvSoftwareList"
          :key="index"
          class="dynamic-form"
        >
          <div class="dynamic-form-header">
            <span class="dynamic-form-index">软件环境 {{ Number(index) + 1 }}</span>
            <ScButton
              type="danger"
              link
              @click="removeEnvSoftware(data, Number(index))"
            >
              删除
            </ScButton>
          </div>
          <div class="dynamic-form-fields">
            <el-form-item
              v-for="field in ENV_SOFTWARE_FIELDS"
              :key="field.prop"
              :label="field.label"
              :prop="`riskSubjectEnvSoftwareList.${index}.${field.prop}`"
              :rules="field.rules"
              style="margin-bottom: 10px"
            >
              <ScInput
                v-if="field.type === 'input'"
                v-model="data.riskSubjectEnvSoftwareList[index][field.prop]"
                :placeholder="`请输入${field.label}`"
              />
              <ScSelect
                v-else
                v-model="data.riskSubjectEnvSoftwareList[index][field.prop]"
                dict-field="software_environment_types"
                :placeholder="`请选择${field.label}`"
              />
            </el-form-item>
          </div>
        </div>
        <div class="add-env-btn">
          <ScButton type="primary" plain @click="addEnvSoftware(data)">
            新增软件环境
          </ScButton>
        </div>
      </div>
    </template>
  </ScDialogForm>
</template>

<style scoped lang="scss">
.env-software-list {
  width: 100%;
}

.dynamic-form {
  border: 1px solid var(--el-border-color-light);
  border-radius: 6px;
  padding: 12px 16px 4px;
  margin-bottom: 12px;

  .dynamic-form-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 10px;

    .dynamic-form-index {
      font-size: 13px;
      color: var(--el-text-color-secondary);
      font-weight: 500;
    }
  }

  .dynamic-form-fields {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0 20px;
  }
}

.add-env-btn {
  display: flex;
  justify-content: center;
  margin-top: 4px;
  margin-bottom: 8px;
}
</style>
