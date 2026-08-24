<script setup lang="ts">
import { defineFormItems } from '@/utils/form.ts'
import { useMenuCopy } from '../useMenuCopy.ts'
import type { MenuCopyFormData } from '../useMenuCopy.ts'

const emit = defineEmits<{ success: [] }>()

const copyFormItems = defineFormItems<MenuCopyFormData>([
  {
    label: '菜单名称',
    prop: 'menuName',
    type: 'input',
    componentProps: { placeholder: '复制后的菜单名称' },
    rules: [{ required: true, message: '请输入菜单名称', trigger: 'blur' }]
  },
  {
    label: '复制子级',
    prop: 'includeChildren',
    type: 'switch',
    componentProps: {
      activeText: '连同子菜单一起复制',
      inactiveText: '仅复制当前菜单'
    }
  }
])

const {
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
} = useMenuCopy({
  onSuccess: () => emit('success')
})

const copyDialogConfig = computed<DialogFormConfig>(() => ({
  title: copyProgress.value ? `复制菜单 ${copyProgress.value}` : '复制菜单',
  formItems: copyFormItems
}))

defineExpose({
  /** 打开复制配置弹窗并带出默认名称 */
  open: openCopyDialog
})
</script>

<template>
  <ScDialogForm
    v-model="copyVisible"
    :form-data="copyFormData"
    :config="copyDialogConfig"
    :confirm-loading="copyLoading"
    @confirm="handleCopyConfirm"
  />
  <ScConfirmDialog
    v-if="rollbackVisible"
    title="复制中断"
    :message="rollbackMessage"
    confirm-text="回滚已复制项"
    cancel-text="保留现状"
    :on-confirm="handleRollback"
    :on-close="handleRollbackClose"
  />
</template>
