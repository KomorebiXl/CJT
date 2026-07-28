import { OverlayVisibleKey } from '@/types/injection-keys'

/**
 * 让组件内部的浮层状态，跟随外层容器（对话框、抽屉等）的关闭动作同步收起。
 * 如果当前组件没有被包裹在任何 provide 了 OverlayVisibleKey 的容器里
 * （比如直接用在普通页面上），这里安全地什么都不做。
 *
 * @param visible 组件自身用来控制浮层显隐的 ref
 */
export function useCloseOnOverlayHide(visible: Ref<boolean>) {
  const overlayVisible = inject(OverlayVisibleKey, undefined)
  if (!overlayVisible) return // 没有外层容器提供信号，直接跳过

  watch(overlayVisible, val => {
    if (val === false) visible.value = false
  })
}
