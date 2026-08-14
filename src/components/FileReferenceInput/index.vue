<script setup lang="ts">
import { Picture, Upload, View } from '@element-plus/icons-vue'
import type { Props, Emit } from './types/fileReferenceInput.ts'
import { uuid } from '@/utils/random'
import FileList from './components/FileList.vue'
import ContextMenu from './components/ContextMenu.vue'
import HighlightTextarea from './components/Highlighttextarea.vue'
import type { FileItem } from '@/types/common'
import { base64ToBlob } from '@/utils/file.ts'
import { ScMessage } from '@/utils/ElUtils'
import { useScConfirm } from '@/hooks/useScConfirmDialog.ts'

const props = withDefaults(defineProps<Props>(), {
  placeholder: '请输入内容',
  rows: 10,
  disabled: false
})

const emit = defineEmits<Emit>()

const { scConfirm } = useScConfirm()

// 文本内容
const tempContent = computed({
  get: () => props.modelValue || '',
  set: (val: string) => {
    emit('update:modelValue', val)
  }
})
// 文件列表
const fileList = defineModel<FileItem[]>('fileList', { default: () => [] })
let fileCounter = 0

watch(
  fileList,
  newList => {
    newList.forEach(item => {
      // 判断是否为编辑的数据：有image字段
      if (item.image) {
        // 将Base64转换为Data URL
        item.url = `data:image/${item.fileType};base64,${item.image}`
        // 将Base64转为File对象
        if (!item.file) {
          const blob = base64ToBlob(item.image, `image/${item.fileType}`)
          item.file = new File([blob], item.originalName, {
            type: `image/${item.fileType}`
          })
        }
      }
    })
  },
  { deep: true, immediate: true }
)

/* 右键菜单相关 start */
const contextMenuVisible = ref(false)
const contextMenuPosition = ref({ x: 0, y: 0 })
const showFileSelect = ref(false)
const textareaRef = ref()
const insertToolbarRef = ref<HTMLDivElement>()
let cursorPosition = 0
/* 右键菜单相关 end */

/* 预览相关 start */
const previewVisible = ref(false)
const previewUrl = ref('')
/* 预览相关 end */

/* 上传相关 start */
const fileInputRef = ref<HTMLInputElement>()
const isDragOver = ref(false)

// 校验并追加文件，点击选择和拖拽落下两个入口共用这一段逻辑
const processFiles = (files: FileList | File[]) => {
  const newFiles: FileItem[] = []
  Array.from(files).forEach(file => {
    // 验证文件类型
    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      ScMessage.warning(`${file.name} 不是支持的图片格式`)
      return
    }
    // 生成格式化文件名
    const originalName = file.name
    const nameWithoutExt = originalName.substring(
      0,
      originalName.lastIndexOf('.')
    )
    fileCounter++
    const formattedName = `{{@${nameWithoutExt}_${fileCounter}}}`
    // 创建预览 URL
    const url = URL.createObjectURL(file)

    newFiles.push({
      id: uuid(),
      file,
      url,
      formattedName,
      originalName,
      fileType: file.type.split('/')[1],
      image: undefined
    } as FileItem)
  })
  if (newFiles.length) {
    fileList.value = [...fileList.value, ...newFiles]
  }
}

// 文件上传处理（点击选择）
const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files) {
    processFiles(target.files)
  }
  // 清空 input
  target.value = ''
}

// 拖拽上传处理
const handleDrop = (event: DragEvent) => {
  isDragOver.value = false
  const files = event.dataTransfer?.files
  if (files) {
    processFiles(files)
  }
}
/* 上传相关 end */

// 删除文件
const handleDeleteFile = (id: string) => {
  const index = fileList.value.findIndex(item => item.id === id)
  if (index === -1) return
  const fileItem = fileList.value[index]
  const hasInContent =
    tempContent.value?.includes(fileItem.formattedName) ?? false
  const message = hasInContent
    ? `确定删除 ${fileItem.formattedName} 吗？文本域中的相关内容也会被删除。`
    : `确定删除 ${fileItem.formattedName} 吗？`

  scConfirm({
    title: '删除确认',
    message,
    confirmText: '确定',
    cancelText: '取消'
  })
    .then(() => {
      // 删除文本
      if (tempContent.value) {
        tempContent.value = tempContent.value.replaceAll(
          fileItem.formattedName,
          ''
        )
      }
      // 释放 URL
      if (fileItem.url && fileItem.url.startsWith('blob:')) {
        URL.revokeObjectURL(fileItem.url)
      }
      // 使用解构确保新数组
      fileList.value = [...fileList.value.filter(item => item.id !== id)]
      ScMessage.success('删除成功！')
    })
    .catch(() => {})
}

