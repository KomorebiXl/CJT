# AI 测试用例评审修复台账

> 阶段提交说明（2026-11-13）：本次提交保存修复实现与隔离回归成果，不代表最终验收或上线批准。独立代码审核发现三个待测试环境复现确认的风险：停止请求缺少 taskId 约束，可能误停同项目新任务；读取旧成功记录的数据库异常可能被当作无旧成功并进入降级；提取提交仅复核素材 hash，可能覆盖在途更新的评审清单。三项尚未修复，后续先真实复现，再安排修复及复验。下文“完成”为实现及所列隔离验证状态，不表示上述风险已关闭。

设计依据：`.codex/ai-testcase-20261110-feedback-review.md`（2026-11-13 最新口径）。

工作区保护：前端原有 `.env.development`、两个生成记录弹窗修改；后端原有 `.gitignore`、`pom.xml`、`application-dev.yml`、`docs/` 均保留。

状态：本轮列出的 1~7（5a/5b 分记）、E1/E2 及旧方案纠正均已实施并完成下列验证。无生产连接、数据库数据修改、部署或 Git 提交。

索引：1 项目任务绑定；2 功能点归属/素材/过期响应；3 单项业务闸门；4 两版统一就绪校验；5a 编辑漏存；5b 连续操作漏存；6 同步超时；7 任务恢复上下文；E1 下载全部；E2 停止清理；D1 旧方案。

## 1 · 完成：跨项目任务请求串线

- 根因：全局拦截器把当前流程项目覆盖到任务显式参数，任务浮卡生命周期跨页面。
- 内容/方式：progress、stop、download 及同组显式项目的 generate/extract/docset 请求设置已有扩展 `needSubjectId: false`。任务携带的项目成为唯一来源，无需扩大修改全局注入规则。
- 文件：`src/api/projectProcess/testCases-api.ts`；回归脚本 `script/ai-testcase-feedback-regression.mjs`。
- 验证：`node --test script/ai-testcase-feedback-regression.mjs`，1/1 通过；执行真实 API、SCRequest 下载包装器和拦截器，模拟当前项目 B、任务项目 A，7 条请求保持 A，下载仍保留 blob 与 simple 参数。
- 限制：未连接真实后端，不包含服务端项目权限校验。

## 6 · 完成：同步 AI 接口超时与后端不一致

- 根因：全局前端 100 秒短于后端一次读取 180 秒；后端还可能重试两次，且同步小批量顺序处理。
- 内容/方式：仅 regenerate / extractSync 设置每项 20 分钟、按 1~10 条缩放的 timeout，覆盖默认配置三次连接+读取各 180 秒与 1/2 秒退避（1083 秒）并留处理余量。评估后保留现有同步协议，避免扩张任务范围协议。
- 文件：`src/api/projectProcess/testCases-api.ts`。
- 验证：Node 真实请求链回归通过，单项 1200000ms、两项 2400000ms，其他 API 仍走默认超时。
- 限制：未实际等待 20 分钟或调用真实 AI；部署网关/代理超时及未来后端重试配置变更仍需配套，网络主动断线不由 Axios timeout 保证。

## 2 · 完成：功能点异步串项与全量误覆盖

- 根因：查询/保存使用实时 props 且不检查过期响应；后端先改归属再置换，信任客户端 hash，也无全量快照冲突检测。
- 内容/方式：切项立即清空并捕获 resultId/上下文，查询成功、失败、保存返回均拒绝过期写回；保存只使用已加载所属测试项。后端在事务内锁测试项父行，先校验完整 expectedIds、条目 ID/result/subject、全部旧素材 hash 及提交版本，再软删插入；新增行由服务端生成 ID/归属/hash。每次返回新清单，支持下一次快照保存。提取置换共用事务父行锁，并在落库前复核素材，防旧提取结果覆盖改版。
- 文件：前端 FunctionPointPanel.vue、testCases-api.ts、testCases.d.ts；后端 AiFunctionPointServiceImpl、IAiFunctionPointService、AiFunctionPointReviewDTO、AiFunctionPointMapper.java/xml、AiTestCaseController。
- 验证：真实 SFC+Vue 的请求乱序/保存切项场景通过；真实后端服务行为回归验证跨项、伪造 ID/hash、旧快照、素材变更均在零删除/零插入前拒绝，合法无 ID 新增带服务端 hash。已授权写入后端，目标 Java 类重新编译及回归通过。
- 限制：无真实数据库事务/锁集成验证；hash 按既定口径覆盖测试项名称及最终说明文本，不扩为前提/步骤。前后端需配套更新，旧客户端缺 expectedIds 将安全拒绝保存。

## 3 · 完成：单项业务闸门被 AI 故障降级吞掉

