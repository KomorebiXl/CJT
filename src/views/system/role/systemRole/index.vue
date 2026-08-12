<script setup lang="ts">
import type {
  SystemRoleSearchParams,
  SystemRoleData,
  SystemRoleFormData
} from '@/types/system/role/systemRole'
import {
  changeRoleStatus,
  createRoleAPI,
  deleteRoleAPI,
  getRoleDataAPI,
  getRoleDetailAPI,
  updateRoleAPI
} from '@/api/system/role/systemRole-api.ts'
import { defineFormItems } from '@/utils/form.ts'
import { useDialogForm } from '@/hooks/useDialogForm.ts'
import { useDeleteAction } from '@/hooks/useDeleteAction.ts'
import {
  getMenuTreeData,
  getMenuTreeDataByRoleId
} from '@/api/system/menu-api.ts'
import { findFormItem } from '@/utils/formItemUtils.ts'
import type { ScTreeOption } from '@/components/ScBaseFormItems'
import type { TreeMenuData } from '@/types/system/menu'
import type { ScDialogFormInstance } from '@/components/ScDialogForm'
import type { ScTreeInstance } from '@/components/ScBaseFormItems/ScTree'
import { safeRequest } from '@/utils/safeRequest.ts'
import { ElNotification } from 'element-plus'
import { useRolePermissionDialog } from './useRolePermissionDialog.tsx'

const searchbarItems = reactive<SearchbarItems<SystemRoleSearchParams>>([
  { label: '角色名称', prop: 'roleName', type: 'input' },
  { label: '权限字符', prop: 'roleKey', type: 'input' },
  {
    label: '角色状态',
    prop: 'status',
    type: 'select',
    dictField: 'sys_normal_disable'
  },
  {
    label: '创建时间',
    prop: 'dateRange',
    type: 'dateRange'
  }
])

const tableColumns = reactive<TableColumns>([
  {
    label: '角色编号',
    prop: 'roleId'
  },
  {
    label: '角色名称',
    prop: 'roleName'
  },
  {
    label: '权限字符',
    prop: 'roleKey'
  },

  {
    label: '显示顺序',
    prop: 'roleSort'
  },
  {
    label: '状态',
    prop: 'status',
    slot: 'roleStatus'
  },
  {
    label: '创建时间',
    prop: 'createTime'
  }
])

const pageConfig: PageConfig<SystemRoleData> = {
  searchConfig: { searchbarItems },
  operateConfig: {
    defaultButtonsConfig: { add: { permission: 'role:add' } }
  },
  tableConfig: {
    tableColumns,
    defaultButtonsConfig: {
      edit: { permission: 'role:edit' },
      delete: { permission: 'role:remove' }
    },
    showIndex: true,
    customActionButtons: [
      {
        name: '角色权限',
        type: 'text',
        onClick: row => openRolePermission(row)
      }
    ]
  },
  fetchData: getRoleDataAPI
}

const dialogFormData = reactive<SystemRoleFormData>({
  roleName: '',
  useSubjectRole: '',
  roleKey: '',
  roleSort: '',
  status: '',
  menuIds: [],
  remark: '',
  menuCheckStrictly: false
})

const { visible, formData, confirmLoading, open, handleConfirm, dialogTitle } =
  useDialogForm<SystemRoleFormData, 'roleId'>({
    idKey: 'roleId',
    defaultFormData: dialogFormData,
    title: '角色管理',
    fetchDetail: id => getRoleDetailAPI(id),
    onCreate: data => createRoleAPI(data),
    onUpdate: data => updateRoleAPI(data),
    onSuccess: () => scResourcePageRef.value?.refresh()
  })

const formItems = defineFormItems<SystemRoleFormData>([
  { label: '角色名称', prop: 'roleName', type: 'input' },
  {
    label: '是否使用项目角色',
    prop: 'useSubjectRole',
    type: 'switch',
    componentProps: {
      activeValue: 1,
      inactiveValue: 0
    }
  },
  { label: '权限字符', prop: 'roleKey', type: 'input' },
  {
    label: '表格排序',
    prop: 'roleSort',
    type: 'input',
    componentProps: { type: 'number' }
  },
  {
    label: '角色状态',
    prop: 'status',
    type: 'radio',
    componentProps: { dictField: 'sys_normal_disable' }
  },
  {
    label: '菜单权限',
    prop: 'menuIds',
    type: 'tree',
    colSpan: 2,
    componentProps: {
      options: [],
      nodeKey: 'id',
      checkStrictly: !formData.menuCheckStrictly
    }
  },
  {
    label: '备注',
    prop: 'remark',
    type: 'input',
    componentProps: { type: 'textarea' },
    colSpan: 2
  }
])

