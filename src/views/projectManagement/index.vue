<script setup lang="ts">
import type { ScResourcePageConfig } from '@/components/ScBaseComponents/ScResourcePage'
import type {
  ProjectManagementData,
  ProjectManagementFormData,
  TestTimeItem
} from '@/types/projectManagement'
import {
  createProjectManagementAPI,
  deleteProjectManagementAPI,
  getProjectManagementDetailAPI,
  getProjectManagementList,
  getSubjectRoleOptionsAPI,
  getUserOptionsAPI,
  updateProjectManagementAPI
} from '@/api/projectManagement-api.ts'
import { useDialogForm } from '@/hooks/useDialogForm.ts'
import { useDeleteAction } from '@/hooks/useDeleteAction.ts'
import { ElMessageBox } from 'element-plus'
import { Minus, Plus } from '@element-plus/icons-vue'
import {
  defaultFormData,
  formItems,
  loadReportTypeOptions,
  searchbarItems,
  tableColumns
} from './config'

const router = useRouter()
const scResourcePageRef = useTemplateRef<PageInstance>('scResourcePageRef')

const operateSubject = (row: ProjectManagementData) => {
  router.push({
    path: '/projectProcess',
    query: { projectId: String(row.id) }
  })
}

const tableConfig: ScResourcePageConfig<ProjectManagementData>['tableConfig'] =
  {
    tableColumns: reactive(tableColumns),
    defaultButtonsConfig: {
      edit: { permission: 'background:subject:edit' },
      delete: { permission: 'background:subject:remove' }
    },
    customActionButtons: [
      {
        name: '进入项目',
        type: 'primary',
        text: true,
        permission: 'background:subject:query',
        onClick: operateSubject
      }
    ]
  }

const { handleDelete } = useDeleteAction<ProjectManagementData>(
  ids => deleteProjectManagementAPI({ ids }),
  {
    message: '确定删除选中的项目吗？删除后不可恢复。',
    onSuccess: () => scResourcePageRef.value?.refresh()
  }
)

const userOptions = ref<Array<{ label: string; value: string }>>([])
const roleOptions = ref<Array<{ label: string; value: string }>>([])

const loadUserOptions = async () => {
  const { data } = await getUserOptionsAPI()
  return (data ?? []).map(item => ({
    label: item.nickName,
    value: item.userId
  }))
}

const loadRoleOptions = async () => {
  const { data } = await getSubjectRoleOptionsAPI()
  return (data ?? []).map(item => ({
    label: item.name,
    value: item.id
  }))
}

const loadOptions = async () => {
  const [userResult, roleResult] = await Promise.allSettled([
    loadUserOptions(),
    loadRoleOptions()
  ])
  if (userResult.status === 'fulfilled') {
    userOptions.value = userResult.value
  }
  if (roleResult.status === 'fulfilled') {
    roleOptions.value = roleResult.value
  }
}

onMounted(loadOptions)

const addTimeData = (list: TestTimeItem[], index: number) => {
  list.splice(index + 1, 0, { testStart: '', testEnd: '' })
}

const removeTimeData = (list: TestTimeItem[], index: number) => {
  list.splice(index, 1)
  if (!list.length) list.push({ testStart: '', testEnd: '' })
}

const TIP =
  '检测到依据文件类型/项目大类被修改，该操作会将当前项目数据重置，是否继续保存？'

const originalValue = ref<ProjectManagementFormData>()

const handleBeforeEditSave = (val: ProjectManagementFormData) => {
  return new Promise<boolean>(resolve => {
    const currentLargeType = val.largeType
    const originalLargeType = originalValue.value?.largeType
    const isLargeTypeChanged = currentLargeType !== originalLargeType

    const currentAccordance = JSON.stringify(val.accordanceFileType ?? [])
    const originalAccordance = JSON.stringify(
      originalValue.value?.accordanceFileType ?? []
    )
    const isAccordanceFileTypeChanged = currentAccordance !== originalAccordance

    if (isAccordanceFileTypeChanged || isLargeTypeChanged) {
      ElMessageBox.confirm(TIP, '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'error'
      })
        .then(() => {
          if (val.largeType !== '10' && val.accordanceFileType?.length) {
            val.accordanceFileType = []
          }
          resolve(true)
        })
        .catch(() => resolve(false))
    } else {
      resolve(true)
    }
  })
}

