<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useTabsStore, type TabView } from '@/store/modules/tabs-store.ts'
import {
  ArrowDown,
  Back,
  Close,
  FolderDelete,
  Operation,
  Refresh,
  Remove,
  Right
} from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()
const tabsStore = useTabsStore()

// 播种须在 watch 注册前：immediate watch 先回填当前页，晚于它播种会把固定标签排到当前页右侧
tabsStore.initAffixTabs(router.getRoutes())

// ---- 监听路由，自动添加 tab ----
watch(
  () => route.path,
  () => tabsStore.addView(route),
  { immediate: true }
)

// ---- tab 点击跳转 ----
function handleTabClick(tab: TabView) {
  if (route.path !== tab.path) {
    router.push(tab.path)
  }
}

// ---- 关闭 tab，并处理跳转 ----
function handleTabClose(e: MouseEvent, tab: TabView) {
  e.stopPropagation()
  const idx = tabsStore.visitedViews.findIndex(v => v.path === tab.path)
  tabsStore.delView(tab)

  // 若关闭的是当前激活页，跳转到相邻 tab
  if (tab.path === route.path) {
    const views = tabsStore.visitedViews
    const next = views[idx] ?? views[idx - 1] ?? views[0]
    if (next) router.push(next.path)
  }
}

// ---- 刷新当前页 ----
function handleRefresh() {
  router.replace({ path: '/redirect' + route.fullPath })
}

// ---- 右键菜单 ----
const contextMenu = ref({
  visible: false,
  x: 0,
  y: 0,
  tab: null as TabView | null
})

function openContextMenu(e: MouseEvent, tab: TabView) {
  e.preventDefault()
  contextMenu.value = { visible: true, x: e.clientX, y: e.clientY, tab }
}

function closeContextMenu() {
  contextMenu.value.visible = false
}

// 核心操作：传入目标 tab 执行对应关闭逻辑
function execAction(action: string, tab: TabView) {
  switch (action) {
    case 'closeCurrent': {
      handleTabClose(new MouseEvent('click'), tab)
      break
    }
    case 'closeOthers': {
      tabsStore.delOtherViews(tab)
      if (route.path !== tab.path) router.push(tab.path)
      break
    }
    case 'closeLeft': {
      tabsStore.delLeftViews(tab)
      const stillExists = tabsStore.visitedViews.some(v => v.path === route.path)
      if (!stillExists) router.push(tab.path)
      break
    }
    case 'closeRight': {
      tabsStore.delRightViews(tab)
      const stillExists = tabsStore.visitedViews.some(v => v.path === route.path)
      if (!stillExists) router.push(tab.path)
      break
    }
    case 'closeAll': {
      tabsStore.delAllViews()
      const first = tabsStore.visitedViews[0]
      if (first) router.push(first.path)
      break
    }
  }
}

// 右键菜单触发：使用右键指定的 tab
function handleContextAction(action: string) {
  const tab = contextMenu.value.tab
  if (!tab) return
  execAction(action, tab)
  closeContextMenu()
}

// 右上角下拉菜单触发：始终基于当前激活的 tab
function handleDropdownAction(action: string) {
  const currentTab = tabsStore.visitedViews.find(v => v.path === route.path)
  if (!currentTab) return
  execAction(action, currentTab)
}

onMounted(() => document.addEventListener('click', closeContextMenu))
onBeforeUnmount(() => document.removeEventListener('click', closeContextMenu))
</script>

<template>
  <div class="tabs-bar">
    <div class="tabs-scroll">
      <div class="tabs-list">
        <div
          v-for="tab in tabsStore.visitedViews"
          :key="tab.path"
          class="tab-item"
          :class="{ 'is-active': tab.path === route.path }"
          @click="handleTabClick(tab)"
          @contextmenu="openContextMenu($event, tab)"
        >
          <span class="tab-dot" />
          <span class="tab-title">{{ (tab.meta?.title as string) || tab.name }}</span>
          <el-icon v-if="!tab.meta?.affix" class="tab-close" @click="handleTabClose($event, tab)">
            <Close />
          </el-icon>
        </div>
      </div>
    </div>
    <div class="tabs-actions">
      <el-tooltip content="刷新当前页" placement="bottom" :show-after="600">
        <div class="action-btn" @click="handleRefresh">
          <el-icon><Refresh /></el-icon>
        </div>
      </el-tooltip>

      <el-dropdown trigger="click" @command="handleDropdownAction">
        <div class="action-btn">
          <el-icon><ArrowDown /></el-icon>
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="closeCurrent">
              <el-icon><Remove /></el-icon>关闭当前
            </el-dropdown-item>
            <el-dropdown-item command="closeOthers">
              <el-icon><Operation /></el-icon>关闭其他
            </el-dropdown-item>
            <el-dropdown-item command="closeLeft">
              <el-icon><Back /></el-icon>关闭左侧
            </el-dropdown-item>
            <el-dropdown-item command="closeRight">
              <el-icon><Right /></el-icon>关闭右侧
            </el-dropdown-item>
            <el-dropdown-item command="closeAll" divided>
              <el-icon><FolderDelete /></el-icon>关闭全部
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
    <!-- 右键上下文菜单（挂载到 body，防止被父容器裁剪） -->
    <Teleport to="body">
      <transition name="ctx-fade">
        <ul
          v-if="contextMenu.visible"
          class="ctx-menu"
          :style="{ left: contextMenu.x + 'px', top: contextMenu.y + 'px' }"
          @click.stop
        >
          <li
            :class="{ disabled: contextMenu.tab?.meta?.affix }"
            @click="!contextMenu.tab?.meta?.affix && handleContextAction('closeCurrent')"
          >
            <el-icon><Remove /></el-icon>关闭当前
          </li>
          <li @click="handleContextAction('closeOthers')">
            <el-icon><Operation /></el-icon>关闭其他
          </li>
          <li @click="handleContextAction('closeLeft')">
            <el-icon><Back /></el-icon>关闭左侧
          </li>
          <li @click="handleContextAction('closeRight')">
            <el-icon><Right /></el-icon>关闭右侧
          </li>
          <li class="divider" @click="handleContextAction('closeAll')">
            <el-icon><FolderDelete /></el-icon>关闭全部
          </li>
        </ul>
      </transition>
    </Teleport>
  </div>
