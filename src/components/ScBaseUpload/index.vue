<script setup lang="ts">
import type { UploadFile } from 'element-plus'
import type {
  ScBaseUploadEmits,
  ScBaseUploadProps,
  ScUploadFileItem
} from './scBaseUpload.ts'
import {
  Delete,
  Download,
  Loading,
  UploadFilled,
  WarningFilled
} from '@element-plus/icons-vue'
import { useDownloadFilesStore } from '@/store/modules/download-store.ts'
import { uploadFile, downloadFile } from '@/utils/file'
import { ScMessage } from '@/utils/ElUtils'

const props = defineProps<ScBaseUploadProps>()
const emit = defineEmits<ScBaseUploadEmits>()

const fileList = ref<ScUploadFileItem[]>([])
const isUploading = ref(false)
const errorMsg = ref('')

const visible = computed({
  get: () => props.modelValue,
  set: val => emit('update:modelValue', val)
})

const dialogTitle = computed(() => {
  if (props.title) return props.title
  return '文件上传'
})

const uploadSuccessMsg = computed(() => {
  if (props.uploadConfig.successMsg) return props.uploadConfig.successMsg
  return '文件导入成功！'
})

const accept = computed(() => {
  const list = props.uploadConfig.accept ?? [
    '.jpg',
    '.jpeg',
    '.png',
    '.pdf',
    '.doc',
    '.docx',
    '.xls',
    '.xlsx'
  ]
  return list.join(',')
})

const acceptHint = computed(() => {
  const list = props.uploadConfig.accept ?? [
    '.jpg',
    '.jpeg',
    '.png',
    '.pdf',
    '.doc',
    '.docx',
    '.xls',
    '.xlsx'
  ]
  return list.join(' ')
})

const formatFileSize = (size: number): string => {
  const units = ['B', 'KB', 'MB', 'GB']
  let index = 0
  let fileSize = size
  while (fileSize >= 1024 && index < units.length - 1) {
    fileSize /= 1024
    index++
  }
  return `${fileSize.toFixed(2)} ${units[index]}`
}

const getFileExt = (name: string): string => {
  const parts = name.split('.')
  return parts.length > 1 ? parts[parts.length - 1].toUpperCase() : 'FILE'
}

const getExtColor = (name: string): string => {
  const ext = name.split('.').pop()?.toLowerCase() ?? ''
  const colorMap: Record<string, string> = {
    pdf: '#E24B4A',
    doc: '#185FA5',
    docx: '#185FA5',
    xls: '#3B6D11',
    xlsx: '#3B6D11',
    jpg: '#BA7517',
    jpeg: '#BA7517',
    png: '#BA7517'
  }
  return colorMap[ext] ?? '#888780'
}

const handleChange = (uploadFile: UploadFile) => {
  if (!uploadFile.raw) return
  if (!props.uploadConfig.multiple) {
    fileList.value = []
  }
  if (fileList.value.find(f => f.uid === uploadFile.uid)) return
  errorMsg.value = ''
  fileList.value.push({
    uid: uploadFile.uid,
    file: uploadFile.raw,
    name: uploadFile.name,
    size: uploadFile.raw.size,
    status: 'pending'
  })
}

const handleRemove = (uid: number) => {
  fileList.value = fileList.value.filter(f => f.uid !== uid)
  if (!fileList.value.length) errorMsg.value = ''
}

const handleConfirm = async () => {
  if (!fileList.value.length || isUploading.value) return
  isUploading.value = true
  errorMsg.value = ''
  fileList.value.forEach(f => {
    f.status = 'uploading'
  })
  // 优先使用自定义上传函数，否则走默认工具函数
  const doUpload = props.uploadFn
    ? () => props.uploadFn!(fileList.value.map(f => f.file))
    : () =>
        uploadFile(
          props.uploadConfig.uploadUrl,
          fileList.value.map(f => f.file),
          props.uploadExtraParams
        )
  try {
    await doUpload()
    fileList.value.forEach(f => {
      f.status = 'success'
    })
    ScMessage.success(uploadSuccessMsg.value)
    emit('uploadSuccess')
    visible.value = false
  } catch (e: any) {
    const msg = e?.msg ?? e?.message ?? '上传失败，请重试'
    fileList.value.forEach(f => {
      f.status = 'error'
    })
    errorMsg.value = msg
  } finally {
    isUploading.value = false
  }
}

const downloadFilesStore = useDownloadFilesStore()

const handleTemplateDownload = async () => {
  const fileName = `${dialogTitle.value}模板`
  if (props.templateConfig) {
    const fileData = await downloadFilesStore.downloadFilesRequest({
      requestUrl: props.templateConfig.templateUrl,
      requestMethod: props.templateConfig?.requestMethod,
      extraParams: props.uploadExtraParams ?? {}
    })
    await downloadFile(fileData, fileName)
  }
}

const handleClosed = () => {
  fileList.value = []
  isUploading.value = false
  errorMsg.value = ''
}

const STATUS_TAG_TYPE = {
  pending: 'info',
  uploading: 'warning',
  success: 'success',
  error: 'danger'
} as const

