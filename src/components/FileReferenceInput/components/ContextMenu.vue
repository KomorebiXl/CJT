<script setup lang="ts">
import type { FileItem } from '@/types/common'

interface Props {
  visible: boolean
  position: { x: number; y: number }
  showFileSelect: boolean
  fileList: FileItem[]
  hasFiles: boolean
  content?: string
}

const props = withDefaults(defineProps<Props>(), {
  content: ''
})

const emit = defineEmits<{
  (e: 'copy'): void
  (e: 'paste'): void
  (e: 'showInsert'): void
  (e: 'insertFile', name: string): void
  (e: 'close'): void
}>()

/* const handleCopy = () => {
  emit('copy')
}

const handlePaste = () => {
  emit('paste')
} */

const handleShowInsert = () => {
  emit('showInsert')
}

const handleInsertFile = (name: string) => {
  emit('insertFile', name)
}

// 选完是否从选图列表里移除——默认关闭（可重复选择同一张图）
const hideInserted = ref(false)

const isReferenced = (item: FileItem) =>
  !!props.content && props.content.includes(item.formattedName)

// 开关打开时，已经在文本内容里出现过的图片就不再展示
// 这是“活的”判断：如果之后把引用从文本里删掉了，下次打开菜单会自动重新出现
const displayFileList = computed(() =>
  hideInserted.value
    ? props.fileList.filter(item => !isReferenced(item))
    : props.fileList
)

// 当前渲染的菜单容器（两种菜单二选一显示，共用同一个 ref）
const menuRef = ref<HTMLElement>()

// 点击菜单以外的地方就关闭
const handleOutsideClick = (event: MouseEvent) => {
  if (menuRef.value && !menuRef.value.contains(event.target as Node)) {
    emit('close')
  }
}

watch(
  () => props.visible,
  visible => {
    if (visible) {
      // 用 nextTick 延后一拍再绑定，避免打开菜单的那次点击
      // 在同一轮事件里冒泡到 document，把刚打开的菜单立刻关掉
      nextTick(() => {
        document.addEventListener('click', handleOutsideClick)
      })
    } else {
      document.removeEventListener('click', handleOutsideClick)
    }
  }
)

onBeforeUnmount(() => {
  document.removeEventListener('click', handleOutsideClick)
})
</script>

<template>
  <Teleport to="body">
    <div
      v-if="visible && !showFileSelect"
      ref="menuRef"
      class="context-menu"
      :style="{ left: position.x + 'px', top: position.y + 'px' }"
      @click.stop
    >
      <!--  <div class="menu-item" @click="handleCopy">
         <span>复制</span>
       </div>
       <div class="menu-item" @click="handlePaste">
         <span>粘贴</span>
       </div> -->
      <div
        class="menu-item"
        :class="{ disabled: !hasFiles }"
        @click="handleShowInsert"
      >
        <span>插入图片</span>
      </div>
    </div>
    <div
      v-if="visible && showFileSelect"
      ref="menuRef"
      class="file-select-menu"
      :style="{ left: position.x + 'px', top: position.y + 'px' }"
      @click.stop
    >
      <div class="menu-header">
        <span>选择要插入的图片</span>
        <label class="menu-header-toggle" @click.stop>
          <ScSwitch v-model="hideInserted" size="small" />
          <span class="toggle-label">选完移除</span>
        </label>
      </div>
      <div class="file-select-list">
        <div
          v-for="item in displayFileList"
          :key="item.id"
          class="file-select-item"
          @click="handleInsertFile(item.formattedName)"
        >
          <img :alt="item.originalName" :src="item.url" class="file-select-thumbnail" />
          <span class="file-select-name">{{ item.formattedName }}</span>
        </div>
        <div v-if="displayFileList.length === 0" class="file-select-empty">
          图片都已插入过了
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped lang="scss">
// 右键菜单样式
.context-menu {
  position: fixed;
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
  padding: 4px 0;
  min-width: 120px;
  z-index: 9999;
  .menu-item {
    padding: 8px 16px;
    cursor: pointer;
    font-size: 14px;
    color: #606266;
    transition: all 0.3s;
    &:hover:not(.disabled) {
      background: #f5f7fa;
      color: #409eff;
    }
    &.disabled {
      color: #c0c4cc;
      cursor: not-allowed;
    }
  }
}
// 文件选择菜单样式
.file-select-menu {
  position: fixed;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 16px rgba(0, 0, 0, 0.2);
  min-width: 240px;
  max-width: 320px;
  z-index: 9999;
  overflow: hidden;
  .menu-header {
    padding: 12px 16px;
    font-size: 14px;
    font-weight: 500;
    color: #303133;
    background: #f5f7fa;
    border-bottom: 1px solid #e4e7ed;
    display: flex;
    align-items: center;
    justify-content: space-between;

    .menu-header-toggle {
      display: flex;
      align-items: center;
      gap: 6px;
      cursor: pointer;

      .toggle-label {
        font-size: 12px;
        font-weight: normal;
        color: #909399;
      }
    }
  }
  .file-select-list {
    max-height: 300px;
    overflow-y: auto;
    padding: 4px 0;

    .file-select-empty {
      padding: 16px;
      text-align: center;
      font-size: 13px;
      color: #909399;
    }
  }
  .file-select-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 8px 16px;
    cursor: pointer;
    transition: all 0.3s;
    &:hover {
      background: #ecf5ff;
      .file-select-name {
        color: #409eff;
      }
    }
    .file-select-thumbnail {
      width: 40px;
      height: 40px;
      object-fit: cover;
      border-radius: 4px;
      flex-shrink: 0;
    }
    .file-select-name {
      flex: 1;
      font-size: 13px;
      color: #606266;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
}
</style>
