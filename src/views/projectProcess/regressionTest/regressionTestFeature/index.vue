<script setup lang="ts">
import type { Component } from 'vue'
import { Download, UploadFilled } from '@element-plus/icons-vue'
import type { ScBaseFormItem } from '@/components/ScBaseForm/types/formItem.ts'
import type { ScUploadConfig } from '@/components/ScBaseUpload/scBaseUpload.ts'
import type { DictOption } from '@/types/system/dict'
import type { DynamicFileColumn } from '@/types/projectProcess/projectProcessCommon'
import type {
  RegressionTestFeatureFormData,
  RegressionTestFeatureResult,
  RegressionTestFeatureSearchParams
} from '@/types/projectProcess/regressionTest'
import {
  deleteInitialTestSystemDetailAPI,
  exportInitialTestFeatureRegressAPI,
  exportInitialTestFeatureReportAPI,
  getInitialTestFeatureListAPI,
  getInitialTestSystemDetailDetailAPI,
  importInitialTestFeatureAPI,
  rebuildInitialTestFeatureSerialAPI,
  updateInitialTestSystemDetailAPI
} from '@/api/projectProcess/initialTest-api.ts'
import FileReferenceInput from '@/components/FileReferenceInput/index.vue'
import { downloadFile, uploadFile } from '@/utils/file.ts'
import { findFormItem } from '@/utils/formItemUtils.ts'
import { getProcessProjectDetail } from '@/utils/processProject.ts'
import { safeRequest } from '@/utils/safeRequest.ts'
import { getDictOptions } from '@/utils/dict.ts'
import { ScMessage } from '@/utils/ElUtils'
import { useDeleteAction } from '@/hooks/useDeleteAction.ts'
import { useUploadDialog } from '@/hooks/useUploadDialog.ts'
import { useScConfirm } from '@/hooks/useScConfirmDialog.ts'
import { useDialogForm } from '@/hooks/useDialogForm.ts'
import { useIfUseResultStealer } from '@/hooks/useProcessProjectFlags.ts'
import { DICT_FILTER_MAP } from '@/views/projectProcess/constants.ts'
import { convertToResultFormData } from '@/views/projectProcess/projectProcessUtils.ts'
import { OperateButtonGroup, TimeAnalysisEditTable } from '../../components'
import {
  FEATURE_CONFIG,
  FEATURE_IMPORT_URL,
  FEATURE_SCREENSHOT_UPLOAD_URL,
  REGRESSION_TEST_FEATURE_FLAT_BUTTONS,
  createRegressionTestFeatureFormData
} from './regressionTestFeature.config'
import type { FeatureKey } from './regressionTestFeature.config'

const route = useRoute()

const scResourcePageRef = useTemplateRef<PageInstance>('scResourcePageRef')

const ifUseResultStealer = useIfUseResultStealer()

const { scConfirm } = useScConfirm()

const feature = computed<FeatureKey | null>(() => {
  const f = route.query.feature
  return typeof f === 'string' && f in FEATURE_CONFIG ? (f as FeatureKey) : null
})

const cfg = computed(() =>
  feature.value ? FEATURE_CONFIG[feature.value] : null
)

const searchbarItems = reactive<
  SearchbarItems<RegressionTestFeatureSearchParams>
>([
  { prop: 'item', type: 'input', placeholder: '请输入测试项' },
  { prop: 'firstTester', type: 'input', placeholder: '请输入首次测试人员' },
  { prop: 'subFeature', type: 'select', placeholder: '请选择子特性' },
  {
    prop: 'firstResult',
    type: 'select',
    dictField: 'first_test_result',
    placeholder: '首轮测试结果'
  },
  {
    prop: 'regressionResult',
    type: 'select',
    dictField: 'first_test_result',
    placeholder: '请选择回归验证结果'
  }
])

const subFeatureOptions = ref<Array<DictOption>>([])

