export const listToTree = <T extends Record<string, any>>(
  list: T[],
  options: {
    idKey: string
    parentIdKey: string
    childrenKey?: string
    rootParentId?: any
  }
): T[] => {
  const {
    idKey,
    parentIdKey,
    childrenKey = 'children',
    rootParentId = 0
  } = options
  const map = new Map<any, T>()
  const result: T[] = []

  list.forEach(item => {
    map.set(item[idKey], { ...item, [childrenKey]: [] })
  })

  map.forEach(item => {
    const parentId = item[parentIdKey]
    if (parentId === rootParentId || !map.has(parentId)) {
      result.push(item)
    } else {
      const parent = map.get(parentId)!
      parent[childrenKey].push(item)
    }
  })

  return result
}

/**
 * 按 id 将该节点及其全部子孙标记 disabled 并返回新树，不修改原数组。
 * 编辑场景下用作上级选项时以此排除自身及后代，避免循环引用；id 未命中时不产生禁用标记。
 */
export const disableSubtreeById = <T extends Record<string, any>>(
  tree: Array<T>,
  id?: string | number | null,
  options?: { idKey?: string; childrenKey?: string }
): Array<T & { disabled: boolean }> => {
  const { idKey = 'id', childrenKey = 'children' } = options ?? {}

  const collectSubtreeIds = (
    node: T,
    ids: Array<string | number> = []
  ): Array<string | number> => {
    ids.push(node[idKey])
    const children = node[childrenKey] as Array<T> | undefined
    children?.forEach(child => collectSubtreeIds(child, ids))
    return ids
  }

  const findNode = (nodes: Array<T>): T | null => {
    for (const node of nodes) {
      if (node[idKey] === id) return node
      const children = node[childrenKey] as Array<T> | undefined
      if (children?.length) {
        const found = findNode(children)
        if (found) return found
      }
    }
    return null
  }

  const root = id == null ? null : findNode(tree)
  const disabledIds = new Set(root ? collectSubtreeIds(root) : [])

  const mark = (nodes: Array<T>): Array<T & { disabled: boolean }> =>
    nodes.map(node => {
      const children = node[childrenKey] as Array<T> | undefined
      return {
        ...node,
        disabled: disabledIds.has(node[idKey]),
        ...(children ? { [childrenKey]: mark(children) } : {})
      }
    })

  return mark(tree)
}
