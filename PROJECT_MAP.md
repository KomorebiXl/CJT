# PROJECT_MAP.md

## 用途与范围

这份文档用于快速定位当前应用代码和理解模块职责。开发规则见 `AGENTS.md`。

本文档只覆盖项目源码和配置，维护时忽略 `.codex`、`.agents`、`node_modules`、构建产物和嵌套 `.git` 目录。

## 技术栈

- Vue 3 + TypeScript + Vite，支持 SFC 与 JSX/TSX
- Vue Router，hash 路由模式
- Pinia + `pinia-plugin-persistedstate`
- Element Plus（中文语言包）
- Sass、Axios、`jsencrypt`、`sm-crypto`
- `unplugin-auto-import`：自动导入 Vue、Vue Router、Pinia API
- `unplugin-vue-components`：自动注册 Element Plus 组件
- `vite-plugin-svg-icons`：SVG 图标集
- `vite-plugin-compression`：构建时压缩产物

## 入口与构建

- `index.html`：Vite HTML 入口。
- `src/main.ts`：创建应用，注册 Element Plus、Router、Pinia、基础组件、样式和 SVG 图标。
- `src/App.vue`：根组件。
- `vite.config.ts`：`@ -> src` 别名、8080 开发端口、`/api` 代理、构建输出和拆包规则。
- `vite/plugins/index.ts`：组合 Vue、setup-extend、JSX、自动导入、SVG 图标、组件注册和压缩插件。
- `vite/plugins/auto-import.ts`：自动导入规则，并生成 `src/auto-import.d.ts`。
- `vite/plugins/components.ts`：组件自动注册规则，并生成 `src/components.d.ts`。
- `vite/plugins/svg-icon.ts`：注册本地 SVG 图标。
- `vite/plugins/compression.ts`：生产构建压缩配置。

## 路由与权限

- `src/router/index.ts`：创建 `createWebHashHistory()` router，注册静态路由与路由守卫。
- `src/router/modules/staticRoutes.ts`：首页、登录、重定向、404 和隐藏详情页路由。
- `src/router/modules/dynamicRoutes.ts`：动态路由占位模块，目前为空。
- `src/utils/routerInterceptor.ts`：登录态校验、用户信息加载、动态路由生成、进度条和页面加载动画。
- `src/utils/pageLoader.ts`：页面加载动画工具。

静态隐藏详情页：

- `/controlPoint/controlPointItem/:id`：测评项详情。
- `/codeVulnerabilityLibrary/codeVulnerabilityLibraryDetail/:id`：复用源代码漏洞标准页面展示详情。
- `/toolLibrary/toolVersion/:id`：工具库版本页面。
- `/system/dict-data/:dictId`：字典数据页面。

业务菜单主要由后端返回，并由 `src/store/modules/router-store.ts` 转换为动态路由和侧边栏菜单。权限数据由 `src/store/modules/user-store.ts` 保存和消费。

## 状态管理

- `src/store/index.ts`：创建 Pinia 并注册持久化插件。
- `src/store/modules/user-store.ts`：用户、角色、权限、登录和退出。
- `src/store/modules/router-store.ts`：动态路由和侧边栏路由。
- `src/store/modules/tabs-store.ts`：标签页状态。
- `src/store/modules/dict-store.ts`：字典缓存。
- `src/store/modules/download-store.ts`：下载状态。
- `src/store/modules/global-store.ts`：全局 UI 状态。

## 请求与接口

- `src/utils/request`：Axios 实例、请求配置、拦截器、类型和错误处理。
- `src/utils/pageRequest.ts`：`createListAPI<TSearch, TData>()` 列表接口工厂。
- `src/utils/safeRequest.ts`：将请求异常转换为可处理结果。
- `src/api/login-api.ts`：登录、退出。
- `src/api/file-api.ts`：上传、下载。
- `src/api/projectManagement-api.ts`：项目管理列表。

系统管理接口：

- `src/api/system/user-api.ts`：用户、状态切换、重置密码和组织树。
- `src/api/system/menu-api.ts`：菜单、路由和菜单树。
- `src/api/system/organizationManagement-api.ts`：组织和部门树。
- `src/api/system/post-api.ts`：岗位。
- `src/api/system/dict-api.ts`：字典类型、字典数据和缓存刷新。
- `src/api/system/logManagement/operlog-api.ts`：操作日志列表。
- `src/api/system/role/systemRole-api.ts`：系统角色和角色权限。
- `src/api/system/role/projectRole-api.ts`：项目角色。

后台管理接口位于 `src/api/adminManagement`，包含漏洞库、源代码漏洞库/标准、常用测试环境、测评项、指南、行业标准、工具库和工具版本。

## 类型声明

- `src/types/schema.d.ts`：通用 schema 类型桥接。
- `src/global.d.ts`、`src/router.d.ts`：全局和路由类型扩展。
- `src/types/user.d.ts`、`src/types/dict.d.ts`、`src/types/projectManagement.d.ts`：跨模块业务类型。
- `src/types/system`：用户、菜单、组织、岗位和角色类型；`logManagement` 子目录存放操作日志类型。
- `src/types/adminManagement`：后台管理领域类型。
- `src/types/injection-keys.ts`：Vue 注入键。
- `src/types/sm-crypto.d.ts`：`sm-crypto` 类型声明。
- `src/auto-import.d.ts`、`src/components.d.ts`：自动生成，通常不要手动编辑。

## 页面与 CRUD 基础设施

