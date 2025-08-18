import { NextRequest, NextResponse } from "next/server";

type ToolsListMethod = {
  method: "tools/list";
};

type ToolExecuteParams = {
  name: keyof typeof tools | string;
  arguments?: Record<string, unknown>;
};

type ToolsExecuteMethod = {
  method: "tools/execute";
  params: ToolExecuteParams;
};

type MCPRequest = ToolsListMethod | ToolsExecuteMethod;

type ToolBase = {
  description: string;
  execute: (args: Record<string, unknown> | undefined) => Promise<unknown>;
  defaultArgs?: Record<string, unknown>; // 新增：默认参数模板
};

const tools: Record<string, ToolBase> = {
  hello: {
    description: "返回一段问候语",
    defaultArgs: { name: "MCP 用户" },
    execute: async (args) => {
      const name =
        typeof (args as Record<string, unknown> | undefined)?.["name"] ===
        "string"
          ? ((args as Record<string, unknown>).name as string)
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
      const categoryIdRaw = (args as Record<string, unknown> | undefined)?.[
        "categoryId"
      ];
      const limitRaw = (args as Record<string, unknown> | undefined)?.["limit"];
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
export async function POST(req: NextRequest) {
  let body: MCPRequest;

  try {
    body = (await req.json()) as MCPRequest;
  } catch {
    return NextResponse.json(
      { error: "Invalid or empty JSON body" },
      { status: 400 }
    );
  }

  if (body.method === "tools/execute") {
    const { name, arguments: args } = body.params;
    const tool = tools[name];
    if (!tool) {
      return NextResponse.json(
        { error: `Unknown tool: ${name}` },
        { status: 400 }
      );
    }
    try {
      const result = await tool.execute(
        args as Record<string, unknown> | undefined
      );
      return NextResponse.json({ result });
    } catch (err: unknown) {
      return NextResponse.json(
        {
          error: "Tool execution failed",
          details: err instanceof Error ? err.message : String(err),
        },
        { status: 500 }
      );
    }
  } else if (body.method === "tools/list") {
    // 返回工具列表
    const list = Object.entries(tools).map(([name, t]) => ({
      name,
      description: t.description,
      defaultArgs: t.defaultArgs || {},
    }));
    return NextResponse.json({ result: list });
  } else {
    return NextResponse.json({ error: "Unknown method" }, { status: 400 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: "MCP API is running. Please use POST with JSON body.",
  });
}
