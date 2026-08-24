<script setup lang="ts">
import type {
  InformationSecurityData,
  InformationSecurityFormData,
  InformationSecuritySearchParams
} from '@/types/projectProcess/informationSecurity'
import {
  createInformationSecurityAPI,
  getInformationSecurityDataAPI,
  getInformationSecurityDetailAPI,
  updateInformationSecurityAPI
} from '@/api/projectProcess/informationSecurity-api.ts'
import { objectToFormData } from '@/utils/file.ts'
import { defineFormItems } from '@/utils/form.ts'
import { useDialogForm } from '@/hooks/useDialogForm.ts'
import { useUploadDialog } from '@/hooks/useUploadDialog.ts'
import FileReferenceInput from '@/components/FileReferenceInput/index.vue'

const searchbarItems = reactive<
  SearchbarItems<InformationSecuritySearchParams>
>([
  {
    label: '安全类别',
    prop: 'securityType',
    type: 'select',
    dictField: 'background_general_security'
  },
  {
    label: '检测结果',
    prop: 'result',
    type: 'select',
    dictField: 'background_point_result'
  }
])

const tableColumns = reactive<TableColumns>([
  { label: '安全类别', prop: 'securityTypeLabel' },
  { label: '检测要求', prop: 'require', showOverflowTooltip: true },
  { label: '检测过程', prop: 'process' },
  { label: '检测结果', prop: 'resultLabel' }
])

const pageConfig: PageConfig<InformationSecurityData> = {
  searchConfig: { searchbarItems },
  operateConfig: {
    defaultButtons: ['add', 'import'],
    defaultButtonsConfig: {
      add: { permission: 'asset:security:add' },
      import: { permission: 'asset:security:import' }
    }
  },
  tableConfig: {
    tableColumns,
    defaultButtonsConfig: {
      edit: { permission: 'asset:security:edit' },
      delete: { show: () => false }
    }
  },
  fetchData: getInformationSecurityDataAPI
}

const dialogFormData = reactive<InformationSecurityFormData>({
  securityType: '',
  result: '',
  process: '',
  process_files: []
})

const formItems = defineFormItems<InformationSecurityFormData>([
  {
    label: '安全类别',
    prop: 'securityType',
    type: 'select',
    rules: [{ required: true, message: '该项不能为空', trigger: 'blur' }],
    componentProps: { dictField: 'background_general_security' }
  },
  {
    label: '检测结果',
    prop: 'result',
    type: 'select',
    rules: [{ required: true, message: '该项不能为空', trigger: 'blur' }],
    componentProps: { dictField: 'background_point_result' }
  },
  {
    label: '检测过程',
    prop: 'process',
    customSlot: 'process',
    rules: [{ required: true, message: '该项不能为空', trigger: 'blur' }],
    colSpan: 2
  }
])

const scResourcePageRef = useTemplateRef<PageInstance>('scResourcePageRef')

const handlePageClick = (
  row: InformationSecurityData | undefined = undefined
) => open(row)

const { visible, formData, confirmLoading, open, handleConfirm, dialogTitle } =
  useDialogForm<InformationSecurityFormData, 'id', string, FormData>({
    defaultFormData: dialogFormData,
    title: '信息安全性',
    transformRequest: data => objectToFormData(data),
    fetchDetail: id => getInformationSecurityDetailAPI(id),
    onCreate: data => createInformationSecurityAPI(data),
    onUpdate: data => updateInformationSecurityAPI(data),
    onSuccess: () => scResourcePageRef.value?.refresh()
  })

const uploadConfig: UploadConfig = {
  uploadUrl: '/asset/security/import',
  accept: ['.xlsx']
}

const templateConfig: TemplateConfig = {
  templateUrl: '/asset/security/template',
  requestMethod: 'POST',
  showTemplateDownload: true
}

const { open: importOpen } = useUploadDialog({
  uploadConfig,
  templateConfig,
  title: '信息安全性导入',
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
      @import="importOpen()"
    />
    <ScDialogForm
      v-model="visible"
      :form-data="formData"
      :config="pageDialogConfig"
      :confirm-loading="confirmLoading"
      @confirm="handleConfirm"
    >
      <template #custom-process="{ data }">
        <FileReferenceInput
          v-model="data.process"
          v-model:file-list="data.process_files"
          :rows="5"
          placeholder="请输入检测过程"
        />
      </template>
    </ScDialogForm>
  </div>
</template>

<style scoped lang="scss"></style>
