<script setup lang="ts">
import { ElMessage } from 'element-plus'
import type { AiUserConfigStatusData } from '@/types/adminManagement/aiUserConfig'
import {
  getAiUserConfigListAPI,
  getAiUserConfigGlobalStatusAPI,
  resetAiUserConfigAPI
} from '@/api/adminManagement/aiUserConfig-api.ts'
import { useScConfirm } from '@/hooks/useScConfirmDialog.ts'

/**
 * AI 密钥管理（仅管理员）：
 * 只看状态与重置（密钥泄露/人员离职），不提供明文查看与代填；
 * 用户本人配置入口在「个人信息 - AI 服务」
 */
const { scConfirm } = useScConfirm()

const tableColumns = reactive<TableColumns>([
  { label: '登录账号', prop: 'userName', minWidth: 140 },
  { label: '用户昵称', prop: 'nickName', minWidth: 140 },
  {
    label: '个人密钥',
    prop: 'apiKeyMasked',
    slot: 'apiKeyMasked',
    minWidth: 160
  },
  { label: '接口地址', prop: 'baseUrl', minWidth: 200, showOverflowTooltip: true },
  { label: '更新时间', prop: 'updateTime', width: 160 }
])

const pageConfig: PageConfig<AiUserConfigStatusData> = {
  searchConfig: { searchbarItems: [] },
  operateConfig: { defaultButtons: [] },
  tableConfig: {
    tableColumns,
    showDefaultButtons: false,
    showPagination: false,
    customActionButtons: [
      {
        name: '重置',
        type: 'danger',
        text: true,
        permission: 'system:aiUserConfig:reset',
        show: row => row.configured,
        onClick: (row: AiUserConfigStatusData) => handleReset(row)
      }
    ]
  },
  fetchData: getAiUserConfigListAPI
}

/** 全局兜底密钥状态（决定未配个人密钥的用户是否可用） */
const globalConfigured = ref<boolean | null>(null)
const loadGlobalStatus = async () => {
  const { data } = await getAiUserConfigGlobalStatusAPI()
  globalConfigured.value = data.configured
}
loadGlobalStatus()

const scResourcePageRef = useTemplateRef<PageInstance>('scResourcePageRef')

/** 重置=删除该用户密钥（本人需到个人信息重新配置） */
const handleReset = async (row: AiUserConfigStatusData) => {
  try {
    await scConfirm({
      message: `将清除「${row.nickName || row.userName}」的个人密钥，其后续生成回退使用全局密钥，确认执行？`
    })
  } catch {
    return
  }
  await resetAiUserConfigAPI(row.userId)
  ElMessage.success('已重置')
  scResourcePageRef.value?.refresh()
}
</script>

<template>
  <div class="page-card">
    <el-alert
      v-if="globalConfigured !== null"
      :type="globalConfigured === false ? 'warning' : 'success'"
      :closable="false"
      show-icon
      class="global-status"
    >
      <template #title>
        <template v-if="globalConfigured === false">
          全局密钥未配置：未配置个人密钥的用户将无法使用 AI 生成（配置方式见部署文档）
        </template>
        <template v-else>
          全局密钥已配置：未配置个人密钥的用户回退使用全局密钥
        </template>
      </template>
    </el-alert>
    <ScResourcePage
      ref="scResourcePageRef"
      :page-config="pageConfig"
    >
      <template #column-apiKeyMasked="{ row }">
        <el-tag v-if="row.configured" type="success">{{ row.apiKeyMasked }}</el-tag>
        <el-tag v-else type="info">未配置</el-tag>
      </template>
    </ScResourcePage>
  </div>
</template>

<style scoped lang="scss">
.global-status {
  margin-bottom: 12px;
}
</style>
