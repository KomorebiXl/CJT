<script setup lang="ts">
import { getFunctionPointFailuresAPI } from '@/api/projectProcess/testCases-api'
import type { FunctionPointTaskFailure } from '@/types/projectProcess/testCases'
import { useRoute } from 'vue-router'

const visible = defineModel<boolean>({ required: true })
const props = defineProps<{
  subjectId: string
  taskId: string
  scopeLabel: string
}>()
const route = useRoute()
const rows = ref<FunctionPointTaskFailure[]>([])
const total = ref(0)
const pageNum = ref(1)
const pageSize = ref(20)
const keyword = ref('')
const search = ref('')
const loading = ref(false)
const error = ref('')
let revision = 0
const featureNames: Record<string, string> = {
  1: '功能性',
  2: '信息安全性',
  3: '兼容性',
  4: '可靠性',
  5: '易用性',
  6: '可移植性',
  7: '维护性'
}
const load = async () => {
  if (!visible.value || !props.subjectId || !props.taskId) return
  const request = ++revision
  const subjectId = props.subjectId
  const taskId = props.taskId
  loading.value = true
  error.value = ''
  rows.value = []
  try {
    const { data } = await getFunctionPointFailuresAPI({
      subjectId,
      taskId,
      pageNum: pageNum.value,
      pageSize: pageSize.value,
      keyword: search.value
    })
    if (
      request !== revision ||
      !visible.value ||
      subjectId !== props.subjectId ||
      taskId !== props.taskId
    )
      return
    if (!data || data.taskId !== taskId)
      throw new Error('任务已更新，请重新打开失败明细')
    rows.value = data.rows ?? []
    total.value = data.total ?? 0
  } catch (failure) {
    if (request !== revision || !visible.value) return
    const reason = failure as { msg?: string; message?: string }
    total.value = 0
    error.value = reason.msg || reason.message || '失败明细加载失败，请重试'
  } finally {
    if (request === revision) loading.value = false
  }
}
const submitSearch = () => {
  search.value = keyword.value.trim()
  pageNum.value = 1
  void load()
}
const changePage = (value: number) => {
  pageNum.value = value
  void load()
}
const changeSize = (value: number) => {
  pageSize.value = value
  pageNum.value = 1
  void load()
}
watch(
  () => [visible.value, props.subjectId, props.taskId],
  () => {
    revision += 1
    rows.value = []
    total.value = 0
    error.value = ''
    loading.value = false
    if (!visible.value) return
    pageNum.value = 1
    keyword.value = ''
    search.value = ''
    void load()
  },
  { flush: 'sync' }
)
watch(
  () => route.fullPath,
  () => {
    visible.value = false
  }
)
onBeforeUnmount(() => {
  revision += 1
})
</script>

<template>
  <ScDialog
    v-model="visible"
    title="功能点提取失败明细"
    dialog-width="min(1100px, 95vw)"
    auto-height
    :show-confirm-button="false"
  >
    <p class="failure-scope">{{ scopeLabel }}</p>
    <p class="failure-hint">
      仅列出本批实际失败项；停止后跳过的项目不计入。明细保留至下一批任务开始或服务重启。任务进行中可点击刷新查看最新失败项。
    </p>
    <form class="failure-toolbar" @submit.prevent="submitSearch">
      <el-input
        v-model="keyword"
        placeholder="搜索编号、名称、测试项 ID 或失败原因"
        clearable
        :maxlength="200"
        @clear="submitSearch"
      />
      <el-button native-type="submit" type="primary" :disabled="loading"
        >搜索</el-button
      >
      <el-button :loading="loading" @click="load">刷新</el-button>
    </form>
    <el-alert
      v-if="error"
      :title="error"
      type="error"
      :closable="false"
      show-icon
    />
    <el-table
      v-loading="loading"
      :data="rows"
      row-key="resultId"
      border
      max-height="460"
      empty-text="暂无匹配的失败项"
    >
      <el-table-column prop="serialNumber" label="测试项编号" width="125" />
      <el-table-column label="测试项" min-width="250">
        <template #default="{ row }">
          <div>{{ row.item || '名称未记录' }}</div>
          <div class="failure-item-id">ID：{{ row.resultId }}</div>
        </template>
      </el-table-column>
      <el-table-column label="所属范围" min-width="150">
        <template #default="{ row }">
          <div>
            {{
              featureNames[row.feature] ||
              row.feature ||
              '--'
            }}
          </div>
          <div v-if="row.subFeature && row.subFeature !== '1'" class="failure-range">
            子特性：{{ row.subFeature }}
          </div>
          <div v-if="row.subsystem" class="failure-range">
            子系统 ID：{{ row.subsystem }}
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="message" label="失败原因" min-width="320" />
    </el-table>
    <el-pagination
      class="failure-pagination"
      :current-page="pageNum"
      :page-size="pageSize"
      :total="total"
      :page-sizes="[20, 50, 100]"
      :disabled="loading"
      layout="total, sizes, prev, pager, next, jumper"
      @current-change="changePage"
      @size-change="changeSize"
    />
  </ScDialog>
</template>

<style scoped lang="scss">
.failure-scope {
  margin: 0 0 8px;
  font-weight: 600;
}
.failure-hint,
.failure-item-id,
.failure-range {
  color: var(--el-text-color-secondary);
  font-size: 12px;
  overflow-wrap: anywhere;
}
.failure-hint {
  margin: 0 0 14px;
  line-height: 1.7;
}
.failure-toolbar {
  display: flex;
  gap: 10px;
  margin-bottom: 14px;
}
.failure-toolbar .el-input {
  flex: 1;
}
.failure-pagination {
  margin-top: 16px;
  justify-content: flex-end;
  overflow-x: auto;
}
:deep(.el-table .cell) {
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}
</style>
