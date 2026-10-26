<script setup lang="ts">
import { useLayoutStore } from './composables/useLayout'
import Sidebar from './components/Sidebar.vue'
import Header from './components/Header.vue'
import TabsBar from './components/TabsBar.vue'
import AppMain from './components/AppMain.vue'
import AiTaskFloatCard from '@/components/AiTaskFloatCard/index.vue'

const layoutStore = useLayoutStore()
</script>

<template>
  <div class="layout-wrapper">
    <Sidebar />
    <div class="layout-main" :style="{ marginLeft: layoutStore.sidebarWidth }">
      <Header />
      <TabsBar />
      <AppMain />
    </div>
    <AiTaskFloatCard />
  </div>
</template>

<style lang="scss" scoped>
.layout-wrapper {
  display: flex;
  height: 100vh;
  overflow: hidden;
  background-color: var(--el-bg-color-page);

  .layout-main {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-width: 0;
    transition: margin-left 0.3s ease;
    overflow: hidden;
  }
}
</style>
