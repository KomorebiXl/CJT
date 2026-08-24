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
import type { ScDialogFormInstance } from '@/components/ScDialogForm'
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
      // 包裹「主类目」根节点（menuId 0）供顶层菜单回显与选择；
      // 排除按钮节点：按钮不可作上级，且显著降低树选项构建开销
      parentMenuItem.componentProps.options = [
        {
          menuId: 0,
          menuName: '主类目',
          children: listToTree(
            data.filter(item => item.menuType !== 'F'),
            {
              idKey: 'menuId',
              parentIdKey: 'parentId',
              rootParentId: 0
            }
          )
        }
      ]
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
  title: dialogTitle.value,
  // 菜单树选项数据量大，保留弹窗内容避免每次打开重建树形下拉
  destroyOnClose: false
}))

const menuFormDialogRef =
  useTemplateRef<ScDialogFormInstance>('menuFormDialogRef')

/** 内容常驻后清除上次会话残留的校验状态；nextTick 等首次打开时表单挂载完成 */
const handleDialogOpen = () =>
  nextTick(() => menuFormDialogRef.value?.clearValidate())

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
      ref="menuFormDialogRef"
      v-model="visible"
      :form-data="formData"
      :config="pageDialogConfig"
      :confirm-loading="confirmLoading"
      @open="handleDialogOpen"
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
