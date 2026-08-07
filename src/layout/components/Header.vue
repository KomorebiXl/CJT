<script setup lang="ts">
import { useLayoutStore } from '../composables/useLayout'
import { useUserStore } from '@/store/modules/user-store.ts'
import { useScopeStore } from '@/store/modules/scope-store.ts'
import { useProjectProcessScope } from '@/hooks/useProjectProcessScope'
import {
  Expand,
  Fold,
  FullScreen,
  ScaleToOriginal,
  SwitchButton,
  User,
  CircleClose
} from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const layoutStore = useLayoutStore()
const userStore = useUserStore()
const scopeStore = useScopeStore()
const { closeProjectProcess } = useProjectProcessScope()

const breadcrumbs = computed(() => {
  const matched = route.matched.filter(item => item.meta?.title)
  return matched
    .filter((item, index, arr) => {
      // 过滤掉 title 与下一项相同的重复父级（后端动态路由 Layout 包裹场景）
      return (
        index === arr.length - 1 ||
        item.meta.title !== arr[index + 1].meta.title
      )
    })
    .map(item => ({
      title: item.meta.title as string,
      path: item.path
    }))
})

const handleBreadcrumbClick = (path: string, isLast: boolean) => {
  if (!isLast) router.push(path)
}

const handleProfile = () => router.push('/profile')

const handleLogout = () => {
  userStore.handleLogout().then(() => {
    router.push('/login')
  })
}

// 关闭当前项目流程：恢复原菜单与权限并跳回来源页
const handleCloseProjectProcess = () => {
  closeProjectProcess(router)
}

// 头像 fallback 首字
const avatarFallback = computed(() => {
  const name = userStore.nickName || userStore.username || '用'
  return name.charAt(0)
})

// 头像图片加载失败时降级显示首字
const handleAvatarError = (e: Event) => {
  const img = e.target as HTMLImageElement
  img.style.display = 'none'
  img.parentElement?.classList.add('is-fallback')
}
</script>

<template>
  <header class="layout-header">
    <div class="header-left">
      <button
        class="icon-btn"
        :title="layoutStore.isCollapsed ? '展开侧边栏' : '折叠侧边栏'"
        @click="layoutStore.toggleSidebar"
      >
        <el-icon :size="18">
          <Expand v-if="layoutStore.isCollapsed" />
          <Fold v-else />
        </el-icon>
      </button>
      <el-breadcrumb separator="›" class="header-breadcrumb">
        <el-breadcrumb-item
          v-for="(crumb, index) in breadcrumbs"
          :key="crumb.path"
          :class="{ 'is-last': index === breadcrumbs.length - 1 }"
          @click="
            handleBreadcrumbClick(crumb.path, index === breadcrumbs.length - 1)
          "
        >
          {{ crumb.title }}
        </el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="header-right">
      <button
        v-if="scopeStore.isProcessCurrent"
        class="icon-btn"
        title="关闭项目流程"
        @click="handleCloseProjectProcess"
      >
        <el-icon :size="18">
          <CircleClose />
        </el-icon>
      </button>
      <button
        class="icon-btn"
        :title="layoutStore.isFullscreen ? '退出全屏' : '进入全屏'"
        @click="layoutStore.toggleFullscreen"
      >
        <el-icon :size="18">
          <FullScreen v-if="!layoutStore.isFullscreen" />
          <ScaleToOriginal v-else />
        </el-icon>
      </button>
      <div class="header-divider" />
      <el-dropdown trigger="click" popper-class="user-dropdown-popper">
        <div class="user-trigger">
          <span class="user-name">{{
            userStore.nickName || userStore.name
          }}</span>
        </div>

        <template #dropdown>
          <div class="user-dropdown-card">
            <div class="dropdown-header">
              <div class="dropdown-avatar">
                <img
                  v-if="userStore.avatar"
                  :src="userStore.avatar"
                  alt="avatar"
                  class="avatar-img"
                  @error="handleAvatarError"
                />
                <span class="avatar-text">{{ avatarFallback }}</span>
              </div>
            </div>

            <div class="dropdown-actions">
              <div class="action-card" @click="handleProfile">
                <el-icon :size="20"><User /></el-icon>
                <span>个人信息</span>
              </div>
              <div class="action-card is-danger" @click="handleLogout">
                <el-icon :size="20"><SwitchButton /></el-icon>
                <span>退出登录</span>
              </div>
            </div>
          </div>
        </template>
      </el-dropdown>
    </div>
  </header>
</template>

<style lang="scss" scoped>
.layout-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 54px;
  padding: 0 16px;
  background-color: var(--topbar-bg);
  border-bottom: 1px solid var(--topbar-border);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
  flex-shrink: 0;
  z-index: 10;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}
.header-breadcrumb {
  font-size: 13px;
  :deep(.el-breadcrumb__item) {
    cursor: pointer;
    .el-breadcrumb__inner {
      color: var(--topbar-text-muted);
      font-weight: 400;
      transition: color 0.15s;
      &:hover {
        color: var(--tab-active-color);
      }
    }
    &.is-last .el-breadcrumb__inner {
      color: var(--topbar-text);
      cursor: default;
      &:hover {
        color: var(--topbar-text);
      }
    }
  }
  :deep(.el-breadcrumb__separator) {
    color: var(--topbar-text-muted);
    margin: 0 6px;
  }
}

.header-right {
  display: flex;
  align-items: center;
  gap: 4px;
}
.header-divider {
  width: 1px;
  height: 20px;
  background-color: var(--topbar-border);
  margin: 0 6px;
}

.icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border: none;
  background: transparent;
  border-radius: 6px;
  color: var(--topbar-text-muted);
  cursor: pointer;
  transition:
    background-color 0.15s,
    color 0.15s;
  &:hover {
    background-color: var(--tab-active-bg);
    color: var(--topbar-text);
  }
  &:active {
    background-color: var(--topbar-border);
  }
}
.user-trigger {
  display: flex;
  align-items: center;
  padding: 4px 8px;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.15s;
  &:hover {
    background-color: var(--tab-active-bg);
  }
  &:focus {
    outline: none;
  }
}
.user-name {
  font-size: 13px;
  color: var(--topbar-text);
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

:global(.user-dropdown-popper) {
  padding: 0 !important;
  border-radius: 10px !important;
  overflow: hidden;
  min-width: 200px !important;
}
.user-dropdown-card {
  padding: 16px 16px 12px;
  .dropdown-header {
    display: flex;
    justify-content: center;
    padding-bottom: 12px;
    border-bottom: 1px solid var(--topbar-border);
    margin-bottom: 12px;
  }
  .dropdown-avatar {
    position: relative;
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background: var(--tab-active-color);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    overflow: hidden;
    .avatar-img {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .avatar-text {
      color: #fff;
      font-size: 20px;
      font-weight: 500;
    }
  }
}

.dropdown-actions {
  display: flex;
  gap: 8px;
}
.action-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 10px 8px;
  border-radius: 8px;
  background: var(--content-bg);
  color: var(--topbar-text);
  cursor: pointer;
  transition:
    background-color 0.15s,
    color 0.15s;
  user-select: none;
  span {
    font-size: 12px;
    line-height: 1;
  }
  &:hover {
    background: var(--tab-active-bg);
    color: var(--tab-active-color);
  }
  &:active {
    background: var(--topbar-border);
  }
  &.is-danger {
    &:hover {
      background: var(--color-danger-bg);
      color: var(--color-danger-text);
    }
  }
}
</style>