/** sub_property 字典按 feature 过滤后注入搜索项与编辑弹窗 */
const loadSubFeatureOptions = async () => {
  if (!feature.value) return
  const allowed = DICT_FILTER_MAP[feature.value] ?? []
  const options = await getDictOptions('sub_property')
  subFeatureOptions.value = options.filter(item =>
    allowed.includes(String(item.value))
  )
  const searchItem = searchbarItems.find(item => item.prop === 'subFeature')
  if (searchItem && searchItem.type === 'select')
    searchItem.options = subFeatureOptions.value
}

const dynamicData = ref<Array<DynamicFileColumn>>([])

// 基础列（用户文档集覆盖）+ 动态文件列尾部追加；
// 窃取未启用（ifUseResultStealer）或配置 hideDescription（仅兼容性）时隐藏「测试项说明」
const columns = computed<TableColumns>(() => {
  const base = cfg.value?.columns ?? []
  const list =
    ifUseResultStealer.value || cfg.value?.hideDescription
      ? base.filter(col => col.prop !== 'itemDescription')
      : [...base]
  return [
    ...list,
    ...dynamicData.value.map(item => ({
      label: item.name,
      prop: item.field,
      width: 150
    }))
  ]
})

const dialogFormData = createRegressionTestFeatureFormData()

const { visible, formData, confirmLoading, open, handleConfirm, dialogTitle } =
  useDialogForm<RegressionTestFeatureFormData, 'id', string, FormData>({
    defaultFormData: dialogFormData,
    title: '',
    fetchDetail: async id => {
      const res = await getInitialTestSystemDetailDetailAPI(id)
      const result = res.data?.result as Record<string, unknown> | undefined
      if (result && Array.isArray(result.timeAnalysisList))
        result.assetAcceptanceTimeAnalysisList = result.timeAnalysisList
      return {
        ...res,
        data: result
      } as DataResponse<RegressionTestFeatureFormData>
    },
    transformRequest: data =>
      convertToResultFormData(
        { ...data, feature: feature.value ?? '' },
        cfg.value?.fileProps ?? []
      ),
    onUpdate: data => updateInitialTestSystemDetailAPI(data),
    onSuccess: () => scResourcePageRef.value?.refresh()
  })

const seedDynamicFields = () => {
  dynamicData.value.forEach(item => {
    formData[item.field] = ''
  })
}

// 编辑弹窗表单项：基础项 + 动态文件字段尾部追加；
// subFeature 选项随字典过滤结果注入；窃取未启用时移除「测试项说明」
const formItems = computed<ScBaseFormItem[]>(() => {
  let list: ScBaseFormItem[] = cfg.value?.createFormItems() ?? []
  const subFeatureItem = findFormItem(list, 'subFeature', 'select')
  if (subFeatureItem?.componentProps) {
    subFeatureItem.componentProps.options = subFeatureOptions.value
  }
  if (ifUseResultStealer.value) {
    list = list.filter(item => item.prop !== 'itemDescription')
  }
  return [
    ...list,
    ...dynamicData.value.map(
      item =>
        ({
          label: item.name,
          prop: item.field,
          type: 'input',
          componentProps: { placeholder: `请输入${item.name}` }
        }) as ScBaseFormItem
    )
  ]
})

const pageConfig = computed<PageConfig<RegressionTestFeatureResult>>(() => ({
  searchConfig: { searchbarItems },
  operateConfig: {
    // 显式置空防缺省回落 ['add']；全部操作按钮经 #operate-button-slot 渲染（首轮特性页同款）
    defaultButtons: []
  },
  tableConfig: {
    get tableColumns() {
      return columns.value
    },
    rowClassName: ({ row }) => (row.enable === 0 ? 'row-deleted' : ''),
    defaultButtonsConfig: {
      edit: { permission: 'acceptance:result:edit' },
      delete: { permission: 'acceptance:result:remove' }
    }
  },
  fetchData: async params => {
    const { data } = await getInitialTestFeatureListAPI(params)
    dynamicData.value = data?.files ?? []
    seedDynamicFields()
    return {
      rows: data?.result?.rows ?? [],
      total: data?.result?.total ?? 0
    }
  },
  pageExtraParams: { feature: feature.value ?? '' }
}))

