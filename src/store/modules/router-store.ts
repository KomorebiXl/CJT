import type { PermissionState, RouterData } from '@/router'
import type {
  Router,
  RouteLocationNormalized,
  ScRouteRecordRaw
} from 'vue-router'
import { staticRoutes } from '@/router/modules/staticRoutes'
import { sessionStorage } from '@/utils/storage'
import {
  PROCESS_PROJECT_ID_KEY,
  PROJECT_ID_KEY
} from '@/constant/globalVariables'
import { getRouters } from '@/api/system/menu-api.ts'
import Layout from '@/layout/index.vue'
import ParentView from '@/layout/components/ParentView/index.vue'
import { parseComponentPath } from '@/utils/routeQuery.ts'

// 对views文件夹下的所有.vue文件进行自动导入
const modules = import.meta.glob('@/views/**/*.vue')

// 项目流程路由的前缀（对应 staticRoutes 中的 projectProcess 父路由）
export const PROJECT_PROCESS_PREFIX = '/projectProcess'

/**
 * @description 从路由中提取项目 id：优先取 query.projectId，其次取当前项目流程作用域绑定的项目 id
 */
export const getProjectIdFromRoute = (
  route: Pick<RouteLocationNormalized, 'query'>
) => {
  const fromQuery = route.query.projectId
  if (typeof fromQuery === 'string' && fromQuery) return fromQuery
  return sessionStorage.get<string>(PROCESS_PROJECT_ID_KEY) ?? ''
}

/**
 * @description 将流程菜单路径统一加上 /projectProcess 前缀，供侧边栏渲染使用
 */
const prefixProcessPath = (
  routes: Array<RouterData>,
  basePath = PROJECT_PROCESS_PREFIX
): Array<RouterData> => {
  return routes.map(item => {
    const fullPath = `${basePath.replace(/\/$/, '')}/${item.path.replace(/^\//, '')}`
    const { query } = parseComponentPath(item.component)
    return {
      ...item,
      path: fullPath,
      meta: query ? { ...item.meta, query } : item.meta,
      children:
        item.children && item.children.length
          ? prefixProcessPath(item.children, fullPath)
          : []
    }
  })
}

export const useGenerateRoutesStore = defineStore('generateRoutes', () => {
  const routers = reactive<PermissionState>({
    routes: [],
    addRoutes: [],
    sidebarRouters: []
  })

  const setRoutes = (routes: Array<ScRouteRecordRaw>) => {
    routers.routes = staticRoutes.concat(routes)
    routers.addRoutes = routes
  }

  const setSidebarRouters = (routes: Array<ScRouteRecordRaw>) => {
    routers.sidebarRouters = routes
  }

  const generateRoutes = () => {
    return new Promise<Array<ScRouteRecordRaw>>(async resolve => {
      const subjectId = sessionStorage.get(PROJECT_ID_KEY)
      const { data } = await getRouters(subjectId)
      const sidebarData: Array<ScRouteRecordRaw> = JSON.parse(
        JSON.stringify(data)
      ) as Array<ScRouteRecordRaw>
      const routerData: Array<ScRouteRecordRaw> = JSON.parse(
        JSON.stringify(data)
      ) as Array<ScRouteRecordRaw>
      const sidebarRoutes = filterAsyncRoutes(sidebarData)
      const rewriteRoute = filterAsyncRoutes(routerData, true)
      setRoutes(rewriteRoute)
      setSidebarRouters(staticRoutes.concat(sidebarRoutes))
      resolve(rewriteRoute)
    })
  }

  return {
    routers,
    setRoutes,
    setSidebarRouters,
    generateRoutes
  }
})

const isString = (val: unknown): val is string => {
  return typeof val === 'string'
}

const filterAsyncRoutes = (
  routesMap: Array<ScRouteRecordRaw>,
  type = false,
  depth = 0
) => {
  return routesMap.filter((r: ScRouteRecordRaw) => {
    if (type && r.children) {
      r.children = filterChildren(r.children)
    }
    if (r.component) {
      if (isString(r.component)) {
        if (r.component === 'Layout') {
          // 只有最外层（depth === 0）才是真正需要完整应用外壳的根路由
          // 嵌套在里面的目录节点即便被后端误填成 'Layout'，
          // 也只会当成 ParentView 透传处理，不会再重复渲染一遍
          // 导航栏 / 面包屑 / 标签页
          // @ts-ignore
          r.component = depth === 0 ? Layout : ParentView
        } else {
          const { componentPath, query } = parseComponentPath(r.component)
          if (query) r.meta = { ...r.meta, query }
          const view = loadView(componentPath)
          r.component = view || (() => import('@/views/error/404.vue'))
        }
      }
    }
    if (r.children !== null && r.children && r.children.length) {
      r.children = filterAsyncRoutes(r.children, type, depth + 1) // 递归时深度 +1
    } else {
      if (!r.children || r.children.length === 0) {
        delete r.children
      }
    }
    return true
  })
}

