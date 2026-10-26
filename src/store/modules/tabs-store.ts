import { defineStore } from 'pinia'
import type { RouteLocationNormalized, RouteRecordNormalized } from 'vue-router'
import { useScopeStore } from '@/store/modules/scope-store'

export interface TabView {
  name: string
  path: string
  meta: RouteLocationNormalized['meta']
}

export const useTabsStore = defineStore('tabs', () => {
  const visitedViews = ref<TabView[]>([])

  const cachedViews = computed(() =>
    visitedViews.value.filter(v => v.meta?.keepAlive).map(v => v.name)
  )

  /**
   * 启动时播种固定标签：visitedViews 是内存态，刷新后 route watch 只回填当前页，
   * affix 标签若不从路由表主动播种会消失（如首页）
   */
  function initAffixTabs(routes: RouteRecordNormalized[]) {
    routes
      .filter(r => r.meta?.affix && !r.meta?.hidden)
      .forEach(r => {
        if (visitedViews.value.some(v => v.path === r.path)) return
        visitedViews.value.push({
          name: r.name as string,
          path: r.path,
          meta: r.meta
        })
      })
  }

  function addView(route: RouteLocationNormalized) {
    if (route.meta?.hidden) return
    // 项目流程作用域：固定标签之外只保留当前页，导航即替换、不再追加
    if (useScopeStore().isProcessCurrent) {
      const affixViews = visitedViews.value.filter(v => v.meta?.affix)
      visitedViews.value = [
        ...affixViews,
        { name: route.name as string, path: route.path, meta: route.meta }
      ]
      return
    }
    const exists = visitedViews.value.some(v => v.path === route.path)
    if (!exists) {
      visitedViews.value.push({ name: route.name as string, path: route.path, meta: route.meta })
    }
  }

  function delView(view: TabView) {
    const idx = visitedViews.value.findIndex(v => v.path === view.path)
    if (idx !== -1) visitedViews.value.splice(idx, 1)
  }

  function delOtherViews(view: TabView) {
    visitedViews.value = visitedViews.value.filter(v => v.meta?.affix || v.path === view.path)
  }

  function delLeftViews(view: TabView) {
    const idx = visitedViews.value.findIndex(v => v.path === view.path)
    visitedViews.value = visitedViews.value.filter((v, i) => v.meta?.affix || i >= idx)
  }

  function delRightViews(view: TabView) {
    const idx = visitedViews.value.findIndex(v => v.path === view.path)
    visitedViews.value = visitedViews.value.filter((v, i) => v.meta?.affix || i <= idx)
  }

  function delAllViews() {
    visitedViews.value = visitedViews.value.filter(v => v.meta?.affix)
  }

  /** 移除所有项目流程页（/projectProcess 前缀）标签，退出项目流程作用域时调用 */
  function delProjectProcessViews() {
    visitedViews.value = visitedViews.value.filter(
      v => !v.path.startsWith('/projectProcess')
    )
  }

  return {
    visitedViews,
    cachedViews,
    initAffixTabs,
    addView,
    delView,
    delOtherViews,
    delLeftViews,
    delRightViews,
    delAllViews,
    delProjectProcessViews
  }
})
