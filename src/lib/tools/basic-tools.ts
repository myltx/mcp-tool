/**
 * 基础 MCP 工具
 */

import type { ToolBase } from "../types";
import { parseStringParam, parseNumberParam } from "../utils";

/**
 * Hello 工具
 */
export const hello: ToolBase = {
  description: "返回一段问候语",
  defaultArgs: { name: "MCP 用户" },
  execute: async (args) => {
    const name = parseStringParam(args, "name", "MCP 用户");
    return {
      message: `Hello ${name}! 你传入的内容是: ${JSON.stringify(args)}`,
    };
  },
};

/**
 * 时间工具
 */
export const time: ToolBase = {
  description: "返回当前时间",
  defaultArgs: {},
  execute: async () => ({ now: new Date().toISOString() }),
};

/**
 * 获取所有网站信息工具
 */
export const getAllWebsites: ToolBase = {
  description: "获取所有站点信息",
  defaultArgs: { categoryId: -1, limit: 9999 },
  execute: async (args) => {
    const categoryId = parseNumberParam(args, "categoryId") ?? -1;
    const limit = parseNumberParam(args, "limit") ?? 9999;

    try {
      const res = await fetch(
        `https://dream-hub.api.myltx.top/website/queryAll?categoryId=${categoryId}&limit=${limit}`
      );
      const data = await res.json();
      return { websites: data };
    } catch (error) {
      console.error("Failed to fetch websites:", error);
      return {
        error: "Failed to fetch websites",
        websites: [],
      };
    }
  },
};

/**
 * MCP网站搜索工具
 */
export const mcpWebsiteSearch: ToolBase = {
  description: "通过关键词搜索MCP网站信息，支持限制返回数量",
  defaultArgs: { limit: 10, keyword: "" },
  execute: async (args) => {
    const limit = parseNumberParam(args, "limit") ?? 10;
    const keyword = parseStringParam(args, "keyword", "");

    try {
      // 构建查询参数
      const params = new URLSearchParams();
      params.append("limit", limit.toString());
      if (keyword) {
        params.append("keyword", keyword);
      }

      const res = await fetch(
        `https://dream-hub.api.myltx.top/website/mcp?${params.toString()}`
      );

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();

      return {
        success: true,
        data: data,
        total: Array.isArray(data) ? data.length : 0,
        limit: limit,
        keyword: keyword,
      };
    } catch (error) {
      console.error("Failed to search MCP websites:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to search MCP websites",
        data: [],
        total: 0,
        limit: limit,
        keyword: keyword,
      };
    }
  },
};
