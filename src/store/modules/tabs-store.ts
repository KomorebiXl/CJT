import { defineStore } from 'pinia'
import type { RouteLocationNormalized } from 'vue-router'

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

  function addView(route: RouteLocationNormalized) {
    if (route.meta?.hidden) return
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
    addView,
    delView,
    delOtherViews,
    delLeftViews,
    delRightViews,
    delAllViews,
    delProjectProcessViews
  }
})
