# 九特性测试用例集中下载实施记录

日期：2026-11-16。实施聊天：本聊天。独立验收入口：原聊天 01a1e30f-02d3-7fb0-9eb1-bb5611a148e7。本记录描述实施与自测结果。后续独立审核与开发库菜单执行结果见 `testcase-central-download-acceptance.md`。

## 实现范围

- 新增“测试用例指引”，复用首轮/回归的 `StepGuide`、页面容器及九特性选择交互，只保留“查看与完善测试用例”和“下载全部测试用例”两步，无统计、预览、批量AI生成功能。
- 集中入口与功能性页原“全部用例”共用 `useAllTestCasesDownload`，固定九特性详细版，点击时绑定项目，首个异步操作前加锁，显示“正在生成文档…”。保留 `needSubjectId:false`，不被全局项目覆盖；项目切换清理错误，旧项目错误不回写当前页面。错误支持业务JSON及HTTP Blob JSON解析，并提供特性页面入口。
- 特性弹窗从当前项目已授权菜单解析组件、真实路由名及目标 `feature`，不假设功能性菜单名称；跳转覆盖旧特性参数并保留项目参数。
- 服务端依次组装1功能性、2信息安全性、3兼容性、4可靠性、5易用性、6可移植性、7维护性、8用户文档集、9性能效率。普通特性保留子特性、子系统、分类及多用例；未匹配到子系统清单的存量行仍按原ID分组输出。
- 普通范围仍只要求存在详细版生成记录，允许降级记录并保留原文回填/降级标识，不要求全部AI成功。文档集有效核查项缺步骤时阻断；整特性专用一张表。性能保留现有 preparation/strategy/transactionDescription/resultDetail 等源字段规则，不调用AI。仅8/仅9绕过普通记录门槛；全空/只有分类或不可渲染叶子拒绝生成。空特性保留章节及“当前无有效测试数据”。
- 共用支持文件注册表，文档集/性能的引用也进入统一附录，附录位于第九特性之后。
- 复用唯一的 `complex-test-case-template.docx`，其封面竖版、正文横版及原页眉页脚关系保留。8/9没有独立docx模板，沿用现有专表改造及映射。集中导出清理旧样例目录缓存，重建当前标题及PAGEREF，保留TOC完整域与打开时更新标记。页码依赖Word更新域，未引入服务端排版引擎。

## 关键文件与接口

前端仓库 `D:/project/rebuild_project`：

- `src/views/projectProcess/testCases/testCaseGuidelines/index.vue`：指引及已授权特性导航。
- `src/views/projectProcess/testCases/useAllTestCasesDownload.ts`：集中请求、项目绑定、防重及错误处理。
- `src/views/projectProcess/testCases/testCasesFunctionality/index.vue`：原全部入口统一口径；单功能性详细/常规下载参数保留。
- `src/views/projectProcess/components/StepGuide/{index.vue,stepGuide.ts}`：可选disabled及兼容同步/异步handler，其余指引默认行为不变。
- `src/types/projectProcess/testCases.d.ts`：显式scope类型。
- 回归与 Word 验证辅助文件在验收完成后按用户要求删除；以下保留删除前的验证记录，不再提供可复跑入口。

后端仓库 `D:/project/risk_assessment_system`：

- `ras-assessment/src/main/java/com/zjsc/ras/assessment/controller/AiTestCaseController.java`：集中范围参数、各类门槛与数据装配。
- `ras-assessment/src/main/java/com/zjsc/ras/assessment/util/AiTestCaseWordBuilder.java`：集中章节、空章节、专表、目录及统一附录。
- `sql/test_case_central_download_menu.sql`：菜单与角色交付。

复用 `GET /asset/acceptance/result/aiTestCase/download?subjectId=<点击时项目>&scope=allFeatures&caseType=detail`，权限仍为 `acceptance:result:aiTestCase:download`。scope不支持其他值；集中范围不能混入feature/subFeature/subsystem或simple/省略版本。无scope保留既有单特性和旧范围契约（旧无feature仍不含性能），前端两个“全部”入口均已改用新scope。

## 菜单交付

实施阶段没有执行数据库SQL；后续验收窗口已执行开发库菜单脚本，创建菜单3830和下载按钮3831，详见独立验收记录。`router-store.ts` 的组件glob及动态路由机制直接支持新组件，无需伪造静态入口。

发布时先核实父菜单3818，再在目标环境执行后端 `sql/test_case_central_download_menu.sql`：幂等新增组件 `projectProcess/testCases/testCaseGuidelines/index`、path `testCaseGuidelines`，排序放在明细前；复制已有测试用例父菜单的系统角色与项目角色可见关系，不删除旧菜单或关系。已有下载权限记录直接复用；若权限记录不存在，补建按钮后仍须管理员授权对应系统角色及项目角色，不自动扩大下载权限。执行脚本后重新登录/加载项目菜单，核实管理员、普通角色、开启项目角色三类可见性及下载权限。SQL仅静态核查，未声称数据库执行通过。

