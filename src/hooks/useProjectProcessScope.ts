import type { Router, RouteLocationNormalized, ScRouteRecordRaw } from 'vue-router'
import { useScopeStore } from '@/store/modules/scope-store'
import {
  getProjectIdFromRoute,
  useGenerateProcessRouterStore,
  useGenerateRoutesStore,
  mountProcessRoutes,
  removeProcessRoutes
} from '@/store/modules/router-store'
import { useUserStore } from '@/store/modules/user-store'
import { useTabsStore } from '@/store/modules/tabs-store'
import { PROCESS_PROJECT_ID_KEY, PROJECT_ID_KEY } from '@/constant/globalVariables'
import { sessionStorage } from '@/utils/storage'

/**
 * 项目流程作用域：进入/退出/切换的统一逻辑
 * 进入时快照常规上下文（权限、菜单、来源页）并替换为项目菜单与权限；
 * 退出时恢复快照并卸载流程路由。
 */
export const useProjectProcessScope = () => {
  const enterProjectProcessScope = async (
    to: RouteLocationNormalized,
    fromPath: string,
    router: Router
  ) => {
    const scopeStore = useScopeStore()
    const userStore = useUserStore()
    const generateStore = useGenerateRoutesStore()
    const processStore = useGenerateProcessRouterStore()

    // 仅当未处于项目流程作用域时压栈快照（常规作用域 → 项目流程作用域）
    if (!scopeStore.isProcessCurrent) {
      scopeStore.pushContext(scopeStore.snapshot(fromPath))
    }

    const projectId = getProjectIdFromRoute(to)
    sessionStorage.set(PROCESS_PROJECT_ID_KEY, projectId)

    // 按项目刷新账号权限标识
    await userStore.refreshUserInfo(projectId)
    // 拉取项目菜单并挂载到 projectProcess 父路由
    const processRoutes = await processStore.generateProcessRouter(projectId)
    mountProcessRoutes(router, processRoutes)
    // 侧边栏切换为项目菜单（已带 /projectProcess 前缀）
    generateStore.setSidebarRouters(
      processStore.sidebarRouters as unknown as Array<ScRouteRecordRaw>
    )
  }

  /**
   * 退出项目流程作用域：恢复进入前的权限标识、subjectId、来源路径与侧边栏菜单，并卸载流程路由
   * @returns 进入前的来源页面路径，调用方可用于跳转；非流程作用域返回 null
   */
  const leaveProjectProcessScope = (router: Router): string | null => {
    const scopeStore = useScopeStore()
    const userStore = useUserStore()
    const generateStore = useGenerateRoutesStore()

    if (!scopeStore.isProcessCurrent) return null

    const prev = scopeStore.popContext()
    if (!prev) return null

    userStore.setUserPermission(prev.roles, prev.permissions)
    if (prev.subjectId) {
      sessionStorage.set(PROJECT_ID_KEY, prev.subjectId)
    } else {
      sessionStorage.remove(PROJECT_ID_KEY)
    }
    sessionStorage.remove(PROCESS_PROJECT_ID_KEY)
    removeProcessRoutes(router)
    generateStore.setSidebarRouters(prev.sidebarRouters)
    // 清理残留的项目流程页标签，避免退出后点击标签 404
    useTabsStore().delProjectProcessViews()
    return prev.fromPath
  }

  /** 项目流程页内切换项目：不压栈/弹栈，仅替换项目 id、权限标识与流程菜单 */
  const switchProjectProcessScope = async (
    to: RouteLocationNormalized,
    router: Router
  ) => {
    const userStore = useUserStore()
    const generateStore = useGenerateRoutesStore()
    const processStore = useGenerateProcessRouterStore()

    const projectId = getProjectIdFromRoute(to)
    sessionStorage.set(PROCESS_PROJECT_ID_KEY, projectId)

    // 先卸载旧项目流程路由，再按新项目拉取并挂载
    removeProcessRoutes(router)
    await userStore.refreshUserInfo(projectId)
    const processRoutes = await processStore.generateProcessRouter(projectId)
    mountProcessRoutes(router, processRoutes)
    generateStore.setSidebarRouters(
      processStore.sidebarRouters as unknown as Array<ScRouteRecordRaw>
    )
  }

  /**
   * 关闭当前项目流程（Header 按钮调用）：退出作用域并跳回来源页
   */
  const closeProjectProcess = async (router: Router) => {
    const fromPath = leaveProjectProcessScope(router)
    if (fromPath) {
      await router.push(fromPath)
    }
  }

  return {
    enterProjectProcessScope,
    leaveProjectProcessScope,
    switchProjectProcessScope,
    closeProjectProcess
  }
}
