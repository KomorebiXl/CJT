<script setup lang="ts">
import type {
  ControlPointData,
  ControlPointFormData,
  ControlPointSearchParams
} from '@/types/adminManagement/controlPoint'
import {
  createControlPointAPI,
  deleteControlPointAPI,
  getControlPointAPI,
  getControlPointDetailAPI,
  updateControlPointAPI
} from '@/api/adminManagement/controlPoint-api.ts'
import { defineFormItems } from '@/utils/form.ts'
import { useDialogForm } from '@/hooks/useDialogForm.ts'
import { findFormItem } from '@/utils/formItemUtils.ts'
import { useDeleteAction } from '@/hooks/useDeleteAction.ts'
import { useUploadDialog } from '@/hooks/useUploadDialog.ts'
import { getGuideOptionsAPI } from '@/api/adminManagement/guideline-api.ts'

const searchbarItems = reactive<SearchbarItems<ControlPointSearchParams>>([
  { label: '指导书名称', prop: 'guideName', type: 'input' },
  {
    label: '安全层面',
    prop: 'category',
    type: 'select',
    componentProps: { dictField: 'background_security_aspect' }
  },
  {
    label: '属性标识',
    prop: 'attribute',
    type: 'select',
    componentProps: { dictField: 'background_attribute' }
  },
  { label: '测评点', prop: 'point', type: 'input' }
])

const tableColumns = reactive<TableColumns>([
  {
    label: '指导书名称',
    prop: 'guideName'
  },
  {
    label: '安全层名',
    prop: 'categoryLabel'
  },
  {
    label: '控制点',
    prop: 'point',
    slot: 'point'
  },
  {
    label: '属性标识',
    prop: 'attribute'
  }
])

const pageConfig: PageConfig<ControlPointData> = {
  searchConfig: { searchbarItems },
  operateConfig: {
    defaultButtonsConfig: { add: { permission: 'background:guide:add' } },
    defaultButtons: ['add', 'import']
  },
  tableConfig: {
    defaultButtonsConfig: {
      edit: { permission: 'background:guide:edit' },
      delete: { permission: 'background:guide:remove' }
    },
    tableColumns
  },
  fetchData: getControlPointAPI
}

const router = useRouter()
const handleCustomSlotClick = (id: string) => {
  router.push({
    name: 'ControlPointItem',
    params: { id }
  })
}

const scResourcePageRef = useTemplateRef<PageInstance>('scResourcePageRef')

const dialogFormData = reactive<ControlPointFormData>({
  guideId: '',
  category: '',
  point: '',
  attribute: ''
})

const formItems = defineFormItems<ControlPointFormData>([
  {
    label: '指导书',
    prop: 'guideId',
    type: 'select',
    componentProps: {
      options: []
    },
    rules: [{ required: true, message: '未选择指导书', trigger: 'blur' }]
  },
  {
    label: '安全层面',
    prop: 'category',
    type: 'select',
    componentProps: { dictField: 'background_security_aspect' },
    rules: [{ required: true, message: '未选择安全层面', trigger: 'blur' }]
  },
  {
    label: '属性标识',
    prop: 'attribute',
    type: 'select',
    componentProps: { dictField: 'background_attribute' },
    rules: [{ required: true, message: '未选择属性标识', trigger: 'blur' }]
  },
  {
    label: '控制点',
    prop: 'point',
    type: 'input',
    componentProps: {
      type: 'textarea',
      rows: 5
    },
    rules: [{ required: true, message: '未填写控制点', trigger: 'blur' }]
  }
])

const { visible, formData, confirmLoading, open, handleConfirm, dialogTitle } =
  useDialogForm<ControlPointFormData>({
    defaultFormData: dialogFormData,
    title: '控制点',
    fetchDetail: id => getControlPointDetailAPI(id),
    onCreate: data => createControlPointAPI(data),
    onUpdate: data => updateControlPointAPI(data),
    onSuccess: () => scResourcePageRef.value?.refresh()
  })

const pageDialogConfig = computed<DialogFormConfig>(() => ({
  formItems,
  title: dialogTitle.value,
  columns: 1
}))

const handlePageClick = (row: ControlPointData | undefined = undefined) =>
  open(row)

const { handleDelete } = useDeleteAction<ControlPointData>(
  ids => deleteControlPointAPI({ ids }),
  {
    message: '确定删除该控制点吗？删除后不可恢复',
    onSuccess: () => scResourcePageRef.value?.refresh()
  }
)

const getControlPointOptions = async () => {
  const { data } = await getGuideOptionsAPI()
  const options = data.map(i => ({
    label: i.guideName,
    value: i.id
  }))
  const guideItem = findFormItem(formItems, 'guideId', 'select')
  if (guideItem)
    guideItem.componentProps = {
      ...guideItem.componentProps,
      options
    }
}

onMounted(() => {
  getControlPointOptions()
})

const uploadConfig: UploadConfig = {
  uploadUrl: '/background/pointItem/import',
  accept: ['.xls', '.xlsx']
}

const templateConfig: TemplateConfig = {
  templateUrl: '/background/pointItem/template',
  requestMethod: 'POST',
  showTemplateDownload: true
}

const { open: importOpen } = useUploadDialog({
  uploadConfig,
  templateConfig,
  title: '控制点检查项导入',
  onSuccess: () => scResourcePageRef?.value?.refresh()
})
</script>

<template>
  <div class="page-card">
    <ScResourcePage
      ref="scResourcePageRef"
      :page-config="pageConfig"
      @add="handlePageClick"
      @edit="handlePageClick"
      @delete="handleDelete"
      @import="importOpen()"
    >
      <template #column-point="{ row }">
        <ScButton type="text" @click="handleCustomSlotClick(row.id)">
          {{ row.point }}
        </ScButton>
      </template>
    </ScResourcePage>
    <ScDialogForm
      v-model="visible"
      :form-data="formData"
      :config="pageDialogConfig"
      :confirm-loading="confirmLoading"
      @success="scResourcePageRef?.refresh()"
      @confirm="handleConfirm"
    />
  </div>
</template>

<style scoped lang="scss"></style>
