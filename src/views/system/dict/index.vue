<script setup lang="ts">
import type {
  DictTypeData,
  DictTypeFormData,
  DictTypeSearchParams
} from '@/types/dict'
import {
  createDictTypeAPI,
  deleteDictTypeAPI,
  getDictTypeDataAPI,
  getDictTypeDetailAPI,
  refreshDictTypeCacheAPI,
  updateDictTypeAPI
} from '@/api/system/dict-api.ts'
import { defineFormItems } from '@/utils/form.ts'
import { useDialogForm } from '@/hooks/useDialogForm.ts'
import { useDeleteAction } from '@/hooks/useDeleteAction.ts'
import { useDictStore } from '@/store/modules/dict-store.ts'
import { safeRequest } from '@/utils/safeRequest.ts'
import { ElMessage } from 'element-plus'
import { RefreshRight } from '@element-plus/icons-vue'

const searchbarItems = reactive<SearchbarItems<DictTypeSearchParams>>([
  { label: '字典名称', prop: 'dictName', type: 'input' },
  { label: '字典类型编码', prop: 'dictType', type: 'input' },
  {
    label: '状态',
    prop: 'status',
    type: 'select',
    dictField: 'sys_normal_disable'
  }
])

const tableColumns = reactive<TableColumns>([
  { label: '字典编号', prop: 'dictId' },
  { label: '字典名称', prop: 'dictName' },
  { label: '字典类型编码', prop: 'dictType', slot: 'dictType' },
  { label: '状态', prop: 'status', slot: 'status' },
  { label: '备注', prop: 'remark' },
  { label: '创建时间', prop: 'createTime' }
])

const scResourcePageRef = useTemplateRef<PageInstance>('scResourcePageRef')

const handleRefreshDictCache = async () => {
  const [err] = await safeRequest(refreshDictTypeCacheAPI(), {
    message: '刷新失败，请稍后重试'
  })
  if (err) return

  useDictStore().clearDictCache()
  ElMessage.success('刷新成功')
  await scResourcePageRef.value?.refresh()
}

const pageConfig: PageConfig<DictTypeData> = {
  searchConfig: { searchbarItems },
  operateConfig: {
    defaultButtonsConfig: {
      add: { permission: 'system:dict:add' },
      export: { permission: 'system:dict:export' }
    },
    customButtons: [
      {
        id: 'refreshCache',
        name: '刷新缓存',
        type: 'success',
        icon: RefreshRight,
        order: 30,
        permission: 'system:dict:refreshCache',
        onClick: handleRefreshDictCache
      }
    ]
  },
  tableConfig: {
    tableColumns,
    showSelection: true,
    defaultButtonsConfig: {
      edit: { permission: 'system:dict:edit' },
      delete: { permission: 'system:dict:remove' }
    }
  },
  fetchData: getDictTypeDataAPI
}

const dialogFormData = reactive<DictTypeFormData>({
  dictName: '',
  dictType: '',
  status: '0',
  remark: ''
})

const formItems = defineFormItems<DictTypeFormData>([
  {
    label: '字典名称',
    prop: 'dictName',
    type: 'input',
    componentProps: { maxLength: 30, showWordLimit: true }
  },
  { label: '字典类型编码', prop: 'dictType', type: 'input' },
  {
    label: '状态',
    prop: 'status',
    type: 'radio',
    componentProps: { dictField: 'sys_normal_disable', border: true }
  },
  {
    label: '备注',
    prop: 'remark',
    type: 'input',
    componentProps: { type: 'textarea', rows: 4 },
    colSpan: 2
  }
])

const handlePageClick = (row: DictTypeData | undefined = undefined) => open(row)

const { handleDelete } = useDeleteAction<DictTypeData>(
  ids => deleteDictTypeAPI({ ids }),
  {
    getId: row => String(row.dictId),
    message: '确定删除该该条数据字典吗？删除后不可恢复。',
    onSuccess: () => scResourcePageRef.value?.refresh()
  }
)

const { visible, formData, confirmLoading, open, handleConfirm, dialogTitle } =
  useDialogForm<DictTypeFormData, 'dictId', string | number>({
    idKey: 'dictId',
    defaultFormData: dialogFormData,
    title: '字典类型',
    fetchDetail: id => getDictTypeDetailAPI(id),
    onCreate: data => createDictTypeAPI(data),
    onUpdate: data => updateDictTypeAPI(data),
    onSuccess: () => scResourcePageRef.value?.refresh()
  })

const pageDialogConfig = computed<DialogFormConfig>(() => ({
  formItems,
  title: dialogTitle.value
}))

const exportConfig: ExportConfig = {
  exportUrl: '/system/dict/type/export',
  fileName: '字典类型列表'
}

const router = useRouter()
const handleDictTypeClick = (dictId: string) =>
  router.push(`/system/dict-data/${dictId}`)
</script>

<template>
  <div class="page-card">
    <ScResourcePage
      ref="scResourcePageRef"
      :page-config="pageConfig"
      :export-config="exportConfig"
      @add="handlePageClick"
      @edit="handlePageClick"
      @delete="handleDelete"
    >
      <template #column-dictType="{ row }">
        <ScButton link type="primary" @click="handleDictTypeClick(row.dictId)">
          {{ row.dictType }}
        </ScButton>
      </template>
      <template #column-status="{ row }">
        <el-tag :type="row.status === '0' ? 'success' : 'danger'">
          {{ row.status === '0' ? '启用' : '禁用' }}
        </el-tag>
      </template>
    </ScResourcePage>
    <ScDialogForm
      v-model="visible"
      :form-data="formData"
      :config="pageDialogConfig"
      :confirm-loading="confirmLoading"
      @confirm="handleConfirm"
    />
  </div>
</template>
