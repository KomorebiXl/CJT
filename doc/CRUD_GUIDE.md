# CRUD 页面与生成器规范

本文档约定后台管理项目中标准 CRUD 页面的搭建方式：优先复用项目已有的公共抽象，借助内置生成器快速产出页面骨架，再在其上补齐业务细节。目标是保证各资源页结构一致、行为统一，避免重复造轮子。

## 一、核心原则

标准 CRUD 页面必须优先组合以下公共能力，**不得绕开公共抽象**重写搜索、表格、分页、弹窗、删除确认或刷新逻辑。

各工具职责划分如下：

| 工具 | 职责 |
| --- | --- |
| `ScResourcePage` | 搜索栏、操作栏、表格、分页、操作列 |
| `ScDialogForm` | 新增 / 编辑弹窗表单 |
| `useDialogForm` | 新增 / 编辑弹窗状态与提交逻辑 |
| `useDeleteAction` | 删除确认与删除后刷新 |
| `defineFormItems<T>()` | 表单项类型辅助 |
| `findFormItem()` | 运行时修改表单项配置 |

## 二、常见资源页结构

一个典型的资源页只需声明搜索项、表格列与数据获取函数，再装配为 `pageConfig` 交给 `ScResourcePage` 渲染：

```vue
<script setup lang="ts">
const searchbarItems = reactive<SearchbarItems<FooSearchParams>>([])
const tableColumns = reactive<TableColumns>([])

const pageConfig: PageConfig<FooData> = {
  searchConfig: { searchbarItems },
  tableConfig: { tableColumns },
  fetchData: getFooDataAPI
}
</script>

<template>
  <ScResourcePage :page-config="pageConfig" />
</template>
```

页面同时需要弹窗时，资源页与弹窗均应复用公共组件：

```vue
<template>
  <ScResourcePage :page-config="pageConfig" />
  <ScDialogForm
    v-model="dialogVisible"
    :form-data="formData"
    :config="dialogConfig"
  />
</template>
```

## 三、表单项定义规范

- 表单项必须使用 `defineFormItems<FormData>()` 定义，字段名应与 `FormData` 类型保持一致。
- 详情异步加载场景，使用 `useDialogForm` 的 `openImmediately` 选项。

## 四、生成 CRUD 骨架

新增标准 CRUD 页面时，优先使用项目内置生成器；只有页面交互或结构明显不符合标准 CRUD 场景时，才手动创建页面。

```bash
pnpm page:create
```

生成器源码与说明位于：

- `script/page-gen/cli.ts`
- `script/page-gen/README.md`

生成器会创建类型、API 和页面骨架。生成后仍需补充以下内容，并继续遵循 API 约定、页面组合规范和公共工具字典：

- [ ] 补充表单与表格字段
- [ ] 填写接口地址
- [ ] 配置权限码
- [ ] 完善页面细节
