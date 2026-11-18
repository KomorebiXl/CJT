<!--功能点编辑面板：提取后可直接生成，所有编辑显式保存；
    由 TestCaseSplitView 在选中叶子测试项时挂载，resultId 变化自动加载清单，
    任务结束后由父组件调 refresh() 刷新-->
<script setup lang="ts">
import { ElMessage } from 'element-plus'
import type { AiFunctionPoint } from '@/types/projectProcess/testCases'
import {
  extractFunctionPointsSyncAPI,
  getFunctionPointsAPI,
  saveFunctionPointsAPI
} from '@/api/projectProcess/testCases-api'
import { useScConfirm } from '@/hooks/useScConfirmDialog.ts'

const props = defineProps<{
  /** 当前测试项 id（叶子行；空则清空面板） */
  resultId?: string
}>()

const { scConfirm } = useScConfirm()
const emit = defineEmits<{ (e: 'saved'): void }>()

type ReviewPoint = AiFunctionPoint & { localKey: number }
const fpPoints = ref<ReviewPoint[]>([])
const fpLoading = ref(false)
const fpExtracting = ref(false)
const fpSaving = ref(false)
const fpDirty = ref(false)
const loadedResultId = ref<string>()
let contextVersion = 0
let requestVersion = 0
let extractionVersion = 0
let savedPoints: AiFunctionPoint[] = []
let saveQueue: Promise<unknown> = Promise.resolve()
let pendingSaves = 0
let localKey = 0
const clonePoints = (
  points: (AiFunctionPoint & { localKey?: number })[]
): ReviewPoint[] =>
  points.map(point => ({ ...point, localKey: point.localKey ?? ++localKey }))
const fpBusy = computed(
  () => fpLoading.value || fpExtracting.value || fpSaving.value
)

const FP_REMOVE_REASONS = [
  '性能约束',
  '安全要求',
  '兼容性要求',
  '可靠性要求',
  '其他非功能'
]

const fpFunctionPoints = computed(() =>
  fpPoints.value.filter(p => p.pointType === '1')
)
const fpRemoved = computed(() =>
  fpPoints.value.filter(p => p.pointType === '0')
)

const fetchFunctionPoints = async () => {
  const resultId = props.resultId
  const context = ++contextVersion
  const request = ++requestVersion
  loadedResultId.value = undefined
  fpPoints.value = []
  savedPoints = []
  fpDirty.value = false
  fpLoading.value = false
  fpExtracting.value = false
  extractionVersion += 1
  if (!resultId) return
  fpLoading.value = true
  try {
    const { data } = await getFunctionPointsAPI(resultId)
    if (
      context !== contextVersion ||
      request !== requestVersion ||
      resultId !== props.resultId
    )
      return
    savedPoints = clonePoints(data ?? [])
    fpPoints.value = clonePoints(savedPoints)
    loadedResultId.value = resultId
  } catch {
    if (context === contextVersion) fpPoints.value = []
  } finally {
    if (context === contextVersion) fpLoading.value = false
  }
}

watch(
  () => props.resultId,
  () => {
    void fetchFunctionPoints()
  },
  { immediate: true, flush: 'sync' }
)
onBeforeUnmount(() => {
  contextVersion += 1
})

/** 捕获所属测试项；保存完成前禁止继续编辑，服务端校验完整清单快照。 */
const persist = () => {
  const resultId = loadedResultId.value
  const context = contextVersion
  if (
    !resultId ||
    resultId !== props.resultId ||
    fpLoading.value ||
    fpExtracting.value
  )
    return Promise.resolve(false)
  pendingSaves += 1
  fpSaving.value = true
  const operation = saveQueue.then(async () => {
    if (context !== contextVersion || resultId !== props.resultId) return false
    const draft = clonePoints(fpPoints.value)
    if (draft.some(point => !point.name?.trim())) {
      ElMessage.warning('存在未填写名称的条目，请填写后再保存')
      return false
    }
    try {
      const { data } = await saveFunctionPointsAPI({
        resultId,
        expectedIds: savedPoints.flatMap(point => (point.id ? [point.id] : [])),
        items: draft
      })
      if (context !== contextVersion || resultId !== props.resultId)
        return false
      savedPoints = data.map(point => ({
        ...point,
        localKey: draft[point.sort ?? -1]?.localKey
      }))
      fpPoints.value = clonePoints(savedPoints)
      fpDirty.value = false
      emit('saved')
      ElMessage.success('功能点已保存，后续生成将使用保存后的清单')
      return true
    } catch {
      if (context === contextVersion) {
        ElMessage.error('功能点保存失败，草稿已保留；清单冲突时请刷新后重新编辑')
        fpDirty.value = true
      }
      return false
    }
  })
  saveQueue = operation.finally(() => {
    pendingSaves -= 1
    fpSaving.value = pendingSaves > 0
  })
  return operation
}

