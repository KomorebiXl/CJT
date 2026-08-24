import {
  createMenuAPI,
  deleteMenuAPI,
  getMenuDataAPI
} from '@/api/system/menu-api.ts'
import { ScMessage } from '@/utils/ElUtils'
import type { MenuData, MenuFormData } from '@/types/system/menu'

/** 复制配置弹窗的表单数据 */
export interface MenuCopyFormData {
  menuName: string
  includeChildren: boolean
}

interface SubtreeNode {
  node: MenuData
  depth: number
}

/** 全量平铺菜单列表 */
const fetchMenuList = async () => {
  const { data } = await getMenuDataAPI({
    pageNum: 1,
    pageSize: 999999,
    menuName: '',
    status: ''
  })
  return data
}

/** 收集目标节点及其后代，按深度升序返回，保证父级恒先于子级 */
const collectSubtree = (
  list: Array<MenuData>,
  rootId: string | number,
  includeChildren: boolean
): Array<SubtreeNode> => {
  const root = list.find(item => String(item.menuId) === String(rootId))
  if (!root) {
    throw new Error('原菜单不存在，请刷新列表后重试')
  }
  const result: Array<SubtreeNode> = []
  const childrenMap = new Map<string, Array<MenuData>>()
  if (includeChildren) {
    list.forEach(item => {
      const key = String(item.parentId)
      const group = childrenMap.get(key)
      if (group) {
        group.push(item)
      } else {
        childrenMap.set(key, [item])
      }
    })
  }
  let level = [root]
  let depth = 0
  while (level.length) {
    const next: Array<MenuData> = []
    level.forEach(node => {
      result.push({ node, depth })
      next.push(...(childrenMap.get(String(node.menuId)) ?? []))
    })
    level = next
    depth += 1
  }
  return result
}

/** 从源节点构造新增请求体，仅保留表单字段，剥离 menuId/createTime/children 等 */
const buildCopyPayload = (
  node: MenuData,
  overrides: Partial<MenuFormData> = {}
): MenuFormData => ({
  parentId: node.parentId,
  menuType: node.menuType,
  icon: node.icon,
  subjectLargeType: node.subjectLargeType,
  subjectType: node.subjectType,
  menuName: node.menuName,
  orderNum: node.orderNum,
  isFrame: node.isFrame,
  path: node.path,
  component: node.component,
  perms: node.perms,
  query: node.query,
  isCache: node.isCache,
  visible: node.visible,
  status: node.status,
  ...overrides
})

/** 根节点路由地址在同级下去重；子级挂在新父级下天然不冲突，无需处理 */
const uniquePathAmongSiblings = (
  list: Array<MenuData>,
  parentId: string | number,
  basePath: string
) => {
  if (!basePath) return basePath
  const siblingPaths = new Set(
    list
      .filter(item => String(item.parentId) === String(parentId))
      .map(item => item.path)
  )
  if (!siblingPaths.has(basePath)) return basePath
  let suffix = 1
  while (siblingPaths.has(`${basePath}-${suffix}`)) {
    suffix += 1
  }
  return `${basePath}-${suffix}`
}

/**
 * 一键复制菜单：后端无复制接口，前端组合现有接口实现。
 * 后端新增不回传新 id，且子级需挂到新父级 id 下，
 * 因此按深度分层创建，层末回查 list 按（父级、名称、类型）定位新 id。
 * 失败时可通过回滚（自底向上删除）恢复。
 */