// 预览图片
const handlePreviewImage = (url: string) => {
  previewUrl.value = url
  previewVisible.value = true
}

// 复制文件名
const handleCopyName = async (name: string) => {
  try {
    await navigator.clipboard.writeText(name)
    ScMessage.success('已复制到剪贴板')
  } catch {
    ScMessage.error('复制失败')
  }
}

// 文件列表是否为空
const hasFiles = computed(() => fileList.value.length > 0)

/* 内容预览相关 start */
const contentPreviewVisible = ref(false)
const PREVIEW_TOKEN_REG = /\{\{@[^{}]+\}\}/g

interface PreviewSegment {
  type: 'text' | 'image'
  text: string
  file?: FileItem
}

// 把文本内容按占位符切段：普通文字原样展示，占位符替换成对应的真实图片
// 找不到匹配文件的占位符（比如图片已被删除）仍按文字展示，避免内容丢失
const previewSegments = computed<PreviewSegment[]>(() => {
  const content = tempContent.value || ''
  const segments: PreviewSegment[] = []
  let lastIndex = 0

  for (const match of content.matchAll(PREVIEW_TOKEN_REG)) {
    const matchedText = match[0]
    const index = match.index ?? 0
    if (index > lastIndex) {
      segments.push({ type: 'text', text: content.slice(lastIndex, index) })
    }
    const file = fileList.value.find(item => item.formattedName === matchedText)
    segments.push(
      file
        ? { type: 'image', text: matchedText, file }
        : { type: 'text', text: matchedText }
    )
    lastIndex = index + matchedText.length
  }
  if (lastIndex < content.length) {
    segments.push({ type: 'text', text: content.slice(lastIndex) })
  }
  return segments
})

const handleOpenContentPreview = () => {
  contentPreviewVisible.value = true
}
/* 内容预览相关 end */

// 右键菜单处理
const handleContextMenu = (event: MouseEvent) => {
  event.preventDefault()
  const textarea = textareaRef.value?.getTextareaEl()
  if (textarea) {
    cursorPosition = textarea.selectionStart
  }
  contextMenuPosition.value = { x: event.clientX, y: event.clientY }
  contextMenuVisible.value = true
  showFileSelect.value = false
}

// 工具栏“插入图片引用”按钮：直接打开选图面板，不用非得右键才能发现
const handleOpenInsertPanel = () => {
  if (!hasFiles.value) {
    ScMessage.info('请先上传图片，再插入引用')
    return
  }
  const textarea = textareaRef.value?.getTextareaEl()
  if (textarea) {
    cursorPosition = textarea.selectionStart
  }
  const rect = insertToolbarRef.value?.getBoundingClientRect()
  if (rect) {
    contextMenuPosition.value = { x: rect.left, y: rect.bottom + 6 }
  }
  contextMenuVisible.value = true
  showFileSelect.value = true
}

// 关闭右键菜单
const closeContextMenu = () => {
  contextMenuVisible.value = false
  showFileSelect.value = false
}

// 复制操作
const handleCopyText = () => {
  const textarea = textareaRef.value?.getTextareaEl()
  if (!textarea) return
  const selectedText = textarea.value.substring(
    textarea.selectionStart,
    textarea.selectionEnd
  )
  if (selectedText) {
    navigator.clipboard
      .writeText(selectedText)
      .then(() => {
        ScMessage.success('已复制')
      })
      .catch(() => {
        ScMessage.error('复制失败')
      })
  }
  closeContextMenu()
}

// 粘贴操作
const handlePasteText = async () => {
  const textarea = textareaRef.value?.getTextareaEl()
  if (!textarea) return
  try {
    const text = await navigator.clipboard.readText()
    const currentContent = tempContent.value ?? ''
    const before = currentContent.substring(0, cursorPosition)
    const after = currentContent.substring(cursorPosition)
    tempContent.value = before + text + after
    // 移动光标到粘贴内容末尾
    const newPosition = cursorPosition + text.length
    setTimeout(() => {
      if (textarea) {
        textarea.focus()
        textarea.setSelectionRange(newPosition, newPosition)
      }
    }, 0)
    ScMessage.success('已粘贴')
  } catch {
    ScMessage.error('粘贴失败，请检查剪贴板权限')
  }
  closeContextMenu()
}

// 显示文件选择
const handleShowInsert = () => {
  if (!hasFiles.value) return
  showFileSelect.value = true
}

