module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // 类型字段小写
    'type-case': [2, 'always', 'lower-case'],
    // 类型字段不能为空
    'type-empty': [2, 'never'],
    // 类型字段枚举
    'type-enum': [
      2,
      'always',
      [
        'build',    // 构建系统或外部依赖的更改
        'chore',    // 杂务，不影响源代码的更改
        'ci',       // CI配置文件和脚本的更改
        'docs',     // 文档更新
        'feat',     // 新功能
        'fix',      // 错误修复
        'perf',     // 性能改进
        'refactor', // 重构代码
        'revert',   // 回滚提交
        'style',    // 代码格式更改
        'test'      // 添加或更新测试
      ]
    ],
    // 主题字段不能为空
    'subject-empty': [2, 'never'],
    // 主题字段以句号结尾
    'subject-full-stop': [2, 'never', '.'],
    // 主题字段小写
    'subject-case': [2, 'always', 'lower-case'],
    // 主题字段最大长度
    'subject-max-length': [2, 'always', 50],
    // header最大长度
    'header-max-length': [2, 'always', 72],
    // body每行最大长度
    'body-max-line-length': [2, 'always', 100]
  }
}; 