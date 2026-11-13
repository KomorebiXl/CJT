<!--功能点确认面板（两段式：提取 → 确认 → 按清单生成）；
    确认即评审：单条确认/全部确认/剔除/拉回/删除均即时落库，无独立"保存"动作；
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

const fpPoints = ref<AiFunctionPoint[]>([])
const fpLoading = ref(false)
const fpExtracting = ref(false)
const fpSaving = ref(false)

const FP_REMOVE_REASONS = ['性能约束', '安全要求', '兼容性要求', '可靠性要求', '其他非功能']

const fpFunctionPoints = computed(() => fpPoints.value.filter(p => p.pointType === '1'))
const fpRemoved = computed(() => fpPoints.value.filter(p => p.pointType === '0'))
const fpConfirmedCount = computed(
  () => fpFunctionPoints.value.filter(p => p.status === '1').length
)

const fetchFunctionPoints = async () => {
  if (!props.resultId) {
    fpPoints.value = []
    return
  }
  fpLoading.value = true
  try {
    const { data } = await getFunctionPointsAPI(props.resultId)
    fpPoints.value = data ?? []
  } catch {
    fpPoints.value = []
  } finally {
    fpLoading.value = false
  }
}

watch(
  () => props.resultId,
  () => {
    void fetchFunctionPoints()
  }
)

onMounted(() => {
  void fetchFunctionPoints()
})

/** 即时落库当前整份清单（各动作触发；成功静默，行内状态即反馈） */
const persist = async () => {
  if (!props.resultId || fpSaving.value) return false
  if (fpFunctionPoints.value.some(point => !point.name?.trim())) {
    ElMessage.warning('存在未填写名称的功能点')
    return false
  }
  fpSaving.value = true
  try {
    await saveFunctionPointsAPI({ resultId: props.resultId, items: fpPoints.value })
    return true
  } catch {
    ElMessage.error('功能点保存失败，已还原为最近一次状态')
    await fetchFunctionPoints()
    return false
  } finally {
    fpSaving.value = false
  }
}

/** 单项 AI 提取（同步接口，完成后逐条确认） */
const extractCurrent = async () => {
  if (!props.resultId || fpExtracting.value) return
  try {
    await scConfirm({
      title: '提示',
      message: '将重新提取该测试项的功能点（覆盖当前清单），确认执行？',
      confirmText: '确认提取'
    })
  } catch {
    return
  }
  fpExtracting.value = true
  try {
    const { data } = await extractFunctionPointsSyncAPI({ resultIds: [props.resultId] })
    const item = data?.[0]
    if (!item || item.status === 3) {
      ElMessage.error(item?.message || '功能点提取失败')
      return
    }
    ElMessage.success('功能点提取完成，请确认清单')
    await fetchFunctionPoints()
  } finally {
    fpExtracting.value = false
  }
}

const addFpPoint = () => {
  fpPoints.value.push({
    name: '',
    description: '',
    pointType: '1',
    status: '0'
  })
}

/** 单条确认：该功能点即评审完成（整份清单随本次落库） */
const confirmPoint = async (point: AiFunctionPoint) => {
  point.status = '1'
  await persist()
}

/** 剔除：移入剔除区并落库（剔除即生效，不再需要单独确认） */
const removePoint = async (point: AiFunctionPoint) => {
  point.pointType = '0'
  point.status = '2'
  if (!point.removeReason) point.removeReason = '其他非功能'
  await persist()
}

/** 拉回功能点：回到待确认态 */
const moveToFp = async (point: AiFunctionPoint) => {
  point.pointType = '1'
  point.status = '0'
  point.removeReason = undefined
  await persist()
}

const deleteFp = async (point: AiFunctionPoint) => {
  fpPoints.value = fpPoints.value.filter(item => item !== point)
  await persist()
}

/** 全部确认：功能点全部置已确认、剔除区全部置已剔除，即时落库 */
const confirmAllFp = async () => {
  fpPoints.value.forEach(point => {
    point.status = point.pointType === '1' ? '1' : '2'
  })
  if (await persist()) {
    ElMessage.success('功能点已全部确认，生成将按清单逐点成例')
  }
}

defineExpose({
  /** 任务结束后由父组件调用刷新清单 */
  refresh: fetchFunctionPoints
})
</script>

<template>
  <div v-loading="fpLoading" class="fp-panel">
    <div class="fp-header">
      <span class="fp-title">
        功能点清单
        <el-tag
          v-if="fpPoints.length"
          :type="fpConfirmedCount === fpFunctionPoints.length ? 'success' : 'info'"
          size="small"
        >
          已确认 {{ fpConfirmedCount }}/{{ fpFunctionPoints.length }}
        </el-tag>
      </span>
      <div class="fp-actions">
        <el-button size="small" :loading="fpExtracting" @click="extractCurrent">
          AI提取
        </el-button>
        <el-button size="small" @click="addFpPoint">添加</el-button>
        <el-button
          size="small"
          type="primary"
          plain
          :disabled="!fpFunctionPoints.length"
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
      <div class="fp-group-title">功能点（未确认的不参与用例生成）</div>
      <div v-for="(point, index) in fpFunctionPoints" :key="'fp' + index" class="fp-row">
        <el-input
          v-model="point.name"
          size="small"
          placeholder="功能点名称"
          class="fp-name"
        />
        <el-input
          v-model="point.description"
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
          link
          type="success"
          size="small"
          @click="confirmPoint(point)"
        >
          确认
        </el-button>
        <el-button link type="warning" size="small" @click="removePoint(point)">
          剔除
        </el-button>
        <el-button link size="small" @click="deleteFp(point)">删除</el-button>
      </div>
      <template v-if="fpRemoved.length">
        <div class="fp-group-title">剔除区（非功能描述，可改判拉回）</div>
        <div v-for="(point, index) in fpRemoved" :key="'rm' + index" class="fp-row">
          <span class="fp-src" :title="point.sourceText || point.name">
            {{ point.name }}
          </span>
          <el-select v-model="point.removeReason" size="small" class="fp-reason">
            <el-option
              v-for="reason in FP_REMOVE_REASONS"
              :key="reason"
              :label="reason"
              :value="reason"
            />
          </el-select>
          <el-button link type="primary" size="small" @click="moveToFp(point)">
            拉回功能点
          </el-button>
          <el-button link size="small" @click="deleteFp(point)">删除</el-button>
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