export const useMenuCopy = (options: { onSuccess?: () => void } = {}) => {
  const copyVisible = ref(false)
  const copyFormData = reactive<MenuCopyFormData>({
    menuName: '',
    includeChildren: true
  })
  const copyLoading = ref(false)
  const copyProgress = ref('')
  const rollbackVisible = ref(false)
  const rollbackMessage = ref('')

  let sourceMenuId: string | number = ''
  /** 已创建且回查到新 id 的节点，用于失败回滚 */
  let createdRecords: Array<{ id: string; depth: number }> = []
  /** 已创建但层末尚未回查 id 的节点（回查失败时无法自动回滚） */
  let pendingCreated: Array<{ node: MenuData; payload: MenuFormData }> = []

  const openCopyDialog = (row: MenuData) => {
    sourceMenuId = row.menuId
    copyFormData.menuName = `${row.menuName}-副本`
    copyFormData.includeChildren = true
    copyProgress.value = ''
    copyVisible.value = true
  }

  const handleCopyConfirm = async (data: Record<string, any>) => {
    const { menuName, includeChildren } = data as MenuCopyFormData
    copyLoading.value = true
    copyProgress.value = ''
    createdRecords = []
    pendingCreated = []
    let total = 0
    try {
      const menuList = await fetchMenuList()
      const nodes = collectSubtree(menuList, sourceMenuId, includeChildren)
      total = nodes.length

      const rootNode = nodes[0]!.node
      const rootOverrides: Partial<MenuFormData> = { menuName }
      // 外链地址是完整 URL，追加后缀会破坏链接，保持原样
      if (
        rootNode.menuType !== 'F' &&
        rootNode.isFrame !== '0' &&
        rootNode.path
      ) {
        rootOverrides.path = uniquePathAmongSiblings(
          menuList,
          rootNode.parentId,
          rootNode.path
        )
      }

      /** 旧菜单 id -> 新菜单 id，供下层子级挂载 */
      const idMap = new Map<string, string | number>()
      let done = 0
      let depth = 0
      let levelNodes = nodes.filter(item => item.depth === depth)
      while (levelNodes.length) {
        for (const { node } of levelNodes) {
          const payload = buildCopyPayload(
            node,
            depth === 0 ? rootOverrides : {}
          )
          const newParentId =
            depth === 0 ? node.parentId : idMap.get(String(node.parentId))
          if (newParentId === undefined) {
            throw new Error(
              `菜单「${node.menuName}」的新父级 id 缺失，已中止复制`
            )
          }
          payload.parentId = newParentId
          await createMenuAPI(payload)
          pendingCreated.push({ node, payload })
          done += 1
          copyProgress.value = `（${done}/${total}）`
        }

        // 层末回查：同级（父级、名称、类型）唯一；同键多条取最大 id
        // 兜底唯一校验上线前的历史重名数据（依赖 menuId 为自增数字的假设）
        const freshList = await fetchMenuList()
        const stillPending: typeof pendingCreated = []
        for (const item of pendingCreated) {
          const matched = freshList
            .filter(
              menu =>
                String(menu.parentId) === String(item.payload.parentId) &&
                menu.menuName === item.payload.menuName &&
                menu.menuType === item.payload.menuType
            )
            .sort((a, b) => Number(b.menuId) - Number(a.menuId))[0]
          if (!matched) {
            stillPending.push(item)
            continue
          }
          idMap.set(String(item.node.menuId), matched.menuId)
          createdRecords.push({ id: String(matched.menuId), depth })
        }
        pendingCreated = stillPending
        if (pendingCreated.length) {
          throw new Error(
            `未能定位新菜单：${pendingCreated
              .map(item => item.payload.menuName)
              .join('、')}`
          )
        }

        depth += 1
        levelNodes = nodes.filter(item => item.depth === depth)
      }

      copyVisible.value = false
      ScMessage.success(`复制成功，共 ${total} 项`)
      options.onSuccess?.()
    } catch (error) {
      console.error('菜单复制失败===>', error)
      const createdCount = createdRecords.length + pendingCreated.length
      if (createdCount > 0) {
        // 已产生数据：关闭弹窗并引导回滚
        copyVisible.value = false
        rollbackMessage.value = `复制中断（已创建 ${createdCount}/${total} 项），是否回滚已复制的部分？`
        if (pendingCreated.length) {
          rollbackMessage.value += `其中「${pendingCreated
            .map(item => item.payload.menuName)
            .join('、')}」未能定位，可能需手动删除。`
        }
        rollbackVisible.value = true
      }
      // 零创建失败（如根节点重名被拒）：保留弹窗供原地改名重试，
      // 错误提示由全局请求拦截器统一 toast
    } finally {
      copyLoading.value = false
      copyProgress.value = ''
    }
  }

  /** 回滚：后端拒绝删除有子级的菜单，必须自底向上按层删除 */
  const handleRollback = async () => {
    const depths = [...new Set(createdRecords.map(item => item.depth))].sort(
      (a, b) => b - a
    )
    for (const depth of depths) {
      const ids = createdRecords
        .filter(item => item.depth === depth)
        .map(item => item.id)
      await deleteMenuAPI({ ids })
      // 每层删除成功立即摘除，部分失败后重试只处理剩余层级，
      // 避免重删已成功层级（后端删 0 行会报错并阻塞重试）
      createdRecords = createdRecords.filter(item => item.depth !== depth)
    }
    ScMessage.success('已回滚本次复制的菜单')
    options.onSuccess?.()
  }

  const handleRollbackClose = () => {
    rollbackVisible.value = false
    createdRecords = []
  }

  return {
    copyVisible,
    copyFormData,
    copyLoading,
    copyProgress,
    rollbackVisible,
    rollbackMessage,
    openCopyDialog,
    handleCopyConfirm,
    handleRollback,
    handleRollbackClose
  }
}
