<script setup lang="ts">
const props = defineProps<{
  /** 文本内容 */
  content: string
  /** 截断行数；传 false 表示不截断 */
  lines: number | false
}>()

const expanded = ref(false)
const textRef = useTemplateRef<HTMLDivElement>('textRef')
const overflowing = ref(false)

const isClamped = computed(
  () => typeof props.lines === 'number' && !expanded.value
)

const clampStyle = computed(() =>
  isClamped.value && typeof props.lines === 'number'
    ? { '--clamp-lines': props.lines }
    : undefined
)

// 展开态下 scrollHeight === clientHeight 会误判为无溢出，仅在收起态测量
const checkOverflow = () => {
  if (expanded.value) return
  const el = textRef.value
  overflowing.value = !!el && el.scrollHeight > el.clientHeight + 1
}

onMounted(() => {
  const observer = new ResizeObserver(checkOverflow)
  if (textRef.value) observer.observe(textRef.value)
  onScopeDispose(() => observer.disconnect())
})

watch(
  () => [props.content, props.lines] as const,
  () => nextTick(checkOverflow)
)

watch(expanded, () => nextTick(checkOverflow))
</script>

<template>
  <div v-if="content" class="clamp-text">
    <div
      ref="textRef"
      class="clamp-text__content"
      :class="{ 'is-clamped': isClamped }"
      :style="clampStyle"
    >
      {{ content }}
    </div>
    <div v-if="lines !== false && overflowing" class="clamp-text__toggle">
      <ScButton link type="primary" @click="expanded = !expanded">
        {{ expanded ? '收起' : '展开' }}
      </ScButton>
    </div>
  </div>
</template>

<style scoped lang="scss">
.clamp-text {
  &__content {
    line-height: 1.6;
    white-space: pre-wrap;
    word-break: break-word;

    &.is-clamped {
      display: -webkit-box;
      -webkit-line-clamp: var(--clamp-lines);
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  }

  &__toggle {
    margin-top: 2px;
    text-align: right;
  }
}
</style>
