/**
 * commitizen (cz-customizable) 交互式提交配置
 * 运行 `pnpm commit` 代替 `git commit`，按提示逐步选择/填写
 * 注意：types 列表需与 commitlint.config.cjs 的 type-enum 保持同步
 */
module.exports = {
  messages: {
    type: '选择提交类型:',
    scope: '选择本次改动的影响范围（可选）:',
    customScope: '请输入自定义范围:',
    subject: '填写简短描述（必填）:',
    body: '填写详细描述（可选，按回车跳过）:',
    breaking: '列出 BREAKING CHANGE（可选，按回车跳过）:',
    footer: '填写关联 issue，如 #31, #34（可选，按回车跳过）:',
    confirmCommit: '确认使用以上信息提交?'
  },
  types: [
    { value: 'feat', name: 'feat:     新增功能' },
    { value: 'fix', name: 'fix:      修复缺陷' },
    { value: 'docs', name: 'docs:     文档变更' },
    { value: 'style', name: 'style:    代码格式（不影响功能逻辑）' },
    { value: 'refactor', name: 'refactor: 重构（既非新增功能也非修复缺陷）' },
    { value: 'perf', name: 'perf:     性能优化' },
    { value: 'test', name: 'test:     测试相关' },
    { value: 'build', name: 'build:    构建系统或外部依赖变更' },
    { value: 'ci', name: 'ci:       CI 配置变更' },
    { value: 'chore', name: 'chore:    其他不影响源码的杂项' },
    { value: 'revert', name: 'revert:  回滚某次提交' }
  ],
  scopes: [
    { value: 'common', name: 'common:    公共组件/Hooks/工具' },
    { value: 'pages', name: 'pages:     业务页面' },
    { value: 'api', name: 'api:       请求/API 定义' },
    { value: 'router', name: 'router:    路由与菜单' },
    { value: 'style', name: 'style:     全局样式' },
    { value: 'build', name: 'build:     构建/工程化配置' },
    { value: 'docs', name: 'docs:      文档' }
  ],
  allowCustomScopes: true,
  allowEmptyScopes: true,
  customScopeAlias: 'custom: 自定义范围',
  emptyScopeAlias: 'empty:  跳过范围',
  upperCaseSubject: false,
  breakingPrefix: 'BREAKING CHANGE',
  footerPrefix: 'Closes',
  subjectLimit: 72
}
