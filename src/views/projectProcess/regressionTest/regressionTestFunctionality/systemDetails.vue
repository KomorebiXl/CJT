<script setup lang="ts">
import type { ScBaseFormItem } from '@/components/ScBaseForm/types/formItem.ts'
import type { DynamicFileColumn } from '@/types/projectProcess/projectProcessCommon'
import type {
  RegressionTestFnSubsystemFormData,
  RegressionTestFnSubsystemResult,
  RegressionTestFnSubsystemSearchParams
} from '@/types/projectProcess/regressionTest'
import {
  deleteInitialTestSystemDetailAPI,
  exportInitialTestRegressReportAPI,
  exportInitialTestResultReportAPI,
  getInitialTestSystemDetailDetailAPI,
  getInitialTestSystemDetailListAPI,
  rebuildInitialTestSystemDetailSerialAPI,
  updateInitialTestSystemDetailAPI
} from '@/api/projectProcess/initialTest-api.ts'
import FileReferenceInput from '@/components/FileReferenceInput/index.vue'
import { downloadFile, uploadFile } from '@/utils/file.ts'
import { safeRequest } from '@/utils/safeRequest.ts'
import { ScMessage } from '@/utils/ElUtils'
import { useDeleteAction } from '@/hooks/useDeleteAction.ts'
import { useUploadDialog } from '@/hooks/useUploadDialog.ts'
import { useScConfirm } from '@/hooks/useScConfirmDialog.ts'
import { useDialogForm } from '@/hooks/useDialogForm.ts'
import { useIfUsePlanStealer } from '@/hooks/useProcessProjectFlags.ts'
import { buildResultFormData, mergeDynamicAfterAnchor } from '@/views/projectProcess/projectProcessUtils.ts'
import { OperateButtonGroup } from '../../components'
import {
  REGRESSION_TEST_FN_DROPDOWN_ITEMS,
  REGRESSION_TEST_FN_FLAT_BUTTONS,
  REGRESSION_TEST_FN_FORM_ITEMS,
  REGRESSION_TEST_FN_IMPORT_URL,
  REGRESSION_TEST_FN_SCREENSHOT_UPLOAD_URL,
  REGRESSION_TEST_FN_SEARCHBAR_ITEMS,
  REGRESSION_TEST_FN_TABLE_COLUMNS,
  REGRESSION_TEST_FN_TEMPLATE_URL,
  createRegressionTestFnExtraParams,
  createRegressionTestFnSubsystemFormData
} from './regressionTestFunctionality.config'

const props = defineProps<{
  systemId: string
  systemName: string
}>()

const emit = defineEmits<{
  (e: 'back'): void
}>()

const { scConfirm } = useScConfirm()

const scResourcePageRef = useTemplateRef<PageInstance>('scResourcePageRef')

const ifUsePlanStealer = useIfUsePlanStealer()

const searchbarItems = reactive<
  SearchbarItems<RegressionTestFnSubsystemSearchParams>
>(REGRESSION_TEST_FN_SEARCHBAR_ITEMS)

const dynamicData = ref<DynamicFileColumn[]>([])

const seedDynamicFields = () => {
  dynamicData.value.forEach(item => {
    formData[item.field] = ''
  })
}

const dialogFormData = createRegressionTestFnSubsystemFormData()

const { visible, formData, confirmLoading, open, handleConfirm, dialogTitle } =
  useDialogForm<RegressionTestFnSubsystemFormData, 'id', string, FormData>({
    defaultFormData: dialogFormData,
    title: '测试项',
    fetchDetail: async id => {
      const res = await getInitialTestSystemDetailDetailAPI(id)
      return {
        ...res,
        data: res.data?.result
      } as unknown as DataResponse<RegressionTestFnSubsystemFormData>
    },
    transformRequest: data =>
      buildResultFormData({ ...data, subsystem: props.systemId }),
    onUpdate: data => updateInitialTestSystemDetailAPI(data),
    onSuccess: () => scResourcePageRef.value?.refresh()
  })

const { handleDelete } = useDeleteAction<RegressionTestFnSubsystemResult>(
  ids => deleteInitialTestSystemDetailAPI({ ids }),
  {
    message: '是否删除当前数据',
    onSuccess: () => scResourcePageRef.value?.refresh()
  }
)

// 基础列 + 动态文件列（插在「测试项说明」或「测试项」之后）
const columns = computed<TableColumns>(() => {
  let list: TableColumns = [...REGRESSION_TEST_FN_TABLE_COLUMNS]
  if (ifUsePlanStealer.value) {
    list = list.filter(col => col.prop !== 'itemDescription')
  }
  return mergeDynamicAfterAnchor(list, dynamicData.value, item => ({
    label: item.name,
    prop: item.field,
    width: 150
  }))
})

// 动态文件表单项同样插在「测试项说明」（或「测试项」）之后
const formItems = computed<ScBaseFormItem[]>(() => {
  let list: ScBaseFormItem[] = [...REGRESSION_TEST_FN_FORM_ITEMS]
  if (ifUsePlanStealer.value)
    list = list.filter(item => item.prop !== 'itemDescription')
  return mergeDynamicAfterAnchor(list, dynamicData.value, item => ({
    label: item.name,
    prop: item.field,
    type: 'input',
    componentProps: { placeholder: `请输入${item.name}` }
  }))
})

