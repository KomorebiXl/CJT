<script setup lang="ts">
import { Minus, Plus } from '@element-plus/icons-vue'
import type { InitialTestTimeAnalysisRow } from '@/types/projectProcess/initialTest'

/**
 * 性能效率-时间特性分析可编辑表（替代源 EditTable）：
 * 测试结果表格1（响应时间/事务通过率七列双级表头）与表格2（次数/响应时间五列）
 * 双形态，caseTableType 切换保留各自数据不清空，行级增删，标题行取表单「测试用例」。
 */
type Table1Row = Extract<
  InitialTestTimeAnalysisRow,
  { minimum: string | number }
>
type Table2Row = Extract<
  InitialTestTimeAnalysisRow,
  { testCount: string | number }
>

const props = defineProps<{
  /** 表格类型：'1' | '2' | '' */
  type: string | number
  /** 表格行数据 */
  modelValue: Array<InitialTestTimeAnalysisRow>
  /** 表单数据（标题行取 testCase） */
  formData: Record<string, any>
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', val: Array<InitialTestTimeAnalysisRow>): void
  (e: 'update:type', val: string): void
}>()

const tableTypeOptions = [
  { label: '测试结果表格1', value: '1' },
  { label: '测试结果表格2', value: '2' }
]

const testResultOptions = [
  { label: '通过', value: '通过' },
  { label: '不通过', value: '不通过' }
]

// 两套表格数据独立维护，切换类型互不清空（沿源行为）
const data1 = ref<Array<Table1Row>>([])
const data2 = ref<Array<Table2Row>>([])

// 回显：modelValue 有数据时填入当前类型数组并清空另一套
watch(
  () => [props.modelValue, props.type] as const,
  ([val, type]) => {
    if (!val?.length) return
    if (String(type) === '1') {
      data1.value = val as Array<Table1Row>
      data2.value = []
    } else if (String(type) === '2') {
      data2.value = val as Array<Table2Row>
      data1.value = []
    }
  },
  { immediate: true }
)

const createRow = (type: '1' | '2'): InitialTestTimeAnalysisRow =>
  type === '1'
    ? {
        userCount: '',
        minimum: '',
        average: '',
        maximum: '',
        successRate: '',
        failureRate: ''
      }
    : { testCount: '', userCount: '', responseTime: '', testResult: '' }

const handleTypeChange = (val: string | number | boolean | undefined) => {
  const newType = String(val ?? '')
  emit('update:type', newType)
  // 切换时同步对应数组当前数据，不清空（沿源行为）
  emit(
    'update:modelValue',
    newType === '1' ? [...data1.value] : [...data2.value]
  )
}

const addRow = (afterIndex: number) => {
  if (String(props.type) === '1') {
    const newRow = createRow('1') as Table1Row
    if (afterIndex < 0) {
      data1.value.push(newRow)
    } else {
      data1.value.splice(afterIndex + 1, 0, newRow)
    }
    emit('update:modelValue', [...data1.value])
  } else {
    const newRow = createRow('2') as Table2Row
    if (afterIndex < 0) {
      data2.value.push(newRow)
    } else {
      data2.value.splice(afterIndex + 1, 0, newRow)
    }
    emit('update:modelValue', [...data2.value])
  }
}

const removeRow = (index: number) => {
  if (String(props.type) === '1') {
    data1.value.splice(index, 1)
    emit('update:modelValue', [...data1.value])
  } else {
    data2.value.splice(index, 1)
    emit('update:modelValue', [...data2.value])
  }
}
</script>