- 根因：doExpand 的业务前置异常被 expandOne 的 catch(Exception) 捕获，触发降级原文落库。
- 内容/方式：素材组装及统一 readiness 在模型 try/catch 之前执行；同步 regenerate 先整批预校验再调用模型。成功结果写库移出模型 catch，数据库异常也不再触发降级。真实调用/解析故障仍保留已有成功结果，无旧成功才按原设计降级。
- 文件：后端 `AiTestCaseServiceImpl.java`。
- 验证：目标类编译及真实服务回归通过：detail/simple 未提取零 AI/零写入；同步小批量后项不就绪时前项零调用；真实模型异常有旧成功不覆盖、无旧成功 status2；数据库异常直接抛出不降级。
- 限制：没有真实 AI/数据库/HTTP 集成；下载仍遵循“所选版本有生成记录”既定闸门，不擅改为每项全部成功。

## 4 · 完成：两版及单项/批量就绪规则不一致

- 根因：单项 simple 清空清单且跳过 hash；批量只认至少一个确认点，漏掉同清单待评审项。
- 内容/方式：统一 `requireReady(result, material)`，全清单归属/hash 有效、全部功能点确认/非功能项剔除且至少一个确认点。详细/常规、单项/批量均复用。批量保留先筛待处理集再计数整批拦截，增量成功项不追溯。常规版读取人工清单为唯一功能边界，合并为一条测试项用例；修正技能缺失时误用详细版兜底模板，并校验常规返回仅一条。
- 文件：后端 IAiFunctionPointService、AiFunctionPointServiceImpl、AiTestCaseServiceImpl、AiTestCaseTaskManager。
- 验证：真实服务/任务回归通过：部分确认/待处置剔除项/素材变更均阻断；增量只检查待处理集、detail 成功不跳过 simple；simple prompt 包含评审点及合并要求，落库版本隔离。目标 Java 类编译通过。
- 补强：生成/降级结果提交前在事务内共用测试项父行锁，再验证素材及评审点 ID 快照；AI 在途改说明或重评清单均拒绝旧结果落库，异常仍在降级范围外。已新增并通过两种在途变更的零写入回归。
- 限制：模型语义质量未以真实 AI 验收；数据库事务/锁未进行真实集成验证。

## 7 · 完成：恢复任务丢失范围与版本

- 根因：后端快照缺真实范围/版本；前端按当前页面 fallback 或同项目旧 meta 猜测下载上下文，且恢复/轮询无过期保护。
- 内容/方式：后端任务创建时固化 taskId、feature/subFeature/subsystem/caseType，快照返回；文档集固定 feature8。前端 start/resume/poll 按可信服务端元信息重建下载参数，页面 fallback 只用于新提交时的显示文案。旧快照可看进度但禁浮卡下载并提示回原范围选版本；下载方法也防御。加入生命周期序号，旧恢复/轮询/停止响应不覆盖新任务，B页面恢复不清掉A在途任务。
- 文件：后端 AiTestCaseTaskManager；前端 ai-task-store.ts、testCases.d.ts、AiTaskFloatCard/index.vue。
- 验证：后端快照 simple/子特性/子系统及文档集 feature8 回归通过；真实 Pinia store 新会话恢复后实际下载参数为服务端 simple+范围；旧快照不发下载，旧恢复响应不覆盖新 start，跨项目 resume 保持在途任务。vue-tsc 与相关 ESLint 通过。
- 限制：后端重启仍丢单机内存任务（既定边界）；旧版本服务端无可信任务范围时须用户从原页面手动下载。

## E1 · 完成：下载全部追加文档集绕过步骤闸门

- 根因：仅独立 feature8 下载校验步骤，合并下载直接组装空步骤载荷。
- 内容/方式：将步骤非空验证放入独立/追加路径共用的 buildDocSetPayload；合并导出先验证文档集再组装文档。没有文档集核查数据仍不追加；不扩张普通特性记录闸门，也不把性能效率并入下载全部。
- 文件：后端 AiTestCaseController.java。
- 验证：真实 Controller 的独立 feature8 / feature 为空合并下载均在 response 任何写入前拒绝缺步骤；共享载荷方法同样拒绝。目标 Java 编译通过。
- 限制：未生成真实 Word 比对版式，未连数据库。

## E2 · 完成：停止清理失败被误报 stopped

- 根因：清理异常仅日志、仍标已作废；重试若与正在清理的同批并行，会存在删除后续批次风险；停止与完成还有检查窗口。
- 内容/方式：清理失败抛错并保留 cleanupPending 和 writtenIds/版本/范围，状态 failed，卡片给“重试作废”；清理完成前拒绝新批次替换任务。仅 failed+pending 允许幂等重试，进行中清理不重复执行。停止请求与成功完成用任务锁原子仲裁，保持排队跳过/在途完成/本批作废语义。前端停止推进请求生命周期，旧 poll 不得回退终态；提交互斥并阻止 resume 抢占，待清理卡片收起保留上下文。
- 文件：后端 AiTestCaseTaskManager；前端 ai-task-store.ts、AiTaskFloatCard/index.vue。
- 验证：mapper 删除失败→failed+pending，禁止新任务，幂等重试→stopped；进行中清理重复停止不重清；已接受停止不转成功、已完成不接受迟到停止；真实 Pinia 旧 poll 晚回不覆盖 stopped，提交在途不会被 resume/重复提交吞掉。按本批 writtenIds 和 simple 版本删除的断言通过。
- 限制：部分清理失败可重试但不是一次数据库事务；后端重启仍会丢内存待清理信息，需人工核对，属于既有单机内存边界。

