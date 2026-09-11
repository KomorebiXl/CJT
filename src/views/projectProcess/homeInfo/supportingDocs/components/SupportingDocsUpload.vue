<!--支持性文件上传：PDF 双重限制 + 文件别名，确认后 FormData 提交 -->
<script setup lang="ts">
import type { UploadFile } from 'element-plus'
import type { ScUploadDraggerInstance } from '@/components/ScUploadDragger/ScUploadDragger.ts'
import { Delete, Document } from '@element-plus/icons-vue'
import { addSupportingDocsAPI } from '@/api/projectProcess/homeInfo/supportingDocs.ts'
import { safeRequest } from '@/utils/safeRequest.ts'
import { ScMessage } from '@/utils/ElUtils'

const emit = defineEmits<{
  'update-data': []
}>()

const visible = defineModel<boolean>('visible', { required: true })

const uploadRef = useTemplateRef<ScUploadDraggerInstance>('uploadRef')

const fileList = ref<Array<UploadFile>>([])

const fileNickName = ref('')

// 非 PDF 由 ScUploadDragger 统一拦截（accept + change 扩展名复检，选择与拖拽上传同等受限）
const handleChange = (_file: UploadFile, files: Array<UploadFile>) => {
  fileList.value = files
  // 文件别名默认取文件名去扩展名
  const fileName = fileList.value[0]?.name ?? ''
  fileNickName.value = fileName.substring(0, fileName.lastIndexOf('.'))
}

const submitLoading = ref(false)

const handleConfirm = async () => {
  submitLoading.value = true
  const formData = new FormData()
  fileList.value.forEach(item => {
    if (item.raw) formData.append('files', item.raw)
  })
  formData.append('nickName', fileNickName.value)
  const [err] = await safeRequest(addSupportingDocsAPI(formData), {
    message: '文件上传失败'
  })
  submitLoading.value = false
  if (err) return
  ScMessage.success('文件上传成功！')
  visible.value = false
  emit('update-data')
}

// 同步移除上传组件内部文件，避免再次选择时残留项随 change 事件回流
const handleRemove = (file: UploadFile) => {
  fileList.value = fileList.value.filter(item => item.uid !== file.uid)
  uploadRef.value?.handleRemove(file)
}

const handleClosed = () => {
  fileList.value = []
  fileNickName.value = ''
  submitLoading.value = false
  uploadRef.value?.clearFiles()
}
</script>

<template>
  <ScDialog
    v-model="visible"
    title="支持性文件上传"
    :confirm-loading="submitLoading"
    :confirm-disabled="!fileList.length"
    @confirm="handleConfirm"
    @closed="handleClosed"
  >
    <div class="upload-dialog-body">
      <ScUploadDragger
        ref="uploadRef"
        :accept="['.pdf']"
        @change="handleChange"
      />
      <div v-if="fileList.length !== 0" class="file-list-content">
        <div class="file-list-header">
          <span class="file-count">已选文件 ({{ fileList.length }})</span>
        </div>
        <div class="file-list">
          <div v-for="file in fileList" :key="file.uid" class="file-item">
            <div class="file-icon">
              <el-icon :size="20"><Document /></el-icon>
            </div>
            <p class="file-name" :title="file.name">{{ file.name }}</p>
            <div class="file-nick-name">
              <p>文件别名：</p>
              <ScInput
                v-model="fileNickName"
                placeholder="请输入文件别名"
              />
            </div>
            <el-button
              link
              type="danger"
              class="remove-btn"
              @click="handleRemove(file)"
            >
              <el-icon><Delete /></el-icon>
            </el-button>
          </div>
        </div>
      </div>
    </div>
  </ScDialog>
</template>

<style lang="scss" scoped>
.upload-dialog-body {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.file-list-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.file-list-header {
  .file-count {
    font-size: 14px;
    font-weight: 500;
    color: var(--el-text-color-primary);
  }
}

.file-list {
  max-height: 300px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.file-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background-color: var(--el-fill-color-lighter);
  border: 1px solid var(--el-border-color-light);
  border-radius: 8px;

  .file-icon {
    width: 36px;
    height: 36px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
    color: var(--el-color-danger);
    background-color: var(--el-color-danger-light-8);
  }

  .file-name {
    flex: 1;
    min-width: 0;
    margin: 0;
    font-size: 14px;
    font-weight: 500;
    color: var(--el-text-color-primary);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .file-nick-name {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    gap: 8px;

    p {
      margin: 0;
      font-size: 13px;
      color: var(--el-text-color-regular);
      white-space: nowrap;
    }

    // ScInput 默认 width:100%，单行布局下固定宽度避免撑爆
    :deep(.input-container) {
      width: 220px;
    }
  }

  .remove-btn {
    flex-shrink: 0;
    padding: 8px;
  }
}
</style>
