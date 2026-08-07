<script setup lang="ts">
import type { ScResourcePageConfig } from '@/components/ScBaseComponents/ScResourcePage'
import { getProjectManagementList } from '@/api/projectManagement-api.ts'
import type {
  ProjectManagementData,
  ProjectManagementSearchParams
} from '@/types/projectManagement'

const router = useRouter()

const searchbarItems = reactive<SearchbarItems<ProjectManagementSearchParams>>([
  {
    prop: 'name',
    label: '项目名称',
    type: 'input'
  },
  {
    prop: 'largeType',
    label: '项目大类',
    type: 'select',
    dictField: 'background_subject_type'
  },
  {
    prop: 'type',
    label: '项目类型',
    type: 'select',
    dictField: 'background_subject_second_type'
  }
])

const tableColumn = ref<TableColumns>([
  {
    prop: 'code',
    label: '项目编号'
  },
  {
    prop: 'name',
    label: '项目名称'
  },
  {
    prop: 'assessAddress',
    label: '测试地址'
  },
  {
    prop: 'assessMethodLabel',
    label: '测试方式'
  },
  {
    prop: 'typeLabel',
    label: '项目类型'
  },
  {
    prop: 'reportCreatorName',
    label: '报告编制人'
  },
  {
    prop: 'reportTime',
    label: '报告编制时间'
  }
])

const tableConfig: ScResourcePageConfig<ProjectManagementData>['tableConfig'] =
  {
    tableColumns: tableColumn.value,
    defaultButtonsConfig: {
      edit: { permission: 'background:subject:edit' },
      delete: { permission: 'background:subject:remove' }
    },
    customActionButtons: [
      {
        name: '进入项目',
        type: 'text',
        permission: 'background:subject:query',
        onClick: (row: ProjectManagementData) => {
          router.push({
            path: '/projectProcess',
            query: { projectId: row.id }
          })
        }
      }
    ]
  }

const pageConfig: ScResourcePageConfig<ProjectManagementData> = {
  searchConfig: {
    searchbarItems: searchbarItems
  },
  operateConfig: {
    defaultButtonsConfig: {
      add: { permission: 'background:subject:add' }
    }
  },
  tableConfig: tableConfig,
  fetchData: getProjectManagementList
}
</script>

<template>
  <div class="page-card">
    <ScResourcePage :page-config="pageConfig" />
  </div>
</template>

<style scoped></style>
