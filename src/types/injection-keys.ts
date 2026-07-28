import type { InjectionKey, Ref } from 'vue'

/**
 * 由任意"承载浮层的容器组件"（如 ScDialog、未来的 ScDrawer 等）provide，
 * 用于告知内部维护了独立浮层状态的子组件（如 ScIconPicker）：容器自身的显示状态。
 * 消费方只需要关心"变为 false"这个时机，用来同步收起自己的浮层。
 */
export const OverlayVisibleKey: InjectionKey<Ref<boolean>> =
  Symbol('overlayVisible')