const projectCode = ref('')

const { handleDelete } = useDeleteAction<RegressionTestFeatureResult>(
  ids => deleteInitialTestSystemDetailAPI({ ids }),
  {
    message: '是否删除当前数据',
    onSuccess: () => scResourcePageRef.value?.refresh()
  }
)

const formatUploadMessage = (response: any) =>
  typeof response?.data === 'string' && response.data.trim()
    ? response.data
    : ''

// feature 切换时原地 mutate：useUploadDialog/ScBaseUpload 持同一 reactive 引用
const featureImportConfig = reactive<ScUploadConfig>({
  uploadUrl: FEATURE_IMPORT_URL,
  accept: ['.xls', '.xlsx'],
  formatSuccessMessage: formatUploadMessage
})

const syncImportConfig = (f: FeatureKey) => {
  const importConf = FEATURE_CONFIG[f].importConfig
  featureImportConfig.accept = [...importConf.accept]
  featureImportConfig.multiple = importConf.multiple
}

/**
 * 回归导入统一走自定义上传，读取请求时刻的 feature 配置（切换特性无陈旧参数）：
 * 可靠性 file/80 分流与性能 250 字段在此构建 FormData（源自定义上传不携 dataType）；
 * 标准特性走公共默认上传，回归区别于首轮：须附加 dataType='2'
 */
const importUploadFn = async (files: File[]) => {
  const { maxFiles, fileField } = cfg.value?.importConfig ?? {}
  if (maxFiles && files.length > maxFiles) {
    throw new Error(`最多只能上传 ${maxFiles} 个文件`)
  }
  if (!fileField) {
    return uploadFile(FEATURE_IMPORT_URL, files, {
      feature: feature.value ?? '',
      dataType: '2'
    })
  }
  const formData = new FormData()
  formData.append('feature', feature.value ?? '')
  files.forEach(file => formData.append(fileField(file), file))
  return importInitialTestFeatureAPI(formData)
}

const { open: importOpen } = useUploadDialog({
  uploadConfig: featureImportConfig,
  title: '回归测试导入',
  uploadFn: importUploadFn,
  onSuccess: () => scResourcePageRef.value?.refresh()
})

const screenshotExtraParams = reactive<{ feature: string }>({
  feature: feature.value ?? ''
})

const { open: screenshotImportOpen } = useUploadDialog({
  uploadConfig: {
    uploadUrl: FEATURE_SCREENSHOT_UPLOAD_URL,
    accept: ['.docx'],
    formatSuccessMessage: formatUploadMessage
  },
  title: '回归测试截图记录导入',
  extraParams: screenshotExtraParams,
  onSuccess: () => scResourcePageRef.value?.refresh()
})

const handleRefreshSerial = async () => {
  try {
    await scConfirm({
      title: '提示',
      message: '是否重构当前系统序号',
      confirmText: '确定',
      cancelText: '取消'
    })
  } catch {
    return
  }
  await rebuildInitialTestFeatureSerialAPI({ feature: feature.value ?? '' })
  ScMessage.success('重构序号成功')
  scResourcePageRef.value?.refresh()
}

/** 回归（未通过记录）导出 */
const handleExportFailed = async () => {
  const [err, res] = await safeRequest(
    exportInitialTestFeatureRegressAPI(
      { feature: feature.value ?? '' },
      cfg.value?.regressExportUrl
    ),
    { showError: false }
  )
  if (err || !res) return
  await downloadFile(res, cfg.value?.buildExportFileName?.(projectCode.value))
  ScMessage.success('数据导出成功！')
}

