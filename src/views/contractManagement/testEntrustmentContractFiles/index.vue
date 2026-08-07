<script setup lang="ts">
import type {
  TestEntrustmentContractFilesData,
  TestEntrustmentContractFilesSearchParams
} from '@/types/contractManagement/testEntrustmentContractFiles'
import type {
  ScResourcePageConfig,
  ScResourcePageInstance
} from '@/components/ScBaseComponents'
import {
  deleteTestEntrustmentContractFileAPI,
  generateTestEntrustmentContractFileAPI,
  getTestEntrustmentContractBlobAPI,
  getTestEntrustmentContractDataAPI
} from '@/api/contractManagement/testEntrustmentContractFiles-api.ts'
import { safeRequest } from '@/utils/safeRequest.ts'
import { useDeleteAction } from '@/hooks/useDeleteAction.ts'
import { downloadFile } from '@/utils/file.ts'

const searchbarItems = reactive<
  SearchbarItems<TestEntrustmentContractFilesSearchParams>
>([{ label: '文件名称', prop: 'fileName', type: 'input' }])

const tableColumns = reactive<TableColumns>([
  { label: '合同文件名称', prop: 'fileName' },
  { label: '生成日期', prop: 'createTime' },
  { label: '生成人', prop: 'createByName' }
])

const pageRef = useTemplateRef<ScResourcePageInstance>('pageRef')

const route = useRoute()

const handleGenerateTestEntrustmentContract = async () => {
  const id: string = String(route.params.contractId)
  await generateTestEntrustmentContractFileAPI({ id })
}

const handleDownloadTestEntrustContractFile = async (id: string) => {
  const [err, res] = await safeRequest(
    getTestEntrustmentContractBlobAPI({ id }),
    { message: '文件下载失败' }
  )
  if (err) return
  await downloadFile(res!)
}

const { handleDelete } = useDeleteAction<TestEntrustmentContractFilesData>(
  ids => deleteTestEntrustmentContractFileAPI({ ids }),
  {
    message: '确定删除该条测试委托合同文件数据吗？删除后不可恢复',
    onSuccess: () => pageRef.value?.refresh()
  }
)

const pageConfig: ScResourcePageConfig<TestEntrustmentContractFilesData> = {
  searchConfig: { searchbarItems },
  operateConfig: {
    defaultButtons: [],
    customButtons: [
      {
        name: '生成测试委托合同',
        type: 'primary',
        onClick: () => handleGenerateTestEntrustmentContract(),
        permission: 'business:testEntrustmentContract:generate'
      }
    ]
  },
  tableConfig: {
    tableColumns,
    showIndex: true,
    defaultButtonsConfig: {
      edit: { show: () => false },
      delete: { permission: 'business:contract:record:remove' }
    },
    customActionButtons: [
      {
        name: '下载',
        type: 'text',
        onClick: row => handleDownloadTestEntrustContractFile(row.id),
        permission: 'business:testEntrustmentContract:download'
      }
    ]
  },
  fetchData: getTestEntrustmentContractDataAPI,
  pageExtraParams: { contractId: route.params.contractId }
}
</script>

<template>
  <div class="page-card">
    <ScResourcePage
      ref="pageRef"
      :page-config="pageConfig"
      @delete="handleDelete"
    />
  </div>
</template>

<style scoped lang="scss"></style>
