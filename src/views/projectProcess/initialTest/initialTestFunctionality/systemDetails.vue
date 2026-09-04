<script setup lang="ts">
import { ArrowDown } from '@element-plus/icons-vue'
import type { ScBaseFormItem } from '@/components/ScBaseForm/types/formItem.ts'
import type { DynamicFileColumn } from '@/types/projectProcess/projectProcessCommon'
import type {
  InitialTestSystemDetailFormData,
  InitialTestSystemDetailResult,
  InitialTestSystemDetailSearchParams
} from '@/types/projectProcess/initialTest'
import {
  deleteInitialTestSystemDetailAPI,
  exportInitialTestRegressReportAPI,
  exportInitialTestResultReportAPI,
  getInitialTestSystemDetailDetailAPI,
  getInitialTestSystemDetailListAPI,
  rebuildInitialTestSystemDetailSerialAPI,
  updateInitialTestSystemDetailAPI
} from '@/api/projectProcess/initialTest-api.ts'
import { usePermission } from '@/components/ScBaseComponents/ScResourcePage/hooks/usePermission.ts'
import FileReferenceInput from '@/components/FileReferenceInput/index.vue'
import { downloadFile } from '@/utils/file.ts'
import { safeRequest } from '@/utils/safeRequest.ts'
import { ScMessage } from '@/utils/ElUtils'
import { useDeleteAction } from '@/hooks/useDeleteAction.ts'
import { useUploadDialog } from '@/hooks/useUploadDialog.ts'
import { useScConfirm } from '@/hooks/useScConfirmDialog.ts'
import { useDialogForm } from '@/hooks/useDialogForm.ts'
import { useIfUsePlanStealer } from '@/hooks/useProcessProjectFlags.ts'
import {
  INITIAL_TEST_FN_DROPDOWN_ITEMS,
  INITIAL_TEST_FN_EXTRA_PARAMS,
  INITIAL_TEST_FN_FLAT_BUTTONS,
  INITIAL_TEST_FN_FORM_ITEMS,
  INITIAL_TEST_FN_IMPORT_URL,
  INITIAL_TEST_FN_SCREENSHOT_UPLOAD_URL,
  INITIAL_TEST_FN_SEARCHBAR_ITEMS,
  INITIAL_TEST_FN_TABLE_COLUMNS,
  INITIAL_TEST_FN_TEMPLATE_URL,
  createInitialTestSystemDetailFormData
} from './initialTestFunctionality.config'

const props = defineProps<{
  systemId: string
  systemName: string
}>()

const emit = defineEmits<{
  (e: 'back'): void
}>()

const { scConfirm } = useScConfirm()

const { hasPermission } = usePermission()

const scResourcePageRef = useTemplateRef<PageInstance>('scResourcePageRef')

const ifUsePlanStealer = useIfUsePlanStealer()

const searchbarItems = reactive<
  SearchbarItems<InitialTestSystemDetailSearchParams>
>(INITIAL_TEST_FN_SEARCHBAR_ITEMS)

const dynamicData = ref<DynamicFileColumn[]>([])

const isPlainObject = (val: unknown): val is Record<string, any> =>
  Object.prototype.toString.call(val) === '[object Object]'

const isEmptyValue = (val: unknown) =>
  val === null ||
  val === undefined ||
  (Array.isArray(val) && val.length === 0) ||
  (isPlainObject(val) && Object.keys(val).length === 0)

/**
 * objectToFormData 不等价，勿替换：
 * 空值整体跳过；File[] 同名重复追加；对象数组按 key[i].prop 展开且不回传
 * image（base64 仅用于回显）；其余值 String() 后追加
 */
const buildResultFormData = (data: Record<string, any>): FormData => {
  const formData = new FormData()
  const appendValue = (key: string, value: unknown) => {
    if (value instanceof File) {
      formData.append(key, value)
    } else {
      formData.append(key, String(value))
    }
  }
  Object.entries(data).forEach(([key, value]) => {
    if (isEmptyValue(value)) return
    if (value instanceof File) {
      appendValue(key, value)
      return
    }
    if (Array.isArray(value) && value.every(v => v instanceof File)) {
      value.forEach(file => appendValue(key, file))
      return
    }
    if (Array.isArray(value) && value.every(isPlainObject)) {
      value.forEach((item, index) => {
        Object.entries(item).forEach(([prop, propValue]) => {
          if (prop === 'image') return
          if (isEmptyValue(propValue)) return
          appendValue(`${key}[${index}].${prop}`, propValue)
        })
      })
      return
    }
    if (Array.isArray(value)) {
      value.forEach(item => {
        if (isEmptyValue(item)) return
        appendValue(key, item)
      })
      return
    }
    appendValue(key, value)
  })
  return formData
}

const seedDynamicFields = () => {
  dynamicData.value.forEach(item => {
    formData[item.field] = ''
  })
}

const dialogFormData = createInitialTestSystemDetailFormData()

const { visible, formData, confirmLoading, open, handleConfirm, dialogTitle } =
  useDialogForm<InitialTestSystemDetailFormData, 'id', string, FormData>({
    defaultFormData: dialogFormData,
    title: '测试项',
    fetchDetail: async id => {
      const res = await getInitialTestSystemDetailDetailAPI(id)
      return {
        ...res,
        data: res.data?.result
      } as DataResponse<InitialTestSystemDetailFormData>
    },
    transformRequest: data =>
      buildResultFormData({ ...data, subsystem: props.systemId }),
    onUpdate: data => updateInitialTestSystemDetailAPI(data),
    onSuccess: () => scResourcePageRef.value?.refresh()
  })

