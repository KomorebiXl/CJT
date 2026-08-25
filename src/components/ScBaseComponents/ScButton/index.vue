<script setup lang="ts">
import type { ScButtonProps } from './scButton.ts'

defineOptions({
  name: 'ScButton',
  inheritAttrs: false
})

const props = withDefaults(defineProps<ScButtonProps>(), {
  size: 'default',
  plain: false,
  text: false,
  bg: false,
  link: false,
  round: false,
  circle: false,
  disabled: false,
  autofocus: false,
  autoInsertSpace: false,
  dark: false,
  nativeType: 'button',
  stop: false
})

// el-button 组件实例
// const buttonRef = useTemplateRef<ButtonInstance>('buttonRef')

const attrs = useAttrs()

const innerLoading = ref<boolean>(false)

const handleClick = async (e: MouseEvent) => {
  // stop prop 替代 @click.stop 修饰符
  if (props.stop) e.stopPropagation()
  if (!props.onClick) return
  const result = props.onClick(e)
  if (!(result instanceof Promise)) return
  try {
    innerLoading.value = true
    await result
  } catch (e) {
    if (typeof e === 'string') {
      console.error('捕获到点击事件异常========>', e)
      throw e
    }
  } finally {
    innerLoading.value = false
  }
}
</script>

<template>
  <el-button
    ref="buttonRef"
    class="sc-button"
    v-bind="attrs"
    :type="type"
    :size
    :plain="plain"
    :link="link"
    :text="text"
    :bg="bg"
    :round="round"
    :circle="circle"
    :disabled="disabled || innerLoading"
    :icon="icon"
    :loading-icon="loadingIcon"
    :autofocus="autofocus"
    :auto-insert-space="autoInsertSpace"
    :native-type="nativeType"
    :tag="props.tag"
    :color="props.color"
    :loading="innerLoading"
    @click="handleClick"
  >
    <!--  透传所有插槽供外部使用  -->
    <template
      v-for="(slotFn, name) in $slots"
      :key="name"
      v-slot:[name]="slotProps"
    >
      <component :is="slotFn" v-bind="slotProps" />
    </template>
  </el-button>
</template>

<style scoped lang="scss"></style>