<template>
  <div class="edit-table-wrapper">
    <ScRadio
      :model-value="String(props.type)"
      :radio-options="tableTypeOptions"
      class="table-type-radio"
      @update:model-value="handleTypeChange"
    />
    <!-- 类型1表格 -->
    <template v-if="String(props.type) === '1'">
      <table class="edit-table" border="1">
        <thead>
          <tr v-if="props.formData.testCase">
            <th colspan="7" class="th-center th-title">
              {{ props.formData.testCase }}
            </th>
          </tr>
          <tr>
            <th rowspan="2" class="th-center">用户数</th>
            <th colspan="3" class="th-center">响应时间：秒(s)</th>
            <th colspan="2" class="th-center">事务通过率</th>
            <th rowspan="2" class="th-center th-op">操作</th>
          </tr>
          <tr>
            <th class="th-center">最小值</th>
            <th class="th-center">平均值</th>
            <th class="th-center">最大值</th>
            <th class="th-center">成功</th>
            <th class="th-center">失败</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="data1.length === 0">
            <td colspan="7" class="td-empty">暂无数据，请点击 + 添加行</td>
          </tr>
          <tr v-for="(row, index) in data1" :key="index">
            <td>
              <ScInput
                v-model="row.userCount"
                type="number"
                placeholder="用户数"
                size="small"
              />
            </td>
            <td>
              <ScInput
                v-model="row.minimum"
                type="number"
                placeholder="最小值"
                size="small"
              />
            </td>
            <td>
              <ScInput
                v-model="row.average"
                type="number"
                placeholder="平均值"
                size="small"
              />
            </td>
            <td>
              <ScInput
                v-model="row.maximum"
                type="number"
                placeholder="最大值"
                size="small"
              />
            </td>
            <td>
              <ScInput
                v-model="row.successRate"
                placeholder="成功"
                size="small"
              />
            </td>
            <td>
              <ScInput
                v-model="row.failureRate"
                placeholder="失败"
                size="small"
              />
            </td>
            <td class="td-op">
              <ScButton
                type="primary"
                :icon="Plus"
                circle
                size="small"
                @click="addRow(index)"
              />
              <ScButton
                type="danger"
                :icon="Minus"
                circle
                size="small"
                @click="removeRow(index)"
              />
            </td>
          </tr>
        </tbody>
      </table>
      <div v-if="data1.length === 0" class="add-btn-row">
        <ScButton type="primary" :icon="Plus" size="small" @click="addRow(-1)">
          添加行
        </ScButton>
      </div>
    </template>
    <!-- 类型2表格 -->
    <template v-else-if="String(props.type) === '2'">
      <table class="edit-table" border="1">
        <thead>
          <tr v-if="props.formData.testCase">
            <th colspan="5" class="th-center th-title">
              {{ props.formData.testCase }}
            </th>
          </tr>
          <tr>
            <th class="th-center">次数</th>
            <th class="th-center">用户数</th>
            <th class="th-center">响应时间 Time：秒(s)</th>
            <th class="th-center">测试结果</th>
            <th class="th-center th-op">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="data2.length === 0">
            <td colspan="5" class="td-empty">暂无数据，请点击 + 添加行</td>
          </tr>
          <tr v-for="(row, index) in data2" :key="index">
            <td>
              <ScInput
                v-model="row.testCount"
                type="number"
                placeholder="次数"
                size="small"
              />
            </td>
            <td>
              <ScInput
                v-model="row.userCount"
                type="number"
                placeholder="用户数"
                size="small"
              />
            </td>
            <td>
              <ScInput
                v-model="row.responseTime"
                type="number"
                placeholder="响应时间"
                size="small"
              />
            </td>
            <td>
              <ScSelect
                v-model="row.testResult"
                :options="testResultOptions"
                placeholder="测试结果"
                size="small"
              />
            </td>
            <td class="td-op">
              <ScButton
                type="primary"
                :icon="Plus"
                circle
                size="small"
                @click="addRow(index)"
              />
              <ScButton
                type="danger"
                :icon="Minus"
                circle
                size="small"
                @click="removeRow(index)"
              />
            </td>
          </tr>
        </tbody>
      </table>
      <div v-if="data2.length === 0" class="add-btn-row">
        <ScButton type="primary" :icon="Plus" size="small" @click="addRow(-1)">
          添加行
        </ScButton>
      </div>
    </template>
  </div>
</template>

<style lang="scss" scoped>
.edit-table-wrapper {
  width: 100%;
}

.table-type-radio {
  margin-bottom: 12px;
}

.edit-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
  font-size: 13px;
}

.edit-table th,
.edit-table td {
  border: 1px solid #dcdfe6;
  padding: 6px 8px;
  text-align: center;
  vertical-align: middle;
}

.edit-table thead th {
  background-color: #f5f7fa;
  color: #606266;
  font-weight: 600;
}

.th-center {
  text-align: center;
}

.th-title {
  background-color: #ebeef5;
  font-size: 14px;
}

.th-op {
  width: 80px;
}

.td-op {
  white-space: nowrap;
  width: 80px;
}

.td-op .el-button + .el-button,
.td-op .sc-button + .sc-button {
  margin-left: 4px;
}

.td-empty {
  color: #909399;
  padding: 16px 0;
}

.add-btn-row {
  margin-top: 8px;
  text-align: left;
}

/* 让输入控件在单元格内撑满 */
.edit-table :deep(.el-input__wrapper) {
  box-shadow: none;
  padding: 0 4px;
}

.edit-table :deep(.el-input__inner) {
  text-align: center;
}
</style>
