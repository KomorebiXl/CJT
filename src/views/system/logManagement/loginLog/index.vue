<script setup lang="ts">
import type {
  LoginLogData,
  LoginLogSearchParams
} from '@/types/system/logManagement/login-log'
import { getLoginLogDataAPI } from '@/api/system/logManagement/login-log-api.ts'
import { useDictStore } from '@/store/modules/dict-store.ts'

const searchbarItems = reactive<SearchbarItems<LoginLogSearchParams>>([
  { label: '登录地址', prop: 'ipaddr', type: 'input' },
  { label: '用户名称', prop: 'userName', type: 'input' },
  {
    label: '状态',
    prop: 'status',
    type: 'select',
    dictField: 'sys_common_status'
  }
])

const tableColumns = reactive<TableColumns>([
  { label: '日志编号', prop: 'infoId', minWidth: 100 },
  { label: '用户名称', prop: 'userName', minWidth: 120 },
  { label: '地址', prop: 'ipaddr', minWidth: 120 },
  { label: '登录地点', prop: 'loginLocation', minWidth: 120 },
  { label: '操作系统', prop: 'os', minWidth: 100 },
  { label: '浏览器', prop: 'browser', minWidth: 100 },
  {
    label: '登录状态',
    prop: 'status',
    slot: 'status',
    minWidth: 100
  },
  {
    label: '描述',
    prop: 'msg',
    minWidth: 160,
    showOverflowTooltip: true
  },
  { label: '访问时间', prop: 'loginTime', minWidth: 160 }
])

const dictStore = useDictStore()

const getDictLabel = (dictType: string, value: unknown) => {
  const option = dictStore.cache[dictType]?.find(
    item => String(item.value) === String(value)
  )
  return option?.label ?? (value === null || value === undefined ? '--' : String(value))
}

const isFailure = (status: LoginLogData['status']) => String(status) === '1'

const pageConfig: PageConfig<LoginLogData> = {
  searchConfig: { searchbarItems },
  operateConfig: { defaultButtons: [] },
  tableConfig: {
    tableColumns,
    showActionColumn: false,
    showDefaultButtons: false
  },
  fetchData: getLoginLogDataAPI
}
</script>

<template>
  <div class="page-card">
    <ScResourcePage :page-config="pageConfig">
      <template #column-status="{ row }">
        <el-tag :type="isFailure(row.status) ? 'danger' : 'success'">
          {{ getDictLabel('sys_common_status', row.status) }}
        </el-tag>
      </template>
    </ScResourcePage>
  </div>
</template>

<style scoped lang="scss"></style>
