<script setup lang="ts">
interface Props {
  modelValue: string
  placeholder?: string
  rows?: number
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: '',
  rows: 10,
  disabled: false
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'contextmenu', event: MouseEvent): void
}>()

const inputRef = ref()
const overlayRef = ref<HTMLDivElement>()

const content = computed({
  get: () => props.modelValue || '',
  set: (val: string) => emit('update:modelValue', val)
})

// 匹配 {{@xxx}} 格式的图片引用占位符
const TOKEN_REG = /\{\{@[^{}]+\}\}/g

// 转义 HTML 特殊字符,避免用户输入的内容被当成标签解析(比如打了个 <script>)
const escapeHtml = (str: string) =>
  str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

// 遮罩层要渲染的 HTML:占位符包一层 span 高亮,其余文字颜色透明
const highlightedHtml = computed(() => {
  const escaped = escapeHtml(content.value)
  const html = escaped.replace(
    TOKEN_REG,
    matched => `<span class="token">${matched}</span>`
  )
  // 末尾补一个换行,修正遮罩层和 textarea 末行高度对不齐的经典问题
  return `${html}\n`
})

// 拿到真正的原生 textarea 元素(给父组件读取/设置光标位置用)
const getTextareaEl = (): HTMLTextAreaElement | undefined =>
  inputRef.value?.textarea ||
  inputRef.value?.ref ||
  inputRef.value?.$el?.querySelector('textarea')

// 把 textarea 的内边距/边框/字体同步到遮罩层,保证两者文字严丝合缝对齐
// 这里用 JS 读 computed style,而不是写死像素值,是为了不被 Element Plus 主题定制影响
const syncOverlayStyle = () => {
  const el = getTextareaEl()
  const overlayEl = overlayRef.value
  if (!el || !overlayEl) return
  const cs = window.getComputedStyle(el)
  const keys: Array<keyof CSSStyleDeclaration> = [
    'paddingTop',
    'paddingRight',
    'paddingBottom',
    'paddingLeft',
    'borderTopWidth',
    'borderRightWidth',
    'borderBottomWidth',
    'borderLeftWidth',
    'fontSize',
    'fontFamily',
    'fontWeight',
    'lineHeight',
    'letterSpacing'
  ]
  keys.forEach(key => {
    const value = cs[key]
    if (typeof value === 'string') {
      ;(overlayEl.style as any)[key] = value
    }
  })
}

// textarea 内部滚动时让遮罩层跟着滚,不然长文本会错位
const handleScroll = () => {
  const el = getTextareaEl()
  const overlayEl = overlayRef.value
  if (!el || !overlayEl) return
  overlayEl.scrollTop = el.scrollTop
  overlayEl.scrollLeft = el.scrollLeft
}

const handleContextMenu = (event: MouseEvent) => {
  emit('contextmenu', event)
}

onMounted(() => {
  nextTick(syncOverlayStyle)
  window.addEventListener('resize', syncOverlayStyle)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', syncOverlayStyle)
})

defineExpose({
  getTextareaEl
})
</script>

<template>
  <div class="highlight-textarea">
    <div ref="overlayRef" class="highlight-overlay" v-html="highlightedHtml" />
    <el-input
      ref="inputRef"
      v-model="content"
      type="textarea"
      class="highlight-input"
      :rows="props.rows"
      :placeholder="props.placeholder"
      :disabled="props.disabled"
      @scroll="handleScroll"
      @contextmenu="handleContextMenu"
    />
  </div>
</template>

<style lang="scss" scoped>
.highlight-textarea {
  position: relative;

  .highlight-overlay {
    position: absolute;
    inset: 0;
    overflow: hidden;
    white-space: pre-wrap;
    word-break: break-word;
    color: transparent;
    pointer-events: none;
    z-index: 1;
    box-sizing: border-box;

    // token 只画背景高亮色，文字本身保持透明——真正显示的文字来自上面那层真实 textarea
    // 注意不要给 .token 加 padding/margin，否则会跟真实文字的字符位置错位
    :deep(.token) {
      background: var(--el-color-primary-light-9);
      border-radius: 2px;
    }
  }

  :deep(.highlight-input) {
    position: relative;
    z-index: 2;

    .el-textarea__inner {
      position: relative;
      z-index: 2;
      background: transparent !important;
    }
  }
}
</style>
