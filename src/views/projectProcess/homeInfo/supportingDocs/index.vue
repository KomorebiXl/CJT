<!--主页信息-支持性文件 -->
<script setup lang="ts">
import type {
  SupportingDocsData,
  SupportingDocsFormData,
  SupportingDocsSearchParams
} from '@/types/projectProcess/homeInfo/supportingDocs'
import {
  getSupportingDocsDetailAPI,
  getSupportingDocsListAPI,
  removeSupportingDocsAPI,
  updateSupportingDocsAPI
} from '@/api/projectProcess/homeInfo/supportingDocs.ts'
import LinkSupportingDocsIssues from './components/LinkSupportingDocsIssues.vue'
import SupportingDocsUpload from './components/SupportingDocsUpload.vue'
import { defineFormItems } from '@/utils/form.ts'
import { useDialogForm } from '@/hooks/useDialogForm.ts'
import { useDeleteAction } from '@/hooks/useDeleteAction.ts'

const searchbarItems = reactive<SearchbarItems<SupportingDocsSearchParams>>([
  { label: '文件名', prop: 'fileName', type: 'input' }
])

const tableColumns = reactive<TableColumns>([
  { label: '文件名', prop: 'fileName' },
  { label: '文件别名', prop: 'nickName' },
  { label: '文件大小', prop: 'fileSize', slot: 'size' },
  { label: '上传时间', prop: 'createTime' }
])

/* 公共层未提供文件大小格式化，页面内实现（与 ScBaseUpload 内部格式一致） */
const formatFileSize = (size: number): string => {
  const units = ['B', 'KB', 'MB', 'GB']
  let index = 0
  let fileSize = size
  while (fileSize >= 1024 && index < units.length - 1) {
    fileSize /= 1024
    index++
  }
  return `${fileSize.toFixed(2)} ${units[index]}`
}

const uploadVisible = ref(false)
const problemVisible = ref(false)
const dataId = ref('')

const scResourcePageRef = useTemplateRef<PageInstance>('scResourcePageRef')

const pageConfig: PageConfig<SupportingDocsData> = {
  searchConfig: { searchbarItems },
  operateConfig: {
    defaultButtons: ['add'],
    defaultButtonsConfig: {
      add: { permission: 'acceptance:result:knowledgeFile:add' }
    }
  },
  tableConfig: {
    tableColumns,
    defaultButtonsConfig: {
      delete: { order: 200, permission: 'acceptance:result:knowledgeFile:remove' }
    },
    customActionButtons: [
      {
        name: '关联问题',
        type: 'primary',
        text: true,
        permission: 'acceptance:result:knowledgeFile:supportingFileLink',
        onClick: row => {
          dataId.value = row.id
          problemVisible.value = true
        }
      }
    ]
  },
  fetchData: getSupportingDocsListAPI
}

const { handleDelete } = useDeleteAction<SupportingDocsData>(
  (_ids, rows) => removeSupportingDocsAPI(rows[0].id),
  {
    onSuccess: () => scResourcePageRef.value?.refresh()
  }
)

const dialogFormData = reactive<SupportingDocsFormData>({
  nickName: ''
})

const formItems = defineFormItems<SupportingDocsFormData>([
  { label: '文件别名', prop: 'nickName', type: 'input' }
])

const { visible: editVisible, formData, confirmLoading, open, handleConfirm, dialogTitle } =
  useDialogForm<SupportingDocsFormData>({
    defaultFormData: dialogFormData,
    title: '文件别名',
    fetchDetail: id => getSupportingDocsDetailAPI(id),
    onUpdate: data =>
      updateSupportingDocsAPI({ id: data.id, nickName: data.nickName }),
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
      @add="uploadVisible = true"
      @edit="open"
      @delete="handleDelete"
    >
      <template #column-size="{ row }">
        {{ formatFileSize(row.fileSize) }}
      </template>
    </ScResourcePage>
    <SupportingDocsUpload
      v-model:visible="uploadVisible"
      @update-data="scResourcePageRef?.refresh()"
    />
    <LinkSupportingDocsIssues
      v-model:visible="problemVisible"
      :data-id="dataId"
      @update-data="scResourcePageRef?.refresh()"
    />
    <ScDialogForm
      v-model="editVisible"
      :form-data="formData"
      :config="pageDialogConfig"
      :confirm-loading="confirmLoading"
      @confirm="handleConfirm"
    />
  </div>
</template>

<style scoped lang="scss"></style>