</template>

<style lang="scss" scoped>
$tab-height: 40px;
$tab-radius: 6px;
$transition-base: 0.2s ease;

.tabs-bar {
  display: flex;
  align-items: center;
  height: $tab-height;
  background-color: var(--tabs-bg);
  border-bottom: 1px solid var(--tabs-border);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
  flex-shrink: 0;
  user-select: none;
  position: relative;
  z-index: 10;
  .tabs-scroll {
    flex: 1;
    overflow: hidden;
    min-width: 0;
    .tabs-list {
      display: flex;
      align-items: center;
      height: $tab-height;
      padding: 0 4px;
      gap: 3px;
      overflow-x: auto;
      overflow-y: hidden;
      scroll-behavior: smooth;
      scrollbar-width: none;

      &::-webkit-scrollbar {
        display: none;
      }
      .tab-item {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        height: 28px;
        padding: 0 10px;
        border-radius: $tab-radius;
        cursor: pointer;
        white-space: nowrap;
        flex-shrink: 0;
        color: var(--text-muted);
        transition:
          background-color $transition-base,
          color $transition-base,
          box-shadow $transition-base;
        &:hover {
          background-color: var(--tab-active-bg);
          color: var(--text-primary);

          .tab-close {
            opacity: 1;
            width: 14px;
            margin-left: 0;
          }
        }
        &.is-active {
          background-color: var(--tab-active-bg);
          color: var(--tab-active-color);
          font-weight: 500;
          box-shadow: inset 0 -2px 0 var(--tab-active-color);

          .tab-dot {
            opacity: 1;
            transform: scale(1);
            background-color: var(--tab-active-color);
          }

          .tab-close {
            opacity: 1;
            width: 14px;
            margin-left: 0;
          }
        }
        .tab-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          flex-shrink: 0;
          opacity: 0;
          transform: scale(0);
          transition:
            opacity $transition-base,
            transform $transition-base,
            background-color $transition-base;
        }
        .tab-title {
          font-size: 13px;
          line-height: 1;
          color: inherit;
        }
        .tab-close {
          font-size: 12px;
          width: 0;
          opacity: 0;
          overflow: hidden;
          flex-shrink: 0;
          border-radius: 3px;
          margin-left: -4px;
          transition:
            width $transition-base,
            opacity $transition-base,
            background-color $transition-base;
          color: var(--text-muted);

          &:hover {
            background-color: var(--color-info-bg);
            color: var(--tab-active-color);
          }
        }
      }
    }
  }
  .tabs-actions {
    display: flex;
    align-items: center;
    height: 100%;
    padding: 0 6px;
    gap: 2px;
    border-left: 1px solid var(--tabs-border);
    flex-shrink: 0;
    .action-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 28px;
      height: 28px;
      border-radius: $tab-radius;
      cursor: pointer;
      color: var(--text-muted);
      transition:
        background-color $transition-base,
        color $transition-base;

      &:hover {
        background-color: var(--tab-active-bg);
        color: var(--text-primary);
      }

      .el-icon {
        font-size: 14px;
      }
    }
  }
}
</style>

<style lang="scss">
.ctx-menu {
  position: fixed;
  z-index: 9999;
  min-width: 140px;
  padding: 4px 0;
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: 8px;
  box-shadow:
    0 4px 16px rgba(0, 0, 0, 0.1),
    0 1px 4px rgba(0, 0, 0, 0.06);
  list-style: none;
  margin: 0;
  li {
    display: flex;
    align-items: center;
    gap: 7px;
    padding: 7px 14px;
    font-size: 13px;
    cursor: pointer;
    color: var(--text-primary);
    transition: background-color 0.15s ease;
    .el-icon {
      font-size: 14px;
      color: var(--text-muted);
    }
    &:hover {
      background-color: var(--tab-active-bg);
      color: var(--tab-active-color);
      .el-icon {
        color: var(--tab-active-color);
      }
    }
    &.disabled {
      opacity: 0.4;
      cursor: not-allowed;
      &:hover {
        background-color: transparent;
        color: var(--text-primary);
        .el-icon {
          color: var(--text-muted);
        }
      }
    }
    &.divider {
      border-top: 1px solid var(--tabs-border);
      margin-top: 3px;
      padding-top: 10px;
    }
  }
}
.ctx-fade-enter-active {
  transition:
    opacity 0.12s ease,
    transform 0.12s ease;
}
.ctx-fade-leave-active {
  transition:
    opacity 0.08s ease,
    transform 0.08s ease;
}
.ctx-fade-enter-from,
.ctx-fade-leave-to {
  opacity: 0;
  transform: scale(0.95) translateY(-4px);
}
</style>