const editPoint = () => {
  fpDirty.value = true
}

/** 无选中项不阻止范围生成；有草稿时明确保存并生成，取消或失败均阻止提交。 */
const ensureSaved = async () => {
  const context = contextVersion
  const resultId = props.resultId
  await saveQueue
  if (context !== contextVersion || resultId !== props.resultId) return false
  if (!resultId) return true
  if (!loadedResultId.value || fpBusy.value) {
    ElMessage.warning('功能点清单正在处理或加载失败，请稍后重试')
    return false
  }
  if (fpDirty.value) {
    try {
      await scConfirm({
        title: '保存功能点修改',
        message: '存在未保存的功能点修改，是否保存后生成？',
        confirmText: '保存并生成',
        cancelText: '取消'
      })
    } catch {
      return false
    }
    if (context !== contextVersion || resultId !== props.resultId || fpBusy.value)
      return false
    return persist()
  }
  return true
}

const refresh = async () => {
  await saveQueue
  if (fpDirty.value) {
    ElMessage.warning(
      '有未保存的功能点编辑，已保留草稿；可保存或点击刷新放弃编辑'
    )
    return
  }
  await fetchFunctionPoints()
}

const reloadCurrent = async () => {
  if (fpBusy.value) return
  if (fpDirty.value) {
    const context = contextVersion
    try {
      await scConfirm({
        title: '提示',
        message: '刷新将放弃未保存的编辑，确认刷新？',
        confirmText: '确认刷新'
      })
    } catch {
      return
    }
    if (context !== contextVersion) return
  }
  await fetchFunctionPoints()
}

/** 单项 AI 提取；明确告知人工编辑将被覆盖。 */
const extractCurrent = async () => {
  const resultId = loadedResultId.value
  const context = contextVersion
  if (!resultId || fpBusy.value) return
  try {
    await scConfirm({
      title: '提示',
      message: '将重新提取该测试项的功能点，覆盖当前清单及人工编辑，并使该项已有用例失效，是否继续？',
      confirmText: '确认提取'
    })
  } catch {
    return
  }
  if (context !== contextVersion || resultId !== props.resultId) return
  fpExtracting.value = true
  const extraction = ++extractionVersion
  try {
    const { data } = await extractFunctionPointsSyncAPI({
      resultIds: [resultId]
    })
    if (context !== contextVersion || resultId !== props.resultId) return
    const item = data?.[0]
    if (!item || item.status === 3) {
      ElMessage.error(item?.message || '功能点提取失败')
      return
    }
    ElMessage.success('功能点提取完成，有效清单可直接生成用例，也可先编辑保存')
    await fetchFunctionPoints()
    emit('saved')
  } finally {
    if (extraction === extractionVersion) fpExtracting.value = false
  }
}

const addFpPoint = () => {
  if (fpBusy.value || !loadedResultId.value) return
  fpPoints.value.push({
    localKey: ++localKey,
    name: '',
    description: '',
    pointType: '1',
    status: '0'
  })
  fpDirty.value = true
}

/** 剔除、恢复、删除均编辑草稿，统一点击保存后生效。 */
const removePoint = (point: ReviewPoint) => {
  if (fpBusy.value) return
  point.pointType = '0'
  point.status = '2'
  if (!point.removeReason) point.removeReason = '其他非功能'
  editPoint()
}

const moveToFp = (point: ReviewPoint) => {
  if (fpBusy.value) return
  point.pointType = '1'
  point.status = '0'
  point.removeReason = undefined
  editPoint()
}

const deleteFp = (point: ReviewPoint) => {
  if (fpBusy.value) return
  const index = fpPoints.value.findIndex(item => item.localKey === point.localKey)
  if (index >= 0) fpPoints.value.splice(index, 1)
  editPoint()
}

defineExpose({
  /** 任务结束后由父组件调用刷新清单 */
  refresh,
  ensureSaved
})
</script>

