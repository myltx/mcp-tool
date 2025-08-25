/**
 * MCP 相关工具函数
 */

import type { ResponseMode } from "../types";

/**
 * 创建标准 MCP 响应
 */
export function makeResponse(
  data: unknown,
  id?: string | number,
  mode: ResponseMode = "simple",
  error?: string
) {
  if (mode === "rpc") {
    if (error) {
      return { jsonrpc: "2.0", id: id ?? null, error: { message: error } };
    }
    return { jsonrpc: "2.0", id: id ?? null, result: data };
  } else {
    if (error) {
      return { error };
    }
    return { result: data };
  }
}

/**
 * 解析参数
 */
export function parseArgs(
  args: Record<string, unknown> | undefined
): Record<string, unknown> {
  return args || {};
}

/**
 * 安全解析字符串参数
 */
export function parseStringParam(
  args: Record<string, unknown> | undefined,
  key: string,
  defaultValue: string = ""
): string {
  const value = args?.[key];
  return typeof value === "string" ? value : defaultValue;
}

/**
 * 安全解析数字参数
 */
export function parseNumberParam(
  args: Record<string, unknown> | undefined,
  key: string,
  defaultValue?: number
): number | undefined {
  const value = args?.[key];
  if (typeof value === "number") {
    return value;
  }
  return defaultValue;
}

/**
 * 安全解析字符串数组参数
 */
export function parseStringArrayParam(
  args: Record<string, unknown> | undefined,
  key: string,
  defaultValue: string[] = []
): string[] {
  const value = args?.[key];
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === "string");
  }
  return defaultValue;
}
