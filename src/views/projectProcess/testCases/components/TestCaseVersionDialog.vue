<script setup lang="ts">
import type { CaseType } from '../useTestCaseGeneration'
import { useRoute } from 'vue-router'

const visible = defineModel<boolean>({ required: true })
const props = withDefaults(
  defineProps<{
    title: string
    action: 'generate' | 'download'
    disabled?: boolean
    allowAll?: boolean
    contextKey?: string
  }>(),
  { disabled: false, allowAll: false, contextKey: '' }
)
const route = useRoute()
// 版本尚未选择时切换页面或范围，关闭旧选择框，避免把旧操作应用于新范围。
watch(
  () => [route.fullPath, props.contextKey],
  () => {
    visible.value = false
  },
  { flush: 'sync' }
)
const emit = defineEmits<{
  select: [caseType: CaseType]
  all: []
}>()

const select = (caseType: CaseType) => {
  if (props.disabled || !visible.value) return
  visible.value = false
  emit('select', caseType)
}
</script>

<template>
  <ScDialog
    v-model="visible"
    :title="title"
    dialog-width="480px"
    :show-footer-operate="false"
    auto-height
  >
    <div class="version-options">
      <p v-if="action === 'generate'" class="version-hint">
        两种版本均需先提取并确认功能点。页面详情展示详细版，常规版生成后请下载查看。
      </p>
      <button
        type="button"
        class="version-option"
        :disabled="disabled"
        @click="select('detail')"
      >
        <span class="version-title">详细版测试用例</span>
        <span class="version-description">
          按已确认功能点拆分成例，一功能点一条用例，可包含多条测试数据。
        </span>
      </button>
      <button
        type="button"
        class="version-option"
        :disabled="disabled"
        @click="select('simple')"
      >
        <span class="version-title">常规版测试用例</span>
        <span class="version-description">
          一测试项一条用例，合并已确认功能点，数据包含正用例与反用例。
        </span>
      </button>
      <button
        v-if="allowAll && action === 'download'"
        type="button"
        class="version-option"
        :disabled="disabled"
        @click="((visible = false), emit('all'))"
      >
        <span class="version-title">下载全部测试用例（九特性详细版）</span>
        <span class="version-description">
          九特性合并为一个 Word，用户文档集、性能效率保留专用表格格式。
        </span>
      </button>
    </div>
  </ScDialog>
</template>

<style scoped lang="scss">
.version-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.version-hint {
  margin: 0;
  font-size: 13px;
  line-height: 1.6;
  color: var(--el-text-color-secondary);
}
.version-option {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 14px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 6px;
  background: var(--card-bg, #fff);
  text-align: left;
  color: inherit;
  font: inherit;
  cursor: pointer;
  &:hover,
  &:focus-visible {
    border-color: var(--el-color-primary);
  }
  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }
}
.version-title {
  font-weight: 600;
}
.version-description {
  font-size: 13px;
  line-height: 1.6;
  color: var(--el-text-color-secondary);
}
</style>
