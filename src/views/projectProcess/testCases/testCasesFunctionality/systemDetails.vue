<!--测试用例功能性-子系统测试项（薄包装：共享骨架按功能性范围实例化） -->
<script setup lang="ts">
import TestCaseSplitView from '../components/TestCaseSplitView.vue'

const props = defineProps<{
  systemId: string
  systemName: string
}>()

const emit = defineEmits<{
  (e: 'back'): void
}>()
</script>

<template>
  <TestCaseSplitView
    feature="1"
    feature-name="功能性"
    sub-feature="1"
    :subsystem="{ id: props.systemId, name: props.systemName }"
    show-back
    @back="emit('back')"
  />
</template>
