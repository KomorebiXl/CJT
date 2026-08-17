<script setup lang="ts">
import type {
  PenetrationTestAddress,
  PenetrationTestData,
  PenetrationTestFormData,
  PenetrationTestSearchParams
} from '@/types/projectProcess/penetrationTest'
import type { VulnerabilityLibraryOption } from '@/types/adminManagement/vulnerabilityLibrary'
import {
  createPenetrationTestAPI,
  generateSubjectLogAPI,
  getPenetrationTestDataAPI,
  getPenetrationTestDetailAPI,
  updatePenetrationTestAPI
} from '@/api/projectProcess/penetrationTest-api.ts'
import { Delete, Document, Plus } from '@element-plus/icons-vue'
import { objectToFormData } from '@/utils/file.ts'
import { ScMessage } from '@/utils/ElUtils'
import { useScConfirm } from '@/hooks/useScConfirmDialog.ts'
import { defineFormItems } from '@/utils/form.ts'
import { useDialogForm } from '@/hooks/useDialogForm.ts'
import { findFormItem } from '@/utils/formItemUtils.ts'
import { useUploadDialog } from '@/hooks/useUploadDialog.ts'
import { getAssetSystemOptionsAPI } from '@/api/projectProcess/assetAssignment-api.ts'
import { getVulnerabilityLibraryOptionsAPI } from '@/api/adminManagement/vulnerabilityLibrary-api.ts'
import FileReferenceInput from '@/components/FileReferenceInput/index.vue'

let step: string = '1'

const DEFAULT_ADDRESSES: Omit<PenetrationTestAddress, 'statusLabel'> = {
  loopholeAddress: '',
  status: '',
  step: '1'
}

const searchbarItems = reactive<SearchbarItems<PenetrationTestSearchParams>>([
  {
    label: '漏洞名称',
    prop: 'loopholeName',
    type: 'input',
    placeholder: '请输入漏洞名称'
  },
  {
    label: '资产名称',
    prop: 'assetName',
    type: 'input',
    placeholder: '请输入资产名称'
  },
  {
    label: '漏洞等级',
    prop: 'level',
    type: 'select',
    dictField: 'background_loophole_level'
  }
])

const tableColumns = reactive<TableColumns>([
  { label: '资产名称', prop: 'assetName' },
  { label: '漏洞名称', prop: 'loopholeName' },
  { label: '检查项', prop: 'itemLabel' },
  { label: '漏洞等级', prop: 'levelLabel' },
  { label: '漏洞描述', prop: 'description', showOverflowTooltip: true },
  { label: '漏洞危害', prop: 'hazard', showOverflowTooltip: true },
  { label: '修复建议', prop: 'suggestion', showOverflowTooltip: true },
  { label: '测试过程', prop: 'result' },
  { label: '漏洞位置', prop: 'loopholeAddress', slot: 'loopholeAddress' }
])

const scResourcePageRef = useTemplateRef<PageInstance>('scResourcePageRef')

const dialogFormData = reactive<PenetrationTestFormData>({
  assetId: '',
  loopholeId: '',
  item: '',
  level: '',
  loopholeName: '',
  description: '',
  hazard: '',
  suggestion: '',
  addresses: [DEFAULT_ADDRESSES],
  result: '',
  result_files: [],
  step
})

