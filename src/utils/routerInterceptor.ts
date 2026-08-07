import type { Router, RouteLocationNormalized } from 'vue-router'
import { getToken } from './auth'
import { useUserStore } from '@/store/modules/user-store.ts'
import { ElMessage } from 'element-plus'
import { isRelogin } from './request/handler/errorHandler'
import {
  PROJECT_PROCESS_PREFIX,
  getProjectIdFromRoute,
  useGenerateRoutesStore
} from '@/store/modules/router-store.ts'
import { useProjectProcessScope } from '@/hooks/useProjectProcessScope'
import { useScopeStore } from '@/store/modules/scope-store.ts'
import { isHttp } from './validate'
import NProgress from 'nprogress'
import pageLoader from '@/utils/pageLoader'
import { useGlobalStore } from '@/store/modules/global-store.ts'
import { PROCESS_PROJECT_ID_KEY } from '@/constant/globalVariables'
import { sessionStorage } from '@/utils/storage'

const whiteList = new Set(['/login'])

const isProjectProcessPath = (path: string) => path.startsWith(PROJECT_PROCESS_PREFIX)

const isProjectProcessRoute = (route: Pick<RouteLocationNormalized, 'fullPath' | 'path'>) => {
  return isProjectProcessPath(route.fullPath)
}

export const beforeEach = (router: Router) => {
  router.beforeEach(async (to, _from, next) => {
    const scopeStore = useScopeStore()
    const { enterProjectProcessScope, leaveProjectProcessScope, switchProjectProcessScope } =
      useProjectProcessScope()
    const isProcess = isProjectProcessRoute(to)
    NProgress.start()
    if (!useGlobalStore().existLoading) {
      pageLoader.show()
      useGlobalStore().setExistLoading(true)
    }
    if (getToken()) {
      document.title = import.meta.env.VITE_APP_TITLE
      if (to.path === '/login') {
        next({ path: '/' })
        return
      }
      if (useUserStore().roles.length === 0) {
        isRelogin.show = true
        try {
          await useUserStore().handleGetUserInfo()
          isRelogin.show = false
          const accessRoutes = await useGenerateRoutesStore().generateRoutes()
          accessRoutes.forEach(r => {
            if (!isHttp(r.path)) {
              router.addRoute(r)
            }
          })
          // 首次加载：目标为项目流程页时，预加载项目菜单与权限
          if (isProcess) {
            await enterProjectProcessScope(to, _from.fullPath, router)
          }
          next({ ...to, replace: true })
        } catch (error) {
          await useUserStore().handleLogout()
          ElMessage({
            message: String(error),
            type: 'error',
            plain: true
          })
          next({ path: '/' })
        }
      } else {
        // ① 退出项目流程作用域：流程页 → 常规页（含浏览器返回）
        if (
          !isProcess &&
          _from.fullPath.startsWith(PROJECT_PROCESS_PREFIX) &&
          scopeStore.isProcessCurrent
        ) {
          leaveProjectProcessScope(router)
          next({ ...to, replace: true })
          return
        }

        // ② 常规页 → 流程页：进入项目流程作用域
        if (isProcess && !scopeStore.isProcessCurrent) {
          try {
            await enterProjectProcessScope(to, _from.fullPath, router)
            next({ ...to, replace: true })
            return
          } catch (error) {
            console.error('进入项目流程作用域失败', error)
            return next(false)
          }
        }

        // ③ 项目流程页内切换项目：仅替换项目数据，不重复压栈
        if (
          isProcess &&
          scopeStore.isProcessCurrent &&
          getProjectIdFromRoute(to) &&
          getProjectIdFromRoute(to) !== sessionStorage.get(PROCESS_PROJECT_ID_KEY)
        ) {
          try {
            await switchProjectProcessScope(to, router)
            next({ ...to, replace: true })
            return
          } catch (error) {
            console.error('切换项目作用域失败', error)
            return next(false)
          }
        }

        // ④ 已在项目流程作用域内且目标仍为流程页：正常放行
        return next()
      }
    } else {
      if (whiteList.has(to.path)) {
        next()
      } else {
        next(`/login?redirect=${to.fullPath}`)
      }
    }
  })
}

export const afterEach = (router: Router) => {
  router.afterEach(() => {
    if (useGlobalStore().existLoading) pageLoader.hide()
    NProgress.done()
  })
}
