/**
 * MCP 协议相关类型定义
 */

/**
 * 响应模式
 */
export type ResponseMode = "rpc" | "simple";

/**
 * 工具基类
 */
export interface ToolBase {
  description: string;
  execute: (args: Record<string, unknown> | undefined) => Promise<unknown>;
  defaultArgs?: Record<string, unknown>;
}

/**
 * 工具列表方法
 */
export interface ToolsListMethod {
  method: "tools/list";
  id?: string | number; // 兼容 JSON-RPC
}

/**
 * 工具执行参数
 */
export interface ToolExecuteParams {
  name: string;
  arguments?: Record<string, unknown>;
}

/**
 * 工具执行方法
 */
export interface ToolsExecuteMethod {
  method: "tools/execute";
  params: ToolExecuteParams;
  id?: string | number;
}

/**
 * MCP 请求类型
 */
export type MCPRequest = ToolsListMethod | ToolsExecuteMethod;

/**
 * MCP 响应类型
 */
export interface MCPResponse {
  result?: unknown;
  error?: string;
  id?: string | number;
  jsonrpc?: string;
}