watch(
  () => formData.menuCheckStrictly,
  val => {
    const menuItem = findFormItem(formItems, 'menuIds', 'tree')
    if (menuItem?.componentProps) {
      menuItem.componentProps.checkStrictly = !val
    }
  }
)

const scResourcePageRef = useTemplateRef<PageInstance>('scResourcePageRef')

const handlePageClick = (row: SystemRoleData | undefined = undefined) => {
  if (row) getTreeMenuDataByRoleId(row.roleId)
  open(row)
}

const { handleDelete } = useDeleteAction<SystemRoleData>(
  ids => deleteRoleAPI({ ids }),
  {
    getId: row => String(row.roleId),
    message: '确定删除该角色吗？删除后不可恢复。',
    onSuccess: () => scResourcePageRef.value?.refresh()
  }
)

const pageDialogConfig = computed<DialogFormConfig>(() => ({
  formItems,
  title: dialogTitle.value,
  labelWidth: 'auto'
}))

const setMenuPermissionData = (
  data: Array<ScTreeOption> | Array<TreeMenuData>
) => {
  const menuPermissionItem = findFormItem(formItems, 'menuIds', 'tree')
  if (menuPermissionItem?.componentProps) {
    menuPermissionItem.componentProps.options = data
  }
}

const getTreeMenuData = async () => {
  const { data } = await getMenuTreeData()
  setMenuPermissionData(data)
}

const getTreeMenuDataByRoleId = async (roleId: number) => {
  const { menus, checkedKeys } = await getMenuTreeDataByRoleId(roleId)
  setMenuPermissionData(menus)
  formData.menuIds = checkedKeys
}

onMounted(() => getTreeMenuData())

const scDialogFormRef = useTemplateRef<ScDialogFormInstance>('scDialogFormRef')
const getTreeRef = (): ScTreeInstance | undefined => {
  const treeRef = scDialogFormRef.value?.getItemRef<ScTreeInstance>('menuIds')
  if (treeRef) return treeRef
}

const expandOrCollapse = ref<boolean>(false)
const handleExpand = () => {
  expandOrCollapse.value
    ? getTreeRef()?.expandAll()
    : getTreeRef()?.collapseAll()
}

const expandAllVal = ref<boolean>(false)
const handleExpandAll = () => {
  expandAllVal.value ? getTreeRef()?.checkAll() : getTreeRef()?.uncheckAll()
}

const handleChangeRoleStatus = async (row: SystemRoleData) => {
  const { roleId, status } = row
  const message = `${row.status === '0' ? '启用' : '停用'}成功`
  const [err, res] = await safeRequest(changeRoleStatus({ roleId, status }))
  if (res)
    ElNotification({
      type: 'success',
      message
    })
  if (err) row.status = row.status === '0' ? '1' : '0'
  scResourcePageRef.value?.refresh()
}

const { RolePermissionDialog, open: openRolePermission } =
  useRolePermissionDialog({
    onSuccess: () => scResourcePageRef.value?.refresh()
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
    >
      <template #column-roleStatus="{ row }">
        <el-tag type="success" v-if="row.roleId === 1">正常</el-tag>
        <ScSwitch
          v-else
          v-model="row.status"
          active-value="0"
          inactive-value="1"
          active-text="启用"
          inactive-text="停用"
          @click="handleChangeRoleStatus(row as SystemRoleData)"
        />
      </template>
    </ScResourcePage>
    <ScDialogForm
      ref="scDialogFormRef"
      v-model="visible"
      :form-data="formData"
      :config="pageDialogConfig"
      :confirm-loading="confirmLoading"
      @success="scResourcePageRef?.refresh()"
      @confirm="handleConfirm"
    >
      <template #before-menuIds>
        <div class="tree-toolbar">
          <el-checkbox @change="handleExpand" v-model="expandOrCollapse">
            展开/收缩
          </el-checkbox>
          <el-checkbox @change="handleExpandAll" v-model="expandAllVal">
            全选/全不选
          </el-checkbox>
          <el-checkbox v-model="formData.menuCheckStrictly">
            父子联动
          </el-checkbox>
        </div>
      </template>
    </ScDialogForm>
    <RolePermissionDialog />
  </div>
</template>

<style scoped lang="scss"></style>
