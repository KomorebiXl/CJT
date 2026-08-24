<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

// 取出 /redirect 后面的真实路径（含 query），立即跳回去
// 例如：/redirect/dashboard/list?id=1 → /dashboard/list?id=1
const realPath = route.fullPath.replace(/^\/redirect/, '') || '/'
router.replace(realPath)
</script>

<template>
  <div />
</template>
