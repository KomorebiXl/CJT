# 执行记录表 AI 补全前提条件与测试步骤 — 实施记录

日期：2026-11-18

## 需求与实证

【首轮测试指引】→「生成执行记录表」（`/asset/plan/resultBatchExportSoftWare`，zip 打包 xlsx）。
用户上传同项目两版样例实证（功能性-HRP系统-首轮）：

- **启用合并版**：列=用例编号｜用例名称｜**前提条件(空)**｜**测试步骤(空)**｜预期结果(=测试项说明，有值)；
- **不启用合并版**：预期结果列替换为需求来源列（招标文件要求/合同要求），内容全空——无 AI 依据，维持现状。

需求（用户口径）：仅启用合并项目，生成时 AI 依据**用例名称+预期结果**填写**前提条件+测试步骤**，填写完再打包下载。

## 实现

- **后端**：新服务 `IAiExecutionRecordService`/`AiExecutionRecordServiceImpl`（触发点 **50**，
  注册进 `AiTriggerPoints`）：叶子行分批（12 行/批）JSON 进出，序号原样回传匹配；
  凭证缺失/批次失败**留空降级、绝不阻断导出**；技能行缺失走代码兜底模板。
  `AssetAcceptancePlanServiceImpl.buildFunctionResultExcel` 仅在 `outCell==0`（启用合并）收集
  叶子行（titleFlag≠1 且说明非空）调用补全，C/D 列有值写入（换行 wrapText 已有）。
  未动 Result 版同名方法（其他入口，超本轮范围）。
- **SQL**：`sql/ai_execution_record_skill.sql`（触发点50字典+ai_skill 出厂行，幂等；可选执行）。
- **前端**：`exportExecutionRecordAPI` 请求级 timeout 放宽至 300s（全局 100s 不够 AI 批量耗时）；
  弹窗确认/进行中文案说明 AI 填写耗时。
- 不落库：每次生成重新补全（与"清空原有记录表数据"的重建语义一致）。

## 验收路径（部署新后端包后）

1. 启用合并项目生成执行记录表：功能性各子系统 xlsx 叶子行 C/D 列有 AI 内容，步骤 1. 2. 3. 分行；
2. 未配置 AI 密钥的环境：下载正常、C/D 留空、后端日志有"跳过"告警；
3. 不启用合并项目：导出与现状完全一致（需求来源列、无 AI 调用）；
4. 大子系统（40+ 行）耗时可观（约 1-3 分钟），前端 5 分钟超时内完成。

## 执行记录

- 2026-11-18 实施完成：后端 4 文件（新服务×2、AiTriggerPoints、PlanServiceImpl 集成）+ SQL 1 +
  前端 2 文件；mvn 编译通过、vue-tsc 零报错。端到端待部署实测（本地 8081 为旧包）。未 commit。
- 2026-11-18（同日反馈）：启用合并效果验收通过；**追加不启用合并口径**——依据=用例名称+启用的
  需求来源字段（本方法内既有 type=PLAN 启用配置反射取 otherN，与表内动态列同源同序），接口加
  `extraBasisBySerial` 参数，提示词/SQL 种子同步升级（含已初始化库的 UPDATE 段）。编译通过。
- 2026-11-19（测试用户半空文件定案修复）：行级比对两份生成文件 + 同款提示词重放（2/2 复现）钉死
  根因——**模型偶发把 `no` 回传为「序号+空格+用例名称」**（深层重复序号批次高发；温度默认 1.0 逐次
  漂移，同批内容一次裸序号成功、一次拼接串整批 0 命中），而原匹配是精确等值 → 12 行整批静默留空、
  无异常无日志（控制台搜不到"批次失败"WARN 即此故）。修复三件套：
  1. `AiExecutionRecordServiceImpl`：`matchSerial` 归一匹配（精确 → 序号前缀+边界符取最长，全角空格/
     冒号等边界；重编号/截断仍拒绝），失配计数 WARN（返回 N 命中 M+样例），缺 cases 数组 WARN；
     `buildFunctionResultExcel` 查找键同步 trim。离线 11/11 用例（含 1FA/15FA 前缀歧义）全过。
  2. logback `file_info`：LevelFilter(INFO) → ThresholdFilter(INFO)，WARN 落盘（ERROR 双写属预期）。
  3. `ai_skill` 补触发点 50 行并定版 temperature=0.70/max_tokens=8192（压格式漂移+防 4096 截断），
     已在 71 库执行（原"可选执行"被跳过导致采样参数一直为空）。mvn 编译零报错。
