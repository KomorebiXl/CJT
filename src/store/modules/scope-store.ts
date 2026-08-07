import type { ScRouteRecordRaw } from 'vue-router'
import { PROCESS_PROJECT_ID_KEY, PROJECT_ID_KEY } from '@/constant/globalVariables'
import { sessionStorage } from '@/utils/storage'
import { useUserStore } from '@/store/modules/user-store'
import { useGenerateRoutesStore } from '@/store/modules/router-store'

export interface PermissionContext {
  /** 作用域标识：'normal' 表示常规作用域，'projectProcess' 表示项目流程作用域 */
  key: string
  roles: Array<string>
  permissions: Array<string>
  /** 进入前的全局 subjectId（恢复时写回 PROJECT_ID_KEY） */
  subjectId: string | null
  /** 当前项目流程绑定的项目 id（退出时清除 PROCESS_PROJECT_ID_KEY 用） */
  processProjectId: string | null
  /** 进入项目流程前的来源页面路径，关闭流程时跳回 */
  fromPath: string
  sidebarRouters: Array<ScRouteRecordRaw>
}

export const useScopeStore = defineStore('scope', () => {
  const contexts = ref<Array<PermissionContext>>([])

  /** 当前是否处于项目流程作用域（进入时置 true，退出时置 false） */
  const isProcessCurrent = ref(false)

  /** 快照当前常规上下文（进入项目流程作用域前调用） */
  const snapshot = (fromPath: string): PermissionContext => {
    const userStore = useUserStore()
    const generateStore = useGenerateRoutesStore()
    return {
      key: 'normal',
      roles: [...userStore.roles],
      permissions: [...userStore.permissions],
      subjectId: sessionStorage.get<string>(PROJECT_ID_KEY),
      processProjectId: sessionStorage.get<string>(PROCESS_PROJECT_ID_KEY),
      fromPath,
      sidebarRouters: [...generateStore.routers.sidebarRouters]
    }
  }

  const pushContext = (ctx: PermissionContext) => {
    contexts.value.push(ctx)
    isProcessCurrent.value = true
  }

  const popContext = () => {
    const prev = contexts.value.pop()
    if (contexts.value.length === 0) isProcessCurrent.value = false
    return prev
  }

  const reset = () => {
    contexts.value = []
    isProcessCurrent.value = false
  }

  return {
    contexts,
    isProcessCurrent,
    snapshot,
    pushContext,
    popContext,
    reset
  }
})
