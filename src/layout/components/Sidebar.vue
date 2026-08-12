<script setup lang="ts">
import { useGenerateRoutesStore } from '@/store/modules/router-store.ts'
import { useLayoutStore } from '../composables/useLayout'
import SidebarMenuItem from './SidebarMenuItem.vue'
import type { ScRouteRecordRaw } from 'vue-router'
import logo from '@/assets/images/logo.png'
import type { MenuInstance } from 'element-plus'

const layoutStore = useLayoutStore()
const generateRoutesStore = useGenerateRoutesStore()
const route = useRoute()

const appTitle = import.meta.env.VITE_APP_TITLE

// 当前激活菜单：优先取 meta.activeMenu（用于详情页高亮父菜单），否则取当前路径
const activeMenu = computed(() => {
  const { activeMenu } = route.meta as {
    activeMenu?: string
    noCache?: boolean
  }
  return activeMenu || route.path
})

// 过滤掉 hidden 的顶级路由
const visibleRoutes = computed(() => {
  return generateRoutesStore.routers.sidebarRouters.filter(
    r => !(r as ScRouteRecordRaw).hidden
  )
})

const menuRef = useTemplateRef<MenuInstance>('menuRef')
const isAdjusting = ref(false)

const activeAncestorChain = computed(() => {
  const parts = activeMenu.value.split('/').filter(Boolean)
  const chain: string[] = []
  let path = ''
  for (const p of parts) {
    path += `/${p}`
    chain.push(path)
  }
  return chain
})

const handleMenuOpen = (index: string) => {
  if (isAdjusting.value) return // 上一轮还没修完，先不理新的触发
  const chain = activeAncestorChain.value
  const pos = chain.indexOf(index)
  if (pos === -1 || pos + 1 >= chain.length - 1) return
  isAdjusting.value = true
  nextTick(() => {
    menuRef.value?.open(chain[pos + 1])
    // 再等一轮 DOM 更新彻底落定，才解锁——这里是关键，只等一次 nextTick 不够保险
    nextTick(() => {
      isAdjusting.value = false
    })
  })
}
</script>

<template>
  <el-aside
    class="sidebar"
    :class="{ 'is-collapsed': layoutStore.isCollapsed }"
  >
    <div class="sidebar-logo">
      <img :src="logo" class="logo-icon" alt="logo" />
      <transition name="logo-fade">
        <span v-if="!layoutStore.isCollapsed" class="logo-title">
          {{ appTitle }}
        </span>
      </transition>
    </div>
    <el-scrollbar class="sidebar-menu-wrap">
      <el-menu
        ref="menuRef"
        :default-active="activeMenu"
        :collapse="layoutStore.isCollapsed"
        :collapse-transition="false"
        unique-opened
        router
        class="sidebar-menu"
        @open="handleMenuOpen"
      >
        <!-- prettier-ignore -->
        <SidebarMenuItem
          v-for="route in visibleRoutes"
          :key="route.path"
          :item="( route as ScRouteRecordRaw )"
          :base-path="route.path"
        />
      </el-menu>
    </el-scrollbar>
  </el-aside>
</template>

<style scoped>
/* ---- 侧边栏容器 ---- */
.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  z-index: 1001;
  width: 220px;
  display: flex;
  flex-direction: column;
  background-color: var(--sidebar-bg);
  transition: width 0.3s ease;
  overflow: hidden;
}

.sidebar.is-collapsed {
  width: 64px;
}

/* ---- Logo 区域 ---- */
.sidebar-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  height: 60px;
  padding: 0 18px;
  border-bottom: 1px solid var(--sidebar-divider);
  flex-shrink: 0;
  overflow: hidden;
  white-space: nowrap;
}

.logo-icon {
  width: 28px;
  height: 28px;
  flex-shrink: 0;
}

.logo-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--sidebar-text);
}

.logo-fade-enter-active,
.logo-fade-leave-active {
  transition: opacity 0.2s ease;
}
.logo-fade-enter-from,
.logo-fade-leave-to {
  opacity: 0;
}

/* ---- 菜单滚动区 ---- */
.sidebar-menu-wrap {
  flex: 1;
}

.sidebar-menu {
  border-right: none;
  width: 100% !important;
  background-color: transparent !important;
}

/* ---- 覆盖 Element Plus el-menu 深色样式 ---- */

/* 菜单项通用文字色 */
:deep(.el-menu-item),
:deep(.el-sub-menu__title) {
  color: var(--sidebar-text-muted);
  background-color: transparent !important;
}

/* 菜单项图标色 */
:deep(.el-menu-item .el-icon),
:deep(.el-sub-menu__title .el-icon) {
  color: var(--sidebar-text-muted);
}

/* hover 状态 */
:deep(.el-menu-item:hover),
:deep(.el-sub-menu__title:hover) {
  color: var(--sidebar-text);
  background-color: rgba(255, 255, 255, 0.06) !important;
}

:deep(.el-menu-item:hover .el-icon),
:deep(.el-sub-menu__title:hover .el-icon) {
  color: var(--sidebar-text);
}

/* 激活状态 */
:deep(.el-menu-item.is-active) {
  color: var(--sidebar-active-text) !important;
  background-color: var(--sidebar-active-bg) !important;
  border-radius: 6px;
  box-shadow: inset 3px 0 0 var(--sidebar-active-text);
}

:deep(.el-menu-item.is-active .el-icon) {
  color: var(--sidebar-active-text) !important;
}

/* 子菜单展开后的背景 */
:deep(.el-sub-menu .el-menu) {
  background-color: transparent !important;
}

/* 折叠箭头色 */
:deep(.el-sub-menu__icon-arrow) {
  color: var(--sidebar-text-muted);
}

/* 折叠状态下 tooltip 弹出菜单样式 */
:deep(.el-menu--collapse .el-menu-item),
:deep(.el-menu--collapse .el-sub-menu__title) {
  justify-content: center;
}

/* 子菜单缩进线 */
:deep(.el-menu--inline) {
  border-left: 1px solid var(--sidebar-divider);
  margin-left: 20px;
}
</style>

<style lang="scss" scoped>
.sidebar-menu {
  user-select: none;
}
</style>