const { visible, formData, confirmLoading, dialogTitle, open, handleConfirm } =
  useDialogForm<ProjectManagementFormData>({
    defaultFormData,
    title: '项目',
    fetchDetail: id => getProjectManagementDetailAPI(id),
    onCreate: data => createProjectManagementAPI(data),
    onUpdate: async data => {
      // 变更确认仅在编辑状态执行（onUpdate 只会在编辑时被 hook 调用）
      const canSave = await handleBeforeEditSave(data)
      if (!canSave) {
        // 用户取消二次确认：抛错阻止 hook 关闭弹窗，loading 由 hook 的 finally 恢复
        throw new Error('cancel')
      }
      return updateProjectManagementAPI(data)
    },
    onSuccess: () => scResourcePageRef.value?.refresh(),
    beforeOpen: async data => {
      originalValue.value = JSON.parse(JSON.stringify(data))
      if (!data.testTimes || !data.testTimes.length) {
        data.testTimes = [{ testStart: '', testEnd: '' }]
      }
      if (!data.subjectRoleUsers || !data.subjectRoleUsers.length) {
        data.subjectRoleUsers = [{ subjectRoleId: '', userId: '' }]
      }
      await loadReportTypeOptions(data.largeType)
    }
  })

const pageDialogConfig = computed<DialogFormConfig>(() => ({
  formItems,
  title: dialogTitle.value,
  columns: 2,
  dialogWidth: '80%',
  labelWidth: '150px'
}))

const pageConfig: ScResourcePageConfig<ProjectManagementData> = {
  searchConfig: { searchbarItems: reactive(searchbarItems) },
  operateConfig: {
    defaultButtonsConfig: { add: { permission: 'background:subject:add' } }
  },
  tableConfig,
  fetchData: getProjectManagementList
}
</script>

<template>
  <div class="page-card">
    <ScResourcePage
      ref="scResourcePageRef"
      :page-config="pageConfig"
      @add="open()"
      @edit="open"
      @delete="handleDelete"
    />
    <ScDialogForm
      v-model="visible"
      :form-data="formData"
      :config="pageDialogConfig"
      :confirm-loading="confirmLoading"
      @confirm="handleConfirm"
    >
      <template #custom-subjectRoleUsers="{ data }">
        <div class="role-user-list">
          <div
            v-for="(item, index) in data.subjectRoleUsers"
            :key="index"
            class="flex-box"
          >
            <ScSelect
              v-model="item.userId"
              :options="userOptions"
              placeholder="请选择用户"
            />
            <ScSelect
              v-model="item.subjectRoleId"
              :options="roleOptions"
              placeholder="请选择角色"
            />
            <ScButton
              type="primary"
              circle
              size="small"
              :icon="Plus"
              @click="
                data.subjectRoleUsers.push({ subjectRoleId: '', userId: '' })
              "
            />
            <ScButton
              type="danger"
              circle
              size="small"
              :icon="Minus"
              :disabled="data.subjectRoleUsers.length <= 1"
              @click="data.subjectRoleUsers.splice(index, 1)"
            />
          </div>
        </div>
      </template>
      <template #custom-testTimes="{ data }">
        <div>
          <div
            v-for="(item, index) in data.testTimes"
            :key="index"
            class="test-times-row"
          >
            <ScDatePicker
              v-model="item.testStart"
              type="date"
              value-format="YYYY-MM-DD"
              placeholder="选择开始日期"
            />
            <ScDatePicker
              v-model="item.testEnd"
              type="date"
              value-format="YYYY-MM-DD"
              placeholder="选择结束日期"
            />
            <ScButton
              type="primary"
              circle
              size="small"
              :icon="Plus"
              @click="addTimeData(data.testTimes, Number(index))"
            />
            <ScButton
              type="danger"
              circle
              size="small"
              :icon="Minus"
              @click="removeTimeData(data.testTimes, Number(index))"
            />
          </div>
        </div>
      </template>
      <template #custom-reportCreator="{ data }">
        <ScSelect
          v-model="data.reportCreator"
          :options="userOptions"
          clearable
          filterable
          placeholder="请选择报告编制人"
        />
      </template>
      <template #custom-planCreator="{ data }">
        <ScSelect
          v-model="data.planCreator"
          :options="userOptions"
          clearable
          filterable
          placeholder="请选择方案编制人"
        />
      </template>
    </ScDialogForm>
  </div>
</template>

<style scoped lang="scss">
.role-user-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;

  .flex-box {
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;

    :deep(.el-select) {
      flex: 1;
    }
  }
}

.test-times-row {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  margin-bottom: 12px;

  :deep(.el-date-editor) {
    flex: 1;
  }
}
</style>