## D1 · 完成：旧设计文档口径纠正

- 内容/方式：two-stage-plan / two-stage-feasibility 删除无清单自动回落、一步式快速模式和下载不变等过时指导，明确最新报告优先、两版强制闸门、增量待处理集以及常规版合并确认范围。
- 文件：`.codex/ai-testcase-two-stage-plan.md`、`.codex/ai-testcase-two-stage-feasibility.md`（仓库忽略目录，已授权写回原文件）。
- 验证：按条核对并检索旧口径；只保留历史背景描述与“禁止回落”的当前说明。
- 限制：旧实施摘要保留历史实现记录，不作为当前设计口径。

## 最终验证与交付边界

- `node --test script/ai-testcase-feedback-regression.mjs`：9/9 通过，执行真实 API/下载包装器/请求拦截器、SFC script + Vue、Pinia store。
- `./script/test-ai-testcase-backend.ps1`：JDK8 编译本轮 7 个目标 Java 源文件和行为回归程序，5 组全部通过。使用后端已有模块 classes 与 WEB-INF/lib 依赖，所有新编译输出写前端 node_modules/.cache；接口由内存替身实现，未启动服务器或访问数据库/AI。
- `pnpm exec vue-tsc --noEmit --incremental false -p tsconfig.app.json`：最终通过。
- 本轮 7 个前端变更文件的 `pnpm exec eslint ...`：通过，仅已有 `.eslintignore` 迁移警告。
- 前后端 `git diff --check`：通过，仅现有 Windows 换行提示。
- MyBatis mapper XML 语法解析通过；本轮暂存补丁目录已清理，回归输出留在忽略的 node_modules/.cache 中。
- 环境未提供 PATH 中的 Maven，未声称全仓 Maven 构建或全量后端测试通过；未做浏览器联调、真实 AI、真实数据库事务锁及 Word 版式验收。
- 服务契约有配套变化：功能点保存请求必须带 expectedIds、响应为新清单；建议前后端一同更新。没有新增数据库列或迁移。
- 保留既定边界：feature8/9 共享骨架；详细/常规独立；详情固定详细；停止本批作废；全部下载不含性能效率；单机内存任务重启丢失。未扩张“全部特性一键生成”等未决业务。
- 原有前后端用户修改完整保留。本轮 .codex 文档为忽略文件，交付时应单独携带；逐项台账及回归脚本在前端 doc/、script/ 中可审阅。

## 5a · 完成：评审文字编辑漏存

- 根因：名称/描述/剔除理由仅 v-model，已确认点隐藏确认入口，生成使用库里旧内容。
- 内容/方式：编辑立即变为待确认/脏草稿，新增明确“保存编辑”及“刷新放弃”入口；确认同时保存当前文本。详情单项与当前范围批量生成都先等待队列并检查未保存状态。后台任务完成刷新保留脏草稿并提示，避免自动刷新漏存。
- 文件：FunctionPointPanel.vue、CaseDetailPanel.vue、TestCaseSplitView.vue。
- 验证：真实 SFC+Vue 回归通过，已确认文本编辑后生成前检查失败、自动刷新保留草稿、保存后仍待确认、重新确认提交新文字；vue-tsc 通过。
- 限制：编辑采用明确保存交互，切换测试项会重新加载；跨页面草稿持久化不在本轮范围。

## 5b · 完成：保存期间连续确认丢失/假确认

- 根因：先改本地状态，persist 遇保存中直接返回，第二动作既没落库也没撤销。
- 内容/方式：动作排队、在最新成功快照上串行保存，服务端成功后才更新确认状态；localKey + 服务端 sort 关联行，跨新 ID/功能区重排仍保持身份。保存期间控件禁用，脚本同轮连续事件仍排队而非丢弃。校验失败不改变确认状态，接口失败保留为未确认草稿并要求刷新重评。
- 文件：FunctionPointPanel.vue；前后端清单快照接口同 #2。
- 验证：真实 SFC 连续“剔除第一条+确认第二条”，模拟新 ID/服务端重排后两次都落库且不串条；保存前无假确认，空名称零提交，失败无已确认状态。请求切项和提取切项回归通过。
- 限制：无浏览器/真实后端联调；已提交保存返回不确定时由服务端旧快照校验拒绝再次覆盖，用户刷新后重评。

## 2026-11-16 清理验收辅助文件

按用户要求删除回归测试和 Word 检查辅助文件。上文命令及结果是删除前的历史验证记录，不再作为当前可运行入口。业务代码和历史验证结论未改动。
