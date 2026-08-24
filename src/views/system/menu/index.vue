<script setup lang="ts">
import type { MenuData, MenuFormData } from '@/types/system/menu'
import {
  createMenuAPI,
  deleteMenuAPI,
  getMenuDataAPI,
  getMenuDetailAPI,
  updateMenuAPI
} from '@/api/system/menu-api.ts'
import { useDialogForm } from '@/hooks/useDialogForm.ts'
import { useDeleteAction } from '@/hooks/useDeleteAction.ts'
import { listToTree } from '@/utils/tree.ts'
import { findFormItem } from '@/utils/formItemUtils.ts'
import SvgIcon from '@/components/SvgIcon/index.vue'
import MenuCopyDialog from './components/MenuCopyDialog.vue'
import {
  searchbarItems,
  tableColumns,
  dialogFormData,
  formItems
} from './menu.config.ts'

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
      },
      {
        name: '复制',
        type: 'text',
        permission: 'system:menu:add',
        onClick: row => menuCopyDialogRef.value?.open(row)
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

const scResourcePageRef = useTemplateRef<PageInstance>('scResourcePageRef')
const menuCopyDialogRef =
  useTemplateRef<InstanceType<typeof MenuCopyDialog>>('menuCopyDialogRef')

const handlePageClick = (row: MenuData | undefined = undefined) => open(row)

const { handleDelete } = useDeleteAction<MenuData>(
  ids => deleteMenuAPI({ ids }),
  {
    getId: row => String(row.menuId),
    message: '确定删除该菜单数据吗？删除后不可恢复。',
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
      @confirm="handleConfirm"
    >
      <template #custom-menuIconSlot>
        <ScIconPicker v-model="formData.icon" />
      </template>
    </ScDialogForm>
    <MenuCopyDialog
      ref="menuCopyDialogRef"
      @success="scResourcePageRef?.refresh()"
    />
  </div>
</template>
