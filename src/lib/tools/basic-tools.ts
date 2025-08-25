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
