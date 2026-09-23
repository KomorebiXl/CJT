<script setup lang="ts">
import { useUserStore } from '@/store/modules/user-store.ts'

const userStore = useUserStore()

const greeting = (() => {
  const hour = new Date().getHours()
  if (hour < 6) return '凌晨好'
  if (hour < 11) return '早上好'
  if (hour < 13) return '中午好'
  if (hour < 18) return '下午好'
  return '晚上好'
})()

const displayName = computed(
  () => userStore.nickName || userStore.name || '用户'
)

const avatarFallback = computed(() => displayName.value.charAt(0))

// 头像图片加载失败时降级显示首字
const handleAvatarError = (e: Event) => {
  const img = e.target as HTMLImageElement
  img.style.display = 'none'
  img.parentElement?.classList.add('is-fallback')
}

const todayText = (() => {
  const now = new Date()
  const weeks = ['日', '一', '二', '三', '四', '五', '六']
  return `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日 星期${weeks[now.getDay()]}`
})()
</script>

<template>
  <div class="home-page">
    <div class="welcome-banner">
      <div class="banner-avatar">
        <img
          v-if="userStore.avatar"
          :src="userStore.avatar"
          alt="avatar"
          class="avatar-img"
          @error="handleAvatarError"
        />
        <span class="avatar-text">{{ avatarFallback }}</span>
      </div>
      <div class="welcome-info">
        <p class="greeting">{{ greeting }}，{{ displayName }}！</p>
        <p class="date-text">今天是 {{ todayText }}</p>
      </div>
    </div>
    <div class="home-placeholder">
      <el-empty :image-size="140" description="首页建设中，敬请期待" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.home-page {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.welcome-banner {
  display: flex;
  align-items: center;
  padding: 24px;
  background: linear-gradient(
    135deg,
    var(--tab-active-bg) 0%,
    var(--card-bg) 60%
  );
  border: 1px solid var(--card-border);
  border-radius: 8px;
}

.banner-avatar {
  position: relative;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: var(--tab-active-color);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  overflow: hidden;
  margin-right: 16px;

  .avatar-img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .avatar-text {
    color: #fff;
    font-size: 20px;
    font-weight: 500;
  }
}

.welcome-info {
  .greeting {
    margin: 0;
    font-size: 20px;
    font-weight: 600;
    color: var(--text-primary);
  }

  .date-text {
    margin: 8px 0 0;
    font-size: 14px;
    color: var(--text-muted);
  }
}

.home-placeholder {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  background-color: var(--content-bg);
  border-radius: 8px;
  border: 1px dashed var(--card-border);
}
</style>
