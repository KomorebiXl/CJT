# AGENTS.md

## 项目概况

这是一个 Vue 3 + TypeScript + Vite 的后台管理项目。主要技术栈：

- Vue 3 `<script setup>`、Vue Router、Pinia
- Element Plus
- Vite，支持 Vue JSX/TSX
- Sass
- Axios 请求封装位于 `src/utils/request`
- 通用 CRUD 页面主要由 `ScResourcePage`、`ScDialogForm`、`ScBaseForm` 组合实现

路径别名：

- `@` 指向 `src`

## 常用命令

使用 `pnpm`：

```bash
pnpm dev
pnpm build
pnpm lint
pnpm lint:fix
pnpm format
pnpm page:create
```

说明：

- 开发服务器默认端口为 `8080`。
- `pnpm build` 会先执行 `vue-tsc -b` 再执行 `vite build`。
- 当前 TypeScript 6 配置下，若只需要做普通类型检查，可使用：

```bash
.\node_modules\.bin\vue-tsc.cmd --noEmit --ignoreDeprecations 6.0
```

## 代码风格

遵循 `.prettierrc`：

- 2 空格缩进
- 不使用分号
- 单引号
- `printWidth` 为 80
- 不使用尾逗号
- 箭头函数单参数省略括号

ESLint 规则重点：

- Vue 组件名不强制多单词
- 允许 `any`
- 未使用变量是 warning
- Vue HTML 缩进规则关闭，由 Prettier 控制格式

## 自动导入和组件注册

`vite/plugins/auto-import.ts` 自动导入：

- `vue`
- `vue-router`
- `pinia`

适用文件包含 `.ts`、`.tsx`、`.vue`。

`vite/plugins/components.ts` 使用 `unplugin-vue-components` 和 `ElementPlusResolver` 自动注册组件，并生成：

- `src/auto-import.d.ts`
- `src/components.d.ts`

注意：

- 在 `.vue` 模板中可以依赖组件自动注册。
- 在 `.tsx` 文件中渲染本地组件时，优先显式 `import` 组件，避免运行时引用不明确。

## 目录约定

主要目录：

- `src/api`：接口模块，通常以 `xxx-api.ts` 命名
- `src/types`：业务类型声明，常用 `.d.ts`
- `src/views`：页面
- `src/components`：通用组件
- `src/hooks`：组合式逻辑
- `src/store/modules`：Pinia store 模块
- `src/router/modules`：静态/动态路由
- `src/utils`：请求、表单、树、文件、校验等工具
- `src/styles`：全局样式
- `script/page-gen`：CRUD 页面骨架生成器

以下目录不属于应用源码或项目文档维护范围，除非任务明确要求，否则不要扫描、引用或修改：

- `.codex`：Codex 本地运行配置和缓存
- `.agents`：代理运行时目录
- `node_modules`、`dist`：依赖和构建产物
- 嵌套的 `.git` 目录：独立 Git 元数据

新增业务模块时，保持 `api`、`types`、`views` 的业务域目录一致。例如：

- `src/api/adminManagement/foo-api.ts`
- `src/types/adminManagement/foo.d.ts`
- `src/views/adminManagement/foo/index.vue`

## API 约定

列表接口优先使用 `createListAPI`：

```ts
export const getFooDataAPI = createListAPI<FooSearchParams, FooData>(
  `${fooBaseUrl}/list`
)
```

普通接口使用 `src/utils/request`：

```ts
request.get<DataResponse<FooData>>({ url })
request.post<BaseResponse>({ url, data })
request.put<BaseResponse>({ url, data })
```

删除接口在当前项目里常见两种形态：

- `request.post<BaseResponse>({ url: `${baseUrl}/delete`, data })`
- 业务接口要求字符串或对象时，以现有同域接口为准

## 页面开发约定

CRUD 页面优先复用以下抽象：

- `ScResourcePage`：搜索栏、操作栏、表格、分页、操作列
- `ScDialogForm`：弹窗表单
- `useDialogForm`：新增/编辑弹窗状态和提交逻辑
- `useDeleteAction`：删除确认和删除后刷新
- `defineFormItems<T>()`：表单项类型辅助
- `findFormItem()`：运行时修改表单项配置

常见页面结构：

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

表单项用 `defineFormItems<FormData>()` 定义，字段名应和 `FormData` 类型保持一致。

## 弹窗和 TSX 注意事项

项目支持 TSX，但 TSX 中渲染本地 Vue 组件时应显式导入：

```ts
import ScDialogForm from '@/components/ScDialogForm'
import { defineComponent, h } from 'vue'
```

事件名包含冒号时，使用 `h()` 写法更稳：

```ts
h(ScDialogForm, {
  modelValue: visible.value,
  'onUpdate:modelValue': (val: boolean) => {
    visible.value = val
  }
})
```

若弹窗需要先打开再异步加载详情，可使用 `useDialogForm` 的 `openImmediately` 选项。

## 生成 CRUD 骨架

新增标准 CRUD 页面时，优先使用项目内置的 CRUD 页面骨架生成器；仅当页面交互或结构明显不符合标准 CRUD 场景时，才手动创建页面。

项目内置生成器：

```bash
pnpm page:create
```

生成器源码和说明位于：

- `script/page-gen/cli.ts`
- `script/page-gen/README.md`

生成器会创建类型、API 和页面骨架。生成后仍需要补充字段、接口地址、权限码和页面细节，并遵循本文件的 API 与页面开发约定。

## 项目文档维护

- `PROJECT_MAP.md` 是项目导航地图，应与当前源码、路由、页面和公共组件保持一致。
- 新增或移除业务域、页面、接口、公共组件、路由或构建插件时，同步更新 `PROJECT_MAP.md` 的对应章节。
- 文档只描述已纳入项目的代码和配置；更新时忽略 `.codex`、`.agents`、`node_modules`、构建产物及嵌套 `.git` 目录。
- 路由以 `src/router/modules/staticRoutes.ts` 和后端动态路由生成逻辑为准；不要根据目录存在推断它已注册为静态路由。

## 修改准则

- 优先沿用现有组件、hooks 和页面模式，不要绕开 `ScResourcePage` / `ScDialogForm` 重写 CRUD 基础能力。
- 保持改动范围小，避免顺手重构无关模块。
- 不要手动编辑自动生成的 `src/auto-import.d.ts` 和 `src/components.d.ts`，除非确实是在更新自动导入结果。
- 尽量不要修改已有中文文案、注释、提示语或标签；除非任务明确要求或必须修复相关问题。
- 必须修改中文时，确认文件以 UTF-8 保存；不要根据 PowerShell 默认输出里的乱码直接重写中文，必要时使用 `Get-Content -Encoding UTF8` 或其他 UTF-8 方式核对真实内容。
- 处理已有未提交改动时，不要回滚他人或用户的修改。

## 校验建议

改动后至少执行与改动范围匹配的检查：

```bash
pnpm lint
.\node_modules\.bin\vue-tsc.cmd --noEmit --ignoreDeprecations 6.0
```

涉及构建产物或路由、全局组件、Vite 配置时，再执行：

```bash
pnpm build
```