- `src/components/ScBaseComponents/ScResourcePage`：资源页，组合搜索、操作栏、表格、分页、权限、导出和树形展开能力。
- `src/components/ScBaseComponents/ScTable`：表格封装。
- `src/components/ScBaseComponents/ScSearchbar`：搜索栏封装。
- `src/components/ScBaseComponents/ScButton`：按钮封装。
- `src/components/ScDialogForm`：组合 `ScDialog` 与 `ScBaseForm` 的弹窗表单。
- `src/components/ScDialog`：弹窗封装。
- `src/components/ScBaseForm`：根据 `formItems` 动态渲染表单。
- `src/components/ScBaseFormItems`：输入、选择、日期/日期范围、单选、多选、开关、树和树选择表单项。
- `src/components/ScBaseDate`：日期展示组件。
- `src/components/ScBaseUpload`：上传组件。
- `src/components/ScConfirmDialog`：确认弹窗。
- `src/components/ScIconPicker`：菜单图标选择器。
- `src/components/ScLinkText`：链接文本。
- `src/components/ScSearchDateRangeSelector`：搜索日期范围选择器。
- `src/components/SvgIcon`：SVG 图标渲染。

资源页内部 hooks 位于 `ScResourcePage/hooks`：`useTableData`、`useActionButtons`、`useOperateButtons`、`useColumnConfig`、`useTreeExpand`、`usePermission`、`useExport`。

表单配置类型位于 `ScBaseForm/types`；`src/utils/form.ts` 提供 `defineFormItems<T>()`，`src/utils/formItemUtils.ts` 提供表单项查找和修改辅助。

## 通用 Hooks 与工具

- `src/hooks/useDialogForm.ts`：新增/编辑状态、详情加载、提交和刷新。
- `src/hooks/useDeleteAction.ts`：删除确认和删除后提示。
- `src/hooks/useUploadDialog.ts`：上传弹窗。
- `src/hooks/useScConfirmDialog.ts`：确认弹窗状态。
- `src/hooks/useLoading.ts`：加载状态。
- `src/hooks/useCloseOnOverlayHide.ts`：遮罩层隐藏时的关闭处理。

常用工具位于 `src/utils`：认证、字典、文件、HTTP、加密、对象、搜索栏、存储、树、校验、图标和 Element Plus 消息处理。

常量位于 `src/constant`：加密密钥、错误码和全局变量；`src/plugins/messages.ts` 集中处理消息相关扩展。

## 布局

- `src/layout/index.vue`：后台主布局。
- `src/layout/components/Header.vue`：顶部区域。
- `src/layout/components/Sidebar.vue`、`SidebarMenuItem.vue`：侧边栏和菜单项。
- `src/layout/components/TabsBar.vue`：标签栏。
- `src/layout/components/AppMain.vue`：路由内容区。
- `src/layout/components/MenuIcon.vue`：菜单图标。
- `src/layout/composables/useLayout.ts`：布局逻辑。

## 页面模块

系统管理：

- `src/views/system/user`：用户管理；`useResetPasswordDialog.tsx` 实现重置密码弹窗。
- `src/views/system/menu`：菜单管理、菜单树和图标选择。
- `src/views/system/organizationManagement`：组织管理。
- `src/views/system/post`：岗位管理。
- `src/views/system/dict`：字典类型管理与字典数据页。
- `src/views/system/logManagement/operlog`：操作日志，只读列表和详情。
- `src/views/system/permission`：权限页面。
- `src/views/system/role/systemRole`：系统角色及权限弹窗。
- `src/views/system/role/projectRole`：项目角色。

后台管理：

- `src/views/adminManagement/vulnerabilityLibrary`：漏洞库。
- `src/views/adminManagement/codeVulnerabilityLibrary`：源代码漏洞库入口。
- `src/views/adminManagement/codeVulnerabilityStandard`：源代码漏洞标准和详情复用页。
- `src/views/adminManagement/commonTestEnvironments`：常用测试环境。
- `src/views/adminManagement/controlPoint`：测评项；`controlPointItem.vue` 为详情页。
- `src/views/adminManagement/guideline`：指南。
- `src/views/adminManagement/industryStandard`：行业标准。
- `src/views/adminManagement/toolLibrary`：工具库。
- `src/views/adminManagement/toolVersion`：工具库版本。

其他页面：

- `src/views/home`：首页。
- `src/views/login`：登录。
- `src/views/projectManagement`：项目管理。
- `src/views/redirect`：路由重定向。
- `src/views/error/404.vue`：404 页面。

## 样式、资源与生成器

- `src/assets/images`：通用图片；`src/assets/login`：登录页图片；`src/assets/icons`：业务 SVG 图标。
- `public/icons.svg`：SVG icon sprite；`public/favicon.svg`：站点图标。
- `src/styles/index.scss`：全局样式入口；`common.scss`、`variables.scss`、`scrollbar.scss`：公共样式、变量和滚动条样式。
- `script/page-gen`：CRUD 骨架生成器；入口为 `script/page-gen/cli.ts`，说明见 `script/page-gen/README.md`，通过 `pnpm page:create` 运行。

## 配置文件

- `package.json`：依赖和 `dev`、`build`、`preview`、`lint`、`lint:fix`、`format`、`page:create` 脚本。
- `.env.development`、`.env.production`：环境变量。
- `tsconfig.json`、`tsconfig.app.json`、`tsconfig.node.json`：TypeScript 配置。
- `eslint.config.js`：ESLint flat config。
- `.prettierrc`、`.prettierignore`：Prettier 配置。
- `.gitignore`：Git 忽略规则。
