<!--
 * @Date: 2025-08-18 16:40:59
 * @LastEditTimes: Do not edit
 * @Descripttion: describe
-->

# MCP Tool

一个基于 [Next.js](https://nextjs.org) 和 [Model Context Protocol (MCP)](https://github.com/modelcontextprotocol/mcp) 构建的工具，用于测试和使用 MCP 协议功能。

## 项目介绍

MCP Tool 是一个用于与 Model Context Protocol 交互的工具，提供了友好的用户界面，让开发者能够轻松测试和使用 MCP 协议的各种功能。

### 主要功能

- **MCP Playground**: 提供交互式界面，用于测试 MCP 工具和功能
- **工具列表**: 展示所有可用的 MCP 工具
- **参数输入**: 支持 JSON 格式的参数输入
- **结果展示**: 清晰展示 API 调用结果

## 技术栈

- **前端**: Next.js 15, React 19, TailwindCSS 4
- **MCP**: @modelcontextprotocol/sdk v1.17.3
- **语言**: TypeScript

## 快速开始

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

启动后，在浏览器中打开 [http://localhost:3000](http://localhost:3000) 查看首页，或访问 [http://localhost:3000/mcp-test](http://localhost:3000/mcp-test) 进入 MCP Playground。

## 使用指南

1. 访问 MCP Playground 页面
2. 从左侧工具列表中选择一个工具
3. 在参数输入区域编辑 JSON 格式的参数
4. 点击"执行"按钮发送请求
5. 在返回结果区域查看 API 响应

## API 说明

项目提供了以下 MCP API 端点：

- `POST /api/mcp` - 支持以下方法:
  - `tools/list`: 获取所有可用工具列表
  - `tools/execute`: 执行指定的工具

## 部署

可以使用 Vercel 平台轻松部署此 Next.js 应用：

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fyourname%2Fmy-mcp-tool)

## 了解更多

- [Next.js 文档](https://nextjs.org/docs) - 了解 Next.js 特性和 API
- [Model Context Protocol](https://github.com/modelcontextprotocol/mcp) - 了解 MCP 协议
