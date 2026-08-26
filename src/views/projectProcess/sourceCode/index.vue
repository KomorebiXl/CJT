<script setup lang="ts">
import type {
  SourceCodeData,
  SourceCodeDetail,
  SourceCodeFormData
} from '@/types/projectProcess/sourceCode'
import {
  createSourceCodeAPI,
  deleteSourceCodeAPI,
  generateSubjectLogAPI,
  getSourceCodeDataAPI,
  getSourceCodeDetailAPI,
  getSubjectLoopholeOptionsAPI,
  updateSourceCodeAPI
} from '@/api/projectProcess/sourceCode-api.ts'
import { Document } from '@element-plus/icons-vue'
import { ScMessage } from '@/utils/ElUtils'
import { useScConfirm } from '@/hooks/useScConfirmDialog.ts'
import { useDialogForm } from '@/hooks/useDialogForm.ts'
import { findFormItem } from '@/utils/formItemUtils.ts'
import { safeRequest } from '@/utils/safeRequest.ts'
import { useUploadDialog } from '@/hooks/useUploadDialog.ts'
import { mapSelectOptions } from '@/utils/optionUtils.ts'
import { getAssetSystemOptionsAPI } from '@/api/projectProcess/assetAssignment-api.ts'
import { useDeleteAction } from '@/hooks/useDeleteAction.ts'
import type { DynamicFormListItem } from '@/components/DynamicFormList/dynamicFormList.ts'
import {
  createSourceCodeDetailRow,
  createSourceCodeFormData,
  createSourceCodeFormItems,
  searchbarItems,
  tableColumns
} from './sourceCode-config.ts'

const route = useRoute()

let step: '1' | '2' = route.query.step === '2' ? '2' : '1'

const scResourcePageRef = useTemplateRef<PageInstance>('scResourcePageRef')

const dialogFormData = createSourceCodeFormData(step)

const formItems = createSourceCodeFormItems(step)

const handlePageClick = (row: SourceCodeData | undefined = undefined) =>
  open(row)

const { visible, formData, confirmLoading, open, handleConfirm, dialogTitle } =
  useDialogForm<SourceCodeFormData, 'id', string, SourceCodeFormData>({
    defaultFormData: dialogFormData,
    title: step === '1' ? '源代码' : '源代码回归测试',
    transformRequest: data =>
      step === '2' && data.id !== undefined ? { ...data, step: null } : data,
    beforeOpen: async (data, row) => {
      if (!data.details || !data.details.length) {
        data.details = [createSourceCodeDetailRow(step)]
      }
      const disable = step === '2' && row !== undefined
      formItems.forEach(item => {
        if (item.type === 'input' || item.type === 'select') {
          item.componentProps ??= {}
          item.componentProps.disabled =
            disable && item.prop !== 'loopholeNum' && item.prop !== 'repairNum'
        }
      })
    },
    fetchDetail: id => getSourceCodeDetailAPI(id),
    onCreate: data => createSourceCodeAPI(data),
    onUpdate: data => updateSourceCodeAPI(data),
    onSuccess: () => scResourcePageRef.value?.refresh()
  })

/** 加载资产选项 */
const loadAssetOptions = async () => {
  const { data } = await getAssetSystemOptionsAPI()
  const assetItem = findFormItem(formItems, 'assetId', 'select')
  if (assetItem?.componentProps) {
    assetItem.componentProps.options = mapSelectOptions(data, {
      label: 'assetName',
      value: 'id'
    })
  }
}

/** 加载漏洞类型选项 */
const loadLoopholeOptions = async () => {
  const { data } = await getSubjectLoopholeOptionsAPI({ useType: 1 })
  const categoryItem = findFormItem(formItems, 'categoryId', 'select')
  if (categoryItem?.componentProps) {
    categoryItem.componentProps.options = mapSelectOptions(data, {
      label: ['typeLabel', 'name'],
      value: 'id'
    })
  }
}

onMounted(() => Promise.allSettled([loadAssetOptions(), loadLoopholeOptions()]))