// 插入文件名
const handleInsertFile = (formattedName: string) => {
  const textarea = textareaRef.value?.getTextareaEl()
  if (!textarea) return
  const currentContent = tempContent.value ?? ''
  const before = currentContent.substring(0, cursorPosition)
  const after = currentContent.substring(cursorPosition)
  tempContent.value = before + formattedName + after
  // 关闭菜单
  closeContextMenu()
  // 移动光标到插入内容末尾
  const newPosition = cursorPosition + formattedName.length
  setTimeout(() => {
    if (textarea) {
      textarea.focus()
      textarea.setSelectionRange(newPosition, newPosition)
    }
  }, 0)
}
</script>

<template>
  <div class="file-insertion-textarea">
    <div
      class="upload-section"
      :class="{ 'is-dragover': isDragOver }"
      @dragover.prevent="isDragOver = true"
      @dragleave.prevent="isDragOver = false"
      @drop.prevent="handleDrop"
    >
      <input
        ref="fileInputRef"
        type="file"
        accept="image/jpeg,image/png"
        multiple
        style="display: none"
        @change="handleFileChange"
      />
      <ScButton type="primary" @click="fileInputRef?.click()">
        <el-icon><Upload /></el-icon>
        上传图片
      </ScButton>
      <span class="upload-tip">支持 JPG、PNG 格式，也可以直接拖拽到此处</span>
    </div>

    <div ref="insertToolbarRef" class="editor-toolbar">
      <ScButton size="small" @click="handleOpenInsertPanel">
        <el-icon><Picture /></el-icon>
        插入图片引用
      </ScButton>
      <ScButton size="small" @click="handleOpenContentPreview">
        <el-icon><View /></el-icon>
        预览
      </ScButton>
      <span class="toolbar-tip">也可以右键文本框快速插入</span>
    </div>
    <div class="text-area">
      <HighlightTextarea
        ref="textareaRef"
        v-model="tempContent"
        :rows="props.rows"
        :placeholder="props.placeholder"
        :disabled="props.disabled"
        @contextmenu="handleContextMenu"
      />
    </div>
    <div v-if="hasFiles" class="file-list-section">
      <div class="section-label">已上传图片（{{ fileList.length }}）</div>
      <FileList
        :file-list="fileList"
        :content="tempContent"
        @delete="handleDeleteFile"
        @preview="handlePreviewImage"
        @copy="handleCopyName"
      />
    </div>
    <ContextMenu
      :visible="contextMenuVisible"
      :position="contextMenuPosition"
      :show-file-select="showFileSelect"
      :file-list="fileList"
      :has-files="hasFiles"
      :content="tempContent"
      @copy="handleCopyText"
      @paste="handlePasteText"
      @show-insert="handleShowInsert"
      @insert-file="handleInsertFile"
      @close="closeContextMenu"
    />
    <el-image-viewer
      v-if="previewVisible"
      :url-list="[previewUrl]"
      @close="previewVisible = false"
    />
    <ScDialog
      v-model="contentPreviewVisible"
      title="内容预览"
      :show-footer-operate="false"
    >
      <div
        v-if="tempContent"
        class="preview-content"
        :style="{
          fontSize: '14px',
          lineHeight: '32px',
          color: '#303133',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word'
        }"
      >
        <template v-for="(seg, index) in previewSegments" :key="index">
          <span v-if="seg.type === 'text'">{{ seg.text }}</span>
          <span
            v-else
            class="preview-inline-image"
            :style="{
              backgroundImage: `url(${seg.file?.url})`,
              display: 'inline-block',
              width: '32px',
              height: '32px',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              borderRadius: '4px',
              verticalAlign: 'middle',
              margin: '0 2px',
              cursor: 'pointer'
            }"
            :title="seg.text"
            @click="seg.file && handlePreviewImage(seg.file.url)"
          />
        </template>
      </div>
      <span
        v-else
        class="preview-empty"
        :style="{ fontSize: '13px', color: '#909399' }"
      >
        暂无内容
      </span>
    </ScDialog>
  </div>
</template>

<style lang="scss" scoped>
.file-insertion-textarea {
  display: flex;
  flex-direction: column;
  gap: 10px;

  .upload-section {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 14px;
    border: 1px dashed var(--el-border-color);
    border-radius: 6px;
    transition: all 0.2s;

    &.is-dragover {
      border-color: var(--el-color-primary);
      background: var(--el-color-primary-light-9);
    }

    .upload-tip {
      font-size: 12px;
      color: #909399;
    }
  }

  .editor-toolbar {
    display: flex;
    align-items: center;
    gap: 10px;

    .toolbar-tip {
      font-size: 12px;
      color: #909399;
    }
  }

  .file-list-section {
    .section-label {
      font-size: 13px;
      color: #909399;
      margin-bottom: 8px;
    }
  }
}
</style>
