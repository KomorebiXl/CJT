<script setup lang="ts" generic="T extends Record<string, any>">
import { Plus } from '@element-plus/icons-vue'
import type { DynamicFormListItem } from './dynamicFormList.ts'
import DynamicFormListCard from './DynamicFormListCard.vue'
import DynamicFormListDialog from './DynamicFormListDialog.vue'

const props = withDefaults(
  defineProps<{
    modelValue: T[]
    items: DynamicFormListItem<T>[]
    /**
     * 可选。不传时组件按 items 自动构建新行（仅覆盖 items 声明过的字段）。
     * 若 T 上存在 items 未覆盖的字段（如 id、隐藏字段），必须显式传入，
     * 否则自动构建出的对象对这些字段而言是残缺的。
     */
    createRow?: () => T
    /** 弹窗标题，默认 { add: '添加', edit: '编辑' } */
    dialogTitle?: { add?: string; edit?: string }
    /** 弹窗宽度，默认 '600px' */
    dialogWidth?: string | number
    /** 空列表提示文案，默认 '暂无数据,点击下方按钮添加' */
    emptyText?: string
    /** 添加按钮文案，默认 '添加' */
    addButtonText?: string
  }>(),
  {
    dialogTitle: () => ({ add: '添加', edit: '编辑' }),
    dialogWidth: '600px',
    emptyText: '暂无数据,点击下方按钮添加',
    addButtonText: '添加'
  }
)

const emit = defineEmits<{
  'update:modelValue': [value: T[]]
  add: [row: T]
  edit: [row: T, index: number]
  remove: [row: T, index: number]
}>()

// 用 WeakMap 给每个行对象分配稳定 key，不污染 T 本身结构
const rowKeyMap = new WeakMap<object, number>()
let keyCounter = 0
const getRowKey = (row: T) => {
  if (!rowKeyMap.has(row)) {
    rowKeyMap.set(row, keyCounter++)
  }
  return rowKeyMap.get(row)!
}

const dialogVisible = ref(false)
const dialogMode = ref<'add' | 'edit'>('add')
const editingIndex = ref(-1)
// shallowRef 避免泛型 T 在模板解包时退化为 UnwrapRef<T> 导致类型不兼容
const dialogInitialRow = shallowRef<T | null>(null)

const dialogTitleText = computed(
  () =>
    (dialogMode.value === 'add'
      ? props.dialogTitle.add
      : props.dialogTitle.edit) ?? '编辑'
)

const openAddDialog = () => {
  dialogMode.value = 'add'
  dialogInitialRow.value = null
  dialogVisible.value = true
}

const openEditDialog = (index: number) => {
  dialogMode.value = 'edit'
  editingIndex.value = index
  dialogInitialRow.value = props.modelValue[index] ?? null
  dialogVisible.value = true
}

defineExpose({ openAddDialog, openEditDialog })

const handleDialogConfirm = (row: T) => {
  if (dialogMode.value === 'add') {
    props.modelValue.push(row)
    emit('add', row)
  } else {
    const index = editingIndex.value
    props.modelValue.splice(index, 1, row)
    emit('edit', row, index)
  }
  emit('update:modelValue', props.modelValue)
}

const handleCardRemove = (index: number) => {
  const [row] = props.modelValue.splice(index, 1)
  emit('remove', row, index)
  emit('update:modelValue', props.modelValue)
}
</script>

<template>
  <div class="dynamic-form-list">
    <DynamicFormListCard
      v-for="(row, index) in modelValue"
      :key="getRowKey(row)"
      :row="row"
      :items="items"
      :index="index"
      @edit="openEditDialog(index)"
      @remove="handleCardRemove(index)"
    >
      <template v-for="(_, name) in $slots" :key="name" #[name]="scope">
        <slot :name="name" v-bind="scope ?? {}" />
      </template>
    </DynamicFormListCard>
    <div v-if="!modelValue.length" class="dynamic-form-list__empty">
      {{ emptyText }}
    </div>
    <div class="dynamic-form-list__footer">
      <ScButton type="primary" :icon="Plus" @click="openAddDialog">
        {{ addButtonText }}
      </ScButton>
    </div>
    <DynamicFormListDialog
      v-model="dialogVisible"
      :mode="dialogMode"
      :initial-row="dialogInitialRow"
      :items="items"
      :create-row="createRow"
      :title="dialogTitleText"
      :width="dialogWidth"
      @confirm="handleDialogConfirm"
    />
  </div>
</template>

<style scoped lang="scss">
.dynamic-form-list {
  display: flex;
  flex-direction: column;
  gap: 12px;

  &__empty {
    padding: 8px 0;
    font-size: 14px;
    color: var(--el-text-color-secondary);
    text-align: center;
  }

  &__footer {
    display: flex;
    justify-content: center;
  }
}
</style>
