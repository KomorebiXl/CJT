<!-- 项目流程模式默认落地页：进入流程后未选择具体菜单时的空态提示 -->
<template>
  <div class="process-entry">
    <el-empty
      :image-size="140"
      description="请从左侧菜单选择要访问的功能页面"
    />
  </div>
</template>

<style lang="scss" scoped>
.process-entry {
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
