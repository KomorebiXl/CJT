<script setup lang="ts">
import { Delete, Refresh } from '@element-plus/icons-vue'
import {
  clearAllCacheAPI,
  clearCacheKeyAPI,
  clearCacheNameAPI,
  getCacheValueAPI,
  listCacheKeysAPI,
  listCacheNamesAPI
} from '@/api/systemMonitor/cache-api.ts'
import type {
  CacheKeyItem,
  CacheNameItem,
  CacheValueDetail
} from '@/types/systemMonitor/cache'
import { useScConfirm } from '@/hooks/useScConfirmDialog.ts'
import ScMessage from '@/utils/ElUtils/message.ts'
import type { ScTableInstance } from '@/components/ScBaseComponents/ScTable/scTable.ts'

defineOptions({ name: 'CacheManagerPage' })

const cacheNames = ref<CacheNameItem[]>([])
const cacheKeys = ref<CacheKeyItem[]>([])
const selectedCacheName = ref<string>()
const selectedCacheKey = ref<string>()
const cacheValue = ref<CacheValueDetail>()
const namesLoading = ref(false)
const keysLoading = ref(false)
const detailLoading = ref(false)
const cacheNameTableRef = useTemplateRef<ScTableInstance>('cacheNameTableRef')
const cacheKeyTableRef = useTemplateRef<ScTableInstance>('cacheKeyTableRef')
const { scConfirm } = useScConfirm()

const nameColumns: TableColumns = [
  {
    prop: 'cacheName',
    label: '缓存名称',
    slot: 'cacheName',
    showOverflowTooltip: true
  },
  { prop: 'remark', label: '备注', showOverflowTooltip: true }
]
const keyColumns: TableColumns = [
  {
    prop: 'cacheKey',
    label: '缓存键',
    slot: 'cacheKey',
    showOverflowTooltip: true
  }
]

const displayCacheName = (name: string) => name.replace(':', '')
const displayCacheKey = (key: string) =>
  selectedCacheName.value ? key.replace(`${selectedCacheName.value}:`, '') : key

const formatCacheValue = (value: string) => {
  try {
    return JSON.stringify(JSON.parse(value), null, 2)
  } catch {
    return value
  }
}

const clearCurrentSelection = () => {
  selectedCacheName.value = undefined
  selectedCacheKey.value = undefined
  cacheKeys.value = []
  cacheValue.value = undefined
  cacheNameTableRef.value?.setCurrentRow(undefined)
  cacheKeyTableRef.value?.setCurrentRow(undefined)
}

const fetchCacheNames = async () => {
  namesLoading.value = true
  try {
    const response = await listCacheNamesAPI()
    cacheNames.value = response.data
    if (
      selectedCacheName.value &&
      !response.data.some(item => item.cacheName === selectedCacheName.value)
    ) {
      clearCurrentSelection()
    }
    await nextTick()
    const selectedRow = response.data.find(
      item => item.cacheName === selectedCacheName.value
    )
    if (selectedRow) {
      cacheNameTableRef.value?.setCurrentRow(
        selectedRow as unknown as Record<
          string,
          string | number | boolean | null
        >
      )
    }
  } finally {
    namesLoading.value = false
  }
}

const fetchCacheKeys = async () => {
  const cacheName = selectedCacheName.value
  if (!cacheName) return
  keysLoading.value = true
  try {
    const response = await listCacheKeysAPI(cacheName)
    if (selectedCacheName.value !== cacheName) return
    cacheKeys.value = response.data.map(cacheKey => ({ cacheKey }))
    if (
      selectedCacheKey.value &&
      !response.data.includes(selectedCacheKey.value)
    ) {
      selectedCacheKey.value = undefined
      cacheValue.value = undefined
    }
    await nextTick()
    const selectedRow = cacheKeys.value.find(
      item => item.cacheKey === selectedCacheKey.value
    )
    if (selectedRow) {
      cacheKeyTableRef.value?.setCurrentRow(
        selectedRow as unknown as Record<
          string,
          string | number | boolean | null
        >
      )
    }
  } finally {
    keysLoading.value = false
  }
}

const handleCacheNameClick = async (row: CacheNameItem) => {
  selectedCacheName.value = row.cacheName
  selectedCacheKey.value = undefined
  cacheValue.value = undefined
  await fetchCacheKeys()
}

const handleCacheNameCurrentChange = async (
  row: Record<string, any> | null
) => {
  if (!row?.cacheName) return
  try {
    await handleCacheNameClick(row as CacheNameItem)
  } catch {
    cacheKeys.value = []
    cacheValue.value = undefined
  }
}

const handleCacheKeyClick = async (row: CacheKeyItem) => {
  const cacheName = selectedCacheName.value
  if (!cacheName) return
  selectedCacheKey.value = row.cacheKey
  detailLoading.value = true
  try {
    const response = await getCacheValueAPI(cacheName, row.cacheKey)
    if (
      selectedCacheName.value !== cacheName ||
      selectedCacheKey.value !== row.cacheKey
    ) {
      return
    }
    cacheValue.value = response.data
  } finally {
    detailLoading.value = false
  }
}

const handleCacheKeyCurrentChange = async (row: Record<string, any> | null) => {
  if (!row?.cacheKey) return
  try {
    await handleCacheKeyClick(row as CacheKeyItem)
  } catch {
    cacheValue.value = undefined
  }
}

const refreshNames = async () => {
  await fetchCacheNames()
  ScMessage.success('缓存名称刷新成功')
}

const refreshKeys = async () => {
  await fetchCacheKeys()
  ScMessage.success('缓存键刷新成功')
}