const { handleDelete } = useDeleteAction<InitialTestSystemDetailResult>(
  ids => deleteInitialTestSystemDetailAPI({ ids }),
  {
    message: '是否删除当前数据',
    onSuccess: () => scResourcePageRef.value?.refresh()
  }
)

// 基础列 + 动态文件列（插在「测试项说明」或「测试项」之后）
const columns = computed<TableColumns>(() => {
  let list: TableColumns = [...INITIAL_TEST_FN_TABLE_COLUMNS]
  if (ifUsePlanStealer.value) {
    list = list.filter(col => col.prop !== 'itemDescription')
  }
  const dynamicCols = dynamicData.value.map(item => ({
    label: item.name,
    prop: item.field,
    width: 150
  }))
  if (dynamicCols.length) {
    const anchorIndex = ['itemDescription', 'item']
      .map(prop => list.findIndex(col => col.prop === prop))
      .find(index => index !== -1)
    if (anchorIndex !== undefined) {
      list.splice(anchorIndex + 1, 0, ...dynamicCols)
    }
  }
  return list
})

// 动态文件表单项同样插在「测试项说明」（或「测试项」）之后
const formItems = computed<ScBaseFormItem[]>(() => {
  let list: ScBaseFormItem[] = [...INITIAL_TEST_FN_FORM_ITEMS]
  if (ifUsePlanStealer.value) {
    list = list.filter(item => item.prop !== 'itemDescription')
  }
  const dynamicItems = dynamicData.value.map(
    item =>
      ({
        label: item.name,
        prop: item.field,
        type: 'input',
        componentProps: { placeholder: `请输入${item.name}` }
      }) as ScBaseFormItem
  )
  if (dynamicItems.length) {
    const anchorIndex = ['itemDescription', 'item']
      .map(prop => list.findIndex(formItem => formItem.prop === prop))
      .find(index => index !== -1)
    if (anchorIndex !== undefined) {
      list.splice(anchorIndex + 1, 0, ...dynamicItems)
    }
  }
  return list
})

const pageConfig: PageConfig<InitialTestSystemDetailResult> = {
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
    const res = await getInitialTestSystemDetailListAPI({
      ...params,
      ...INITIAL_TEST_FN_EXTRA_PARAMS,
      subsystem: props.systemId
    })
    dynamicData.value = res.data?.files ?? []
    seedDynamicFields()
    return {
      rows: res.data?.result?.rows ?? [],
      total: res.data?.result?.total ?? 0
    }
  },
  treeConfig: { children: 'child', rowKey: 'id', showExpandButton: true }
}

const formatUploadMessage = (response: any) =>
  typeof response?.data === 'string' && response.data.trim()
    ? response.data
    : ''

const { open: importOpen } = useUploadDialog({
  uploadConfig: {
    uploadUrl: INITIAL_TEST_FN_IMPORT_URL,
    accept: ['.xls', '.xlsx'],
    formatSuccessMessage: formatUploadMessage
  },
  templateConfig: {
    templateUrl: INITIAL_TEST_FN_TEMPLATE_URL,
    requestMethod: 'GET',
    showTemplateDownload: true
  },
  title: '首轮测试功能性',
  extraParams: { ...INITIAL_TEST_FN_EXTRA_PARAMS, subsystem: props.systemId },
  onSuccess: () => scResourcePageRef.value?.refresh()
})

const { open: screenshotImportOpen } = useUploadDialog({
  uploadConfig: {
    uploadUrl: INITIAL_TEST_FN_SCREENSHOT_UPLOAD_URL,
    accept: ['.docx'],
    formatSuccessMessage: formatUploadMessage
  },
  title: '首轮测试截图记录',
  extraParams: { ...INITIAL_TEST_FN_EXTRA_PARAMS, subsystem: props.systemId },
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
    exportInitialTestRegressReportAPI({
      ...INITIAL_TEST_FN_EXTRA_PARAMS,
      subsystem: props.systemId
    }),
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
      ...INITIAL_TEST_FN_EXTRA_PARAMS,
      subsystem: props.systemId,
      ...(scResourcePageRef.value?.getSearchParams() ?? {})
    }),
    { showError: false }
  )
  if (err || !res) return
  await downloadFile(res)
  ScMessage.success('数据导出成功！')
}

/** 「数据导入导出操作」下拉菜单项 */
const dropdownItems = computed(() =>
  INITIAL_TEST_FN_DROPDOWN_ITEMS.filter(
    item => !item.permission || hasPermission(item.permission)
  )
)

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

const flatButtons = computed(() =>
  INITIAL_TEST_FN_FLAT_BUTTONS.filter(
    item => !item.permission || hasPermission(item.permission)
  )
)

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
      <div v-if="dropdownItems.length" class="btn-item">
        <el-dropdown trigger="click" @command="handleDropdownCommand">
          <ScButton type="warning">
            数据导入导出操作
            <el-icon class="el-icon--right"><ArrowDown /></el-icon>
          </ScButton>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item
                v-for="item in dropdownItems"
                :key="item.id"
                :command="item.id"
              >
                <el-icon><component :is="item.icon" /></el-icon>
                {{ item.name }}
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
      <div v-for="btn in flatButtons" :key="btn.id" class="btn-item">
        <ScButton :type="btn.type" :icon="btn.icon" @click="handleFlatClick(btn.id)">
          {{ btn.name }}
        </ScButton>
      </div>
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
