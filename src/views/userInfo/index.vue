<script setup lang="ts">
import type { UserProfileData } from '@/types/system/user'
import { getUserProfileAPI } from '@/api/system/user-api.ts'
import UserAvatar from './components/userAvatar.vue'
import UserInfo from './components/userInfo.vue'
import ResetPwd from './components/resetPwd.vue'

const activeTab = ref<'info' | 'pwd'>('info')
const user = ref<UserProfileData>({} as UserProfileData)
const roleGroup = ref('')
const postGroup = ref('')

const getUser = async () => {
  const res = await getUserProfileAPI()
  user.value = res.data
  roleGroup.value = res.roleGroup
  postGroup.value = res.postGroup
}

getUser()
</script>

<template>
  <div class="account-page">
    <div class="wrap">
      <div class="page-head">
        <h1>账户设置</h1>
        <span>管理你的个人资料与登录密码</span>
      </div>

      <!-- 身份通栏 -->
      <div class="card banner">
        <UserAvatar />
        <div class="ident">
          <div class="name">
            <b>{{ user.nickName || user.userName }}</b>
            <span class="badge">
              <span class="dot" />
              {{ roleGroup }}
            </span>
          </div>
        </div>
        <div class="meta">
          <div class="stat">
            <span class="k">用户名称</span>
            <span class="v">{{ user.userName }}</span>
          </div>
          <div class="stat">
            <span class="k">所属部门</span>
            <span class="v">
              <template v-if="user.dept">
                {{ user.dept.deptName }} / {{ postGroup }}
              </template>
            </span>
          </div>
          <div class="stat">
            <span class="k">创建日期</span>
            <span class="v">{{ user.createTime }}</span>
          </div>
        </div>
      </div>

      <!-- 表单卡 -->
      <div class="card">
        <div class="seg" role="tablist">
          <button
            type="button"
            role="tab"
            :aria-selected="activeTab === 'info'"
            :class="{ active: activeTab === 'info' }"
            @click="activeTab = 'info'"
          >
            基本资料
          </button>
          <button
            type="button"
            role="tab"
            :aria-selected="activeTab === 'pwd'"
            :class="{ active: activeTab === 'pwd' }"
            @click="activeTab = 'pwd'"
          >
            修改密码
          </button>
        </div>
        <div class="panel-body">
          <UserInfo v-show="activeTab === 'info'" :user="user" />
          <ResetPwd v-show="activeTab === 'pwd'" />
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
// Design Token：§3（亮色默认；暗色经媒体查询与 [data-theme="dark"] 双通道覆盖，
// 身份带 --band-1/2 亮暗同色保持品牌一致）
@mixin dark-tokens {
  --bg: #0f141b;
  --surface: #161d27;
  --surface-2: #1b2330;
  --ink: #e7ecf3;
  --muted: #9aa6b4;
  --faint: #6b7684;
  --line: #26303d;
  --line-strong: #313d4c;
  --primary: #4f8bff;
  --primary-weak: rgba(79, 139, 255, 0.16);
  --primary-ring: rgba(79, 139, 255, 0.3);
  --danger: #f0716f;
  --shadow:
    0 1px 2px rgba(0, 0, 0, 0.3),
    0 10px 30px -14px rgba(0, 0, 0, 0.6);
}

.account-page {
  --bg: #eef1f5;
  --surface: #ffffff;
  --surface-2: #f7f9fc;
  --ink: #1e2733;
  --muted: #6a7583;
  --faint: #9aa4b2;
  --line: #e6eaf0;
  --line-strong: #d9dfe8;
  --primary: #2b6cf0;
  --primary-weak: rgba(43, 108, 240, 0.1);
  --primary-ring: rgba(43, 108, 240, 0.22);
  --band-1: #1e2536;
  --band-2: #2a3a54;
  --danger: #e35d5b;
  --radius: 14px;
  --radius-sm: 8px;
  --shadow:
    0 1px 2px rgba(23, 34, 54, 0.04),
    0 8px 24px -12px rgba(23, 34, 54, 0.14);

  flex: 1;
  box-sizing: border-box;
  padding: 36px 20px 48px;
  background: var(--bg);
  font-family:
    'Inter',
    'PingFang SC',
    'Microsoft YaHei',
    'Hiragino Sans GB',
    system-ui,
    -apple-system,
    sans-serif;
  font-size: 14px;
  line-height: 1.5;
  color: var(--ink);
}

@media (prefers-color-scheme: dark) {
  .account-page {
    @include dark-tokens;
  }
}

:global([data-theme='dark']) .account-page {
  @include dark-tokens;
}

.wrap {
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.page-head {
  display: flex;
  align-items: baseline;
  gap: 12px;

  h1 {
    margin: 0;
    font-size: 20px;
    font-weight: 600;
    color: var(--ink);
  }

  span {
    font-size: 13px;
    font-weight: 400;
    color: var(--muted);
  }
}

.card {
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  overflow: hidden;
}

// 身份通栏：§6.1
.banner {
  background: linear-gradient(120deg, var(--band-1), var(--band-2));
  padding: 26px 28px;
  display: flex;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
}

.ident .name {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;

  b {
    font-size: 19px;
    font-weight: 600;
    color: #fff;
  }
}

.badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  font-weight: 500;
  padding: 3px 10px;
  border-radius: 100px;
  color: #fff;
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.12);

  .dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #7ee0b0;
  }
}

.meta {
  display: flex;
  margin-left: auto;
  flex-wrap: wrap;
}

.stat {
  padding: 2px 20px;
  border-left: 1px solid rgba(255, 255, 255, 0.16);

  &:first-child {
    border-left: none;
    padding-left: 0;
  }

  .k {
    display: block;
    font-size: 11px;
    color: rgba(255, 255, 255, 0.55);
    margin-bottom: 2px;
  }

  .v {
    display: block;
    font-size: 13px;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.95);
    font-variant-numeric: tabular-nums;
  }
}

// 分段 Tab：§6.3
.seg {
  display: inline-flex;
  gap: 2px;
  margin: 20px 24px 0;
  padding: 3px;
  background: var(--surface-2);
  border: 1px solid var(--line);
  border-radius: 10px;

  button {
    border: none;
    background: transparent;
    cursor: pointer;
    font-size: 13px;
    font-weight: 500;
    color: var(--muted);
    padding: 7px 16px;
    border-radius: 7px;
    transition: all 0.16s;

    &:hover {
      color: var(--ink);
    }

    &.active {
      background: var(--surface);
      color: var(--ink);
      box-shadow: 0 1px 2px rgba(23, 34, 54, 0.1);
    }
  }
}

.panel-body {
  padding: 22px 24px 0;
}

@media (max-width: 720px) {
  .account-page {
    padding: 20px 14px;
  }

  .banner {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .meta {
    margin-left: 0;

    .stat:first-child {
      padding-left: 0;
    }
  }
}

@media (prefers-reduced-motion: reduce) {
  .account-page *,
  .account-page *::before,
  .account-page *::after {
    transition: none !important;
  }
}
</style>
