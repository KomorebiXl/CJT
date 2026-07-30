# 项目 Agent 总纲

这是 Vue 3 + TypeScript + Vite 后台管理项目。开始任何业务修改前，必须先查阅适用规则，尤其是公共工具字典：

| 规则文件 | 适用范围 |
| --- | --- |
| `.codex/rules/UTILS_INDEX.md` | 公共组件、Hooks、表单辅助、请求/API，防止手写重复轮子 |
| `.codex/rules/CRUD_GUIDE.md` | CRUD 页面组合、弹窗表单、骨架生成器 |
| `.codex/rules/TECH_STACK.md` | 技术栈、目录、TSX、风格、命令、校验和项目地图 |
| `.codex/rules/COMPONENTS_GUIDE.md` | 通用组件清单、Props、复用场景和原生组件替代约束 |

## 最高优先级红线

- 编写业务逻辑前必须查阅公共工具字典，严禁手写重复轮子。
- 优先复用现有组件、Hooks 和页面模式，不得绕开 `ScResourcePage` / `ScDialogForm` 重写 CRUD 能力。
- 保持改动范围小，避免顺手重构无关模块；处理未提交改动时不得回滚用户或他人修改。
- 不得手动编辑自动生成的 `src/auto-import.d.ts`、`src/components.d.ts`，除非确实在更新自动导入结果。
- 除非任务明确要求，不扫描、引用或修改 `.codex`、`.agents`、`node_modules`、`dist` 和嵌套 `.git`；本次任务对 `.codex/rules/` 是明确例外。
- 不要随意修改已有中文文案、注释、提示语或标签；必须修改中文时确认 UTF-8 编码。

详细技术、命令、CRUD/API 约定和校验要求以 `.codex/rules/` 为准；涉及中文时不要依据 PowerShell 乱码重写文件，必要时使用 UTF-8 方式核对。
