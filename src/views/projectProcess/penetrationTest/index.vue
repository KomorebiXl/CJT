<script setup lang="ts">
import type {
  PenetrationTestAddress,
  PenetrationTestAssetOption,
  PenetrationTestData,
  PenetrationTestFormData
} from '@/types/projectProcess/penetrationTest'
import type { DictOption } from '@/types/system/dict'
import type { VulnerabilityLibraryOption } from '@/types/adminManagement/vulnerabilityLibrary'
import {
  createPenetrationTestAPI,
  deletePenetrationTestAPI,
  generateSubjectLogAPI,
  getPenetrationTestDataAPI,
  getPenetrationTestDetailAPI,
  updatePenetrationTestAPI
} from '@/api/projectProcess/penetrationTest-api.ts'
import { Document } from '@element-plus/icons-vue'
import { objectToFormData } from '@/utils/file.ts'
import { ScMessage } from '@/utils/ElUtils'
import { useScConfirm } from '@/hooks/useScConfirmDialog.ts'
import { useDialogForm } from '@/hooks/useDialogForm.ts'
import { findFormItem } from '@/utils/formItemUtils.ts'
import { useUploadDialog } from '@/hooks/useUploadDialog.ts'
import { getAssetSystemOptionsAPI } from '@/api/projectProcess/assetAssignment-api.ts'
import { getVulnerabilityLibraryOptionsAPI } from '@/api/adminManagement/vulnerabilityLibrary-api.ts'
import { getDictOptionsMap } from '@/utils/dict.ts'
import {
  searchbarItems,
  createDefaultAddressFormData,
  createPenetrationTestFormData,
  createPenetrationTestFormItems,
  penetrationTestFirstItem,
  penetrationTestRegressionItem,
  penetrationTestRegularItem,
  createPenetrationTestTableColumns
} from '@/views/projectProcess/penetrationTest/penetrationTest-config.ts'
import { useDeleteAction } from '@/hooks/useDeleteAction.ts'
import FileReferenceInput from '@/components/FileReferenceInput/index.vue'
import type { DynamicFormListItem } from '@/components/DynamicFormList/dynamicFormList.ts'

const route = useRoute()

/** step：'1' 首次测试，'2' 回归测试；stateGrid：国网安全形态（路由 query stateGrid=1） */
let step: '1' | '2' = route.query.step === '2' ? '2' : '1'
const stateGrid = route.query.stateGrid === '1'

const scResourcePageRef = useTemplateRef<PageInstance>('scResourcePageRef')

const dialogFormData = createPenetrationTestFormData(step, stateGrid)

const formItems = [
  ...createPenetrationTestFormItems(stateGrid),
  ...(stateGrid ? [] : penetrationTestRegularItem),
  ...(step === '1' ? penetrationTestFirstItem : penetrationTestRegressionItem)
]

const handlePageClick = (row: PenetrationTestData | undefined = undefined) =>
  open(row)

const { visible, formData, confirmLoading, open, handleConfirm, dialogTitle } =
  useDialogForm<PenetrationTestFormData, 'id', string, FormData>({
    defaultFormData: dialogFormData,
    title: '渗透测试',
    transformRequest: data => objectToFormData(data),
    beforeOpen: async data => {
      if (!data.addresses || !data.addresses.length) {
        data.addresses = [createDefaultAddressFormData(step)]
      }
      if (stateGrid && data.assetId) {
        syncStateGridItemOptions(data.assetId)
      }
    },
    fetchDetail: id => getPenetrationTestDetailAPI(id),
    onCreate: data => createPenetrationTestAPI(data),
    onUpdate: data => updatePenetrationTestAPI(data),
    onSuccess: () => scResourcePageRef.value?.refresh()
  })

/** 资产选项原始数据（国网形态按 applicationMode 切换检查项字典） */
const assetOptions = ref<Array<PenetrationTestAssetOption>>([])

/** 加载资产系统选项 */
const loadAssetOptions = async () => {
  const { data } = await getAssetSystemOptionsAPI()
  assetOptions.value = (data ?? []) as Array<PenetrationTestAssetOption>
  const assetItem = findFormItem(formItems, 'assetId', 'select')
  if (assetItem?.componentProps) {
    assetItem.componentProps.options = assetOptions.value.map(item => ({
      label: item.ipAddress
        ? `${item.assetName} ${item.ipAddress}`
        : item.assetName,
      value: item.id
    }))
  }
}

/** 漏洞选项（复用漏洞库列表数据） */
const loopholeOptions = ref<Array<VulnerabilityLibraryOption>>([])

const loadLoopholeOptions = async () => {
  const { data } = await getVulnerabilityLibraryOptionsAPI()
  loopholeOptions.value = data ?? []
}

const loopholeSelectOptions = computed(() =>
  loopholeOptions.value.map(item => ({
    label: item.name,
    value: item.id
  }))
)

/** 常规形态：选择漏洞后回填（为空才回填，测试项除外——源对 item 为无条件覆盖） */
const handleLoopholeChange = (value: string) => {
  if (stateGrid) return
  const target = loopholeOptions.value.find(item => item.id === value)
  if (!target) return
  formData.item = target.itemLabel ?? ''
  formData.level = formData.level || target.level || ''
  formData.loopholeName = formData.loopholeName || target.name || ''
  formData.description = formData.description || target.description || ''
  formData.hazard = formData.hazard || target.risk || ''
  formData.suggestion = formData.suggestion || target.suggestion || ''
}

