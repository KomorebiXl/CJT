<script setup lang="ts">
import { usePermission } from '@/components/ScBaseComponents/ScResourcePage/hooks/usePermission.ts'
import { ArrowDown } from '@element-plus/icons-vue'
import type { StepItem } from './stepGuide.ts'

interface Props {
  title: string
  subtitle?: string
  steps: StepItem[]
  /** 是否默认全部展开，默认 false */
  defaultExpanded?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  defaultExpanded: false
})

const { hasPermission } = usePermission()

const visibleSteps = computed(() =>
  props.steps.filter(item =>
    item.permission ? hasPermission(item.permission) : true
  )
)

// 展开状态：用 Set 存展开中的下标
const openIndices = ref<Set<number>>(new Set())

onMounted(() => {
  if (props.defaultExpanded) {
    openIndices.value = new Set(visibleSteps.value.map((_, i) => i))
  }
})

const isOpen = (index: number) => openIndices.value.has(index)

const toggle = (index: number) => {
  const next = new Set(openIndices.value)
  next.has(index) ? next.delete(index) : next.add(index)
  openIndices.value = next
}

const isAllOpen = computed(
  () =>
    visibleSteps.value.length > 0 &&
    openIndices.value.size === visibleSteps.value.length
)

const toggleAll = () => {
  openIndices.value = isAllOpen.value
    ? new Set()
    : new Set(visibleSteps.value.map((_, i) => i))
}

const formatStepNo = (index: number) => String(index + 1).padStart(2, '0')
</script>

<template>
  <div class="step-guide">
    <!-- 标题区 -->
    <div class="step-guide__header">
      <div class="step-guide__header-text">
        <h1 class="step-guide__title">{{ props.title }}</h1>
        <p v-if="props.subtitle" class="step-guide__subtitle">
          {{ props.subtitle }}
        </p>
      </div>
      <ScButton
        v-if="visibleSteps.length > 0"
        text
        type="primary"
        @click="toggleAll"
      >
        {{ isAllOpen ? '全部收起' : '全部展开' }}
      </ScButton>
    </div>

    <!-- 步骤列表 -->
    <div class="step-guide__list">
      <div
        v-for="(item, index) in visibleSteps"
        :key="index"
        class="step-guide__row"
        :class="{ 'is-open': isOpen(index) }"
      >
        <!-- 左侧时间线 -->
        <div class="step-guide__gutter">
          <div class="step-guide__dot" />
          <div
            v-if="index < visibleSteps.length - 1"
            class="step-guide__line"
          />
        </div>

        <!-- 主体 -->
        <div class="step-guide__main">
          <div class="step-guide__bar" @click="toggle(index)">
            <span class="step-guide__no">步骤 {{ formatStepNo(index) }}</span>
            <span class="step-guide__title-text">{{ item.title }}</span>
            <div class="step-guide__actions" @click.stop>
              <ScButton type="primary" @click="item.action.handler()">
                {{ item.action.text }}
              </ScButton>
              <el-icon class="step-guide__caret">
                <ArrowDown />
              </el-icon>
            </div>
          </div>

          <el-collapse-transition>
            <div v-show="isOpen(index)" class="step-guide__desc-wrap">
              <div class="step-guide__desc">
                <p
                  v-for="(d, i) in item.desc"
                  :key="i"
                  class="step-guide__desc-item"
                >
                  {{ d }}
                </p>
              </div>
            </div>
          </el-collapse-transition>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.step-guide {
  display: flex;
  flex-direction: column;
  gap: 16px;

  // ── 标题区 ──
  &__header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
    background: #fff;
    border-radius: 12px;
    padding: 24px 28px;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
    border-left: 4px solid var(--el-color-primary);
  }

  &__header-text {
    flex: 1;
    min-width: 0;
  }

  &__title {
    font-size: 20px;
    font-weight: 700;
    color: #1a1a2e;
    margin: 0 0 4px;
    line-height: 1.3;
  }

  &__subtitle {
    font-size: 14px;
    color: #6b7280;
    margin: 0;
  }

  // ── 列表容器 ──
  &__list {
    background: #fff;
    border-radius: 12px;
    padding: 8px 28px;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
  }

  // ── 单行（时间线 + 内容） ──
  &__row {
    display: flex;
    align-items: stretch;
    gap: 16px;

    &.is-open .step-guide__caret {
      transform: rotate(180deg);
    }
  }

  // ── 左侧时间线（圆点 + 竖线） ──
  &__gutter {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 12px;
    padding-top: 26px; // 让圆点与横条中线对齐
  }

  &__dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: var(--el-color-primary);
    flex-shrink: 0;
    box-shadow: 0 0 0 3px rgba(64, 158, 255, 0.15);
  }

  &__line {
    width: 2px;
    flex: 1;
    background: #e4e7ed;
    margin-top: 6px;
  }

  // ── 主体 ──
  &__main {
    flex: 1;
    min-width: 0;
  }

  // ── 步骤横条 ──
  &__bar {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 16px 4px;
    cursor: pointer;
    user-select: none;
    border-radius: 6px;
  }

  &__no {
    display: inline-flex;
    align-items: center;
    padding: 4px 12px;
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.5px;
    color: var(--el-color-primary);
    background: var(--el-color-primary-light-9);
    border-radius: 12px;
    flex-shrink: 0;
  }

  &__title-text {
    flex: 1;
    font-size: 15px;
    font-weight: 600;
    color: #1a1a2e;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__actions {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-shrink: 0;
  }

  &__caret {
    font-size: 14px;
    color: #8a94a6;
    transition: transform 0.25s;
  }

  // ── 展开的说明区 ──
  &__desc-wrap {
    padding: 0 4px 16px;
  }

  &__desc {
    padding: 12px 16px;
    background: #f9fafc;
    border-radius: 8px;
  }

  &__desc-item {
    font-size: 13px;
    color: #5c6370;
    line-height: 1.7;
    margin: 0;

    & + & {
      margin-top: 4px;
    }
  }
}
</style>
