<script setup lang="ts">
import type { MenuData } from '@/types/system/menu'
import { listToTree } from '@/utils/tree.ts'
import { ORPHAN_MENU_ID, ORPHAN_MENU_NAME } from '../buttonPerm.config.ts'

defineOptions({ name: 'MenuTree' })

const props = defineProps<{
  menuList: Array<MenuData>
  /** 深链预选的菜单 id（来自路由 query.menuId），仅首次数据就绪时应用 */
  initialSelectedId?: string | number
  /** 未挂到任何目录/菜单下的孤儿按钮，左树顶部以虚拟节点兜底展示 */
  orphanButtons?: Array<MenuData>
}>()

const emit = defineEmits<{ select: [menu: MenuData] }>()

type MenuTreeInstance = {
  filter: (value: string) => void
  setCurrentKey: (key?: string | number) => void
}

const treeRef = useTemplateRef<MenuTreeInstance>('treeRef')
const filterText = ref('')

// 左树只保留目录/菜单节点；按钮权限数量按 parentId 汇总成徽标；
// 存在孤儿按钮时顶部追加「未挂载按钮」虚拟节点
const treeData = computed<Array<MenuData>>(() => {
  const roots = listToTree(
    props.menuList.filter(item => item.menuType !== 'F'),
    { idKey: 'menuId', parentIdKey: 'parentId', rootParentId: 0 }
  )
  if (!props.orphanButtons?.length) return roots
  return [
    {
      menuId: ORPHAN_MENU_ID,
      parentId: 0,
      menuType: 'orphan',
      icon: '',
      subjectLargeType: '',
      subjectType: [],
      menuName: ORPHAN_MENU_NAME,
      orderNum: '',
      isFrame: '',
      path: '',
      component: '',
      perms: '',
      query: '',
      isCache: '',
      visible: '',
      status: '0',
      createTime: '',
      children: []
    },
    ...roots
  ]
})

const buttonCountMap = computed(() => {
  const map = new Map<string | number, number>()
  props.menuList.forEach(item => {
    if (item.menuType === 'F') {
      map.set(item.parentId, (map.get(item.parentId) ?? 0) + 1)
    }
  })
  return map
})

watch(filterText, value => treeRef.value?.filter(value))

const handleFilterNode = (value: string, data: any) =>
  !value || data.menuName.includes(value)

const currentKey = ref<string | number>()
let deepLinkConsumed = false

// 数据就绪后应用深链预选；列表重拉导致树重建后恢复高亮
watch(
  () => props.menuList,
  () => {
    if (!deepLinkConsumed && props.initialSelectedId != null) {
      const target = props.menuList.find(
        item => String(item.menuId) === String(props.initialSelectedId)
      )
      if (target) {
        deepLinkConsumed = true
        currentKey.value = target.menuId
        emit('select', target)
      }
    }
    nextTick(() => treeRef.value?.setCurrentKey(currentKey.value))
  },
  { immediate: true }
)

const handleNodeClick = (data: MenuData) => {
  currentKey.value = data.menuId
  emit('select', data)
}
</script>

<template>
  <div class="menu-tree-panel">
    <ScInput v-model="filterText" placeholder="请输入菜单名称" />
    <el-scrollbar class="menu-tree-panel__scroll">
      <el-tree
        ref="treeRef"
        :data="treeData"
        node-key="menuId"
        :props="{ label: 'menuName', children: 'children' }"
        :filter-node-method="handleFilterNode"
        highlight-current
        :expand-on-click-node="false"
        @node-click="handleNodeClick"
      >
        <template #default="{ data }">
          <span class="menu-tree-node">
            <span class="menu-tree-label">{{ data.menuName }}</span>
            <el-tag
              v-if="data.menuType === 'orphan'"
              size="small"
              type="warning"
              effect="plain"
            >
              {{ orphanButtons?.length }} 个按钮
            </el-tag>
            <el-tag
              v-else-if="
                data.menuType === 'C' && buttonCountMap.get(data.menuId)
              "
              size="small"
              type="info"
              effect="plain"
            >
              {{ buttonCountMap.get(data.menuId) }} 个按钮
            </el-tag>
          </span>
        </template>
      </el-tree>
    </el-scrollbar>
  </div>
</template>

<style scoped lang="scss">
.menu-tree-panel {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-height: 0;

  &__scroll {
    flex: 1;
    min-height: 0;

    :deep(.el-scrollbar__thumb) {
      background-color: var(--card-border);
      border-radius: 4px;

      &:hover {
        background-color: var(--text-muted);
      }
    }
  }
}

.menu-tree-node {
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  overflow: hidden;
}

.menu-tree-label {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
