<script setup lang="ts">
import type { UploadFile } from 'element-plus'
import type {
  ScBaseUploadEmits,
  ScBaseUploadProps,
  ScTemplateItem,
  ScUploadFileItem,
  UploadFeedback
} from './scBaseUpload.ts'
import {
  CircleCheckFilled,
  Delete,
  Download,
  Loading,
  WarningFilled
} from '@element-plus/icons-vue'
import { useDownloadFilesStore } from '@/store/modules/download-store.ts'
import { uploadFile, downloadFile, getFileName } from '@/utils/file'
import { ScMessage } from '@/utils/ElUtils'

const props = defineProps<ScBaseUploadProps>()
const emit = defineEmits<ScBaseUploadEmits>()

const fileList = ref<ScUploadFileItem[]>([])
const isUploading = ref(false)
const feedback = ref<UploadFeedback | null>(null)

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

// 成功反馈驻留期间禁用确认按钮，防重复提交；文件列表变化时反馈会被清空，按钮自然恢复
const confirmDisabled = computed(
  () => !fileList.value.length || feedback.value?.type === 'success'
)

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

// ScUploadDragger emit 的 change 事件签名与 el-upload on-change 对齐，这里只需第一个参数
const handleChange = (uploadFile: UploadFile) => {
  if (!uploadFile.raw) return
  if (!props.uploadConfig.multiple) {
    fileList.value = []
  }
  if (fileList.value.find(f => f.uid === uploadFile.uid)) return
  feedback.value = null
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
  if (!fileList.value.length) feedback.value = null
}

const handleConfirm = async () => {
  if (!fileList.value.length || isUploading.value) return
  isUploading.value = true
  feedback.value = null
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
    const response = await doUpload()
    fileList.value.forEach(f => {
      f.status = 'success'
    })
    emit('uploadSuccess', response)

    // 「存在即意图」：配置了 formatSuccessMessage 且返回非空则进入手动关闭模式
    const successMessage = props.uploadConfig.formatSuccessMessage?.(response)
    if (successMessage) {
      feedback.value = { type: 'success', message: successMessage }
    } else {
      ScMessage.success(uploadSuccessMsg.value)
      visible.value = false
    }
  } catch (e: any) {
    const msg = e?.msg ?? e?.message ?? '上传失败，请重试'
    fileList.value.forEach(f => {
      f.status = 'error'
    })
    feedback.value = { type: 'error', message: msg }
  } finally {
    isUploading.value = false
  }
}

const downloadFilesStore = useDownloadFilesStore()

const handleTemplateDownload = async (item?: ScTemplateItem) => {
  if (!props.templateConfig) return
  const fileData = await downloadFilesStore.downloadFilesRequest({
    requestUrl: props.templateConfig.templateUrl,
    requestMethod: props.templateConfig?.requestMethod,
    extraParams: {
      ...(props.uploadExtraParams ?? {}),
      ...(item?.extraParams ?? {})
    }
  })
  // 优先取后端 content-disposition 文件名（getFileName 缺头返回空串），配置名与「标题+模板」依次兜底
  const fileName =
    item?.fileName ||
    getFileName(fileData.headers?.['content-disposition']) ||
    `${dialogTitle.value}模板`
  await downloadFile(fileData, fileName)
}

const handleClosed = () => {
  fileList.value = []
  isUploading.value = false
  feedback.value = null
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

const FEEDBACK_META = {
  success: { icon: CircleCheckFilled, title: '上传成功' },
  error: { icon: WarningFilled, title: '上传失败' }
} as const
</script>

<template>
  <ScDialog
    v-model="visible"
    :title="dialogTitle"
    confirm-text="确认上传"
    :confirm-loading="isUploading"
    :confirm-disabled="confirmDisabled"
    @confirm="handleConfirm"
    @closed="handleClosed"
  >
    <div v-if="templateConfig?.showTemplateDownload" class="template-bar">
      <ScButton
        v-for="tpl in templateConfig.templates"
        :key="tpl.label"
        link
        type="primary"
        :icon="Download"
        @click="handleTemplateDownload(tpl)"
      >
        {{ tpl.label }}
      </ScButton>
      <ScButton
        v-if="!templateConfig.templates?.length"
        link
        type="primary"
        :icon="Download"
        @click="handleTemplateDownload()"
      >
        下载模板
      </ScButton>
    </div>

    <ScUploadDragger
      :accept="uploadConfig.accept"
      :multiple="uploadConfig.multiple ?? false"
      @change="handleChange"
    />

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

    <div
      v-if="feedback"
      class="feedback-block"
      :class="`feedback-block--${feedback.type}`"
    >
      <div class="feedback-block__title">
        <el-icon>
          <component :is="FEEDBACK_META[feedback.type].icon" />
        </el-icon>
        {{ FEEDBACK_META[feedback.type].title }}
      </div>
      <p class="feedback-block__msg">{{ feedback.message }}</p>
    </div>
  </ScDialog>
</template>

<style lang="scss" scoped>
@use './scBaseUploadSytle';
</style>
