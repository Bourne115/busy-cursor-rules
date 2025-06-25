import { RuleTemplate } from '@/types/index';

// 内置基础模板
const BASIC_TEMPLATE: RuleTemplate = {
  id: 'basic',
  name: '基础规则',
  description: '通用的编程基础规范',
  version: '1.0.0',
  category: 'basic',
  tags: ['basic', 'general'],
  author: 'Cursor Rules CLI',
  files: [
    {
      path: 'basic/general.mdc',
      content: `---
description: "通用编程基础规范"
alwaysApply: true
---

# 通用编程基础规范

## 代码风格
- 使用有意义的变量和函数命名
- 保持代码简洁和可读性
- 添加必要的注释说明复杂逻辑
- 遵循项目的代码格式化规范

## 函数设计
- 函数应该单一职责，功能明确
- 避免函数过长，建议不超过50行
- 参数不宜过多，超过3个参数考虑使用对象
- 返回值类型要明确

## 错误处理
- 对可能出错的操作进行适当的错误处理
- 使用具体的错误信息，便于调试
- 避免空的catch块

## 性能考虑
- 避免不必要的计算和内存分配
- 合理使用缓存
- 注意避免内存泄漏
`,
    },
  ],
};

const REACT_TEMPLATE: RuleTemplate = {
  id: 'react',
  name: 'React 规则',
  description: 'React 开发最佳实践',
  version: '1.0.0',
  category: 'module',
  tags: ['react', 'frontend'],
  author: 'Cursor Rules CLI',
  files: [
    {
      path: 'modules/react.mdc',
      content: `---
description: "React 开发规范"
globs: ["**/*.jsx", "**/*.tsx"]
---

# React 开发规范

## 组件设计
- 使用函数式组件和 Hooks
- 组件名使用 PascalCase
- 组件文件名与组件名保持一致
- 单个文件只导出一个主要组件

## Hooks 规则
- 只在组件顶层调用 Hooks
- 不要在循环、条件或嵌套函数中调用 Hooks
- 使用 useEffect 处理副作用
- 合理使用 useMemo 和 useCallback 优化性能

## Props 管理
- 使用 TypeScript 定义 Props 类型
- 为 Props 提供默认值
- 使用解构赋值简化 Props 使用

## 状态管理
- 优先使用内置的 useState 和 useReducer
- 复杂状态考虑使用 Context 或外部状态管理库
- 避免过度嵌套的状态结构

## 性能优化
- 使用 React.memo 避免不必要的重渲染
- 合理使用 key 属性
- 避免在 render 中创建对象和函数
`,
    },
  ],
};

const TYPESCRIPT_TEMPLATE: RuleTemplate = {
  id: 'typescript',
  name: 'TypeScript 规则',
  description: 'TypeScript 开发规范',
  version: '1.0.0',
  category: 'basic',
  tags: ['typescript', 'type-safety'],
  author: 'Cursor Rules CLI',
  files: [
    {
      path: 'basic/typescript.mdc',
      content: `---
description: "TypeScript 开发规范"
globs: ["**/*.ts", "**/*.tsx"]
---

# TypeScript 开发规范

## 类型定义
- 优先使用 interface 定义对象类型
- 使用 type 定义联合类型和复杂类型
- 避免使用 any，使用 unknown 替代
- 合理使用泛型提高代码复用性

## 类型安全
- 启用严格模式 (strict: true)
- 使用类型断言时要谨慎
- 优先使用类型守卫而不是类型断言
- 为函数参数和返回值明确指定类型

## 接口设计
- 接口名使用 PascalCase
- 可选属性使用 ? 标记
- 只读属性使用 readonly 修饰符
- 合理使用继承和组合

## 模块导入导出
- 使用 ES6 模块语法
- 明确指定导入导出的类型
- 避免循环依赖
`,
    },
  ],
};

const VUE_TEMPLATE: RuleTemplate = {
  id: 'vue',
  name: 'Vue.js 规则',
  description: 'Vue.js 开发最佳实践',
  version: '1.0.0',
  category: 'module',
  tags: ['vue', 'frontend'],
  author: 'Cursor Rules CLI',
  files: [
    {
      path: 'modules/vue.mdc',
      content: `---
description: "Vue.js 开发规范"
globs: ["**/*.vue", "**/*.ts", "**/*.js"]
---

# Vue.js 开发规范

## 组件命名
- 使用 PascalCase 命名组件
- 组件文件名与组件名保持一致
- 使用描述性的组件名

## 组件结构
- 使用 Composition API (Vue 3)
- 合理使用 ref 和 reactive
- 使用 computed 处理派生状态
- 使用 watch 监听响应式数据变化

## 模板规范
- 使用 v-for 时始终添加 key
- 避免在模板中使用复杂的表达式
- 合理使用 v-if 和 v-show
- 使用作用域插槽传递数据

## 样式规范
- 使用 scoped 样式避免样式污染
- 合理使用 CSS Modules 或 CSS-in-JS
- 遵循 BEM 命名规范

## 性能优化
- 使用 v-memo 优化列表渲染
- 合理使用异步组件
- 避免不必要的响应式数据
`,
    },
  ],
};

const NODE_TEMPLATE: RuleTemplate = {
  id: 'node',
  name: 'Node.js 规则',
  description: 'Node.js 开发最佳实践',
  version: '1.0.0',
  category: 'module',
  tags: ['node', 'backend'],
  author: 'Cursor Rules CLI',
  files: [
    {
      path: 'modules/node.mdc',
      content: `---
description: "Node.js 开发规范"
globs: ["**/*.ts", "**/*.js"]
---

# Node.js 开发规范

## 模块管理
- 使用 ES6 模块语法 (import/export)
- 合理组织模块结构
- 避免循环依赖
- 使用绝对路径导入

## 异步处理
- 优先使用 async/await
- 正确处理 Promise 错误
- 避免回调地狱
- 合理使用并发控制

## 错误处理
- 使用统一的错误处理机制
- 提供详细的错误信息
- 记录错误日志
- 优雅地处理未捕获的异常

## 性能优化
- 使用流处理大文件
- 合理使用缓存
- 避免内存泄漏
- 监控应用性能

## 安全规范
- 验证输入数据
- 防范 SQL 注入
- 使用 HTTPS
- 实施访问控制
`,
    },
  ],
};

// 模板注册表
const TEMPLATES = new Map<string, RuleTemplate>([
  ['basic', BASIC_TEMPLATE],
  ['react', REACT_TEMPLATE],
  ['typescript', TYPESCRIPT_TEMPLATE],
  ['vue', VUE_TEMPLATE],
  ['node', NODE_TEMPLATE],
]);

/**
 * 获取指定模板
 */
export async function getTemplate(templateId: string): Promise<RuleTemplate> {
  const template = TEMPLATES.get(templateId);

  if (!template) {
    throw new Error(`Template "${templateId}" not found`);
  }

  return template;
}

/**
 * 获取所有可用模板
 */
export async function getAllTemplates(): Promise<RuleTemplate[]> {
  return Array.from(TEMPLATES.values());
}

/**
 * 检查模板是否存在
 */
export function hasTemplate(templateId: string): boolean {
  return TEMPLATES.has(templateId);
}

/**
 * 注册新模板
 */
export function registerTemplate(template: RuleTemplate): void {
  TEMPLATES.set(template.id, template);
}

/**
 * 获取模板列表（仅基本信息）
 */
export async function getTemplateList(): Promise<
  Array<{ id: string; name: string; description: string }>
> {
  return Array.from(TEMPLATES.values()).map(template => ({
    id: template.id,
    name: template.name,
    description: template.description,
  }));
}
