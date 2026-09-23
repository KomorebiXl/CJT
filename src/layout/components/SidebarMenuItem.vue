<script setup lang="ts">
import { TopRight } from '@element-plus/icons-vue'
import type { ScRouteMeta, ScRouteRecordRaw } from 'vue-router'
import MenuIcon from '@/components/MenuIcon/index.vue'
import MenuTitle from './MenuTitle.vue'
import { appendQuery } from '@/utils/routeQuery.ts'

defineOptions({
  name: 'SidebarMenuItem'
})

const props = defineProps<{
  item: ScRouteRecordRaw
  basePath?: string
}>()

const visibleChildren = computed(
  () =>
    (props.item.children as ScRouteRecordRaw[] | undefined)?.filter(
      c => !c.hidden
    ) ?? []
)

const isSingleLeaf = computed(() => {
  if (props.item.alwaysShow) return false
  return visibleChildren.value.length <= 1
})

const resolvePath = (routePath: string, base = ''): string => {
  if (!routePath) return base
  if (routePath.startsWith('/') || routePath.startsWith('http'))
    return routePath
  return `${base.replace(/\/$/, '')}/${routePath}`
}

const leafRoute = computed((): ScRouteRecordRaw => {
  if (visibleChildren.value.length === 1) return visibleChildren.value[0]
  return props.item
})

const leafFullPath = computed(() => {
  if (visibleChildren.value.length === 1) {
    return resolvePath(visibleChildren.value[0].path, currentFullPath.value)
  }
  return currentFullPath.value
})

const isExternalLink = computed(() => {
  const link = props.item.meta?.link as string | undefined
  return (
    (!!link && link.startsWith('http')) || props.item.path.startsWith('http')
  )
})

const externalUrl = computed(() => {
  const link = props.item.meta?.link as string | undefined
  return link?.startsWith('http') ? link : props.item.path
})

const openExternalLink = () => {
  window.open(externalUrl.value, '_blank', 'noopener,noreferrer')
}

const currentFullPath = computed(() =>
  resolvePath(props.item.path, props.basePath)
)

const getMeta = (route: ScRouteRecordRaw) => {
  return route.meta as ScRouteMeta | undefined
}

const leafQuery = computed(
  () => getMeta(leafRoute.value)?.query as Record<string, string> | undefined
)
const leafIndexWithQuery = computed(() =>
  appendQuery(leafFullPath.value, leafQuery.value)
)
</script>

<template>
  <template v-if="!item.hidden">
    <el-menu-item
      v-if="isExternalLink"
      :index="externalUrl"
      @click="openExternalLink"
    >
      <MenuIcon :icon="getMeta(item)?.icon" />
      <template #title>
        <MenuTitle :title="item.meta?.title as string" />
        <el-icon class="external-icon"><TopRight /></el-icon>
      </template>
    </el-menu-item>
    <!-- 外包 router-link 渲染真实 <a href>，Ctrl/中键新开标签页走浏览器原生行为 -->
    <router-link
      v-else-if="isSingleLeaf"
      :to="leafIndexWithQuery"
      class="menu-leaf-link"
    >
      <el-menu-item :index="leafIndexWithQuery">
        <MenuIcon :icon="getMeta(leafRoute)?.icon" />
        <template #title>
          <MenuTitle :title="leafRoute.meta?.title as string" />
        </template>
      </el-menu-item>
    </router-link>
    <el-sub-menu v-else :index="currentFullPath">
      <template #title>
        <MenuIcon :icon="getMeta(item)?.icon" />
        <MenuTitle :title="item.meta?.title as string" />
      </template>
      <!-- prettier-ignore -->
      <SidebarMenuItem
        v-for="child in visibleChildren"
        :key="child.path"
        :item="( child as ScRouteRecordRaw )"
        :base-path="currentFullPath"
      />
    </el-sub-menu>
  </template>
</template>

<style lang="scss" scoped>
.external-icon {
  font-size: 12px;
  margin-left: 4px;
  vertical-align: middle;
  opacity: 0.6;
}

/* 锚点只提供新标签页语义，不能带来任何视觉变化 */
.menu-leaf-link {
  display: block;
  text-decoration: none;
}
</style>
