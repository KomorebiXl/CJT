# PROJECT_MAP.md

## 用途

这份文档是项目导航地图，用来快速定位代码位置和理解模块职责。编码规范和代理工作规则见 `AGENTS.md`。

## 技术栈

- Vue 3 + TypeScript + Vite
- Vue Router，hash 路由模式
- Pinia + `pinia-plugin-persistedstate`
- Element Plus，中文语言包
- Sass
- Axios 请求封装
- `unplugin-auto-import` 自动导入 Vue、Router、Pinia API
- `unplugin-vue-components` 自动注册组件和 Element Plus 组件

## 应用入口

- `src/main.ts`：创建应用，注册 Element Plus、Router、Pinia、全局基础组件、全局样式和 SVG icon。
- `src/App.vue`：根组件。
- `index.html`：Vite HTML 入口。
- `vite.config.ts`：Vite 配置，包含 `@ -> src` 别名、开发端口 `8080`、`/api` 代理和构建拆包配置。

## 路由

- `src/router/index.ts`：创建 router，使用 `createWebHashHistory()`，挂载路由守卫。
- `src/router/modules/staticRoutes.ts`：静态路由和隐藏详情页路由。
- `src/router/modules/dynamicRoutes.ts`：动态路由模块，目前为空。
- `src/utils/routerInterceptor.ts`：登录态校验、用户信息加载、动态路由生成、进度条和页面加载动画。
- `src/utils/pageLoader.ts`：页面加载动画工具。

路由相关 store：

- `src/store/modules/router-store.ts`：生成和保存动态路由、侧边栏路由。
- `src/store/modules/user-store.ts`：用户信息、角色、权限、登录退出。
- `src/store/modules/global-store.ts`：全局状态，例如加载状态。

## 状态管理

- `src/store/index.ts`：创建 Pinia，并注册持久化插件。
- `src/store/modules/user-store.ts`：用户信息、角色、权限、token 相关动作。
- `src/store/modules/router-store.ts`：动态路由和菜单路由。
- `src/store/modules/tabs-store.ts`：标签页状态。
- `src/store/modules/dict-store.ts`：字典数据。
- `src/store/modules/download-store.ts`：下载相关状态。
- `src/store/modules/global-store.ts`：全局 UI 状态。

## 请求层

- `src/utils/request/index.ts`：Axios 封装，导出默认请求实例，提供 `get`、`post`、`put`、`delete`、`download`。
- `src/utils/request/config.ts`：请求基础配置。
- `src/utils/request/interceptors.ts`：全局请求和响应拦截器。
- `src/utils/request/handler/errorHandler.ts`：错误处理和重新登录状态。
- `src/utils/request/type.ts`：请求封装类型。
- `src/utils/pageRequest.ts`：`createListAPI<TSearch, TData>()`，用于快速创建列表接口。
- `src/utils/safeRequest.ts`：安全请求辅助，用于将异常转成可处理结果。

业务 API 目录：

- `src/api/system`：系统管理相关接口，例如用户、菜单、组织、角色。
- `src/api/adminManagement`：后台管理相关接口。
- `src/api/projectManagement-api.ts`：项目管理接口。
- `src/api/login-api.ts`：登录接口。
- `src/api/system/dict-api.ts`：字典接口。
- `src/api/file-api.ts`：文件接口。

## 类型声明

- `src/types`：业务类型声明。
- `src/types/schema.d.ts`：全局常用 schema 类型桥接。
- `src/global.d.ts`：全局类型。
- `src/router.d.ts`：路由类型扩展。
- `src/auto-import.d.ts`：自动导入生成文件。
- `src/components.d.ts`：自动组件注册生成文件。

按业务域组织的类型：

- `src/types/system`
- `src/types/adminManagement`
- `src/types/projectManagement.d.ts`
- `src/types/dict.d.ts`
- `src/types/user.d.ts`

## 通用页面组件

CRUD 页面主要复用这些组件：

- `src/components/ScBaseComponents/ScResourcePage`：资源页组合组件，包含搜索栏、操作栏、表格、分页、操作列等能力。
- `src/components/ScDialogForm`：弹窗表单，内部组合 `ScDialog` 和 `ScBaseForm`。
- `src/components/ScBaseForm`：根据 `formItems` 动态渲染表单。
- `src/components/ScBaseComponents/ScTable`：表格封装。
- `src/components/ScBaseComponents/ScSearchbar`：搜索栏封装。
- `src/components/ScBaseComponents/ScButton`：按钮封装。
- `src/components/ScDialog`：弹窗封装。

`ScResourcePage` 内部 hooks：

- `useTableData.ts`：列表请求和分页。
- `useActionButtons.ts`：表格操作列按钮。
- `useOperateButtons.ts`：页面顶部操作按钮。
- `useColumnConfig.ts`：列配置。
- `useTreeExpand.ts`：树形表格展开收起。
- `usePermission.ts`：权限判断。
- `useExport.ts`：导出处理。

## 表单组件

动态表单组件位于：

- `src/components/ScBaseFormItems`

已支持的表单项类型：

- `input`
- `select`
- `date`
- `dateRange`
- `radio`
- `checkbox`
- `switch`
- `treeSelect`
- `tree`
- `customSlot`

表单项类型定义：

- `src/components/ScBaseForm/types/formItem.ts`
- `src/components/ScBaseForm/types/componentProps.ts`
- `src/components/ScBaseForm/types/scBaseForm.ts`

