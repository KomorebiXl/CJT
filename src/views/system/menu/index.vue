<script setup lang="ts">
import type {
  MenuSearchParams,
  MenuData,
  MenuFormData
} from '@/types/system/menu'
import {
  createMenuAPI,
  deleteMenuAPI,
  getMenuDataAPI,
  getMenuDetailAPI,
  updateMenuAPI
} from '@/api/system/menu-api.ts'
import { defineFormItems } from '@/utils/form.ts'
import { useDialogForm } from '@/hooks/useDialogForm.ts'
import { useDeleteAction } from '@/hooks/useDeleteAction.ts'
import { listToTree } from '@/utils/tree.ts'
import { findFormItem } from '@/utils/formItemUtils.ts'
import SvgIcon from '@/components/SvgIcon/index.vue'

const currentMenuType = ref('M')

const searchbarItems = reactive<SearchbarItems<MenuSearchParams>>([
  { label: '菜单名称', prop: 'menuName', type: 'input' },
  {
    label: '状态',
    prop: 'status',
    type: 'select',
    dictField: 'sys_normal_disable'
  }
])

const tableColumns = reactive<TableColumns>([
  { label: '菜单名称', prop: 'menuName' },
  { label: '图标', prop: 'icon', slot: 'icon' },
  { label: '菜单排序', prop: 'orderNum' },
  { label: '权限字符', prop: 'perms', showOverflowTooltip: true },
  { label: '组件路径', prop: 'component', showOverflowTooltip: true },
  { label: '创建时间', prop: 'createTime' }
])

const pageConfig: PageConfig<MenuData> = {
  searchConfig: { searchbarItems },
  operateConfig: {
    defaultButtonsConfig: { add: { permission: 'system:menu:add' } }
  },
  tableConfig: {
    tableColumns,
    defaultButtonsConfig: {
      edit: { permission: 'system:menu:edit' },
      delete: { permission: 'system:menu:remove' }
    },
    showPagination: false,
    customActionButtons: [
      {
        name: '新增菜单',
        type: 'text',
        permission: 'system:menu:add',
        onClick: row => handleAddMenu(row)
      }
    ]
  },
  fetchData: async params => {
    const { data } = await getMenuDataAPI(params)
    const treeData = listToTree(data, {
      idKey: 'menuId',
      parentIdKey: 'parentId',
      rootParentId: 0
    })
    const parentMenuItem = findFormItem(formItems, 'parentId', 'treeSelect')
    if (parentMenuItem?.componentProps) {
      parentMenuItem.componentProps.options = treeData
    }
    return {
      rows: treeData
    }
  },
  treeConfig: {
    rowKey: 'menuId',
    showExpandButton: true
  }
}

const dialogFormData = reactive<MenuFormData>({
  parentId: '',
  menuType: 'M',
  icon: '',
  subjectLargeType: '',
  subjectType: '',
  menuName: '',
  orderNum: '',
  isFrame: '',
  path: '',
  component: '',
  perms: '',
  query: '',
  isCache: '',
  visible: '',
  status: ''
})

