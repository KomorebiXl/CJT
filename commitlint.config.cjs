/**
 * commitlint 提交信息校验规则（由 .husky/commit-msg 钩子触发）
 * type-enum 需与 .cz-config.cjs 的 types 保持同步
 */
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      ['feat', 'fix', 'docs', 'style', 'refactor', 'perf', 'test', 'build', 'ci', 'chore', 'revert']
    ]
  },
  ignores: [
    // git 自动生成的合并提交不参与校验
    (message) => /^Merge (branch|pull request|remote-tracking branch|tag)/.test(message)
  ]
}