const pageConfig: PageConfig<RegressionTestFnSubsystemResult> = {
  searchConfig: { searchbarItems },
  operateConfig: {
    defaultButtons: []
  },
  tableConfig: {
    get tableColumns() {
      return columns.value
    },
    showPagination: false,
    rowClassName: ({ row }) => (row.enable === 0 ? 'row-deleted' : ''),
    defaultButtonsConfig: {
      edit: { permission: 'asset:subsystem:edit' },
      delete: { permission: 'asset:subsystem:remove' }
    }
  },
  fetchData: async params => {
    const { data } = await getInitialTestSystemDetailListAPI({
      ...params,
      ...createRegressionTestFnExtraParams(props.systemId)
    })
    dynamicData.value = data?.files ?? []
    seedDynamicFields()
    return {
      rows: data?.result?.rows ?? [],
      total: data?.result?.total ?? 0
    }
  },
  treeConfig: { children: 'child', rowKey: 'id', showExpandButton: true }
}

const formatUploadMessage = (response: any) =>
  typeof response?.data === 'string' && response.data.trim()
    ? response.data
    : ''

/** 文件名后缀校验 */
const importUploadFn = async (files: File[]) => {
  if (!files.every(file => file.name.includes('回归'))) {
    throw new Error('请选择包含"回归"字样的文件进行上传')
  }
  return uploadFile(
    REGRESSION_TEST_FN_IMPORT_URL,
    files,
    createRegressionTestFnExtraParams(props.systemId)
  )
}

const { open: importOpen } = useUploadDialog({
  uploadConfig: {
    uploadUrl: REGRESSION_TEST_FN_IMPORT_URL,
    accept: ['.xls', '.xlsx'],
    formatSuccessMessage: formatUploadMessage
  },
  templateConfig: {
    templateUrl: REGRESSION_TEST_FN_TEMPLATE_URL,
    requestMethod: 'GET',
    showTemplateDownload: true
  },
  title: '回归测试功能性',
  extraParams: createRegressionTestFnExtraParams(props.systemId),
  uploadFn: importUploadFn,
  onSuccess: () => scResourcePageRef.value?.refresh()
})

const { open: screenshotImportOpen } = useUploadDialog({
  uploadConfig: {
    uploadUrl: REGRESSION_TEST_FN_SCREENSHOT_UPLOAD_URL,
    accept: ['.docx'],
    formatSuccessMessage: formatUploadMessage
  },
  title: '回归测试截图记录',
  extraParams: createRegressionTestFnExtraParams(props.systemId),
  onSuccess: () => scResourcePageRef.value?.refresh()
})

const handleRefreshSerial = async () => {
  try {
    await scConfirm({
      title: '提示',
      message: '是否重构当前子系统序号',
      confirmText: '确定',
      cancelText: '取消'
    })
  } catch {
    return
  }

  await rebuildInitialTestSystemDetailSerialAPI({
    feature: '1',
    subFeature: '1',
    subsystem: props.systemId
  })
  ScMessage.success('重构序号成功')
  scResourcePageRef.value?.refresh()
}

const handleExportFailedReport = async () => {
  const [err, res] = await safeRequest(
    exportInitialTestRegressReportAPI(
      createRegressionTestFnExtraParams(props.systemId)
    ),
    { showError: false }
  )
  if (err || !res) return
  await downloadFile(res)
  ScMessage.success('数据导出成功！')
}

/** 全部记录导出 */
const handleExportAllReport = async () => {
  const [err, res] = await safeRequest(
    exportInitialTestResultReportAPI({
      ...createRegressionTestFnExtraParams(props.systemId),
      ...(scResourcePageRef.value?.getSearchParams() ?? {})
    }),
    { showError: false }
  )
  if (err || !res) return
  await downloadFile(res)
  ScMessage.success('数据导出成功！')
}

const handleDropdownCommand = (id: string) => {
  switch (id) {
    case 'import':
      importOpen()
      break
    case 'exportAll':
      handleExportAllReport()
      break
    case 'exportFailed':
      handleExportFailedReport()
      break
    case 'importScreenshot':
      screenshotImportOpen()
      break
    default:
      break
  }
}

const handleFlatClick = (btnId: string) => {
  switch (btnId) {
    case 'back':
      emit('back')
      break
    case 'refreshNum':
      handleRefreshSerial()
      break
    default:
      break
  }
}

const pageDialogConfig = computed<DialogFormConfig>(() => ({
  formItems: formItems.value,
  title: dialogTitle.value
}))
</script>

<template>
  <ScResourcePage
    ref="scResourcePageRef"
    :page-config="pageConfig"
    @edit="open"
    @delete="handleDelete"
  >
    <template #operate-button-slot>
      <OperateButtonGroup
        :dropdown-items="REGRESSION_TEST_FN_DROPDOWN_ITEMS"
        :flat-buttons="REGRESSION_TEST_FN_FLAT_BUTTONS"
        @dropdown-command="handleDropdownCommand"
        @flat-click="handleFlatClick"
      />
    </template>
    <template #extra-operate-left>
      <el-tag>{{ props.systemName }}</el-tag>
    </template>
  </ScResourcePage>
  <ScDialogForm
    v-model="visible"
    :form-data="formData"
    :config="pageDialogConfig"
    :confirm-loading="confirmLoading"
    @confirm="handleConfirm"
  >
    <template #custom-firstScreenshot="{ data }">
      <FileReferenceInput
        v-model="data.firstScreenshot"
        v-model:file-list="data.firstScreenshotFiles"
      />
    </template>
    <template #custom-regressionScreenshot="{ data }">
      <FileReferenceInput
        v-model="data.regressionScreenshot"
        v-model:file-list="data.regressionScreenshotFiles"
      />
    </template>
  </ScDialogForm>
</template>

<style scoped lang="scss">
:deep(.row-deleted) {
  background-color: #fee;

  td {
    background-color: #fee;
  }
}
</style>
