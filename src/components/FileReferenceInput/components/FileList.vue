<script setup lang="ts">
import type { FileItem } from '@/types/common'
import { Close, ArrowDown, ArrowUp } from '@element-plus/icons-vue'

interface Props {
  fileList: FileItem[]
  content?: string
}

const props = withDefaults(defineProps<Props>(), {
  content: ''
})

const emit = defineEmits<{
  (e: 'delete', id: string): void
  (e: 'preview', url: string): void
  (e: 'copy', name: string): void
}>()

// 超过这个数量默认折叠，只展示前 N 个
const COLLAPSE_LIMIT = 6
const expanded = ref(false)

const visibleFiles = computed(() =>
  expanded.value ? props.fileList : props.fileList.slice(0, COLLAPSE_LIMIT)
)
const canCollapse = computed(() => props.fileList.length > COLLAPSE_LIMIT)

// 判断某张图片的占位符当前是否已经出现在文本内容里
const isReferenced = (item: FileItem) =>
  !!props.content && props.content.includes(item.formattedName)

const handleDelete = (id: string) => {
  emit('delete', id)
}

const handlePreview = (url: string) => {
  emit('preview', url)
}

const handleCopy = (name: string) => {
  emit('copy', name)
}
</script>

<template>
  <div v-if="props.fileList.length > 0" class="file-list">
    <div class="file-tags">
      <div
        v-for="item in visibleFiles"
        :key="item.id"
        class="file-tag"
        :class="{ 'is-referenced': isReferenced(item) }"
      >
        <img
          :alt="item.formattedName"
          :src="item.url"
          class="tag-thumbnail"
          :title="'预览 ' + item.formattedName"
          @click="handlePreview(item.url)"
        />
        <span
          class="tag-name"
          :title="item.formattedName"
          @click="handleCopy(item.formattedName)"
        >
          {{ item.formattedName }}
        </span>
        <el-icon class="tag-delete" @click="handleDelete(item.id)">
          <Close />
        </el-icon>
      </div>
    </div>

    <div
      v-if="canCollapse"
      class="collapse-toggle"
      @click="expanded = !expanded"
    >
      <template v-if="expanded">
        收起
        <el-icon><ArrowUp /></el-icon>
      </template>
      <template v-else>
        展开全部（共 {{ props.fileList.length }} 张）
        <el-icon><ArrowDown /></el-icon>
      </template>
    </div>
  </div>
</template>

<style scoped lang="scss">
.file-list {
  .file-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .file-tag {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 3px 8px 3px 4px;
    border: 1px solid #dcdfe6;
    border-radius: 999px;
    background: #fff;
    font-size: 13px;
    transition: all 0.2s;

    &.is-referenced {
      border-color: #a0cfff;
      background: #ecf5ff;
    }

    .tag-thumbnail {
      width: 20px;
      height: 20px;
      border-radius: 50%;
      object-fit: cover;
      cursor: pointer;
      flex-shrink: 0;
      transition: transform 0.2s;
      &:hover {
        transform: scale(1.15);
      }
    }

    .tag-name {
      color: #409eff;
      cursor: pointer;
      max-width: 160px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      user-select: none;
      &:hover {
        text-decoration: underline;
      }
    }

    .tag-delete {
      font-size: 13px;
      color: #909399;
      cursor: pointer;
      flex-shrink: 0;
      margin-left: 2px;
      &:hover {
        color: #f56c6c;
      }
    }
  }

  .collapse-toggle {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    margin-top: 8px;
    font-size: 13px;
    color: #409eff;
    cursor: pointer;
    user-select: none;
    &:hover {
      color: #66b1ff;
    }
  }
}
</style>
