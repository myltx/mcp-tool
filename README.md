<!--
 * @Date: 2025-08-18 16:40:59
 * @LastEditTimes: 2025-08-25
 * @Description: MCP Tool - 模块化架构的 MCP 协议测试工具
-->

# MCP Tool

一个基于 [Next.js](https://nextjs.org) 和 [Model Context Protocol (MCP)](https://github.com/modelcontextprotocol/mcp) 构建的现代化工具箱，提供完整的 MCP 协议功能测试和菜谱管理系统。

## 项目介绍

MCP Tool 是一个采用模块化架构设计的 MCP 协议交互平台，集成了基础工具和智能菜谱系统，为开发者提供友好的用户界面来测试和使用 MCP 协议的各种功能。

### 核心特性

- **🏗️ 模块化架构**: 采用现代化模块化设计，职责分离，易于维护和扩展
- **🍳 智能菜谱系统**: 集成真实菜谱数据源，提供搜索、推荐、智能搭配、食材匹配等功能
- **⚡ 高性能缓存**: 30 分钟智能缓存机制，提升性能同时减少 API 调用
- **🔧 MCP Playground**: 交互式界面，实时测试 MCP 工具和功能
- **📋 完整工具集**: 9 个精心设计的 MCP 工具，涵盖基础功能和菜谱管理
- **🎯 类型安全**: 完整的 TypeScript 类型定义，确保代码质量

### 工具列表

#### 基础工具 (3 个)

- **hello**: 返回一段问候语
- **time**: 返回当前时间
- **getAllWebsites**: 获取 [Dream-hub](https://dream-hub.myltx.top/) 所有网站信息

#### 菜谱工具 (6 个)

- **searchRecipes**: 根据菜名搜索菜谱，返回完整菜谱信息
- **randomRecipe**: 随机推荐菜谱，解决"今天吃什么"的难题
- **whatToEat**: 智能推荐菜品组合，根据人数自动配置荤素搭配，返回完整菜谱信息
- **findRecipesByIngredients**: 根据现有食材查找可制作的菜谱
- **getRecipeDetail**: 获取菜谱的详细制作步骤和完整信息
- **getRecipeCategories**: 获取所有菜谱分类和统计信息

## 技术栈

- **前端框架**: Next.js 15 (App Router)
- **UI 库**: React 19
- **样式**: TailwindCSS 4
- **语言**: TypeScript
- **MCP 协议**: @modelcontextprotocol/sdk v1.17.3
- **数据源**: [weilei.site](https://weilei.site/all_recipes.json) 真实菜谱数据

## 项目架构

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

## 快速开始

### 环境要求

- Node.js v20+
- npm / yarn / pnpm / bun

### 安装依赖

```bash
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

## 使用指南

### MCP Playground 使用

1. 访问 MCP Playground 页面
2. 从工具列表中选择要测试的工具
3. 在参数输入区域编辑 JSON 格式的参数
4. 点击"执行"按钮发送请求
5. 在返回结果区域查看 API 响应

### 菜谱功能使用示例

```bash
# 搜索菜谱
curl -X POST http://localhost:3000/api/mcp \
  -H "Content-Type: application/json" \
  -d '{"method": "tools/execute", "params": {"name": "searchRecipes", "arguments": {"query": "鸡蛋"}}, "id": 1}'

# 随机推荐菜谱
curl -X POST http://localhost:3000/api/mcp \
  -H "Content-Type: application/json" \
  -d '{"method": "tools/execute", "params": {"name": "randomRecipe", "arguments": {}}, "id": 2}'

# 智能推荐菜品组合（根据人数）
curl -X POST http://localhost:3000/api/mcp \
  -H "Content-Type: application/json" \
  -d '{"method": "tools/execute", "params": {"name": "whatToEat", "arguments": {"peopleCount": 4}}, "id": 3}'

# 根据食材查找菜谱
curl -X POST http://localhost:3000/api/mcp \
  -H "Content-Type: application/json" \
  -d '{"method": "tools/execute", "params": {"name": "findRecipesByIngredients", "arguments": {"ingredients": ["鸡蛋", "西红柿"]}}, "id": 4}'
```

## API 接口

### MCP 协议端点

- **GET** `/api/mcp` - 获取 API 状态信息
- **POST** `/api/mcp` - 执行 MCP 协议请求

### 支持的方法

- `tools/list` - 获取所有可用工具列表 (9 个工具)
- `tools/execute` - 执行指定的工具

### 响应模式

支持两种响应模式：

- **简单模式** (默认): `{"result": data}`
- **JSON-RPC 模式**: `{"jsonrpc": "2.0", "id": 1, "result": data}`

通过查询参数 `?mode=rpc` 切换到 JSON-RPC 模式。

## 构建和部署

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

## 开发指南

### 添加新工具

1. 在 `src/lib/tools/` 目录下创建工具文件
2. 实现 `ToolBase` 接口
3. 在 `src/lib/tools/index.ts` 中导出新工具
4. 工具将自动在 API 中可用

### 扩展类型定义

在 `src/lib/types/` 目录下添加新的类型定义文件，并在 `index.ts` 中导出。

### 配置管理

项目配置集中在 `src/lib/constants/config.ts` 中，包括：

- 菜谱数据源 URL
- 缓存持续时间
- API 端点配置

## 特性说明

### 智能推荐算法

- **荤素搭配**: 根据人数自动计算荤菜和素菜数量比例
- **Fisher-Yates 洗牌**: 使用经典算法实现真正随机化推荐
- **智能筛选**: 自动分类荤菜和素菜，确保营养均衡
- **类型安全**: 完整的 TypeScript 类型定义和参数验证

### 智能缓存机制

- **缓存时长**: 30 分钟
- **降级策略**: 网络异常时自动使用缓存数据
- **性能优化**: 减少重复 API 调用

### 错误处理

- 完善的异常捕获机制
- 详细的错误日志记录
- 优雅的错误响应

### 类型安全

- 完整的 TypeScript 类型定义
- 参数安全解析函数
- 编译时类型检查

## 了解更多

- [Next.js 文档](https://nextjs.org/docs) - 了解 Next.js 特性和 API
- [Model Context Protocol](https://github.com/modelcontextprotocol/mcp) - 了解 MCP 协议
- [TailwindCSS](https://tailwindcss.com) - 了解样式框架
- [TypeScript](https://www.typescriptlang.org) - 了解类型系统

## 更新日志

### v2.0.0 (2025-08-25)

- ✨ 全新模块化架构设计
- 🍳 集成完整菜谱管理系统
- ⚡ 实现智能缓存机制
- 📝 新增 whatToEat 智能推荐工具，支持根据人数自动配置荤素搭配
- 🔧 增加 6 个菜谱相关工具
- 📋 完善 TypeScript 类型定义
- 🎯 优化 API 路由处理器
