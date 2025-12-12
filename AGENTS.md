# Repository Guidelines

## 项目结构与模块组织
- `src/app`: Next.js App Router 页面层。`page.tsx` 为首页，`mcp-test/page.tsx` 是 MCP Playground，`api/mcp/route.ts` 处理 MCP API，`globals.css` 承载 Tailwind v4 基础样式。
- `src/components`: 展示组件与结果渲染，如 `SmartResultDisplay.tsx`、`DishRecommendationDisplay.tsx`。
- `src/lib`: 核心逻辑库。`tools` 汇总基础/菜谱工具并由 `index.ts` 导出；`services/recipe-service.ts` 负责数据获取与 30 分钟缓存；`constants/config.ts` 统一外部 API 与难度映射；`types`、`utils` 提供类型与通用方法。支持 `@/` 路径别名。
- 其他: `public` 存放静态资源；根目录配置文件（`eslint.config.mjs`、`tailwind.config.js`、`tsconfig.json` 等）。

## 构建、测试与开发命令
- `npm run dev`: 本地开发，默认 http://localhost:3000，用于调试首页与 `/mcp-test`。
- `npm run build`: 生产构建，发布前必跑。
- `npm run start`: 基于 `.next` 产物启动生产服务。
- `npm run lint`: Next + ESLint 检查，CI/提交前必跑，可修复常见风格问题。
- 提示: 保持锁文件一致，若使用 `pnpm`/`yarn`/`bun`，运行同名脚本即可。

## 代码风格与命名规范
- TypeScript 严格模式；函数式组件 + Hooks 优先，客户端组件需显式 `"use client"`。
- 文件命名使用 kebab-case（如 `recipe-service.ts`）；React 组件与类型用 PascalCase，常量大写（如 `CONFIG`）。
- 导入顺序建议内置库 → 第三方 → 本地（`@/` 别名优先），保持分组空行。
- 缩进 2 空格，字符串/分号遵循 ESLint 默认；Tailwind 类名按语义分组，通用样式集中在 `globals.css`。
- 新增 MCP 工具：在 `src/lib/tools` 创建文件并在 `index.ts` 导出；公共配置写入 `constants/config.ts`，避免硬编码 URL。

## 测试指引
- 当前无自动化测试，最少运行 `npm run lint`。
- 关键路径验证：`npm run dev` 后访问 `/mcp-test` 交互测试；用 `curl` 命中 `/api/mcp` 验证工具执行。
- 新功能建议补充端到端用例（如 Playwright 或 API 脚本）并在 PR 描述记录复现/验证步骤。

## 提交与 PR 规范
- Git 历史使用 Conventional Commits，例如 `feat(MCP): ✨ 添加CORS支持`、`chore:` 等；保持小写类型 + 可选作用域 + 简明摘要。
- 提交前确保 `npm run lint` 通过并自测页面/接口。
- PR 应包含变更概述、测试结果，UI 改动附截图/录屏，关联 Issue/需求，说明对缓存或外部接口的影响。

## 配置与安全
- 外部 API、缓存时长、难度映射集中在 `src/lib/constants/config.ts`，修改前确认上游可用性与策略。
- 不要提交真实密钥；若需环境变量请使用 `.env.local`（默认被忽略），并在文档中注明用途与格式。
