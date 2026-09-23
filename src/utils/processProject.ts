import type { ProjectManagementData } from '@/types/projectManagement'
import { getProjectManagementDetailAPI } from '@/api/projectManagement-api.ts'
import { useScopeStore } from '@/store/modules/scope-store'
import {
  PROCESS_PROJECT_DETAIL_KEY,
  PROCESS_PROJECT_ID_KEY
} from '@/constant/globalVariables'
import { sessionStorage } from '@/utils/storage'

/**
 * 项目流程作用域的项目详情缓存：
 * 进入/切换项目时由 useProjectProcessScope 预热写入 sessionStorage，
 * 页面统一经 getProcessProjectDetail 读取，避免各页面重复请求详情接口。
 */

// 同一项目的在途请求去重：预热与页面首读并发时只发一次
const inflightMap = new Map<string, Promise<ProjectManagementData | null>>()

const fetchProjectDetail = (projectId: string) => {
  const existing = inflightMap.get(projectId)
  if (existing) return existing
  const promise = getProjectManagementDetailAPI(projectId)
    .then(({ data }) => {
      sessionStorage.set(PROCESS_PROJECT_DETAIL_KEY, data)
      return data
    })
    .catch(() => null)
    .finally(() => inflightMap.delete(projectId))
  inflightMap.set(projectId, promise)
  return promise
}

const getCachedDetail = (projectId: string) => {
  const cached = sessionStorage.get<ProjectManagementData>(
    PROCESS_PROJECT_DETAIL_KEY
  )
  return cached && String(cached.id) === projectId ? cached : null
}

/** 读取当前流程作用域的项目详情（读穿透：缓存未命中或项目不符时拉取一次并回填，失败返回 null） */
export const getProcessProjectDetail =
  async (): Promise<ProjectManagementData | null> => {
    const projectId = sessionStorage.get<string>(PROCESS_PROJECT_ID_KEY)
    if (!projectId) return null
    return getCachedDetail(projectId) ?? fetchProjectDetail(projectId)
  }

/**
 * 进入/切换项目时预热缓存并回填流程项目标识；
 * 同项目已缓存时直接命中，请求失败静默处理（标识置空），不阻塞作用域进入
 */
export const warmProcessProjectDetail = (
  projectId: string
): Promise<ProjectManagementData | null> => {
  const cached = getCachedDetail(projectId)
  const ready = cached ? Promise.resolve(cached) : fetchProjectDetail(projectId)
  return ready.then(detail => {
    syncProcessProject(detail)
    return detail
  })
}

/** 将项目详情回填到流程项目标识（Header 流程项目标签展示用），失败/空详情时清空 */
const syncProcessProject = (detail: ProjectManagementData | null) => {
  useScopeStore().setProcessProject(
    detail ? { code: detail.code, name: detail.name } : null
  )
}

/**
 * 强制刷新流程作用域的项目详情缓存（页面保存项目属性后调用）：
 * 重新拉取并覆写缓存，同步刷新流程项目标识；拉取失败时清掉缓存键，
 * 让下一次读取走读穿透重新拉取，避免服务端已新、缓存长期残留旧快照
 */
export const refreshProcessProjectDetail =
  async (): Promise<ProjectManagementData | null> => {
    const projectId = sessionStorage.get<string>(PROCESS_PROJECT_ID_KEY)
    if (!projectId) return null
    const detail = await fetchProjectDetail(projectId)
    syncProcessProject(detail)
    if (!detail) sessionStorage.remove(PROCESS_PROJECT_DETAIL_KEY)
    return detail
  }

/** 退出项目流程作用域时清理缓存与流程项目标识 */
export const clearProcessProjectDetail = () => {
  sessionStorage.remove(PROCESS_PROJECT_DETAIL_KEY)
  syncProcessProject(null)
}
