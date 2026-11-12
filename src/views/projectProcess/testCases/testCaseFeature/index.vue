<!--测试用例-六个特性共享页（?feature=2..7 query 驱动，复用左树右详情骨架）-->
<script setup lang="ts">
import TestCaseSplitView from '../components/TestCaseSplitView.vue'
import { TEST_CASE_FEATURE_NAME_MAP } from './testCaseFeature.config'

const route = useRoute()

const feature = computed(() => {
  const value = route.query.feature
  const key = Array.isArray(value) ? value[0] : value
  return key ?? ''
})

const featureName = computed(() => TEST_CASE_FEATURE_NAME_MAP[feature.value])
</script>

<template>
  <div class="page-card">
    <TestCaseSplitView
      v-if="featureName"
      :key="feature"
      :feature="feature"
      :feature-name="featureName"
    />
    <el-empty v-else description="特性参数无效，请从菜单进入" />
  </div>
</template>
