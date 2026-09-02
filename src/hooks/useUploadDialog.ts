import { createVNode, render } from 'vue'
import ScBaseUpload from '@/components/ScBaseUpload'
import type {
  ScUploadConfig,
  ScTemplateConfig
} from '@/components/ScBaseUpload/scBaseUpload.ts'

interface UseUploadDialogOptions {
  uploadConfig: ScUploadConfig
  templateConfig?: ScTemplateConfig
  title?: string
  extraParams?: Record<string, any>
  uploadFn?: (files: File[]) => Promise<any>
  onSuccess?: (response: any) => void
}

export const useUploadDialog = (options: UseUploadDialogOptions) => {
  const {
    uploadConfig,
    templateConfig,
    title,
    extraParams,
    uploadFn,
    onSuccess
  } = options

  const visible = ref<boolean>(false)

  let container: HTMLDivElement | null = null

  // 关闭动作交由组件层自行管理：
  // 自动模式下组件内部已 emit('update:modelValue', false)，v-model 回流即可；
  // 手动模式（配置了 formatSuccessMessage）下须保留弹窗等待用户关闭，hook 层不能强关。
  const handleUploadSuccess = (response: any) => {
    onSuccess?.(response)
  }

  const renderDialog = () => {
    if (!container) {
      container = document.createElement('div')
      document.body.appendChild(container)
    }
    const vnode = createVNode(ScBaseUpload, {
      modelValue: visible.value,
      'onUpdate:modelValue': (val: boolean) => (visible.value = val),
      title,
      uploadExtraParams: extraParams,
      uploadConfig,
      templateConfig,
      uploadFn,
      onUploadSuccess: handleUploadSuccess
    })
    render(vnode, container)
  }
  watchEffect(renderDialog)

  const open = () => (visible.value = true)

  onScopeDispose(() => {
    if (container) {
      render(null, container)
      container.remove()
      container = null
    }
  })
  return { open }
}
