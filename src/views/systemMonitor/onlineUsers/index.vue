<script setup lang="ts">
import type {
  OnlineUserData,
  OnlineUserSearchParams
} from '@/types/systemMonitor/onlineUsers'
import {
  forceLogoutOnlineUserAPI,
  getOnlineUserDataAPI
} from '@/api/systemMonitor/onlineUsers-api.ts'
import { ScMessage } from '@/utils/ElUtils'

const searchbarItems = reactive<SearchbarItems<OnlineUserSearchParams>>([
  { label: '登录地址', prop: 'ipaddr', type: 'input' },
  { label: '用户名称', prop: 'userName', type: 'input' }
])

const tableColumns = reactive<TableColumns>([
  {
    label: '会话编号',
    prop: 'tokenId',
    minWidth: 160,
    showOverflowTooltip: true
  },
  { label: '登录名称', prop: 'userName', minWidth: 120 },
  { label: '所属部门', prop: 'deptName', minWidth: 120 },
  { label: '登录地址', prop: 'ipaddr', minWidth: 130 },
  { label: '登录地点', prop: 'loginLocation', minWidth: 120 },
  { label: '操作系统', prop: 'os', minWidth: 120 },
  { label: '浏览器', prop: 'browser', minWidth: 120 },
  {
    label: '登录时间',
    prop: 'loginTime',
    slot: 'loginTime',
    minWidth: 180
  }
])

const scResourcePageRef = useTemplateRef<PageInstance>('scResourcePageRef')
const pendingOnlineUser = ref<OnlineUserData | null>(null)

const normalizeTimestamp = (value: string | number) => {
  if (typeof value === 'number') {
    return Math.abs(value) < 1_000_000_000_000 ? value * 1000 : value
  }

  if (/^\d{10}$/.test(value)) return Number(value) * 1000
  if (/^\d{13}$/.test(value)) return Number(value)
  return value
}

const formatLoginTime = (value: OnlineUserData['loginTime']) => {
  if (value === null || value === undefined || value === '') return '--'

  const rawValue = String(value).trim()
  const localDateTime = rawValue.match(
    /^(\d{4}-\d{2}-\d{2})[T\s](\d{2}:\d{2}:\d{2})$/
  )
  if (localDateTime) return `${localDateTime[1]} ${localDateTime[2]}`

  const date = new Date(
    normalizeTimestamp(typeof value === 'number' ? value : rawValue)
  )
  if (Number.isNaN(date.getTime())) return '--'

  const parts = new Intl.DateTimeFormat('zh-CN', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23'
  }).formatToParts(date)
  const partMap = Object.fromEntries(parts.map(item => [item.type, item.value]))
  return `${partMap.year}-${partMap.month}-${partMap.day} ${partMap.hour}:${partMap.minute}:${partMap.second}`
}

const handleForceLogout = (row: OnlineUserData) => {
  if (!row.tokenId) return
  pendingOnlineUser.value = row
}

const handleConfirmForceLogout = async () => {
  const tokenId = pendingOnlineUser.value?.tokenId
  if (!tokenId) return

  await forceLogoutOnlineUserAPI(String(tokenId))
  ScMessage.success('强退成功')
  await scResourcePageRef.value?.refresh()
}

const handleCloseForceLogout = () => {
  pendingOnlineUser.value = null
}

const forceLogoutMessage = computed(() => {
  const row = pendingOnlineUser.value
  if (!row) return ''
  const target = row.userName || row.tokenId
  return `确定要强制退出“${target}”的当前会话吗？`
})

const pageConfig: PageConfig<OnlineUserData> = {
  searchConfig: { searchbarItems },
  operateConfig: { defaultButtons: [] },
  tableConfig: {
    tableColumns,
    showDefaultButtons: false,
    showSelection: false,
    showIndex: true,
    customActionButtons: [
      {
        name: '强退',
        type: 'danger',
        text: true,
        permission: 'monitor:online:forceLogout',
        disabled: row => !row.tokenId,
        onClick: handleForceLogout
      }
    ]
  },
  fetchData: getOnlineUserDataAPI
}
</script>

<template>
  <div class="page-card">
    <ScResourcePage ref="scResourcePageRef" :page-config="pageConfig">
      <template #column-loginTime="{ row }">
        {{ formatLoginTime(row.loginTime) }}
      </template>
    </ScResourcePage>
    <ScConfirmDialog
      v-if="pendingOnlineUser"
      title="确认强退"
      :message="forceLogoutMessage"
      confirm-text="确认强退"
      :on-confirm="handleConfirmForceLogout"
      :on-close="handleCloseForceLogout"
    />
  </div>
</template>

<style scoped lang="scss"></style>
