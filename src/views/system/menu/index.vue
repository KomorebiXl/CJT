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
import { useScConfirm } from '@/hooks/useScConfirmDialog.ts'
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

// 过滤前的全量平铺列表：按钮权限节点不在树中展示，留作徽标计数与删除预检
const fullMenuList = ref<Array<MenuData>>([])

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
    fullMenuList.value = data
    // 按钮权限节点（menuType='F'）已拆至按钮权限管理页维护，树表与上级选项只保留目录/菜单
    const treeData = listToTree(
      data.filter(item => item.menuType !== 'F'),
      {
        idKey: 'menuId',
        parentIdKey: 'parentId',
        rootParentId: 0
      }
    )
    const parentMenuItem = findFormItem(formItems, 'parentId', 'treeSelect')
    if (parentMenuItem?.componentProps) {
      // 包裹「主类目」根节点（menuId 0）供顶层菜单回显与选择
      parentMenuItem.componentProps.options = [
        {
          menuId: 0,
          menuName: '主类目',
          children: treeData
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

const router = useRouter()
const { scConfirm } = useScConfirm()

/** 按钮权限管理页的路由，由菜单数据配置（挂在系统管理目录下，路由地址 buttonPerm） */
const BUTTON_PERM_ROUTE_PATH = '/system/buttonPerm'

// menuId → 直接子按钮列表：徽标渲染与删除预检共用，避免模板内重复全表过滤
const buttonChildrenMap = computed(() => {
  const map = new Map<string | number, Array<MenuData>>()
  fullMenuList.value.forEach(item => {
    if (item.menuType !== 'F') return
    const siblings = map.get(item.parentId)
    if (siblings) siblings.push(item)
    else map.set(item.parentId, [item])
  })
  return map
})

const getButtonChildren = (row: MenuData) =>
  buttonChildrenMap.value.get(row.menuId) ?? []

const goButtonPerm = (row: MenuData) =>
  router.push({
    path: BUTTON_PERM_ROUTE_PATH,
    query: { menuId: String(row.menuId) }
  })

// 删除预检：按钮子节点已不在树中展示，提前拦截并引导至按钮权限页，
// 避免直接撞后端「存在子菜单,不允许删除」报错
const handleDeleteMenu = async (row: MenuData) => {
  const buttons = getButtonChildren(row)
  if (!buttons.length) return handleDelete(row)
  const sample = buttons
    .slice(0, 2)
    .map(item => item.perms || item.menuName)
    .filter(Boolean)
    .join('、')
  try {
    await scConfirm({
      message: `该菜单下存在 ${buttons.length} 个未在树中显示的按钮权限${sample ? `（如 ${sample}）` : ''}，需先处理这些按钮才能删除菜单。是否前往按钮权限管理页面？`
    })
    goButtonPerm(row)
  } catch {}
}

const { visible, formData, confirmLoading, open, handleConfirm, dialogTitle } =
  useDialogForm<MenuFormData, 'menuId', string | number>({
    idKey: 'menuId',
    defaultFormData: dialogFormData,
    title: '菜单管理',
    fetchDetail: id => getMenuDetailAPI(id),
    transformRequest: data => ({
      ...data,
      subjectLargeType: data.subjectLargeType || null
    }),
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
      @delete="handleDeleteMenu"
    >
      <template #column-icon="{ row }">
        <SvgIcon v-if="row.icon" :name="row.icon" size="1.2em" />
      </template>
      <template #column-menuName="{ row }">
        <span class="menu-name-cell">
          {{ row.menuName }}
          <el-tag
            v-if="
              row.menuType === 'C' && getButtonChildren(row as MenuData).length
            "
            size="small"
            type="info"
            effect="plain"
            @click.stop="goButtonPerm(row as MenuData)"
          >
            {{ getButtonChildren(row as MenuData).length }} 个按钮
          </el-tag>
        </span>
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

<style scoped lang="scss">
.menu-name-cell {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
</style>