<template>
  <div v-loading="fpLoading" class="fp-panel">
    <div class="fp-header">
      <span class="fp-title">
        功能点清单
        <!-- 常驻不卸载：切换测试项时若随清单清空重挂，el-tag 自带的 leave 过渡会出现
             “宽度塌缩+右移”的位移动画（2026-11-18 反馈1），故改为三态文案 -->
        <el-tag
          v-if="fpPoints.length || fpLoading"
          type="info"
          size="small"
        >
          {{
            fpLoading
              ? '加载中…'
              : `有效 ${fpFunctionPoints.length} · 剔除 ${fpRemoved.length}`
          }}
        </el-tag>
      </span>
      <div class="fp-actions">
        <el-button
          size="small"
          :disabled="fpBusy || !loadedResultId"
          :loading="fpExtracting"
          @click="extractCurrent"
        >
          AI提取
        </el-button>
        <el-button
          size="small"
          :disabled="fpBusy || !loadedResultId"
          @click="addFpPoint"
          >添加</el-button
        >
        <el-button
          size="small"
          :disabled="!fpDirty || fpBusy"
          @click="persist()"
          >保存编辑</el-button
        >
        <el-button size="small" :disabled="fpBusy" @click="reloadCurrent"
          >刷新</el-button
        >
      </div>
    </div>
    <div v-if="!fpPoints.length" class="fp-empty">
      尚未提取功能点：点击「AI提取」从测试项说明拆分功能点（非功能描述自动进剔除区），
      提取并保存有效清单后可直接生成，也可添加功能点后保存
    </div>
    <template v-else>
      <div class="fp-group-title">
        功能点（提取后可直接生成；编辑后需保存，保存会使该项已有用例失效）{{
          fpDirty ? ' · 有未保存编辑' : ''
        }}
      </div>
      <div
        v-for="point in fpFunctionPoints"
        :key="point.localKey"
        class="fp-row"
      >
        <el-input
          v-model="point.name"
          :disabled="fpBusy"
          @input="editPoint"
          size="small"
          placeholder="功能点名称"
          class="fp-name"
        />
        <el-input
          v-model="point.description"
          :disabled="fpBusy"
          @input="editPoint"
          size="small"
          placeholder="描述（可独立执行验证的操作）"
          class="fp-desc"
        />
        <el-button
          link
          type="warning"
          size="small"
          :disabled="fpBusy"
          @click="removePoint(point)"
        >
          剔除
        </el-button>
        <el-button link size="small" :disabled="fpBusy" @click="deleteFp(point)"
          >删除</el-button
        >
      </div>
      <template v-if="fpRemoved.length">
        <div class="fp-group-title">剔除区（非功能描述，可改判拉回）</div>
        <div v-for="point in fpRemoved" :key="point.localKey" class="fp-row">
          <span class="fp-src" :title="point.sourceText || point.name">
            {{ point.name }}
          </span>
          <el-select
            v-model="point.removeReason"
            :disabled="fpBusy"
            size="small"
            class="fp-reason"
            @change="editPoint"
          >
            <el-option
              v-for="reason in FP_REMOVE_REASONS"
              :key="reason"
              :label="reason"
              :value="reason"
            />
          </el-select>
          <el-button
            link
            type="primary"
            size="small"
            :disabled="fpBusy"
            @click="moveToFp(point)"
          >
            拉回功能点
          </el-button>
          <el-button
            link
            size="small"
            :disabled="fpBusy"
            @click="deleteFp(point)"
            >删除</el-button
          >
        </div>
    <div v-if="fpPoints.length && !fpFunctionPoints.length" class="fp-empty">
      当前清单无有效功能点，不能生成用例；请添加功能点或从剔除区恢复后保存
    </div>
      </template>
    </template>
  </div>
</template>

<style scoped lang="scss">
.fp-panel {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 8px 12px;
  border-bottom: 1px solid var(--el-border-color-lighter);

  .fp-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }

  .fp-title {
    font-size: 13px;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .fp-actions {
    display: flex;
    gap: 4px;
    flex-shrink: 0;
  }

  .fp-empty {
    font-size: 12px;
    color: var(--el-text-color-secondary);
    line-height: 1.6;
  }

  .fp-group-title {
    font-size: 12px;
    color: var(--el-text-color-secondary);
    padding-top: 2px;
  }

  .fp-row {
    display: flex;
    align-items: center;
    gap: 6px;

    .fp-name {
      width: 220px;
      flex-shrink: 0;
    }

    .fp-desc {
      flex: 1;
      min-width: 0;
    }

    .fp-src {
      flex: 1;
      min-width: 0;
      font-size: 13px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .fp-reason {
      width: 130px;
      flex-shrink: 0;
    }

    .fp-status {
      flex-shrink: 0;
    }
  }
}
</style>
