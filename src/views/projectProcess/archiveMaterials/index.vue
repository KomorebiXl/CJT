<script setup lang="ts">
import type {
  ArchiveMaterialsData,
  ArchiveMaterialsSearchParams
} from '@/types/projectProcess/archiveMaterials'
import {
  deleteArchiveMaterialsAPI,
  generateSubjectArchiveAPI,
  getArchiveMaterialsBlobAPI,
  getArchiveMaterialsDataAPI
} from '@/api/projectProcess/archiveMaterials-api.ts'
import { ScMessage } from '@/utils/ElUtils'
import { useScConfirm } from '@/hooks/useScConfirmDialog.ts'
import { safeRequest } from '@/utils/safeRequest.ts'
import { downloadFile } from '@/utils/file.ts'
import { useDeleteAction } from '@/hooks/useDeleteAction.ts'
import { getProjectIdFromRoute } from '@/store/modules/router-store'

const route = useRoute()

const searchbarItems = reactive<SearchbarItems<ArchiveMaterialsSearchParams>>([
  { label: '归档资料名称', prop: 'name', type: 'input' }
])

const tableColumns = reactive<TableColumns>([
  { label: '归档资料名称', prop: 'name' },
  { label: '生成日期', prop: 'createTime' },
  { label: '生成人', prop: 'createByName', width: 150 }
])

const scResourcePageRef = useTemplateRef<PageInstance>('scResourcePageRef')

const { scConfirm } = useScConfirm()

/** 生成归档资料：服务端返回更高 confirmStep 时，确认后带新步骤继续，取消则终止 */
const handleGenerateArchive = async (confirmStep: number) => {
  const closeLoading = ScMessage.loading('正在生成归档资料，请稍候...')
  const [err, res] = await safeRequest(
    generateSubjectArchiveAPI({
      confirmStep,
      id: getProjectIdFromRoute(route)
    }),
    { showError: false }
  )
  closeLoading()
  if (err || !res) return
  if (res.confirmStep && res.confirmStep > confirmStep) {
    try {
      await scConfirm({ message: res.msg })
    } catch {
      return
    }
    await handleGenerateArchive(res.confirmStep)
    return
  }
  ScMessage.success('归档资料生成成功')
  await scResourcePageRef.value?.refresh()
}

/** 下载归档资料，文件名取行数据 name */
const handleDownloadArchive = async (row: ArchiveMaterialsData) => {
  const [err, res] = await safeRequest(getArchiveMaterialsBlobAPI(row), {
    message: '文件下载失败'
  })
  if (err) return
  await downloadFile(res!, row.name)
}

const pageConfig: PageConfig<ArchiveMaterialsData> = {
  searchConfig: { searchbarItems },
  operateConfig: {
    defaultButtons: [],
    customButtons: [
      {
        name: '生成归档资料',
        type: 'primary',
        permission: 'subject:archive:add',
        onClick: () => handleGenerateArchive(1)
      }
    ]
  },
  tableConfig: {
    tableColumns,
    showPagination: false,
    defaultButtonsConfig: {
      edit: { show: () => false },
      delete: { permission: 'subject:archive:remove' }
    },
    customActionButtons: [
      {
        name: '下载',
        type: 'text',
        onClick: row => handleDownloadArchive(row),
        permission: 'subject:archive:download'
      }
    ]
  },
  fetchData: async params => {
    const { data } = await getArchiveMaterialsDataAPI({
      ...params,
      id: getProjectIdFromRoute(route)
    })
    return { rows: data ?? [] }
  }
}

const { handleDelete } = useDeleteAction<ArchiveMaterialsData>(
  (_ids, rows) => deleteArchiveMaterialsAPI(rows[0]),
  {
    message: '确定删除该归档资料吗？删除后不可恢复。',
    onSuccess: () => scResourcePageRef.value?.refresh()
  }
)
</script>

<template>
  <div class="page-card">
    <ScResourcePage
      ref="scResourcePageRef"
      :page-config="pageConfig"
      @delete="handleDelete"
    />
  </div>
</template>

<style scoped lang="scss"></style>