const formItems = defineFormItems<MenuFormData>([
  {
    label: '上级菜单',
    prop: 'parentId',
    groupName: '基本信息',
    type: 'treeSelect',
    componentProps: {
      options: [],
      nodeKey: 'menuId',
      fieldNames: { label: 'menuName', children: 'children' }
    },
    colSpan: 2
  },
  {
    label: '菜单类型',
    prop: 'menuType',
    groupName: '基本信息',
    type: 'radio',
    componentProps: {
      radioOptions: [
        {
          label: '目录',
          value: 'M'
        },
        {
          label: '菜单',
          value: 'C'
        },
        {
          label: '按钮',
          value: 'F'
        }
      ],
      border: true
    }
  },
  {
    label: '菜单图标',
    prop: 'icon',
    groupName: '目录信息',
    customSlot: 'menuIconSlot',
    colSpan: 2,
    hide: formData => formData.menuType === 'F'
  },
  {
    label: '项目大类',
    prop: 'subjectLargeType',
    groupName: '基本信息',
    type: 'select',
    componentProps: {
      dictField: 'background_subject_type',
      filterable: true,
      clearable: true
    }
  },
  {
    label: '项目类型',
    prop: 'subjectType',
    groupName: '基本信息',
    type: 'select',
    componentProps: {
      dictField: 'background_subject_second_type',
      filterable: true,
      clearable: true,
      multiple: true
    }
  },
  {
    label: (formData: MenuFormData) =>
      `${formData.menuType !== 'F' ? '菜单' : '权限'}名称`,
    prop: 'menuName',
    groupName: '基本信息',
    type: 'input',
    rules: (formData: MenuFormData) => [
      {
        required: true,
        message: `请输入${formData.menuType !== 'F' ? '菜单' : '权限'}名称`,
        trigger: 'blur'
      }
    ]
  },
  {
    label: '菜单排序',
    prop: 'orderNum',
    groupName: '基本信息',
    type: 'input',
    componentProps: {
      type: 'number'
    },
    rules: [{ required: true, message: '菜单顺序不能为空', trigger: 'blur' }]
  },
  {
    label: '是否外链',
    prop: 'isFrame',
    groupName: '目录信息',
    type: 'radio',
    hide: formData => formData.menuType === 'F',
    componentProps: {
      border: true,
      radioOptions: [
        {
          label: '是',
          value: '0'
        },
        {
          label: '否',
          value: '1'
        }
      ]
    }
  },
  {
    label: '路由地址',
    prop: 'path',
    groupName: '目录信息',
    type: 'input',
    hide: formData => formData.menuType === 'F',
    rules: formData => [
      {
        required: formData.menuType !== 'F',
        message: '路由地址不能为空',
        trigger: 'blur'
      }
    ]
  },
  {
    label: '组件路径',
    prop: 'component',
    groupName: '菜单信息',
    type: 'input',
    colSpan: 2,
    hide: formData => !(formData.menuType === 'C')
  },
  {
    label: '权限字符',
    prop: 'perms',
    groupName: '按钮信息',
    type: 'input',
    hide: formData => formData.menuType === 'M'
  },
  {
    label: '路由参数',
    prop: 'query',
    groupName: '菜单信息',
    type: 'input',
    hide: formData => formData.menuType !== 'C'
  },
  {
    label: '是否缓存',
    prop: 'isCache',
    groupName: '菜单信息',
    type: 'radio',
    hide: formData => !(formData.menuType === 'C'),
    componentProps: {
      radioOptions: [
        {
          label: '缓存',
          value: '0'
        },
        {
          label: '不缓存',
          value: '1'
        }
      ]
    }
  },
  {
    label: '显示状态',
    prop: 'visible',
    groupName: '基本信息',
    type: 'radio',
    hide: formData => formData.menuType === 'F',
    componentProps: { dictField: 'sys_show_hide', border: true }
  },
  {
    label: '菜单状态',
    prop: 'status',
    groupName: '基本信息',
    type: 'radio',
    componentProps: {
      dictField: 'sys_normal_disable',
      border: true
    }
  }
])

const scResourcePageRef = useTemplateRef<PageInstance>('scResourcePageRef')

const handlePageClick = (row: MenuData | undefined = undefined) => open(row)

const { handleDelete } = useDeleteAction<MenuData>(
  ids => deleteMenuAPI({ ids }),
  {
    getId: row => String(row.menuId),
    message: '确定删除该菜单管理吗？删除后不可恢复。',
    onSuccess: () => scResourcePageRef.value?.refresh()
  }
)

const { visible, formData, confirmLoading, open, handleConfirm, dialogTitle } =
  useDialogForm<MenuFormData, 'menuId', string | number>({
    idKey: 'menuId',
    defaultFormData: dialogFormData,
    title: '菜单管理',
    fetchDetail: id => getMenuDetailAPI(id),
    onCreate: data => createMenuAPI(data),
    onUpdate: data => updateMenuAPI(data),
    onSuccess: () => scResourcePageRef.value?.refresh()
  })

watch(
  () => formData.menuType,
  value => {
    currentMenuType.value = value
  },
  { immediate: true }
)

const pageDialogConfig = computed<DialogFormConfig>(() => ({
  formItems,
  title: dialogTitle.value
}))

const handleAddMenu = (row: MenuData) => {
  open(undefined, { parentId: row.menuId })
}
</script>

<template>
  <div class="page-card">
    <ScResourcePage
      ref="scResourcePageRef"
      :page-config="pageConfig"
      @add="handlePageClick"
      @edit="handlePageClick"
      @delete="handleDelete"
    >
      <template #column-icon="{ row }">
        <SvgIcon v-if="row.icon" :name="row.icon" size="1.2em" />
      </template>
    </ScResourcePage>
    <ScDialogForm
      v-model="visible"
      :form-data="formData"
      :config="pageDialogConfig"
      :confirm-loading="confirmLoading"
      @success="scResourcePageRef?.refresh()"
      @confirm="handleConfirm"
    >
      <template #custom-menuIconSlot>
        <ScIconPicker v-model="formData.icon" />
      </template>
    </ScDialogForm>
  </div>
</template>
