<script setup lang="ts">
import { useTabsStore } from '@/store/modules/tabs-store.ts'

const tabsStore = useTabsStore()
const cachedViews = computed(() => tabsStore.cachedViews)
</script>

<template>
  <main class="app-main">
    <el-scrollbar class="app-main__scrollbar">
      <div class="app-main__content">
        <router-view v-slot="{ Component, route }">
          <keep-alive :include="cachedViews">
            <component :is="Component" :key="route.fullPath" />
          </keep-alive>
        </router-view>
      </div>
    </el-scrollbar>
  </main>
</template>

<style lang="scss" scoped>
.app-main {
  flex: 1;
  overflow: hidden;
  background-color: var(--content-bg);

  &__scrollbar {
    height: 100%;

    :deep(.el-scrollbar__thumb) {
      background-color: var(--card-border);
      border-radius: 4px;

      &:hover {
        background-color: var(--text-muted);
      }
    }

    :deep(.el-scrollbar__wrap) {
      overflow-x: hidden;
    }

    :deep(.el-scrollbar__view) {
      min-height: 100%;
      display: flex;
      flex-direction: column;
    }
  }

  &__content {
    // h-viewport 锁高卡片的定位锚点，勿删
    position: relative;
    --app-content-gap: 16px;
    padding: var(--app-content-gap);
    flex: 1;
    min-height: 0;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.18s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
