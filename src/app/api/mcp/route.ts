/**
 * MCP API 路由处理器 - 简化测试版本
 * 测试基础功能是否正常
 */

import { NextRequest, NextResponse } from "next/server";
import type { MCPRequest, ResponseMode } from "@/lib/types";
import { makeResponse } from "@/lib/utils";
import { tools } from "@/lib/tools";

/**
 * 处理 MCP GET 请求
 */
export async function GET(req: NextRequest) {
  try {
    const mode =
      (req.nextUrl.searchParams.get("mode") as ResponseMode) || "simple";

    return NextResponse.json(
      makeResponse(
        {
          message: "MCP API is running. Please use POST with JSON body.",
          version: "1.0.0",
          supportedMethods: ["tools/list", "tools/execute"],
          totalTools: Object.keys(tools).length,
        },
        undefined,
        mode
      )
    );
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * 处理 MCP POST 请求
 */
export async function POST(req: NextRequest) {
  try {
    const mode =
      (req.nextUrl.searchParams.get("mode") as ResponseMode) || "simple";

    let body: MCPRequest;

    try {
      body = (await req.json()) as MCPRequest;
    } catch {
      return NextResponse.json(
        makeResponse(null, undefined, mode, "Invalid or empty JSON body"),
        { status: 400 }
      );
    }

    if (body.method === "tools/execute") {
      const { name, arguments: args } = body.params;
      const tool = tools[name];

      if (!tool) {
        return NextResponse.json(
          makeResponse(null, body.id, mode, `Unknown tool: ${name}`),
          { status: 400 }
        );
      }

      try {
        const result = await tool.execute(args);
        return NextResponse.json(makeResponse(result, body.id, mode));
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        return NextResponse.json(
          makeResponse(null, body.id, mode, errorMessage),
          { status: 500 }
        );
      }
    } else if (body.method === "tools/list") {
      const toolsList = Object.entries(tools).map(([name, tool]) => ({
        name,
        description: tool.description,
        defaultArgs: tool.defaultArgs || {},
      }));

      return NextResponse.json(makeResponse(toolsList, body.id, mode));
    } else {
      return NextResponse.json(
        makeResponse(
          null,
          (body as unknown as { id?: string | number }).id || undefined,
          mode,
          "Unknown method"
        ),
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
