import { NextRequest, NextResponse } from "next/server";

// ========== JSON-RPC 工具函数 ==========
function jsonRpcSuccess(id: string | number | null, result: unknown) {
  return { jsonrpc: "2.0", id, result };
}

function jsonRpcError(
  id: string | number | null,
  message: string,
  code = -32603
) {
  return {
    jsonrpc: "2.0",
    id,
    error: { code, message },
  };
}

// ========== 类型定义 ==========
type ToolsListMethod = { method: "tools/list" };
type ToolExecuteParams = {
  name: keyof typeof tools | string;
  arguments?: Record<string, unknown>;
};
type ToolsExecuteMethod = {
  method: "tools/execute";
  params: ToolExecuteParams;
};

type MCPRequest = (ToolsListMethod | ToolsExecuteMethod) & {
  id?: string | number | null;
};

type ToolBase = {
  description: string;
  execute: (args: Record<string, unknown> | undefined) => Promise<unknown>;
  defaultArgs?: Record<string, unknown>;
};

// ========== 工具集 ==========
const tools: Record<string, ToolBase> = {
  hello: {
    description: "返回一段问候语",
    defaultArgs: { name: "MCP 用户" },
    execute: async (args) => {
      const name =
        typeof args?.["name"] === "string"
          ? (args["name"] as string)
          : "MCP 用户";
      return {
        message: `Hello ${name}! 你传入的内容是: ${JSON.stringify(args)}`,
      };
    },
  },
  time: {
    description: "返回当前时间",
    defaultArgs: {},
    execute: async () => ({ now: new Date().toISOString() }),
  },
  getAllWebsites: {
    description: "获取所有站点信息",
    defaultArgs: { categoryId: -1, limit: 9999 },
    execute: async (args) => {
      const categoryIdRaw = args?.["categoryId"];
      const limitRaw = args?.["limit"];
      const categoryId = typeof categoryIdRaw === "number" ? categoryIdRaw : -1;
      const limit = typeof limitRaw === "number" ? limitRaw : 9999;

      const res = await fetch(
        `https://dream-hub.api.myltx.top/website/queryAll?categoryId=${categoryId}&limit=${limit}`
      );
      const data = (await res.json()) as unknown;
      return { websites: data };
    },
  },
};

// ========== MCP 入口 ==========
export async function POST(req: NextRequest) {
  let body: MCPRequest;

  try {
    body = (await req.json()) as MCPRequest;
  } catch {
    return NextResponse.json(
      jsonRpcError(null, "Invalid or empty JSON body", -32700),
      {
        status: 400,
      }
    );
  }

  const id = body.id ?? null;

  // 工具执行
  if (body.method === "tools/execute") {
    const { name, arguments: args } = body.params;
    const tool = tools[name];
    if (!tool) {
      return NextResponse.json(
        jsonRpcError(id, `Unknown tool: ${name}`, -32601),
        {
          status: 400,
        }
      );
    }
    try {
      const result = await tool.execute(args);
      return NextResponse.json(jsonRpcSuccess(id, result));
    } catch (err: unknown) {
      return NextResponse.json(
        jsonRpcError(
          id,
          err instanceof Error ? err.message : String(err),
          -32000
        ),
        { status: 500 }
      );
    }
  }

  // 工具列表
  else if (body.method === "tools/list") {
    const list = Object.entries(tools).map(([name, t]) => ({
      name,
      description: t.description,
      defaultArgs: t.defaultArgs || {},
    }));
    return NextResponse.json(jsonRpcSuccess(id, list));
  }

  // 未知方法
  else {
    return NextResponse.json(jsonRpcError(id, "Unknown method", -32601), {
      status: 400,
    });
  }
}

// GET 测试接口
export async function GET() {
  return NextResponse.json({
    message:
      "MCP API is running. Please POST JSON-RPC request to this endpoint.",
    example: {
      jsonrpc: "2.0",
      id: 1,
      method: "tools/list",
    },
  });
}