const STATUS_LABEL = {
  pending: '待上传',
  uploading: '上传中',
  success: '已完成',
  error: '上传失败'
} as const
</script>

<template>
  <ScDialog
    v-model="visible"
    :title="dialogTitle"
    confirm-text="确认上传"
    :confirm-loading="isUploading"
    :confirm-disabled="!fileList.length"
    @confirm="handleConfirm"
    @closed="handleClosed"
  >
    <div v-if="templateConfig?.showTemplateDownload" class="template-bar">
      <ScButton
        link
        type="primary"
        :icon="Download"
        @click="handleTemplateDownload"
      >
        下载模板
      </ScButton>
    </div>
    <el-upload
      ref="uploadRef"
      :accept="accept"
      :multiple="uploadConfig.multiple ?? false"
      :auto-upload="false"
      :show-file-list="false"
      :on-change="handleChange"
      drag
      class="upload-dragger"
    >
      <div class="upload-dragger__inner">
        <div class="upload-dragger__icon-wrap">
          <el-icon class="upload-dragger__icon"><UploadFilled /></el-icon>
        </div>
        <p class="upload-dragger__text">拖拽文件到此处，或 <em>点击上传</em></p>
        <span class="upload-dragger__hint">仅支持 {{ acceptHint }}格式</span>
      </div>
    </el-upload>
    <transition-group
      v-if="fileList.length"
      name="file-list"
      tag="ul"
      class="file-list"
    >
      <li v-for="item in fileList" :key="item.uid" class="file-item">
        <div
          class="file-item__icon"
          :style="{ backgroundColor: getExtColor(item.name) }"
        >
          <span>{{ getFileExt(item.name) }}</span>
        </div>
        <div class="file-item__info">
          <span class="file-item__name" :title="item.name">{{
            item.name
          }}</span>
          <div class="file-item__meta">
            <span>{{ formatFileSize(item.size) }}</span>
            <el-tag :type="STATUS_TAG_TYPE[item.status]" size="small" round>
              <el-icon v-if="item.status === 'uploading'" class="is-loading"
                ><Loading
              /></el-icon>
              {{ STATUS_LABEL[item.status] }}
            </el-tag>
          </div>
        </div>
        <el-button
          :icon="Delete"
          circle
          text
          size="small"
          :disabled="item.status === 'uploading'"
          class="file-item__delete"
          @click="handleRemove(item.uid)"
        />
      </li>
    </transition-group>

    <div v-if="errorMsg" class="error-block">
      <div class="error-block__title">
        <el-icon><WarningFilled /></el-icon>
        上传失败
      </div>
      <p class="error-block__msg">{{ errorMsg }}</p>
    </div>
  </ScDialog>
</template>

<style scoped lang="scss">
.template-bar {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 12px;
}

.upload-dragger {
  width: 100%;

  :deep(.el-upload),
  :deep(.el-upload-dragger) {
    width: 100%;
  }

  :deep(.el-upload-dragger) {
    padding: 28px 0;
    transition:
      border-color 0.2s,
      background-color 0.2s;

    &:hover {
      border-color: var(--el-color-primary);
      background-color: var(--el-color-primary-light-9);
    }
  }

  &__inner {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
  }

  &__icon-wrap {
    width: 52px;
    height: 52px;
    border-radius: 50%;
    background-color: var(--el-fill-color);
    border: 1px solid var(--el-border-color-lighter);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 2px;
  }

  &__icon {
    font-size: 24px;
    color: var(--el-color-primary);
  }

  &__text {
    font-size: 14px;
    color: var(--el-text-color-regular);

    em {
      color: var(--el-color-primary);
      font-style: normal;
      font-weight: 500;
    }
  }

  &__hint {
    font-size: 12px;
    color: var(--el-text-color-placeholder);
    background-color: var(--el-fill-color-light);
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 20px;
    padding: 2px 12px;
  }
}

.file-list {
  list-style: none;
  margin: 12px 0 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.file-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 6px;
  background-color: var(--el-fill-color-light);
  border: 1px solid var(--el-border-color-lighter);

  &__icon {
    flex-shrink: 0;
    width: 40px;
    height: 40px;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;

    span {
      font-size: 10px;
      font-weight: 700;
      color: #fff;
      letter-spacing: 0.5px;
    }
  }

  &__info {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  &__name {
    font-size: 13px;
    font-weight: 500;
    color: var(--el-text-color-primary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__meta {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }

  &__delete {
    flex-shrink: 0;
  }
}

.error-block {
  margin-top: 12px;
  padding: 10px 14px;
  border-radius: 6px;
  background-color: var(--el-color-danger-light-9);
  border: 1px solid var(--el-color-danger-light-5);

  &__title {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    font-weight: 500;
    color: var(--el-color-danger);
    margin-bottom: 4px;
  }

  &__msg {
    font-size: 12px;
    color: var(--el-color-danger);
    white-space: pre-line;
    line-height: 1.6;
    opacity: 0.85;
    margin: 0;
  }
}

.file-list-enter-active,
.file-list-leave-active {
  transition: all 0.2s ease;
}

.file-list-enter-from,
.file-list-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
