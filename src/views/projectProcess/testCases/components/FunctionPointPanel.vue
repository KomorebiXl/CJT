<!--功能点确认面板（两段式：提取 → 确认 → 按清单生成）；
    确认即评审：动作串行落库，文字编辑先保存为待确认，成功后才展示确认；
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
const fpConfirmedCount = computed(
  () => fpFunctionPoints.value.filter(p => p.status === '1').length
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

/** 捕获所属测试项；排队动作在上一份快照成功后执行，失败不会假确认。 */
const persist = (change: (draft: ReviewPoint[]) => void = () => {}) => {
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
    change(draft)
    if (draft.some(point => !point.name?.trim())) {
      ElMessage.warning('存在未填写名称的条目，请填写后再保存或确认')
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
      return true
    } catch {
      if (context === contextVersion) {
        ElMessage.error('功能点保存失败，请刷新清单后重新评审')
        // 草稿保留，但不得显示成已经保存的确认状态。
        fpPoints.value.forEach(point => {
          point.status = '0'
        })
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

const editPoint = (point: AiFunctionPoint) => {
  point.status = '0'
  fpDirty.value = true
}

/** 生成前等待已提交保存；未提交的草稿要求明确保存/确认。 */
const ensureSaved = async () => {
  await saveQueue
  if (fpDirty.value || !loadedResultId.value || fpBusy.value) {
    ElMessage.warning('请先保存并确认当前功能点清单')
    return false
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

/** 单项 AI 提取（同步接口，完成后逐条确认） */
const extractCurrent = async () => {
  const resultId = loadedResultId.value
  const context = contextVersion
  if (!resultId || fpBusy.value) return
  try {
    await scConfirm({
      title: '提示',
      message: '将重新提取该测试项的功能点（覆盖当前清单），确认执行？',
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
    ElMessage.success('功能点提取完成，请确认清单')
    await fetchFunctionPoints()
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

/** 单条确认：该功能点即评审完成（整份清单随本次落库） */
const confirmPoint = async (point: ReviewPoint) => {
  await persist(draft => {
    const item = draft.find(item => item.localKey === point.localKey)
    if (item) item.status = '1'
  })
}

/** 剔除：移入剔除区并落库（剔除即生效，不再需要单独确认） */
const removePoint = async (point: ReviewPoint) => {
  await persist(draft => {
    const item = draft.find(item => item.localKey === point.localKey)
    if (!item) return
    item.pointType = '0'
    item.status = '2'
    if (!item.removeReason) item.removeReason = '其他非功能'
  })
}

/** 拉回功能点：回到待确认态 */
const moveToFp = async (point: ReviewPoint) => {
  await persist(draft => {
    const item = draft.find(item => item.localKey === point.localKey)
    if (!item) return
    item.pointType = '1'
    item.status = '0'
    item.removeReason = undefined
  })
}

const deleteFp = async (point: ReviewPoint) => {
  await persist(draft => {
    const index = draft.findIndex(item => item.localKey === point.localKey)
    if (index >= 0) draft.splice(index, 1)
  })
}

/** 全部确认：功能点全部置已确认、剔除区全部置已剔除，即时落库 */
const confirmAllFp = async () => {
  if (
    await persist(draft =>
      draft.forEach(point => {
        point.status = point.pointType === '1' ? '1' : '2'
      })
    )
  ) {
    ElMessage.success('功能点已全部确认，可以生成用例')
  }
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
        <el-tag
          v-if="fpPoints.length"
          :type="
            fpConfirmedCount === fpFunctionPoints.length ? 'success' : 'info'
          "
          size="small"
        >
          已确认 {{ fpConfirmedCount }}/{{ fpFunctionPoints.length }}
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
        <el-button
          size="small"
          type="primary"
          plain
          :disabled="!fpFunctionPoints.length || fpBusy"
          @click="confirmAllFp"
        >
          全部确认
        </el-button>
      </div>
    </div>
    <div v-if="!fpPoints.length" class="fp-empty">
      尚未提取功能点：点击「AI提取」从测试项说明拆分功能点（非功能描述自动进剔除区），
      确认后「生成」将按清单逐点成例
    </div>
    <template v-else>
      <div class="fp-group-title">
        功能点（编辑后需重新确认；全部评审完成后才能生成）{{
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
          @input="editPoint(point)"
          size="small"
          placeholder="功能点名称"
          class="fp-name"
        />
        <el-input
          v-model="point.description"
          :disabled="fpBusy"
          @input="editPoint(point)"
          size="small"
          placeholder="描述（可独立执行验证的操作）"
          class="fp-desc"
        />
        <el-tag
          :type="point.status === '1' ? 'success' : 'info'"
          size="small"
          class="fp-status"
        >
          {{ point.status === '1' ? '已确认' : '待确认' }}
        </el-tag>
        <el-button
          v-if="point.status !== '1'"
          :disabled="fpBusy"
          link
          type="success"
          size="small"
          @click="confirmPoint(point)"
        >
          确认
        </el-button>
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
            @change="editPoint(point)"
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
  max-height: 280px;
  overflow-y: auto;
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
