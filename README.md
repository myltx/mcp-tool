<!--
 * @Date: 2025-08-18 16:40:59
 * @LastEditTimes: 2025-08-25
 * @Description: MCP Tool - 模块化架构的 MCP 协议测试工具
-->

# MCP Tool

一个基于 [Next.js](https://nextjs.org) 和 [Model Context Protocol (MCP)](https://github.com/modelcontextprotocol/mcp) 构建的现代化工具箱，提供完整的 MCP 协议功能测试和菜谱管理系统。

## 📋 目录

- [项目介绍](#项目介绍)
- [核心特性](#核心特性)
- [快速开始](#快速开始)
- [使用指南](#使用指南)
- [API 文档](#api-文档)
- [项目架构](#项目架构)
- [开发指南](#开发指南)
- [部署指南](#部署指南)
- [故障排除](#故障排除)
- [贡献指南](#贡献指南)
- [许可证](#许可证)

## 🚀 项目介绍

MCP Tool 是一个采用模块化架构设计的 MCP 协议交互平台，集成了基础工具和智能菜谱系统，为开发者提供友好的用户界面来测试和使用 MCP 协议的各种功能。

### 核心特性

- **🏗️ 模块化架构**: 采用现代化模块化设计，职责分离，易于维护和扩展
- **🍳 智能菜谱系统**: 集成真实菜谱数据源，提供搜索、推荐、智能搭配、食材匹配等功能
- **⚡ 高性能缓存**: 30 分钟智能缓存机制，提升性能同时减少 API 调用
- **🔧 MCP Playground**: 交互式界面，实时测试 MCP 工具和功能
- **📋 完整工具集**: 9 个精心设计的 MCP 工具，涵盖基础功能和菜谱管理
- **🎯 类型安全**: 完整的 TypeScript 类型定义，确保代码质量
- **🌙 深色模式**: 自动适应系统主题偏好
- **📱 响应式设计**: 完美适配桌面和移动设备

### 工具列表

#### 基础工具 (3 个)

| 工具名           | 功能描述                    | 参数示例                          |
| ---------------- | --------------------------- | --------------------------------- |
| `hello`          | 返回一段问候语              | `{"name": "世界"}`                |
| `time`           | 返回当前时间                | `{}`                              |
| `getAllWebsites` | 获取 Dream-hub 所有网站信息 | `{"categoryId": -1, "limit": 10}` |

#### 菜谱工具 (6 个)

| 工具名                     | 功能描述         | 参数示例                              |
| -------------------------- | ---------------- | ------------------------------------- |
| `searchRecipes`            | 根据菜名搜索菜谱 | `{"query": "红烧肉"}`                 |
| `randomRecipe`             | 随机推荐菜谱     | `{}`                                  |
| `whatToEat`                | 智能推荐菜品组合 | `{"peopleCount": 4}`                  |
| `findRecipesByIngredients` | 根据食材查找菜谱 | `{"ingredients": ["鸡蛋", "西红柿"]}` |
| `getRecipeDetail`          | 获取菜谱详细步骤 | `{"recipeId": "红烧肉"}`              |
| `getRecipeCategories`      | 获取菜谱分类统计 | `{}`                                  |

## 🛠️ 技术栈

- **前端框架**: Next.js 15 (App Router)
- **UI 库**: React 19
- **样式**: TailwindCSS 4
- **语言**: TypeScript
- **MCP 协议**: @modelcontextprotocol/sdk v1.17.3
- **数据源**: [weilei.site](https://weilei.site/all_recipes.json) 真实菜谱数据
- **构建工具**: Webpack 5
- **代码规范**: ESLint 9

## ⚡ 快速开始

### 环境要求

- Node.js v20 或更高版本
- npm / yarn / pnpm / bun

### 安装依赖

```bash
# 克隆项目
git clone https://github.com/yourname/my-mcp-tool.git
cd my-mcp-tool

# 安装依赖
npm install
# 或
yarn install
# 或
pnpm install
# 或
bun install
```

### 启动开发服务器

```bash
npm run dev
# 或
yarn dev
# 或
pnpm dev
# 或
bun dev
```

启动后，在浏览器中打开：

- [http://localhost:3000](http://localhost:3000) - 项目首页
- [http://localhost:3000/mcp-test](http://localhost:3000/mcp-test) - MCP Playground

## 📖 使用指南

### MCP Playground 使用

1. **访问页面**: 打开 [http://localhost:3000/mcp-test](http://localhost:3000/mcp-test)
2. **选择工具**: 从左侧工具列表中选择要测试的工具
3. **配置参数**: 在参数输入区域编辑 JSON 格式的参数
4. **执行测试**: 点击"执行"按钮发送请求
5. **查看结果**: 在返回结果区域查看 API 响应

### 菜谱功能使用示例

#### 基础搜索

```bash
# 搜索包含"红烧肉"的菜谱
curl -X POST http://localhost:3000/api/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "method": "tools/execute",
    "params": {
      "name": "searchRecipes",
      "arguments": {"query": "红烧肉"}
    },
    "id": 1
  }'
```

#### 智能推荐

```bash
# 为4个人智能推荐菜品组合
curl -X POST http://localhost:3000/api/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "method": "tools/execute",
    "params": {
      "name": "whatToEat",
      "arguments": {"peopleCount": 4}
    },
    "id": 2
  }'
```

#### 食材匹配

```bash
# 根据现有食材查找可制作的菜谱
curl -X POST http://localhost:3000/api/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "method": "tools/execute",
    "params": {
      "name": "findRecipesByIngredients",
      "arguments": {"ingredients": ["鸡蛋", "西红柿", "米饭"]}
    },
    "id": 3
  }'
```

## 📚 API 文档

### 基础端点

| 方法 | 端点       | 描述              |
| ---- | ---------- | ----------------- |
| GET  | `/api/mcp` | 获取 API 状态信息 |
| POST | `/api/mcp` | 执行 MCP 协议请求 |

### 支持的方法

#### `tools/list`

获取所有可用工具列表。

**请求示例**:

```json
{
  "method": "tools/list"
}
```

**响应示例**:

```json
{
  "result": [
    {
      "name": "hello",
      "description": "返回一段问候语",
      "defaultArgs": { "name": "MCP 用户" }
    }
  ]
}
```

#### `tools/execute`

执行指定的工具。

**请求示例**:

```json
{
  "method": "tools/execute",
  "params": {
    "name": "searchRecipes",
    "arguments": { "query": "红烧肉" }
  }
}
```

### 响应模式

支持两种响应模式：

- **简单模式** (默认): `{"result": data}`
- **JSON-RPC 模式**: `{"jsonrpc": "2.0", "id": 1, "result": data}`

通过查询参数 `?mode=rpc` 切换到 JSON-RPC 模式。

## 🏗️ 项目架构

```
src/
├── app/                    # Next.js App Router
│   ├── api/mcp/route.ts   # MCP API 路由处理器 (70行轻量级)
│   ├── mcp-test/page.tsx  # MCP Playground 页面
│   ├── globals.css        # 全局样式
│   ├── layout.tsx         # 布局组件
│   └── page.tsx           # 首页组件
└── lib/                   # 模块化核心库
    ├── constants/         # 配置常量
    │   ├── config.ts      # 项目配置
    │   └── index.ts       # 统一导出
    ├── services/          # 数据服务层
    │   ├── recipe-service.ts  # 菜谱数据服务
    │   └── index.ts       # 统一导出
    ├── tools/             # MCP工具层
    │   ├── basic-tools.ts     # 基础工具
    │   ├── recipe-tools.ts    # 菜谱工具
    │   └── index.ts       # 统一导出
    ├── types/             # 类型定义
    │   ├── mcp.ts         # MCP协议类型
    │   ├── recipe.ts      # 菜谱相关类型
    │   └── index.ts       # 统一导出
    └── utils/             # 工具函数
        ├── mcp-utils.ts   # MCP工具函数
        ├── recipe-utils.ts # 菜谱工具函数
        └── index.ts       # 统一导出
```

## 🛠️ 开发指南

### 添加新工具

1. 在 `src/lib/tools/` 目录下创建工具文件
2. 实现 `ToolBase` 接口
3. 在 `src/lib/tools/index.ts` 中导出新工具
4. 工具将自动在 API 中可用

**示例**:

```typescript
// src/lib/tools/my-tool.ts
import { ToolBase } from "../types";

export const myTool: ToolBase = {
  description: "我的新工具",
  defaultArgs: {},
  execute: async (args) => {
    // 实现工具逻辑
    return { message: "Hello World!" };
  },
};
```

### 扩展类型定义

在 `src/lib/types/` 目录下添加新的类型定义文件，并在 `index.ts` 中导出。

### 配置管理

项目配置集中在 `src/lib/constants/config.ts` 中，包括：

- 菜谱数据源 URL
- 缓存持续时间
- API 端点配置

## 🚀 部署指南

### 构建生产版本

```bash
npm run build
```

### 启动生产服务器

```bash
npm start
```

### 代码检查

```bash
npm run lint
```

### 部署到 Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fyourname%2Fmy-mcp-tool)

### 部署到其他平台

项目支持部署到以下平台：

- **Vercel**: 推荐，一键部署
- **Netlify**: 支持，需要配置构建命令
- **Railway**: 支持，需要配置环境变量
- **Docker**: 支持，提供 Dockerfile

## 🔧 故障排除

### 常见问题

#### 1. 构建失败

```bash
# 清理缓存
rm -rf .next
rm -rf node_modules/.cache
npm run build
```

#### 2. 样式不生效

检查 TailwindCSS 配置：

```bash
# 确保安装了正确的依赖
npm install @tailwindcss/postcss tailwindcss
```

#### 3. API 请求失败

检查网络连接和 API 端点：

```bash
# 测试 API 状态
curl http://localhost:3000/api/mcp
```

### 调试模式

启用调试模式：

```bash
DEBUG=* npm run dev
```

## 🤝 贡献指南

### 提交 Issue

1. 使用 Issue 模板
2. 提供详细的错误信息和复现步骤
3. 包含环境信息（操作系统、Node.js 版本等）

### 提交 Pull Request

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request

### 代码规范

- 使用 TypeScript
- 遵循 ESLint 规则
- 添加适当的注释
- 编写单元测试

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🙏 致谢

本项目的菜谱功能借鉴了 [HowToCook-mcp](https://github.com/worryzyy/HowToCook-mcp/) 项目的创意和设计思路。感谢该项目为开源社区提供的优秀示例和灵感。

特别感谢：

- [worryzyy/HowToCook-mcp](https://github.com/worryzyy/HowToCook-mcp/) - 菜谱 MCP 工具的原始创意来源
- [weilei.site](https://weilei.site/all_recipes.json) - 提供真实可靠的菜谱数据源
- [Next.js](https://nextjs.org) - 优秀的 React 框架
- [TailwindCSS](https://tailwindcss.com) - 高效的 CSS 框架

## 📈 更新日志

### v2.0.0 (2025-08-25)

- ✨ 全新模块化架构设计
- 🍳 集成完整菜谱管理系统
- ⚡ 实现智能缓存机制
- 📝 新增 whatToEat 智能推荐工具，支持根据人数自动配置荤素搭配
- 🔧 增加 6 个菜谱相关工具
- 📋 完善 TypeScript 类型定义
- 🎯 优化 API 路由处理器
- 🌙 添加深色模式支持
- 📱 优化响应式设计

### v1.0.0 (2025-08-18)

- 🎉 初始版本发布
- 🔧 基础 MCP 工具实现
- 📋 工具列表和执行功能
- 🎯 TypeScript 类型支持

## 📞 联系我们

- **GitHub Issues**: [报告问题](https://github.com/yourname/my-mcp-tool/issues)
- **邮箱**: your-email@example.com
- **GitHub**: [@yourname](https://github.com/yourname)

## 🔗 相关链接

- [Next.js 文档](https://nextjs.org/docs) - 了解 Next.js 特性和 API
- [Model Context Protocol](https://github.com/modelcontextprotocol/mcp) - 了解 MCP 协议
- [TailwindCSS](https://tailwindcss.com) - 了解样式框架
- [TypeScript](https://www.typescriptlang.org) - 了解类型系统

---

⭐ 如果这个项目对你有帮助，请给它一个星标！
