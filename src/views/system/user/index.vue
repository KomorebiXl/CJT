<script setup lang="ts">
import type {
  UserSearchParams,
  UserData,
  UserDeptTreeSelectData,
  UserFormData
} from '@/types/system/user'
import {
  createUserAPI,
  deleteUserAPI,
  getDeepTreeData,
  getUserDataAPI,
  getUserDetailData,
  getUserDetailAPI,
  updateUserAPI,
  changeUserStatusAPI
} from '@/api/system/user-api.ts'
import { defineFormItems } from '@/utils/form.ts'
import { useDialogForm } from '@/hooks/useDialogForm.ts'
import { useDeleteAction } from '@/hooks/useDeleteAction.ts'
import { findFormItem } from '@/utils/formItemUtils.ts'
import { safeRequest } from '@/utils/safeRequest.ts'
import { ElNotification } from 'element-plus'
import { useUploadDialog } from '@/hooks/useUploadDialog.ts'
import { useResetPasswordDialog } from './useResetPasswordDialog.tsx'

const deptTreeOptions = reactive<Array<UserDeptTreeSelectData>>([])

const deptTreeSelectConfig = {
  options: deptTreeOptions,
  nodeKey: 'id',
  fieldNames: { label: 'label', children: 'children' }
}

const { ResetPasswordDialog, open: openResetPassword } =
  useResetPasswordDialog()

const searchbarItems = reactive<SearchbarItems<UserSearchParams>>([
  { label: '用户名称', prop: 'userName', type: 'input' },
  { label: '手机号码', prop: 'phonenumber', type: 'input' },
  {
    label: '部门',
    prop: 'deptId',
    type: 'treeSelect',
    ...deptTreeSelectConfig
  },
  {
    label: '用户状态',
    prop: 'status',
    type: 'select',
    dictField: 'sys_normal_disable'
  },
  { label: '创建时间', prop: 'dateRange', type: 'dateRange' }
])

const tableColumns = reactive<TableColumns>([
  { label: '用户名称', prop: 'userName' },
  { label: '用户昵称', prop: 'nickName' },
  { label: '部门', prop: 'dept', slot: 'deptSlot' },
  { label: '手机号码', prop: 'phonenumber' },
  { label: '状态', prop: 'status', slot: 'statusSlot' },
  { label: '创建时间', prop: 'createTime' }
])

const pageConfig: PageConfig<UserData> = {
  searchConfig: { searchbarItems },
  operateConfig: {
    defaultButtons: ['add', 'import'],
    defaultButtonsConfig: {
      add: { permission: 'system:user:add' }
    }
  },
  tableConfig: {
    tableColumns,
    defaultButtonsConfig: {
      edit: { permission: 'system:user:edit' },
      delete: { permission: 'system:user:remove' }
    },
    customActionButtons: [
      {
        name: '重置密码',
        type: 'text',
        onClick: openResetPassword
      }
    ]
  },
  fetchData: getUserDataAPI
}

const dialogFormData = reactive<UserFormData>({
  nickName: '',
  deptId: '',
  phonenumber: '',
  email: '',
  userName: '',
  sex: '',
  status: '0',
  postIds: [],
  roleIds: [],
  remark: ''
})