const { scConfirm } = useScConfirm()

const handleGenerateLog = async () => {
  ScMessage.warning('正在生成测试日志，请等待...')
  const [err] = await safeRequest<BaseResponse, BaseResponse>(
    generateSubjectLogAPI({ step, type: '6' }),
    { showError: false }
  )
  if (!err) {
    ScMessage.success('测试日志生成成功！')
    return
  }
  const { code, msg } = err
  if (code === 500) return
  if (code !== 200 && msg) {
    await scConfirm({
      title: '警告',
      message: `${msg}?`,
      cancelText: '取消'
    }).catch(() => {})
  }
}

const uploadConfig: UploadConfig = {
  uploadUrl: '/asset/code/import',
  accept: ['.xls', '.xlsx']
}

const templateConfig: TemplateConfig = {
  templateUrl: '/asset/code/template',
  requestMethod: 'POST',
  showTemplateDownload: true
}

const { open: importOpen } = useUploadDialog({
  uploadConfig,
  templateConfig,
  title: step === '1' ? '源代码首次测试导入' : '源代码回归测试导入',
  extraParams: { step },
  onSuccess: () => scResourcePageRef.value?.refresh()
})

const pageConfig: PageConfig<SourceCodeData> = {
  searchConfig: { searchbarItems },
  pageExtraParams: { step },
  operateConfig: {
    defaultButtons: ['add', 'import'],
    defaultButtonsConfig: {
      add: { permission: 'asset:code:add' },
      import: { permission: 'asset:code:import' }
    },
    customButtons: [
      {
        id: 'generateLog',
        name: '生成测试日志',
        type: 'success',
        icon: Document,
        permission: 'subject:log:add',
        onClick: handleGenerateLog
      }
    ]
  },
  tableConfig: {
    tableColumns,
    showSelection: true,
    defaultButtonsConfig: {
      edit: { permission: 'asset:code:edit' },
      delete: { permission: 'asset:code:remove' }
    }
  },
  fetchData: getSourceCodeDataAPI
}

const pageDialogConfig = computed<DialogFormConfig>(() => ({
  formItems,
  title: dialogTitle.value,
  columns: 2
}))

const { handleDelete } = useDeleteAction<SourceCodeData>(
  ids => deleteSourceCodeAPI({ ids }),
  {
    message: '确定删除该源代码吗？删除后不可恢复。',
    onSuccess: () => scResourcePageRef.value?.refresh()
  }
)

const dynamicFormItems = reactive<Array<DynamicFormListItem<SourceCodeDetail>>>(
  [
    {
      type: 'textarea',
      prop: 'content',
      label: '内容',
      placeholder: '请输入内容'
    },
    {
      type: 'textarea',
      prop: 'entryPoint',
      label: '入口点',
      placeholder: '请输入入口点'
    },
    ...(step === '2'
      ? ([
          {
            type: 'select',
            prop: 'status',
            label: '状态',
            dictField: 'background_code_status',
            placeholder: '请选择状态'
          },
          {
            type: 'textarea',
            prop: 'repairContent',
            label: '修复后内容',
            placeholder: '请输入修复后内容'
          }
        ] as Array<DynamicFormListItem<SourceCodeDetail>>)
      : [])
  ]
)
</script>

<template>
  <div class="page-card">
    <ScResourcePage
      ref="scResourcePageRef"
      :page-config="pageConfig"
      @add="handlePageClick"
      @edit="handlePageClick"
      @import="importOpen()"
      @delete="handleDelete"
    />
    <ScDialogForm
      v-model="visible"
      :form-data="formData"
      :config="pageDialogConfig"
      :confirm-loading="confirmLoading"
      @confirm="handleConfirm"
    >
      <template #custom-details="{ data }">
        <DynamicFormList
          v-model="data.details"
          :items="dynamicFormItems"
          :create-row="() => createSourceCodeDetailRow(step)"
        />
      </template>
    </ScDialogForm>
  </div>
</template>