/** 回归（全部记录）导出 */
const handleExportAll = async () => {
  const [err, res] = await safeRequest(
    exportInitialTestFeatureReportAPI(
      {
        feature: feature.value ?? '',
        ...(scResourcePageRef.value?.getSearchParams() ?? {})
      },
      cfg.value?.exportUrl
    ),
    { showError: false }
  )
  if (err || !res) return
  await downloadFile(res, cfg.value?.buildExportFileName?.(projectCode.value))
  ScMessage.success('数据导出成功！')
}

/**
 * 「数据导入导出操作」下拉菜单项（首轮特性页同款布局）：
 * 截图导入入口随特性开关、两项导出权限随 cfg 变，故为页面 computed 而非 config 静态清单；
 * 权限过滤由 OperateButtonGroup 内置
 */
const dropdownItems = computed(() => {
  const items: Array<{
    id: string
    name: string
    icon: Component
    permission?: string
  }> = [
    {
      id: 'import',
      name: '回归（测试完成记录）导入',
      icon: UploadFilled,
      permission: 'acceptance:result:software:import'
    }
  ]
  if (cfg.value?.showScreenshotImport) {
    items.push({
      id: 'importScreenshot',
      name: '导入回归测试截图记录',
      icon: UploadFilled,
      permission: 'acceptance:result:import:screenshot'
    })
  }
  items.push(
    {
      id: 'exportFailed',
      name: '回归（未通过记录）导出',
      icon: Download,
      permission: cfg.value?.regressExportPermission
    },
    {
      id: 'exportAll',
      name: '回归（全部记录）导出',
      icon: Download,
      permission: cfg.value?.exportPermission
    }
  )
  return items
})

const handleDropdownCommand = (id: string) => {
  switch (id) {
    case 'import':
      importOpen()
      break
    case 'importScreenshot':
      screenshotImportOpen()
      break
    case 'exportFailed':
      handleExportFailed()
      break
    case 'exportAll':
      handleExportAll()
      break
    default:
      break
  }
}

const handleFlatClick = (btnId: string) => {
  switch (btnId) {
    case 'refreshNum':
      handleRefreshSerial()
      break
    default:
      break
  }
}

const pageDialogConfig = computed<DialogFormConfig>(() => ({
  formItems: formItems.value,
  title: `${dialogTitle.value}${cfg.value?.name ?? ''}`
}))

// feature 切换：上传配置原地更新、动态列清空、字典重过滤、搜索重置并重取
watch(feature, f => {
  if (!f) return
  syncImportConfig(f)
  screenshotExtraParams.feature = f
  dynamicData.value = []
  loadSubFeatureOptions()
  scResourcePageRef.value?.resetSearch()
})

onMounted(() => {
  if (feature.value) syncImportConfig(feature.value)
  loadSubFeatureOptions()
  getProcessProjectDetail().then(detail => {
    projectCode.value = detail?.code ?? ''
  })
})
</script>

<template>
  <div class="page-card">
    <ScResourcePage
      ref="scResourcePageRef"
      :page-config="pageConfig"
      @edit="open"
      @delete="handleDelete"
    >
      <template #operate-button-slot>
        <OperateButtonGroup
          :dropdown-items="dropdownItems"
          :flat-buttons="REGRESSION_TEST_FEATURE_FLAT_BUTTONS"
          @dropdown-command="handleDropdownCommand"
          @flat-click="handleFlatClick"
        />
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
      <template #custom-processScreenshot="{ data }">
        <FileReferenceInput
          v-model="data.processScreenshot"
          v-model:file-list="data.files"
        />
      </template>
      <template #custom-caseTableType="{ data }">
        <TimeAnalysisEditTable
          v-model="data.assetAcceptanceTimeAnalysisList"
          :type="data.caseTableType"
          :form-data="data"
          @update:type="val => (data.caseTableType = val)"
        />
      </template>
    </ScDialogForm>
  </div>
</template>

<style scoped lang="scss">
:deep(.row-deleted) {
  background-color: #fee;

  td {
    background-color: #fee;
  }
}
</style>
