<script setup lang="ts">
import { previewGeneratedCodeAPI } from '@/api/systemTools/codeGeneration'
import ScMessage from '@/utils/ElUtils/message.ts'

const modelValue = defineModel<boolean>({ default: false })
const files = ref<Record<string, string>>({})
const activeFile = ref('')
const loading = ref(false)
const currentCode = computed(() => files.value[activeFile.value] ?? '')

const open = async (tableId: number | string) => {
  modelValue.value = true
  loading.value = true
  try {
    const response = await previewGeneratedCodeAPI(tableId)
    files.value = response.data ?? {}
    activeFile.value = Object.keys(files.value)[0] ?? ''
  } finally {
    loading.value = false
  }
}
const copyCurrentFile = async () => {
  if (!currentCode.value) return
  await navigator.clipboard.writeText(currentCode.value)
  ScMessage.success('当前文件内容已复制')
}
defineExpose({ open })
</script>

<template>
  <ScDialog
    v-model="modelValue"
    title="代码预览"
    dialog-width="1000px"
    auto-height
  >
    <div v-loading="loading" class="preview-content">
      <el-tabs v-model="activeFile">
        <el-tab-pane
          v-for="(_, fileName) in files"
          :key="fileName"
          :label="fileName"
          :name="fileName"
        />
      </el-tabs>
      <pre class="code-content">{{ currentCode }}</pre>
    </div>
    <template #footer>
      <ScButton :disabled="!currentCode" @click="copyCurrentFile">
        复制当前文件
      </ScButton>
    </template>
  </ScDialog>
</template>

<style scoped lang="scss">
.preview-content {
  min-height: 480px;
}
.code-content {
  max-height: 540px;
  margin: 0;
  padding: 16px;
  overflow: auto;
  white-space: pre-wrap;
  word-break: break-word;
  background: var(--el-fill-color-light);
  color: var(--el-text-color-primary);
}
</style>