const clearCacheName = async () => {
  if (!selectedCacheName.value) return
  await scConfirm({
    message: `确定清理缓存名称“${displayCacheName(selectedCacheName.value)}”吗？`
  })
  await clearCacheNameAPI(selectedCacheName.value)
  clearCurrentSelection()
  await fetchCacheNames()
  ScMessage.success('缓存名称清理成功')
}

const clearCacheKey = async () => {
  if (!selectedCacheKey.value) return
  await scConfirm({ message: '确定清理当前缓存键吗？' })
  await clearCacheKeyAPI(selectedCacheKey.value)
  selectedCacheKey.value = undefined
  cacheValue.value = undefined
  cacheKeyTableRef.value?.setCurrentRow(undefined)
  await fetchCacheKeys()
  ScMessage.success('缓存键清理成功')
}

const clearAllCache = async () => {
  await scConfirm({ message: '确定清理全部缓存吗？' })
  await clearAllCacheAPI()
  clearCurrentSelection()
  cacheNames.value = []
  await fetchCacheNames()
  ScMessage.success('全部缓存清理成功')
}

onMounted(fetchCacheNames)
</script>

<template>
  <div class="cache-manager-page page-card">
    <section class="cache-panel">
      <div class="panel-header">
        <h3>缓存名称</h3>
        <div>
          <ScButton text :icon="Refresh" @click="refreshNames" />
          <ScButton
            text
            type="danger"
            :icon="Delete"
            :disabled="!selectedCacheName"
            @click="clearCacheName"
          />
        </div>
      </div>
      <ScTable
        ref="cacheNameTableRef"
        :data="cacheNames"
        :table-columns="nameColumns"
        :loading="namesLoading"
        :show-action="false"
        :show-pagination="false"
        @current-change="handleCacheNameCurrentChange"
      >
        <template #cacheName="{ row }">
          <ScLinkText :content="displayCacheName(row.cacheName)" />
        </template>
      </ScTable>
    </section>
    <section class="cache-panel">
      <div class="panel-header">
        <h3>缓存键</h3>
        <div>
          <ScButton
            text
            :icon="Refresh"
            :disabled="!selectedCacheName"
            @click="refreshKeys"
          /><ScButton
            text
            type="danger"
            :icon="Delete"
            :disabled="!selectedCacheKey"
            @click="clearCacheKey"
          />
        </div>
      </div>
      <ScTable
        ref="cacheKeyTableRef"
        :data="cacheKeys"
        :table-columns="keyColumns"
        :loading="keysLoading"
        :show-action="false"
        :show-pagination="false"
        @current-change="handleCacheKeyCurrentChange"
      >
        <template #cacheKey="{ row }">
          <ScLinkText :content="displayCacheKey(row.cacheKey)" />
        </template>
      </ScTable>
    </section>
    <section class="cache-panel detail-panel">
      <div class="panel-header">
        <h3>缓存详情</h3>
        <ScButton type="danger" :icon="Delete" @click="clearAllCache">
          清理全部
        </ScButton>
      </div>
      <div v-loading="detailLoading" class="detail-content">
        <template v-if="cacheValue">
          <div class="detail-field">
            <span>缓存名称</span><strong>{{ cacheValue.cacheName }}</strong>
          </div>
          <div class="detail-field">
            <span>缓存键</span><strong>{{ cacheValue.cacheKey }}</strong>
          </div>
          <div class="detail-field value-field">
            <span>缓存内容</span>
            <pre>{{ formatCacheValue(cacheValue.cacheValue) }}</pre>
          </div>
        </template>
        <el-empty v-else description="请选择缓存键查看详情" :image-size="100" />
      </div>
    </section>
  </div>
</template>

<style scoped lang="scss">
.cache-manager-page {
  display: grid;
  grid-template-columns: 1fr 1fr 1.4fr;
  gap: 16px;
  min-height: calc(100vh - 180px);
}
.cache-panel {
  display: flex;
  flex-direction: column;
  min-width: 0;
  padding: 16px;
  border: 1px solid var(--el-border-color-light);
  border-radius: 8px;
  background: var(--el-bg-color);
}
.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 12px;
}
.panel-header h3 {
  margin: 0;
  font-size: 16px;
}
.detail-content {
  flex: 1;
  min-height: 0;
  overflow: auto;
}
.detail-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 18px;
  color: var(--el-text-color-secondary);
}
.detail-field strong {
  color: var(--el-text-color-primary);
  word-break: break-all;
}
.value-field pre {
  flex: 1;
  min-height: 240px;
  max-height: 480px;
  margin: 0;
  padding: 12px;
  overflow: auto;
  white-space: pre-wrap;
  word-break: break-all;
  border-radius: 4px;
  background: var(--el-fill-color-light);
  color: var(--el-text-color-primary);
  scrollbar-width: thin;
  scrollbar-color: var(--el-border-color) transparent;
}
.value-field pre::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}
.value-field pre::-webkit-scrollbar-track {
  background: transparent;
}
.value-field pre::-webkit-scrollbar-thumb {
  border: 2px solid transparent;
  border-radius: 8px;
  background-clip: padding-box;
  background-color: var(--el-border-color);
}
.value-field pre::-webkit-scrollbar-thumb:hover {
  background-color: var(--el-color-primary-light-5);
}
@media (max-width: 1100px) {
  .cache-manager-page {
    grid-template-columns: 1fr 1fr;
  }
  .detail-panel {
    grid-column: 1 / -1;
    min-height: 360px;
  }
}
@media (max-width: 650px) {
  .cache-manager-page {
    grid-template-columns: 1fr;
    min-height: auto;
  }
  .cache-panel {
    min-height: 320px;
  }
  .value-field pre {
    max-height: 300px;
  }
  .detail-panel {
    grid-column: auto;
  }
}
</style>
