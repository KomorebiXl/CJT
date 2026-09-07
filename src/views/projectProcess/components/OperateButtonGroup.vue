<script setup lang="ts">
import { ArrowDown } from '@element-plus/icons-vue'
import type { PageButton } from '@/components/ScBaseComponents/ScResourcePage/types/operateConfig.ts'
import { usePermission } from '@/components/ScBaseComponents/ScResourcePage/hooks/usePermission.ts'

/**
 * ScResourcePage #operate-button-slot 的「下拉 + 平铺」按钮组共享渲染件
 * （initialTestFunctionality/systemDetails 与 initialTestFeature 定版形态，回归测试模块同此复用）。
 * 传入清单由组件按 item.permission 自行过滤（无权限字段视为放行）；
 * command/点击分发留在消费方页面。
 */
const props = withDefaults(
  defineProps<{
    /** 下拉菜单项原始清单（组件内按权限过滤；过滤后为空时触发按钮整体隐藏） */
    dropdownItems?: Array<{
      id: string
      name: string
      icon: Component
      permission?: string | Array<string>
    }>
    /** 平铺按钮原始清单（组件内按权限过滤；id 必填供分发） */
    flatButtons?: Array<PageButton & { id: string }>
    /** 下拉触发按钮文案 */
    dropdownButtonText?: string
  }>(),
  {
    dropdownItems: () => [],
    flatButtons: () => [],
    dropdownButtonText: '数据导入导出操作'
  }
)

const emit = defineEmits<{
  (e: 'dropdownCommand', id: string): void
  (e: 'flatClick', id: string): void
}>()

const { hasPermission } = usePermission()

// hasPermission 对 undefined 返回 true，无权限字段即放行
const visibleDropdownItems = computed(() =>
  props.dropdownItems.filter(item => hasPermission(item.permission))
)

const visibleFlatButtons = computed(() =>
  props.flatButtons.filter(item => hasPermission(item.permission))
)

// el-dropdown 的 command 类型为 string | number | object，统一转 string 分发
const handleCommand = (id: string | number | object) => {
  emit('dropdownCommand', String(id))
}
</script>

<template>
  <div v-if="visibleDropdownItems.length" class="btn-item">
    <el-dropdown trigger="click" @command="handleCommand">
      <ScButton type="warning">
        {{ dropdownButtonText }}
        <el-icon class="el-icon--right"><ArrowDown /></el-icon>
      </ScButton>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item
            v-for="item in visibleDropdownItems"
            :key="item.id"
            :command="item.id"
          >
            <el-icon><component :is="item.icon" /></el-icon>
            {{ item.name }}
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </div>
  <div v-for="btn in visibleFlatButtons" :key="btn.id" class="btn-item">
    <ScButton
      :type="btn.type"
      :icon="btn.icon"
      @click="emit('flatClick', btn.id)"
    >
      {{ btn.name }}
    </ScButton>
  </div>
</template>
