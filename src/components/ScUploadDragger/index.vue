<script setup lang="ts">
import type { UploadFile, UploadInstance } from 'element-plus'
import type {
  ScUploadDraggerEmits,
  ScUploadDraggerInstance,
  ScUploadDraggerProps
} from './ScUploadDragger.ts'
import { UploadFilled } from '@element-plus/icons-vue'

const DEFAULT_ACCEPT = [
  '.jpg',
  '.jpeg',
  '.png',
  '.pdf',
  '.doc',
  '.docx',
  '.xls',
  '.xlsx'
]

const props = defineProps<ScUploadDraggerProps>()
const emit = defineEmits<ScUploadDraggerEmits>()

const uploadRef = useTemplateRef<UploadInstance>('uploadRef')

const acceptList = computed(() => props.accept ?? DEFAULT_ACCEPT)

const accept = computed(() => acceptList.value.join(','))

const hintText = computed(() => {
  if (props.hint) return props.hint
  return `仅支持 ${acceptList.value.join(' ')} 格式`
})

const handleChange = (file: UploadFile, fileList: UploadFile[]) => {
  emit('change', file, fileList)
}

// 显式转发 el-upload 的常用实例方法，父组件通过 useTemplateRef 拿到 ScUploadDraggerInstance 后可直接调用
defineExpose<ScUploadDraggerInstance>({
  clearFiles: () => uploadRef.value?.clearFiles(),
  handleRemove: (file: UploadFile) => uploadRef.value?.handleRemove(file)
})
</script>

<template>
  <el-upload
    ref="uploadRef"
    drag
    :accept="accept"
    :multiple="multiple ?? false"
    :auto-upload="false"
    :show-file-list="false"
    :on-change="handleChange"
    class="sc-upload-dragger"
  >
    <div class="sc-upload-dragger__inner">
      <div class="sc-upload-dragger__icon-wrap">
        <el-icon class="sc-upload-dragger__icon"><UploadFilled /></el-icon>
      </div>
      <p class="sc-upload-dragger__text">
        拖拽文件到此处，或 <em>点击上传</em>
      </p>
      <span class="sc-upload-dragger__hint">{{ hintText }}</span>
    </div>
  </el-upload>
</template>

<style scoped lang="scss">
.sc-upload-dragger {
  width: 100%;

  :deep(.el-upload),
  :deep(.el-upload-dragger) {
    width: 100%;
  }

  :deep(.el-upload-dragger) {
    padding: 28px 20px;
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
    background-color: var(--el-color-primary-light-8);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 2px;
  }

  &__icon {
    font-size: 26px;
    color: var(--el-color-primary);
  }

  &__text {
    font-size: 14px;
    color: var(--el-text-color-regular);
    margin: 0;

    em {
      color: var(--el-color-primary);
      font-style: normal;
      font-weight: 500;
    }
  }

  &__hint {
    font-size: 12px;
    color: var(--el-text-color-placeholder);
  }
}
</style>
