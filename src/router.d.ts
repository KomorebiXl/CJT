import { RouteRecordRaw, RouteMeta } from 'vue-router'

declare module 'vue-router' {
  type ScRouteRecordRaw = RouteRecordRaw & {
    hidden?: boolean
    permissions?: Array<string>
    roles?: Array<string>
    alwaysShow?: boolean
    fullPath?: string
  }

  type ScRouteMeta = RouteMeta & {
    title: string
    icon?: string
    noCache?: boolean
    link?: string
    activeMenu: string
    fullHeight?: boolean
    query?: Record<string, any>
  }
}

export type PermissionState = {
  routes: Array<RouteRecordRaw>
  addRoutes: Array<RouteRecordRaw>
  sidebarRouters: Array<RouteRecordRaw>
}

export type RouterData = {
  path: string
  hidden: boolean
  component: string
  children: Array<RouterData>
  name: string
  meta: {
    icon: string
    menuId: number
    title: string
  }
}
