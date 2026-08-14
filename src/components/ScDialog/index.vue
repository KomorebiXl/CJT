<script setup lang="ts">
import type { ScDialogEmits, ScDialogProps } from './scDialog.ts'
import { CircleCheckFilled, CircleCloseFilled } from '@element-plus/icons-vue'
import { OverlayVisibleKey } from '@/types/injection-keys.ts'

defineOptions({ name: 'ScDialog' })

const props = withDefaults(defineProps<ScDialogProps>(), {
  title: '弹窗标题',
  confirmText: '确认',
  cancelText: '取消',
  dialogWidth: '50%',
  draggable: true,
  fullscreen: false,
  showConfirmButton: true,
  showFooterOperate: true
})

const emit = defineEmits<ScDialogEmits>()

const visible = computed({
  get: () => props.modelValue,
  set: val => emit('update:modelValue', val)
})

provide(OverlayVisibleKey, visible)

const handleConfirm = () => {
  emit('confirm')
}

const handleCancel = () => {
  emit('update:modelValue', false)
  emit('cancel')
}
</script>

<template>
  <el-dialog
    class="sc-dialog"
    v-bind="$attrs"
    v-model="visible"
    :title="title"
    :width="dialogWidth"
    :draggable="draggable"
    :fullscreen="fullscreen"
    :style="{ '--sc-body-min-h': autoHeight ? 'auto' : undefined }"
    append-to-body
    destroy-on-close
    @close="handleCancel"
    @closed="emit('closed')"
    @open="emit('open')"
  >
    <!-- 自定义 header slot -->
    <template v-if="$slots.header" #header="slotProps">
      <slot name="header" v-bind="slotProps" />
    </template>
    <!-- 默认内容 -->
    <div class="p-10">
      <slot />
    </div>
    <!-- footer：优先使用外部 slot，否则渲染默认按钮 -->
    <template #footer>
      <slot name="footer">
        <div class="dialog-footer" v-if="showFooterOperate">
          <ScButton
            :icon="CircleCloseFilled"
            @click="handleCancel"
            type="warning"
          >
            {{ cancelText }}
          </ScButton>
          <el-button
            :icon="CircleCheckFilled"
            type="danger"
            :loading="confirmLoading"
            :disabled="props.confirmDisabled"
            @click="handleConfirm"
            v-show="showConfirmButton"
          >
            {{ confirmText }}
          </el-button>
        </div>
      </slot>
    </template>
  </el-dialog>
</template>

<style lang="scss">
.sc-dialog {
  border-radius: 10px;
  overflow: hidden;
  .el-dialog__header {
    display: flex;
    align-items: center;
    position: relative;
    padding: 16px 20px 16px 20px;
    border-bottom: 1px solid #f0f0f0;
    margin-right: 0;
    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 4px;
      height: 18px;
      background: linear-gradient(180deg, #9b6eff 0%, #6c3fcf 100%);
      border-radius: 0 3px 3px 0;
    }
  }

  .el-dialog__title {
    font-weight: 600;
    font-size: 16px;
    line-height: 1;
    color: #1a1a2e;
    letter-spacing: 0.02em;
  }

  .el-dialog__headerbtn {
    width: 32px;
    height: 32px;
    top: 50%;
    transform: translateY(-50%);
    background: none !important;
    &:hover {
      background: none !important;
      .el-dialog__close {
        animation: sc-spin 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        color: #9b6eff;
      }
    }
    .el-dialog__close {
      font-size: 16px;
      transition: color 0.25s ease;
    }
  }

  .el-dialog__body {
    padding: 5px;
    min-height: var(--sc-body-min-h, 300px);
    color: #333;
  }
  .el-dialog__footer {
    height: 64px;
    border-top: 1px solid #ebebeb;
  }
}

.dialog-footer {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}
@keyframes sc-spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(180deg);
  }
}
</style>