const formItems = defineFormItems<PenetrationTestFormData>([
  {
    label: '资产名称',
    prop: 'assetId',
    type: 'select',
    rules: [{ required: true, message: '请选择资产名称', trigger: 'blur' }],
    componentProps: {
      options: []
    }
  },
  {
    label: '关联测试项',
    prop: 'loopholeId',
    customSlot: 'loopholeId'
  },
  {
    label: '检查项',
    prop: 'item',
    type: 'input',
    componentProps: {
      disabled: true,
      placeholder: '选择漏洞后自动回填'
    }
  },
  {
    label: '漏洞等级',
    prop: 'level',
    type: 'select',
    rules: [{ required: true, message: '请选择漏洞等级', trigger: 'blur' }],
    componentProps: {
      dictField: 'background_loophole_level'
    }
  },
  {
    label: '漏洞名称',
    prop: 'loopholeName',
    type: 'input',
    rules: [{ required: true, message: '请输入漏洞名称', trigger: 'blur' }]
  },
  {
    label: '漏洞描述',
    prop: 'description',
    type: 'input',
    componentProps: {
      type: 'textarea',
      rows: 3
    },
    colSpan: 2,
    rules: [{ required: true, message: '请输入漏洞描述', trigger: 'blur' }]
  },
  {
    label: '漏洞危害',
    prop: 'hazard',
    type: 'input',
    componentProps: {
      type: 'textarea',
      rows: 3
    },
    colSpan: 2,
    rules: [{ required: true, message: '请输入漏洞危害', trigger: 'blur' }]
  },
  {
    label: '修复建议',
    prop: 'suggestion',
    type: 'input',
    componentProps: {
      type: 'textarea',
      rows: 3
    },
    colSpan: 2,
    rules: [{ required: true, message: '请输入修复建议', trigger: 'blur' }]
  },
  {
    label: '漏洞地址',
    prop: 'addresses',
    customSlot: 'addresses',
    colSpan: 2,
    rules: [{ required: true, message: '请添加漏洞地址', trigger: 'blur' }]
  },
  {
    label: '测试过程',
    prop: 'result',
    customSlot: 'result',
    colSpan: 2,
    rules: [{ required: true, message: '请输入测试过程', trigger: 'blur' }]
  }
])

const handlePageClick = (row: PenetrationTestData | undefined = undefined) =>
  open(row)

const { visible, formData, confirmLoading, open, handleConfirm, dialogTitle } =
  useDialogForm<PenetrationTestFormData, 'id', string, FormData>({
    defaultFormData: dialogFormData,
    title: '渗透测试',
    transformRequest: data => objectToFormData(data),
    beforeOpen: async data => {
      if (!data.addresses || !data.addresses.length) {
        data.addresses = [DEFAULT_ADDRESSES]
      }
    },
    fetchDetail: id => getPenetrationTestDetailAPI(id),
    onCreate: data => createPenetrationTestAPI(data),
    onUpdate: data => updatePenetrationTestAPI(data),
    onSuccess: () => scResourcePageRef.value?.refresh()
  })

/** 加载资产系统选项 */
const loadAssetOptions = async () => {
  const { data } = await getAssetSystemOptionsAPI()
  const assetItem = findFormItem(formItems, 'assetId', 'select')
  if (assetItem?.componentProps) {
    assetItem.componentProps.options = (data ?? []).map(item => ({
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

/** 选择漏洞后回填字段 */
const handleLoopholeChange = (value: string) => {
  const target = loopholeOptions.value.find(item => item.id === value)
  if (!target) return
  formData.item = target.itemLabel ?? ''
  formData.level = target.level ?? ''
  formData.loopholeName = target.name ?? ''
  formData.description = target.description ?? ''
  formData.hazard = target.risk ?? ''
  formData.suggestion = target.suggestion ?? ''
}

/** 添加漏洞地址行 */
const handleAddAddress = () => {
  formData.addresses.push(DEFAULT_ADDRESSES)
}

/** 删除漏洞地址行 */
const handleRemoveAddress = (index: number) => {
  formData.addresses.splice(index, 1)
}

onMounted(() => Promise.allSettled([loadAssetOptions(), loadLoopholeOptions()]))

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
    tableColumns,
    defaultButtonsConfig: {
      edit: { permission: 'asset:penetrate:edit' },
      delete: { show: () => false }
    }
  },
  fetchData: getPenetrationTestDataAPI
}

const pageDialogConfig = computed<DialogFormConfig>(() => ({
  formItems,
  title: dialogTitle.value,
  columns: 2
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
          :options="loopholeSelectOptions"
          placeholder="请选择漏洞"
          @change="handleLoopholeChange"
        />
      </template>
      <template #custom-addresses="{ data }">
        <div class="address-list">
          <div
            v-for="(address, index) in data.addresses"
            :key="index"
            class="address-row"
          >
            <ScInput
              v-model="address.loopholeAddress"
              placeholder="请输入漏洞地址"
            />
            <ScSelect
              v-model="address.status"
              dict-field="background_code_status"
              placeholder="请选择地址状态"
            />
            <ScButton
              type="danger"
              text
              :icon="Delete"
              @click="handleRemoveAddress(Number(index))"
            />
          </div>
          <ScButton type="primary" :icon="Plus" @click="handleAddAddress">
            添加地址
          </ScButton>
        </div>
      </template>
      <template #custom-result="{ data }">
        <FileReferenceInput
          v-model="data.result"
          v-model:file-list="data.result_files"
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
