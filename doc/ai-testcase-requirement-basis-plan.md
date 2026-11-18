# 非合并项目生成用例纳入需求来源依据 — 实施方案

日期：2026-11-18

## 背景与目标

AI 测试用例链路目前仅按「启用合并」项目形态取素材（测试项 + 说明 + 前提条件 + 测试步骤）。
项目**不启用合并**时，功能表（`asset_acceptance_result`）由人工填写导入的 `other1..other8`
需求来源列承载依据（如"招标文件要求""合同要求"）。目标：此类项目**生成测试用例**时，
把【需求来源配置】中**已启用**字段的非空文本并入 AI 素材；提取功能点与启用合并项目维持现状。

## 实证数据（项目 2026STS2102470001-000）

- 合并标志：`ifUsePlanStealer="0"`、`ifUseResultStealer="0"`（0=不启用合并，先例：
  PlanStrategyHelper 以 `"1".equals(ifUseResultStealer)` 判合并/纵向表）；
- 需求来源配置（`risk_subject_item_basis_config`，16 行）：`other1 招标文件要求`、`other2 合同要求`
  两种功能表类型（方案/结果）均为**已启用**；`other3 需求规格说明书要求`、`other4..8` 未启用；
- `field(otherN)` 与 `AssetAcceptanceResult(Vo)` 的 `other1..other8` 字段一一对应，内容为**文本**。

## 设计

1. **触发判据**：`ifUseResultStealer = "0"`（不启用报告合并）。测试用例是结果侧产物，
   与 `generateTestLog`/`PlanStrategyHelper` 判合并用同一字段的先例一致。〔决策点①可改〕
2. **取数**：查该项目的 basis 配置，条件 `type=2（验收测试结果）`、`enable=1（启用）`，
   按 `sort` 排序；将 `field` 映射到测试项行 `other1..other8` 取值。〔决策点②：若存在
   "方案启用而结果未启用"的不对称配置会以结果表口径为准〕
3. **拼接**：在 `renderPrompt` 的局部 `itemText` 末尾追加
   `【需求来源依据】\n字段名称：内容`（如"招标文件要求：…"），空值跳过、全空不追加；
   位于【功能点清单】之前，作为背景素材。
4. **hash 与提取不受影响**：追加只发生在渲染提示词的局部变量，
   `buildMaterial`/`sourceHash`（=md5(itemText)）/提取链路（触发点20）全部不动——
   依据文本后续被人工修改不会触发"素材版本已变更"拦截，下次生成自然读到新值。
5. **范围**：详细版与常规版共用同一 `renderPrompt`，一并生效；用户文档集（docset 走专用素材）、
   性能效率、降级原文回填路径不涉及。启用合并项目（`=1`）零改动。

## 改动清单（仅后端 `AiTestCaseServiceImpl`）

- 新增注入 `IRiskSubjectService`、`IRiskSubjectItemBasisConfigService`；
- `doExpand` 内构造 `requirementBasisText(subject, result)`，传入 `renderPrompt`；
- `renderPrompt` 增加依据段参数并在 `itemText` 后拼接；
- `otherFieldValue`：`field(other1..other8) → result.getOtherN()` 显式 switch 映射，不认识的 field 跳过。

## 验收路径

1. 项目 2026STS2102470001-000 某测试项（other1/other2 有内容）生成详细版：
   AI 请求素材含【需求来源依据】段，用例内容体现依据；
2. 停用 other1 后重新生成：素材不再含该段；
3. 同项目提取功能点：素材无依据段、hash 不变、已有清单可直接生成；
4. 任一启用合并项目（如之前测试的合并项目）生成：素材与现状完全一致。

## 执行记录

- 2026-11-18 用户确认方案后实施完成，后端 `AiTestCaseServiceImpl` 单文件改动：
  新增 `requirementBasisText`（判据 ifUseResultStealer=0 + type=2 + enable=1，按 sort 升序拼接，
  mapper 已核实 `order by sort asc`）与 `otherFieldValue`（other1..8 显式映射，未识别 field 跳过）；
  `renderPrompt` 增依据参数并在 itemText 末尾追加（【功能点清单】之前）。ras-assessment 模块编译通过。
- 未验证：本地 8081 为旧部署包，端到端需用户重新部署后按上方验收路径实测；未 commit 等验收。
