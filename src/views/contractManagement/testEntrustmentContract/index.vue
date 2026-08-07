<script setup lang="ts">
import type {
  TestEntrustmentContractData,
  TestEntrustmentContractFormData
} from '@/types/contractManagement/testEntrustmentContract'
import {
  createTestEntrustmentContractAPI,
  deleteTestEntrustmentContractAPI,
  getTestEntrustmentContractDataAPI,
  getTestEntrustmentContractDetailAPI,
  updateTestEntrustmentContractAPI
} from '@/api/contractManagement/testEntrustmentContract-api.ts'
import {
  getContractContactLibraryDetailAPI,
  getContractContactLibraryOptionsAPI
} from '@/api/contractManagement/contractContactLibrary-api.ts'
import { getContractingOrgLibraryOptionsAPI } from '@/api/contractManagement/contractingOrgLibrary-api.ts'
import { getIndustryStandardOptionsAPI } from '@/api/adminManagement/industryStandard-api.ts'
import { findFormItem } from '@/utils/formItemUtils.ts'
import { useDialogForm } from '@/hooks/useDialogForm.ts'
import { useDeleteAction } from '@/hooks/useDeleteAction.ts'
import { useUploadDialog } from '@/hooks/useUploadDialog.ts'
import { useDebounceFn } from '@vueuse/core'
import DynamicFormList from './components/DynamicFormList.vue'
import {
  searchbarItems,
  tableColumns,
  defaultFormData,
  formItems,
  exportConfig,
  uploadConfig,
  templateConfig
} from './config'
import type { ScBaseFormItem } from '@/components/ScBaseForm/types/formItem.ts'

const router = useRouter()
const scResourcePageRef = useTemplateRef<PageInstance>('scResourcePageRef')

const pageConfig: PageConfig<TestEntrustmentContractData> = {
  searchConfig: { searchbarItems: reactive(searchbarItems) },
  tableConfig: {
    tableColumns: reactive(tableColumns),
    defaultButtonsConfig: {},
    customActionButtons: [
      {
        name: '查看生成记录',
        type: 'primary',
        text: true,
        onClick: row =>
          router.push({
            name: 'TestEntrustmentContractFilesRecord',
            params: { contractId: row.id }
          })
      }
    ]
  },
  fetchData: getTestEntrustmentContractDataAPI
}

const loadOptions = async () => {
  const results = await Promise.allSettled([
    getIndustryStandardOptionsAPI(),
    getContractingOrgLibraryOptionsAPI(),
    getContractContactLibraryOptionsAPI()
  ])

  const configs: Array<{
    prop: string
    type: Exclude<ScBaseFormItem['type'], undefined>
    extract: (item: any) => { label: string; value: string }
    resultIndex: number
    dataKey: 'data' | 'rows'
  }> = [
    {
      prop: 'testBasis',
      type: 'select',
      resultIndex: 0,
      dataKey: 'data',
      extract: item => ({
        label: `${item.standardNo} ${item.standardName}`,
        value: item.id
      })
    },
    {
      prop: 'contractingUnit',
      type: 'select',
      resultIndex: 1,
      dataKey: 'rows',
      extract: item => ({ label: item.companyName, value: item.id })
    },
    {
      prop: 'trusteeLinkman',
      type: 'select',
      resultIndex: 2,
      dataKey: 'rows',
      extract: item => ({ label: item.name, value: item.id })
    }
  ]

  for (const cfg of configs) {
    const result = results[cfg.resultIndex]
    if (result.status !== 'fulfilled') continue
    const item = findFormItem(formItems, cfg.prop, cfg.type)
    if (!item) continue
    const sourceData = (result.value as any)[cfg.dataKey]
    item.componentProps = {
      ...item.componentProps,
      options: sourceData.map(cfg.extract)
    }
  }
}

const handleTrusteeLinkmanChange = async (id: string) => {
  if (!id) {
    formData.trusteePhone = ''
    return
  }
  const { data } = await getContractContactLibraryDetailAPI(id)
  formData.trusteePhone = data.phone
}

const normalizeFormData = <T extends TestEntrustmentContractFormData>(
  data: T
): Omit<T, 'testBasis'> & { testBasis: string } => ({
  ...data,
  testBasis: Array.isArray(data.testBasis)
    ? data.testBasis.join(',')
    : (data.testBasis as string)
})

const fetchDetail = async (id: string) => {
  const response = await getTestEntrustmentContractDetailAPI(id)
  const detail = response.data
  return {
    ...response,
    data: {
      ...detail,
      testBasis: detail.testBasis
        ? String(detail.testBasis).split(',').filter(Boolean)
        : [],
      businessContractProjectDetails:
        detail.businessContractProjectDetailVos ?? []
    }
  }
}

const { visible, formData, confirmLoading, open, handleConfirm, dialogTitle } =
  useDialogForm<TestEntrustmentContractFormData>({
    defaultFormData,
    title: '测试委托合同',
    fetchDetail,
    onCreate: data => createTestEntrustmentContractAPI(normalizeFormData(data)),
    onUpdate: data => updateTestEntrustmentContractAPI(normalizeFormData(data)),
    onSuccess: () => scResourcePageRef.value?.refresh()
  })

const { handleDelete } = useDeleteAction<TestEntrustmentContractData>(
  ids => deleteTestEntrustmentContractAPI({ ids }),
  {
    message: '确定删除该测试委托合同吗？删除后不可恢复。',
    onSuccess: () => scResourcePageRef.value?.refresh()
  }
)

const updateAmounts = useDebounceFn(() => {
  const contractAmount = Number(formData.contractAmount) || 0
  const firstRatio = Number(formData.firstRatio) || 0
  const firstAmount = Number(((contractAmount * firstRatio) / 100).toFixed(2))
  formData.firstAmount = firstAmount
  formData.finalRatio = Number((100 - firstRatio).toFixed(2))
  formData.finalAmount = String(
    Number((contractAmount - firstAmount).toFixed(2))
  )
}, 300)

watch(() => [formData.contractAmount, formData.firstRatio], updateAmounts)

// 受托方联系人选中后联动电话
watch(
  () => formData.trusteeLinkman,
  id => {
    handleTrusteeLinkmanChange(id)
  }
)

const pageDialogConfig = computed<DialogFormConfig>(() => ({
  formItems,
  title: dialogTitle.value,
  columns: 2,
  dialogWidth: '70%'
}))

const { open: importOpen } = useUploadDialog({
  uploadConfig,
  templateConfig,
  title: '测试委托合同导入',
  onSuccess: () => scResourcePageRef.value?.refresh()
})

onMounted(loadOptions)
</script>

<template>
  <div class="page-card">
    <ScResourcePage
      ref="scResourcePageRef"
      :page-config="pageConfig"
      :export-config="exportConfig"
      @add="open()"
      @edit="open"
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
      <template #custom-projectDetails="{ data }">
        <DynamicFormList v-model="data.businessContractProjectDetails" />
      </template>
    </ScDialogForm>
  </div>
</template>

<style scoped lang="scss"></style>
