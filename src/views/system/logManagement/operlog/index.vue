<script setup lang="ts">
import type {
  OperlogData,
  OperlogSearchParams
} from '@/types/system/logManagement/operlog'
import { getOperlogDataAPI } from '@/api/system/logManagement/operlog-api.ts'
import { defineFormItems } from '@/utils/form.ts'
import { getDictLabel } from '@/utils/dict.ts'
import { useVisible } from '@/hooks/useVisible.ts'

const searchbarItems = reactive<SearchbarItems<OperlogSearchParams>>([
  { label: '操作地址', prop: 'operIp', type: 'input' },
  { label: '系统模块', prop: 'title', type: 'input' },
  { label: '操作人员', prop: 'operName', type: 'input' },
  {
    label: '操作类型',
    prop: 'businessType',
    type: 'select',
    dictField: 'sys_oper_type'
  },
  {
    label: '操作状态',
    prop: 'status',
    type: 'select',
    dictField: 'sys_common_status'
  }
])

const tableColumns = reactive<TableColumns>([
  { label: '日志编号', prop: 'operId' },
  { label: '系统模块', prop: 'title' },
  { label: '操作类型', prop: 'businessType', slot: 'businessType' },
  { label: '操作人员', prop: 'operName' },
  { label: '操作地址', prop: 'operIp' },
  { label: '操作状态', prop: 'status', slot: 'status' },
  { label: '操作日期', prop: 'operTime' }
])

const { visible, setVisible } = useVisible()
const detailData = ref<OperlogData | null>(null)

const isFailure = (status: OperlogData['status']) => String(status) === '1'

const formatValue = (value: unknown) => {
  return value === undefined || value === null || value === ''
    ? '--'
    : String(value)
}

const handleView = (row: OperlogData) => {
  detailData.value = row
  setVisible(true)
}

const pageConfig: PageConfig<OperlogData> = {
  searchConfig: { searchbarItems },
  operateConfig: {
    defaultButtons: []
  },
  tableConfig: {
    tableColumns,
    showDefaultButtons: false,
    customActionButtons: [
      {
        name: '详情',
        type: 'primary',
        text: true,
        permission: 'monitor:operlog:query',
        onClick: handleView
      }
    ]
  },
  fetchData: getOperlogDataAPI
}

const detailFormItems = defineFormItems<OperlogData>([
  { label: '操作模块', prop: 'title', customSlot: 'title', colSpan: 2 },
  {
    label: '登录信息',
    prop: 'operName',
    customSlot: 'loginInfo',
    colSpan: 2
  },
  { label: '操作地点', prop: 'operLocation', customSlot: 'operLocation' },
  { label: '部门名称', prop: 'deptName', customSlot: 'deptName' },
  { label: '请求地址', prop: 'operUrl', customSlot: 'operUrl', colSpan: 2 },
  { label: 'HTTP 方法', prop: 'requestMethod', customSlot: 'requestMethod' },
  { label: '后端方法', prop: 'method', customSlot: 'method' },
  { label: '请求参数', prop: 'operParam', customSlot: 'operParam', colSpan: 2 },
  {
    label: '返回参数',
    prop: 'jsonResult',
    customSlot: 'jsonResult',
    colSpan: 2
  },
  { label: '操作时间', prop: 'operTime', customSlot: 'operTime' },
  { label: '操作状态', prop: 'status', customSlot: 'status' },
  {
    label: '异常信息',
    prop: 'errorMsg',
    customSlot: 'errorMsg',
    colSpan: 2,
    hide: data => !isFailure(data.status)
  }
])

const detailTextSlots = [
  { prop: 'operLocation', multiline: false, error: false },
  { prop: 'deptName', multiline: false, error: false },
  { prop: 'operUrl', multiline: true, error: false },
  { prop: 'requestMethod', multiline: false, error: false },
  { prop: 'method', multiline: true, error: false },
  { prop: 'operParam', multiline: true, error: false },
  { prop: 'jsonResult', multiline: true, error: false },
  { prop: 'operTime', multiline: false, error: false },
  { prop: 'errorMsg', multiline: true, error: true }
] as const
</script>

<template>
  <div class="page-card">
    <ScResourcePage :page-config="pageConfig">
      <template #column-businessType="{ row }">
        {{ getDictLabel('sys_oper_type', row.businessType) }}
      </template>
      <template #column-status="{ row }">
        <el-tag :type="isFailure(row.status) ? 'danger' : 'success'">
          {{ getDictLabel('sys_common_status', row.status) }}
        </el-tag>
      </template>
    </ScResourcePage>
    <ScDialog
      v-model="visible"
      title="操作日志详细"
      dialog-width="900px"
      auto-height
    >
      <el-scrollbar max-height="500px">
        <ScBaseForm
          :model-value="detailData ?? {}"
          :form-items="detailFormItems"
          :columns="2"
        >
          <template #custom-title="{ data }">
            {{ formatValue(data.title) }} /
            {{ getDictLabel('sys_oper_type', data.businessType) }}
          </template>
          <template #custom-loginInfo="{ data }">
            {{
              [data.operName, data.operIp, data.operLocation]
                .filter(Boolean)
                .join(' / ') || '--'
            }}
          </template>
          <template
            v-for="item in detailTextSlots"
            :key="item.prop"
            #[`custom-${item.prop}`]="{ data }"
          >
            <span
              :class="{
                'detail-text': item.multiline,
                'error-text': item.error
              }"
            >
              {{ formatValue(data[item.prop]) }}
            </span>
          </template>
          <template #custom-status="{ data }">
            {{ getDictLabel('sys_common_status', data.status) }}
          </template>
        </ScBaseForm>
      </el-scrollbar>
      <template #footer>
        <ScButton type="warning" @click="setVisible(false)">关闭</ScButton>
      </template>
    </ScDialog>
  </div>
</template>

<style scoped lang="scss">
.detail-text {
  white-space: pre-wrap;
  word-break: break-word;
}

.error-text {
  color: var(--el-color-danger);
}
</style>