const filterChildren = (
  childrenMap: Array<ScRouteRecordRaw>,
  lastRouter?: ScRouteRecordRaw
) => {
  let children: Array<ScRouteRecordRaw> = []
  childrenMap.forEach(i => {
    if (lastRouter) {
      i.path = `${lastRouter.path.replace(/\/$/, '')}/${i.path.replace(/^\//, '')}`
      if (i.children && i.children.length) {
        children = children.concat(filterChildren(i.children, i))
        return
      }
    }
    children = children.concat(i)
  })
  return children
}

const loadView = (view: string): (() => Promise<any>) | undefined => {
  const match = Object.keys(modules).find(path =>
    path.includes(`/views/${view}.vue`)
  )
  return match ? modules[match] : undefined
}

export const useGenerateProcessRouterStore = defineStore(
  'generateProcessRouter',
  () => {
    const sidebarRouters = ref<Array<RouterData>>([])

    const setSidebarRouters = (routes: Array<RouterData>) => {
      sidebarRouters.value = routes
    }

    const generateProcessRouter = (subjectId: string) => {
      return new Promise<Array<ScRouteRecordRaw>>(async resolve => {
        const { data } = await getRouters({ isSubjectMenu: '2', subjectId })
        const sidebarData: Array<RouterData> = JSON.parse(
          JSON.stringify(data)
        ) as Array<RouterData>
        // 侧边栏菜单：统一加 /projectProcess 前缀，供菜单跳转使用
        setSidebarRouters(prefixProcessPath(sidebarData))
        // 路由挂载：使用相对路径（不含前缀），由 addRoute('projectProcess', r) 拼成完整路径
        const processSidebarRoutes = generateProcessRoutes(sidebarData)
        addedProcessRouteNames.length = 0
        processSidebarRoutes.forEach(r => {
          if (r.name) addedProcessRouteNames.push(String(r.name))
        })
        resolve(processSidebarRoutes)
      })
    }

    return {
      sidebarRouters,
      generateProcessRouter
    }
  }
)

// 已挂载到 projectProcess 父路由下的子路由名，退出项目流程作用域时用于卸载
const addedProcessRouteNames: Array<string> = []

export const mountProcessRoutes = (
  router: Router,
  routes: Array<ScRouteRecordRaw>
) => {
  routes.forEach(r => {
    router.addRoute('projectProcess', r)
  })
}

export const removeProcessRoutes = (router: Router) => {
  addedProcessRouteNames.forEach(name => {
    if (router.hasRoute(name)) router.removeRoute(name)
  })
  addedProcessRouteNames.length = 0
}

// 将后端返回数据进行处理，生成路由
const generateProcessRoutes = (
  routes: RouterData[],
  basePath = ''
): ScRouteRecordRaw[] => {
  const result: ScRouteRecordRaw[] = []
  routes.forEach(item => {
    if (item.hidden) return
    const fullPath = basePath ? `${basePath}/${item.path}` : item.path
    if (item.component === 'Layout') {
      if (item.children && item.children.length > 0) {
        result.push(...generateProcessRoutes(item.children, fullPath))
      }
    } else {
      const { componentPath: viewName, query } = parseComponentPath(
        item.component
      )
      const meta = query ? { ...item.meta, query } : item.meta
      const componentPath = `/src/views/${viewName}.vue`
      if (modules[componentPath]) {
        result.push({
          path: fullPath,
          name: item.name,
          component: modules[componentPath],
          meta
        } as unknown as ScRouteRecordRaw)
      } else {
        // 组件尚未迁移时兜底为系统 404（挂载在 projectProcess 父路由下，渲染在主 Layout 内）
        console.warn(`组件路径不存在: ${componentPath}，已兜底为 404 页面`)
        result.push({
          path: fullPath,
          name: item.name,
          component: () => import('@/views/error/404.vue'),
          meta
        } as unknown as ScRouteRecordRaw)
      }
      if (item.children && item.children.length > 0) {
        result.push(...generateProcessRoutes(item.children, fullPath))
      }
    }
  })
  return result
}
