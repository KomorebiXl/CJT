# PROJECT_MAP.md

## 用途

本文件只做全局导航索引，业务域的页面、API、类型和路由详情拆分在 `.codex/maps/`。开发规则见 `AGENTS.md`，公共组件复用规则见 `.codex/rules/COMPONENTS_GUIDE.md`。

## 顶层结构

| 目录 | 职责 |
| --- | --- |
| `src/api` | Axios 业务接口模块 |
| `src/types` | 业务类型声明和全局类型桥接 |
| `src/views` | 页面、业务组件和页面级 TSX 辅助 |
| `src/components` | 通用组件库，详见 `.codex/maps/common-components-map.md` |
| `src/hooks` | 组合式逻辑 |
| `src/store/modules` | Pinia Store |
| `src/router/modules` | 静态和动态路由模块 |
| `src/utils` | 请求、表单、字典、文件、树和校验工具 |
| `src/layout` | 后台布局和导航组件 |
| `src/styles` | 全局样式入口、变量和公共样式 |
| `script/page-gen` | CRUD 页面骨架生成器 |
| `vite/plugins` | Vite、自动导入、组件注册、SVG 和压缩插件 |

## 模块地图索引

| 业务域 | 页面/API/类型/路由地图 |
| --- | --- |
| 系统管理 `system` | `.codex/maps/system-map.md` |
| 系统监控 `systemMonitor` | `.codex/maps/system-monitor-map.md` |
| 后台管理 `adminManagement` | `.codex/maps/admin-management-map.md` |
| 工具 `tool`（后台管理子域） | `.codex/maps/tool-map.md` |
| 项目管理 `projectManagement` | `.codex/maps/project-management-map.md` |
| 公共能力、路由与 Store | `.codex/maps/common-components-map.md` |

## 路由判断

`src/router/modules/staticRoutes.ts` 是静态路由唯一依据；业务菜单和大部分页面由后端返回，经 `src/store/modules/router-store.ts` 转换为动态路由。不要根据目录存在推断页面已注册为静态路由。

## 维护入口

新增或移除模块页面时，优先更新对应 `.codex/maps/<模块名>-map.md` 子地图，再按需更新本索引；不要为单个业务变更重写整个全局地图。