const formItems = defineFormItems<UserFormData>([
  {
    label: '用户昵称',
    prop: 'nickName',
    type: 'input',
    rules: [{ required: true, message: '请输入用户昵称', trigger: 'blur' }]
  },
  {
    label: '归属部门',
    prop: 'deptId',
    type: 'treeSelect',
    componentProps: deptTreeSelectConfig
  },
  {
    label: '手机号码',
    prop: 'phonenumber',
    type: 'input',
    rules: [
      {
        pattern: /^1[3-9]\d{9}$/,
        message: '请输入正确的手机号码',
        trigger: 'blur'
      }
    ]
  },
  {
    label: '邮箱',
    prop: 'email',
    type: 'input',
    rules: [{ type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }]
  },
  {
    label: '用户名称',
    prop: 'userName',
    type: 'input',
    rules: [
      { required: true, message: '请输入用户名称', trigger: 'blur' },
      {
        min: 2,
        max: 20,
        message: '用户名称长度需在2到20个字符之间',
        trigger: 'blur'
      }
    ]
  },
  {
    label: '性别',
    prop: 'sex',
    type: 'select',
    componentProps: { dictField: 'sys_user_sex' }
  },
  {
    label: '岗位',
    prop: 'postIds',
    type: 'select',
    componentProps: {
      options: [],
      multiple: true
    }
  },
  {
    label: '角色',
    prop: 'roleIds',
    type: 'select',
    componentProps: {
      options: [],
      multiple: true
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
    componentProps: { type: 'textarea' },
    colSpan: 2
  }
])

const scResourcePageRef = useTemplateRef<PageInstance>('scResourcePageRef')

const handlePageClick = (row: UserData | undefined = undefined) => open(row)

const loadFormOptions = async () => {
  const [{ data: deptTreeData }, { posts, roles }] = await Promise.all([
    getDeepTreeData(),
    getUserDetailData()
  ])
  const postItem = findFormItem(formItems, 'postIds', 'select')
  const roleItem = findFormItem(formItems, 'roleIds', 'select')

  deptTreeOptions.splice(0, deptTreeOptions.length, ...deptTreeData)
  if (postItem?.componentProps) {
    postItem.componentProps.options = posts.map(i => ({
      label: i.postName,
      value: i.postId
    }))
  }
  if (roleItem?.componentProps) {
    roleItem.componentProps.options = roles.map(i => ({
      label: i.roleName,
      value: i.roleId
    }))
  }
}

onMounted(() => loadFormOptions())

const { handleDelete } = useDeleteAction<UserData>(
  ids => deleteUserAPI({ ids }),
  {
    getId: row => String(row.userId),
    message: '确定删除该账号管理吗？删除后不可恢复。',
    onSuccess: () => scResourcePageRef.value?.refresh()
  }
)

const getUserDetailForForm = async (userId: number) => {
  const { data, postIds, roleIds } = await getUserDetailAPI(userId)
  return {
    data: {
      ...data,
      postIds,
      roleIds
    }
  }
}

const { visible, formData, confirmLoading, open, handleConfirm, dialogTitle } =
  useDialogForm<UserFormData, 'userId', number>({
    idKey: 'userId',
    defaultFormData: dialogFormData,
    title: '账号管理',
    fetchDetail: id => getUserDetailForForm(id),
    onCreate: data => createUserAPI(data),
    onUpdate: data => updateUserAPI(data),
    onSuccess: () => scResourcePageRef.value?.refresh()
  })

const pageDialogConfig = computed<DialogFormConfig>(() => ({
  formItems,
  title: dialogTitle.value
}))

const uploadConfig: UploadConfig = {
  uploadUrl: '/system/user/importData',
  accept: ['.xls', '.xlsx']
}

const templateConfig: TemplateConfig = {
  templateUrl: '/system/user/importTemplate',
  requestMethod: 'POST',
  showTemplateDownload: true
}

const exportConfig: ExportConfig = {
  exportUrl: '/system/user/export',
  fileName: '账号列表'
}

const { open: importOpen } = useUploadDialog({
  uploadConfig,
  templateConfig,
  title: '账号导入',
  onSuccess: () => scResourcePageRef.value?.refresh()
})

const handleChangeUserStatus = async (row: UserData) => {
  const { userId, status } = row
  const message = `${row.status === '0' ? '启用' : '停用'}成功`
  const [err, res] = await safeRequest(changeUserStatusAPI({ userId, status }))
  if (res)
    ElNotification({
      type: 'success',
      message
    })
  if (err) row.status = row.status === '0' ? '1' : '0'
  scResourcePageRef.value?.refresh()
}
</script>

<template>
  <div class="page-card">
    <ScResourcePage
      ref="scResourcePageRef"
      :page-config="pageConfig"
      :export-config="exportConfig"
      @add="handlePageClick"
      @edit="handlePageClick"
      @import="importOpen()"
      @delete="handleDelete"
    >
      <template #column-deptSlot="{ row }">
        <el-tag type="primary" v-if="row.dept">
          {{ row.dept.deptName }}
        </el-tag>
      </template>
      <template #column-statusSlot="{ row }">
        <ScSwitch
          v-model="row.status"
          active-value="0"
          inactive-value="1"
          active-text="启用"
          inactive-text="停用"
          @click="handleChangeUserStatus(row as UserData)"
        />
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
    <ResetPasswordDialog />
  </div>
</template>