## 验证命令及结果

以下为清理前的历史执行记录；涉及的辅助文件已按用户要求删除，路径不是当前运行入口。

从前端目录运行：

| 命令 | 实际结果 |
| --- | --- |
| `node --test （已删除）ai-testcase-feedback-regression.mjs` | 13/13通过，含真实SFC/路由特性参数2/8/9、项目切换/请求包装器、防重、Blob错误、单特性任务恢复原回归 |
| `./（已删除）test-ai-testcase-backend.ps1` | 目标Java 8编译通过，显式编译本次controller及builder；既有反馈回归和集中下载回归均通过 |
| `./（已删除）test-ai-testcase-backend.ps1 -Group central` | 可单独复跑集中范围/版本/门槛及Word生成检查 |
| `npx vue-tsc --noEmit --incremental false -p tsconfig.app.json` | 通过；沙箱内依赖读取EPERM后经正常提权执行 |
| `npx eslint src/views/projectProcess/components/StepGuide/index.vue src/views/projectProcess/components/StepGuide/stepGuide.ts src/views/projectProcess/testCases/testCasesFunctionality/index.vue src/views/projectProcess/testCases/testCaseGuidelines/index.vue src/views/projectProcess/testCases/useAllTestCasesDownload.ts src/types/projectProcess/testCases.d.ts` | 通过；仅既有ESLintIgnoreWarning；沙箱依赖读取EPERM后经正常提权执行 |
| 前后端 `git diff --check` | 通过；存在Windows LF/CRLF提示，无空白错误 |
| `./（已删除）testcase-central-download-word-qa.ps1` | 本机Word 2013只读打开3份样例，更新域并导出PDF，不保存修改到源docx；实际PDF页数为13、7、7 |

Java内存端口测试调用真实Controller及Builder，不连接DB/AI：覆盖全空、只有标题、空祖先下叶子、详细/常规隔离、降级放行、混合普通+缺文档集步骤拒绝、仅8/9、冲突范围与子范围、性能空字段`--`、九特性顺序、空章节、层级/全部子系统、多AI cases、原文/降级标识、共享附录、单1 detail/simple及单8/9回归。所有数据查询校验subjectId=A、enable=1、delFlag=0，集中AI记录只查询普通有效项及detail版本，AI/提取调用即触发测试失败。

## Word证据与版式边界

自测留存的样例位于 `D:/project/rebuild_project/node_modules/.cache/testcase-central-download/`：`nine-features.docx`、`only-docset.docx`、`only-performance.docx`。`word-render/` 下保留Word导出的PDF、PNG及 `word-qa.json`，`pages`采用pdfinfo实际页数；Word的ComputeStatistics对仅8/9曾返回9页，与PDF实际7页不同，另记为 `wordStatisticsPages` 供追查。

已使用documents的 `render_docx.py --emit_pdf` 做LibreOffice渲染，并用Word及Poppler交叉检查。Word混合样例13页及两个单类样例共14页均已视觉检查：封面、修订、目录、横竖版、专表字段、页眉页脚、空章节及末尾附录可读，无内容覆盖或缺列。目录在Word更新域后页码正确、无旧XXXX样例；LibreOffice直接转换对PAGEREF缓存不自动刷新，不能把其空白页码视为Word更新已验证的替代证据。

沿用模板的可见限制：长表会跨页，普通用例或仅文档集样例可能在页底只留表头/身份行，后续内容续页，没有把该行重复为续表头；本次未重设计既有模板分页规则，不宣称分页完美。Word COM QA经正常提权只读执行；Poppler报Symbol显示字体提示，但已查看中文/英数字正文与字段，无对应缺字现象。

## 未验证项与独立审核入口

- 未启动真实HTTP服务、连接真实数据库或调用AI；未做真实项目数据下载、权限中间件/角色菜单端到端联调，实施阶段未执行菜单SQL；后续验收窗口已完成开发库落地。真实登录及前述三类角色的入口和权限仍须联调。
- 未跑全仓Maven构建（PATH无mvn）；已用本机JDK及现存模块classes/dependency jars完成目标编译。未把此结果冒充全后端构建或部署通过。
- 未在真实浏览器中登录查看新页；布局复用及交互通过类型/lint与真实SFC/路由行为测试验证。
- 未提交、推送、部署或修改线上数据。前端原`.env.development`、后端其他并发改动（`.gitignore`、`pom.xml`、`application-dev.yml`、`docs/`）均未由本次编辑，不应纳入本次提交。发现后端SQL存在外部暂存快照，本次未操作Git索引，审核需同时查看staged与unstaged，采用工作树最终版本。
- 原聊天可从本记录、两仓实际diff、上述命令和样例独立验收，重点复核三类门槛、项目绑定、旧单特性行为、菜单落地及模板跨页边界。本聊天未向原聊天发送消息，未自行宣布独立验收完成。
