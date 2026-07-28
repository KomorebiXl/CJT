<script setup lang="ts">
import type {
  DictData,
  DictDataFormData,
  DictDataSearchParams,
  DictOption,
  DictTypeData
} from '@/types/dict'
import {
  createDictDataAPI,
  deleteDictDataAPI,
  getDictDetailData,
  getDictListData,
  getDictTypeDetailAPI,
  getDictTypeOptionsAPI,
  updateDictDataAPI
} from '@/api/system/dict-api.ts'
import { defineFormItems } from '@/utils/form.ts'
import { useDialogForm } from '@/hooks/useDialogForm.ts'
import { useDeleteAction } from '@/hooks/useDeleteAction.ts'
import { ElMessage } from 'element-plus'
import { CloseBold } from '@element-plus/icons-vue'

const dictTypeOptions = reactive<Array<DictOption>>([])
const currentDictType = ref('')
const isReady = ref(false)
const loadFailed = ref(false)
const route = useRoute()

const searchbarItems = reactive<SearchbarItems<DictDataSearchParams>>([
  {
    label: '字典类型名称',
    prop: 'dictType',
    type: 'select',
    options: dictTypeOptions,
    clearable: false
  },
  { label: '字典标签', prop: 'dictLabel', type: 'input' },
  {
    label: '状态',
    prop: 'status',
    type: 'select',
    dictField: 'sys_normal_disable'
  }
])

const tableColumns = reactive<TableColumns>([
  { label: '字典编码', prop: 'dictCode' },
  { label: '字典标签', prop: 'dictLabel' },
  { label: '字典键值', prop: 'dictValue' },
  { label: '字典排序', prop: 'dictSort' },
  { label: '状态', prop: 'status', slot: 'status' },
  { label: '备注', prop: 'remark' },
  { label: '创建时间', prop: 'createTime' }
])

const router = useRouter()
const handleClose = () => {
  router.push('/system/dict')
}

const pageConfig: PageConfig<DictData> = {
  searchConfig: {
    searchbarItems,
    searchExtraParams: { dictType: currentDictType.value }
  },
  operateConfig: {
    defaultButtonsConfig: {
      add: { permission: 'system:dict:add' },
      export: { permission: 'system:dict:export' }
    },
    customButtons: [
      {
        id: 'close',
        name: '关闭',
        type: 'info',
        icon: CloseBold,
        order: 30,
        onClick: () => handleClose()
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
  fetchData: getDictListData
}

const dialogFormData = reactive<DictDataFormData>({
  dictType: '',
  dictLabel: '',
  dictValue: '',
  cssClass: '',
  dictSort: 0,
  listClass: 'default',
  status: '0',
  remark: ''
})

const formItems = defineFormItems<DictDataFormData>([
  {
    label: '字典类型编码',
    prop: 'dictType',
    type: 'input',
    componentProps: { disabled: true, maxLength: 30 }
  },
  {
    label: '数据标签',
    prop: 'dictLabel',
    type: 'input',
    rules: [{ required: true, message: '数据标签不能为空', trigger: 'blur' }],
    componentProps: { maxLength: 255, showWordLimit: true }
  },
  {
    label: '数据键值',
    prop: 'dictValue',
    type: 'input',
    rules: [{ required: true, message: '数据键值不能为空', trigger: 'blur' }],
    componentProps: { maxLength: 30, showWordLimit: true }
  },
  {
    label: '样式属性',
    prop: 'cssClass',
    type: 'input',
    componentProps: { maxLength: 30, showWordLimit: true }
  },
  {
    label: '显示排序',
    prop: 'dictSort',
    type: 'input',
    rules: [
      { required: true, message: '数据顺序不能为空', trigger: 'blur' },
      {
        validator: (_rule, value, callback) => {
          if (!Number.isInteger(Number(value)) || Number(value) < 0) {
            callback(new Error('显示排序必须是大于等于0的整数'))
            return
          }
          callback()
        },
        trigger: 'blur'
      }
    ],
    componentProps: { type: 'number' }
  },
  {
    label: '回显样式',
    prop: 'listClass',
    type: 'select',
    componentProps: {
      options: [
        { label: '默认', value: 'default' },
        { label: '主要', value: 'primary' },
        { label: '成功', value: 'success' },
        { label: '信息', value: 'info' },
        { label: '警告', value: 'warning' },
        { label: '危险', value: 'danger' }
      ]
    }
  },
  {
    label: '状态',
    prop: 'status',
    type: 'radio',
    componentProps: { dictField: 'sys_normal_disable' }
  },
  {
    label: '备注',
    prop: 'remark',
    type: 'input',
    componentProps: { type: 'textarea', rows: 4 },
    colSpan: 2
  }
])

const scResourcePageRef = useTemplateRef<PageInstance>('scResourcePageRef')

const handlePageClick = (row: DictData | undefined = undefined) => {
  open(row, row ? undefined : { dictType: currentDictType.value })
}

const { handleDelete } = useDeleteAction<DictData>(
  ids => deleteDictDataAPI({ ids }),
  {
    getId: row => String(row.dictCode),
    message: '确定删除该字典数据吗？删除后不可恢复。',
    onSuccess: () => scResourcePageRef.value?.refresh()
  }
)

const { visible, formData, confirmLoading, open, handleConfirm, dialogTitle } =
  useDialogForm<DictDataFormData, 'dictCode', string | number>({
    idKey: 'dictCode',
    defaultFormData: dialogFormData,
    title: '字典数据',
    fetchDetail: id => getDictDetailData(id),
    onCreate: data => createDictDataAPI(data),
    onUpdate: data => updateDictDataAPI(data),
    onSuccess: () => scResourcePageRef.value?.refresh()
  })

const pageDialogConfig = computed<DialogFormConfig>(() => ({
  formItems,
  title: dialogTitle.value
}))

const exportConfig: ExportConfig = {
  exportUrl: '/system/dict/data/export',
  fileName: '字典数据列表'
}

const loadDictContext = async () => {
  const { dictId } = route.params
  if (!dictId || Array.isArray(dictId)) {
    loadFailed.value = true
    ElMessage.error('缺少字典类型参数')
    return
  }

  try {
    const [{ data: dictType }, { data: dictTypes }] = await Promise.all([
      getDictTypeDetailAPI(dictId),
      getDictTypeOptionsAPI()
    ])
    currentDictType.value = dictType.dictType
    dictTypeOptions.splice(
      0,
      dictTypeOptions.length,
      ...dictTypes.map((item: DictTypeData) => ({
        label: item.dictName,
        value: item.dictType
      }))
    )
    pageConfig.searchConfig.searchExtraParams = {
      dictType: currentDictType.value
    }
    isReady.value = true
  } catch {
    loadFailed.value = true
    ElMessage.error('字典类型加载失败，请稍后重试')
  }
}

onMounted(loadDictContext)
</script>

<template>
  <div class="page-card">
    <template v-if="isReady">
      <ScResourcePage
        ref="scResourcePageRef"
        :page-config="pageConfig"
        :export-config="exportConfig"
        @add="handlePageClick"
        @edit="handlePageClick"
        @delete="handleDelete"
      >
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
    </template>
    <el-empty
      v-else
      :description="loadFailed ? '字典类型加载失败' : '正在加载字典类型...'"
    />
  </div>
</template>