常用辅助：

- `src/utils/form.ts`：`defineFormItems<T>()`，让表单项 `prop` 和业务表单类型关联。
- `src/utils/formItemUtils.ts`：查找和修改表单项配置。

## 通用 Hooks

- `src/hooks/useDialogForm.ts`：新增/编辑弹窗表单状态、详情加载、提交、成功刷新。
- `src/hooks/useDeleteAction.ts`：删除二次确认、删除请求、成功提示。
- `src/hooks/useUploadDialog.ts`：上传弹窗。
- `src/hooks/useScConfirmDialog.ts`：确认弹窗。
- `src/hooks/useLoading.ts`：加载状态辅助。

## 常用工具

- `src/utils/auth.ts`：认证和 token 相关。
- `src/utils/dict.ts`：字典处理。
- `src/utils/file.ts`：文件相关工具。
- `src/utils/http.ts`：HTTP 辅助。
- `src/utils/jsencrypt.ts`：加密辅助。
- `src/utils/object.ts`：对象赋值和字段合并。
- `src/utils/searchbarUtils.ts`：搜索栏辅助。
- `src/utils/storage.ts`：本地存储封装。
- `src/utils/tree.ts`：树形数据处理。
- `src/utils/validate.ts`：校验工具。
- `src/utils/ElUtils`：Element Plus 消息工具。

## 布局

- `src/layout/index.vue`：后台主布局。
- `src/layout/components/Header.vue`：顶部区域。
- `src/layout/components/Sidebar.vue`：侧边栏。
- `src/layout/components/SidebarMenuItem.vue`：侧边栏菜单项。
- `src/layout/components/TabsBar.vue`：标签栏。
- `src/layout/components/AppMain.vue`：主内容渲染区。
- `src/layout/components/MenuIcon.vue`：菜单图标。
- `src/layout/composables/useLayout.ts`：布局逻辑。

## 页面模块

系统管理：

- `src/views/system/menu/index.vue`：菜单树管理，支持菜单 CRUD、树形展开收起、上级菜单选择和图标选择。
- `src/views/system/organizationManagement/index.vue`：组织管理。
- `src/views/system/permission/index.vue`：权限/菜单相关页面。
- `src/views/system/role/systemRole/index.vue`：系统角色页面。
- `src/views/system/role/systemRole/useRolePermissionDialog.tsx`：角色数据权限弹窗逻辑。

后台管理：

- `src/views/adminManagement/codeVulnerabilityLibrary/index.vue`
- `src/views/adminManagement/codeVulnerabilityStandard/index.vue`
- `src/views/adminManagement/commonTestEnvironments/index.vue`
- `src/views/adminManagement/controlPoint/index.vue`
- `src/views/adminManagement/controlPoint/controlPointItem.vue`
- `src/views/adminManagement/guideline/index.vue`
- `src/views/adminManagement/industryStandard/index.vue`
- `src/views/adminManagement/toolLibrary/index.vue`
- `src/views/adminManagement/toolVersion/index.vue`
- `src/views/adminManagement/vulnerabilityLibrary/index.vue`

其他页面：

- `src/views/home/index.vue`：首页。
- `src/views/login/index.vue`：登录页。
- `src/views/projectManagement/index.vue`：项目管理。
- `src/views/error/404.vue`：404 页面。
- `src/views/redirect/index.vue`：重定向页。

## CRUD 开发路径

新增一个典型 CRUD 页面时，通常需要：

1. 在 `src/types/<domain>/<entity>.d.ts` 定义 `SearchParams`、`Data`、`FormData`。
2. 在 `src/api/<domain>/<entity>-api.ts` 定义列表、详情、新增、更新、删除接口。
3. 在 `src/views/<domain>/<entity>/index.vue` 使用 `ScResourcePage` 和 `ScDialogForm` 搭页面。
4. 用 `defineFormItems<T>()` 定义表单项。
5. 用 `useDialogForm` 管理新增/编辑弹窗。
6. 需要删除时用 `useDeleteAction`。
7. 根据后端菜单/权限机制补路由、菜单和权限码。

## 页面生成器

生成器目录：

- `script/page-gen`

入口：

- `script/page-gen/cli.ts`

说明：

- `script/page-gen/README.md`

命令：

```bash
pnpm page:create
```

生成器可以创建类型、API、Vue 页面骨架。生成后仍需补全字段、接口地址、权限码和业务细节。

## 静态资源和样式

- `src/assets`：图片和静态资源。
- `src/assets/login`：登录页图片。
- `src/styles/index.scss`：全局样式入口。
- `src/styles/common.scss`：公共样式。
- `src/styles/variables.scss`：样式变量。
- `src/styles/scrollbar.scss`：滚动条样式。

## 配置文件

- `package.json`：脚本和依赖。
- `vite.config.ts`：Vite 配置。
- `vite/plugins`：Vite 插件拆分配置。
- `tsconfig.json`、`tsconfig.app.json`、`tsconfig.node.json`：TypeScript 配置。
- `eslint.config.js`：ESLint flat config。
- `.prettierrc`：Prettier 配置。
- `.env.development`、`.env.production`：环境变量。

## 自动生成文件

这些文件通常不要手动维护：

- `src/auto-import.d.ts`
- `src/components.d.ts`

如果自动导入或组件注册规则变化，应通过相关插件重新生成。