/** 国网形态：BS/CS 检查项字典选项，按资产应用模式切换 */
const penetrateItemOptionsMap = ref<Record<string, DictOption[]>>({})
const stateGridItemOptions = ref<Array<DictOption>>([])

const loadPenetrateItemDicts = async () => {
  penetrateItemOptionsMap.value = await getDictOptionsMap([
    'background_penetrate_stateGrid_BS',
    'background_penetrate_stateGrid_CS'
  ])
}

/** 按资产应用模式同步国网检查项选项：B/S 系统取 BS 字典，C/S 系统取 CS 字典 */
const syncStateGridItemOptions = (assetId: string) => {
  const asset = assetOptions.value.find(item => item.id === assetId)
  if (asset?.applicationMode === '1') {
    stateGridItemOptions.value =
      penetrateItemOptionsMap.value['background_penetrate_stateGrid_BS'] ?? []
  }
  if (asset?.applicationMode === '2') {
    stateGridItemOptions.value =
      penetrateItemOptionsMap.value['background_penetrate_stateGrid_CS'] ?? []
  }
}

if (stateGrid) {
  const assetItem = findFormItem(formItems, 'assetId', 'select')
  if (assetItem) {
    assetItem.onChange = (value: string) => syncStateGridItemOptions(value)
  }
}

onMounted(() =>
  Promise.allSettled([
    loadAssetOptions(),
    ...(stateGrid ? [loadPenetrateItemDicts()] : [loadLoopholeOptions()])
  ])
)

const { scConfirm } = useScConfirm()

/** 生成测试日志 */
const handleGenerateLog = async () => {
  await scConfirm({
    message: '确定生成测试日志吗？',
    confirmText: '确定生成'
  })
  await generateSubjectLogAPI({ step, type: '1' })
  ScMessage.success('生成成功')
  await scResourcePageRef.value?.refresh()
}

const uploadConfig: UploadConfig = {
  uploadUrl: '/asset/penetrate/import',
  accept: ['.doc', '.docx']
}

const templateConfig: TemplateConfig = {
  templateUrl: '/asset/penetrate/template',
  requestMethod: 'POST',
  showTemplateDownload: true
}

const { open: importOpen } = useUploadDialog({
  uploadConfig,
  templateConfig,
  title: '渗透测试导入',
  extraParams: { step },
  onSuccess: () => scResourcePageRef.value?.refresh()
})

const pageConfig: PageConfig<PenetrationTestData> = {
  searchConfig: { searchbarItems },
  pageExtraParams: { step },
  operateConfig: {
    defaultButtons: ['add', 'import'],
    defaultButtonsConfig: {
      add: { permission: 'asset:penetrate:add' },
      import: { permission: 'asset:penetrate:import' }
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
    tableColumns: createPenetrationTestTableColumns(step),
    defaultButtonsConfig: {
      edit: { permission: 'asset:penetrate:edit' },
      delete: { permission: 'asset:penetrate:remove' }
    }
  },
  fetchData: getPenetrationTestDataAPI
}

const pageDialogConfig = computed<DialogFormConfig>(() => ({
  formItems,
  title: dialogTitle.value,
  columns: 2
}))

const { handleDelete } = useDeleteAction<PenetrationTestData>(
  ids => deletePenetrationTestAPI({ ids }),
  {
    message: '确定删除该渗透测试吗？删除后不可恢复。',
    onSuccess: () => scResourcePageRef.value?.refresh()
  }
)

const dynamicFormItems = reactive<
  Array<DynamicFormListItem<PenetrationTestAddress>>
>([
  {
    label: '漏洞未知',
    type: 'input',
    prop: 'loopholeAddress',
    placeholder: '请输入漏洞地址'
  },
  {
    label: '状态',
    type: 'select',
    prop: 'status',
    dictField: 'background_code_status',
    placeholder: '请选择状态'
  }
])
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
    >
      <template #column-loopholeAddress="{ row }">
        <div
          v-for="(address, index) in (row as PenetrationTestData).addresses"
          :key="index"
          class="address-cell"
        >
          {{ address.loopholeAddress }}（{{ address.statusLabel }}）
        </div>
      </template>
    </ScResourcePage>
    <ScDialogForm
      v-model="visible"
      :form-data="formData"
      :config="pageDialogConfig"
      :confirm-loading="confirmLoading"
      @confirm="handleConfirm"
    >
      <template #custom-loopholeId="{ data }">
        <ScSelect
          v-model="data.loopholeId"
          :options="stateGrid ? stateGridItemOptions : loopholeSelectOptions"
          :clearable="!stateGrid"
          :placeholder="stateGrid ? '请选择测试项' : '请选择漏洞'"
          @change="handleLoopholeChange"
        />
      </template>
      <template #custom-addresses="{ data }">
        <DynamicFormList v-model="data.addresses" :items="dynamicFormItems" />
      </template>
      <template #custom-result="{ data }">
        <FileReferenceInput
          v-model="data.result"
          v-model:file-list="data.result_files"
          :rows="5"
          placeholder="请输入测试过程"
        />
      </template>
      <template #custom-regressionResult="{ data }">
        <FileReferenceInput
          v-model="data.regressionResult"
          v-model:file-list="data.regressionResult_files"
          :rows="5"
          placeholder="请输入测试过程"
        />
      </template>
    </ScDialogForm>
  </div>
</template>

<style scoped lang="scss">
.address-cell {
  line-height: 1.6;
}

.address-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;

  .address-row {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
  }
}
</style>
