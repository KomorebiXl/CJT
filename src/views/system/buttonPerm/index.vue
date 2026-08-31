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
import { ScMessage } from '@/utils/ElUtils'
import MenuTree from './components/MenuTree.vue'
import {
  searchbarItems,
  tableColumns,
  dialogFormData,
  formItems,
  ORPHAN_MENU_ID
} from './buttonPerm.config.ts'

const route = useRoute()

const fullMenuList = ref<Array<MenuData>>([])
const selectedMenu = ref<MenuData>()

const initialMenuId = computed<string | number | undefined>(() => {
  const value = route.query.menuId
  const resolved = Array.isArray(value) ? value[0] : value
  return resolved ?? undefined
})

const loadMenuList = async () => {
  const { data } = await getMenuDataAPI({
    menuName: '',
    status: '',
    pageNum: 1,
    pageSize: 100
  })
  fullMenuList.value = data
}

// 孤儿按钮：父级不是任何目录/菜单节点（顶层、挂在按钮下或父级已删），
// 两页树中均无自然入口，由左树「未挂载按钮」虚拟节点兜底展示与清理
const menuNodeIds = computed(() => {
  const ids = new Set<string | number>()
  fullMenuList.value.forEach(item => {
    if (item.menuType !== 'F') ids.add(item.menuId)
  })
  return ids
})

const orphanButtons = computed(() =>
  fullMenuList.value.filter(
    item => item.menuType === 'F' && !menuNodeIds.value.has(item.parentId)
  )
)

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
    showPagination: false
  },
  // 按钮权限挂在菜单树下，从缓存按选中菜单过滤，不发请求；
  // 搜索项初值是 null 而非 undefined，必须用 ?? 归一；
  // 选中「未挂载按钮」虚拟节点时列出孤儿按钮
  fetchData: async (params: { menuName?: string; perms?: string }) => {
    const menu = selectedMenu.value
    if (!menu) return { rows: [] }
    const menuName = params?.menuName ?? ''
    const perms = params?.perms ?? ''
    const source =
      menu.menuId === ORPHAN_MENU_ID
        ? orphanButtons.value
        : fullMenuList.value.filter(
            item => item.menuType === 'F' && item.parentId === menu.menuId
          )
    return {
      rows: source.filter(
        item => item.menuName.includes(menuName) && item.perms.includes(perms)
      )
    }
  }
}

const scResourcePageRef = useTemplateRef<PageInstance>('scResourcePageRef')

const refreshTable = async () => {
  await loadMenuList()
  await scResourcePageRef.value?.refresh()
}

const handleSelectMenu = (menu: MenuData) => {
  selectedMenu.value = menu
  scResourcePageRef.value?.refresh()
}

const handleAdd = () => {
  if (selectedMenu.value?.menuType !== 'C') {
    ScMessage.warning('请先在左侧选择一个菜单类型的节点')
    return
  }
  open(undefined, { parentId: selectedMenu.value.menuId })
}

const { handleDelete } = useDeleteAction<MenuData>(
  ids => deleteMenuAPI({ ids }),
  {
    getId: row => String(row.menuId),
    message: '确定删除该按钮权限吗？删除后不可恢复。',
    onSuccess: refreshTable
  }
)

const { visible, formData, confirmLoading, open, handleConfirm, dialogTitle } =
  useDialogForm<MenuFormData, 'menuId', string | number>({
    idKey: 'menuId',
    defaultFormData: dialogFormData,
    title: '按钮权限',
    fetchDetail: id => getMenuDetailAPI(id),
    transformRequest: data => ({
      ...data,
      subjectLargeType: data.subjectLargeType || null
    }),
    onCreate: data => createMenuAPI(data),
    onUpdate: data => updateMenuAPI(data),
    onSuccess: refreshTable
  })

const pageDialogConfig = computed<DialogFormConfig>(() => ({
  formItems,
  title: dialogTitle.value
}))

onMounted(loadMenuList)
</script>

<template>
  <div class="page-card h-viewport button-perm-page">
    <MenuTree
      class="menu-tree-wrapper"
      :menu-list="fullMenuList"
      :orphan-buttons="orphanButtons"
      :initial-selected-id="initialMenuId"
      @select="handleSelectMenu"
    />
    <div class="table-wrapper">
      <ScResourcePage
        ref="scResourcePageRef"
        :page-config="pageConfig"
        @add="handleAdd"
        @edit="row => open(row)"
        @delete="handleDelete"
      >
        <template #column-statusSlot="{ row }">
          <el-tag :type="row.status === '1' ? 'danger' : 'success'">
            {{ row.status === '1' ? '停用' : '正常' }}
          </el-tag>
        </template>
      </ScResourcePage>
    </div>
    <ScDialogForm
      v-model="visible"
      :form-data="formData"
      :config="pageDialogConfig"
      :confirm-loading="confirmLoading"
      @confirm="handleConfirm"
    />
  </div>
</template>

<style scoped lang="scss">
.button-perm-page {
  display: flex;
  flex-direction: row;
  align-items: stretch;
  gap: 16px;
  min-height: 0;
  overflow: hidden;
}

.menu-tree-wrapper {
  width: 260px;
  flex-shrink: 0;
}

.table-wrapper {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
  min-height: 0;
}
</style>
