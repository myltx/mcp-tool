"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SmartResultDisplay } from "../../components/SmartResultDisplay";

type ToolInfo = {
  name: string;
  description: string;
  defaultArgs: Record<string, unknown>;
  category?: string;
};

type ExecutionHistory = {
  id: string;
  toolName: string;
  timestamp: Date;
  success: boolean;
  duration: number;
  params: Record<string, unknown>;
  result?: string;
};

type ToolStats = {
  totalExecutions: number;
  successCount: number;
  avgDuration: number;
  lastExecution?: Date;
};

export default function MCPPlayground() {
  const [tools, setTools] = useState<ToolInfo[]>([]);
  const [selectedTool, setSelectedTool] = useState<string>("");
  const [jsonInput, setJsonInput] = useState("{}");
  const [response, setResponse] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [executionHistory, setExecutionHistory] = useState<ExecutionHistory[]>(
    []
  );
  const [toolStats, setToolStats] = useState<Record<string, ToolStats>>({});
  const [showApiExample, setShowApiExample] = useState(false);
  const [fullscreenMode, setFullscreenMode] = useState<
    "params" | "result" | "api" | null
  >(null);

  // 获取工具列表
  useEffect(() => {
    fetch("/api/mcp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ method: "tools/list" }),
    })
      .then((res) => res.json())
      .then((data: { result: ToolInfo[] }) => {
        const toolsWithCategory = data.result.map((tool) => ({
          ...tool,
          category: tool.name.includes("recipe")
            ? "菜谱"
            : tool.name.includes("git")
            ? "Git"
            : tool.name.includes("file")
            ? "文件"
            : tool.name.includes("search")
            ? "搜索"
            : "其他",
        }));
        setTools(toolsWithCategory);
        if (toolsWithCategory.length > 0) {
          const firstTool = toolsWithCategory[0];
          setSelectedTool(firstTool.name);
          setJsonInput(JSON.stringify(firstTool.defaultArgs || {}, null, 2));
        }
      });
  }, []);

  // 模拟执行历史数据
  useEffect(() => {
    const mockHistory: ExecutionHistory[] = [
      {
        id: "1",
        toolName: "search_recipes",
        timestamp: new Date(Date.now() - 5 * 60 * 1000),
        success: true,
        duration: 250,
        params: { query: "川菜" },
      },
      {
        id: "2",
        toolName: "get_recipe_detail",
        timestamp: new Date(Date.now() - 15 * 60 * 1000),
        success: true,
        duration: 180,
        params: { name: "宫保鸡丁" },
      },
    ];
    setExecutionHistory(mockHistory);

    // 计算工具统计
    const stats: Record<string, ToolStats> = {};
    mockHistory.forEach((item) => {
      if (!stats[item.toolName]) {
        stats[item.toolName] = {
          totalExecutions: 0,
          successCount: 0,
          avgDuration: 0,
        };
      }
      stats[item.toolName].totalExecutions++;
      if (item.success) stats[item.toolName].successCount++;
      stats[item.toolName].avgDuration =
        (stats[item.toolName].avgDuration + item.duration) / 2;
      stats[item.toolName].lastExecution = item.timestamp;
    });
    setToolStats(stats);
  }, []);

  // 过滤工具
  const filteredTools = tools.filter((tool) => {
    const matchesSearch =
      tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || tool.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // 获取所有分类
  const categories = [
    "all",
    ...new Set(tools.map((tool) => tool.category).filter(Boolean)),
  ];

  // 总体统计
  const totalStats = {
    totalExecutions: Object.values(toolStats).reduce(
      (sum, stat) => sum + stat.totalExecutions,
      0
    ),
    successRate:
      Object.values(toolStats).length > 0
        ? (Object.values(toolStats).reduce(
            (sum, stat) => sum + stat.successCount,
            0
          ) /
            Object.values(toolStats).reduce(
              (sum, stat) => sum + stat.totalExecutions,
              0
            )) *
          100
        : 0,
    avgDuration:
      Object.values(toolStats).length > 0
        ? Object.values(toolStats).reduce(
            (sum, stat) => sum + stat.avgDuration,
            0
          ) / Object.values(toolStats).length
        : 0,
  };

  const handleToolSelect = (name: string) => {
    setSelectedTool(name);
    const tool = tools.find((t) => t.name === name);
    setJsonInput(JSON.stringify(tool?.defaultArgs || {}, null, 2));
    setError("");
    setResponse("");
  };

  const handleSend = async () => {
    setError("");
    setResponse("");
    setLoading(true);

    const startTime = Date.now();
    let parsedArgs: Record<string, unknown>;

    try {
      parsedArgs = JSON.parse(jsonInput);
    } catch (err: unknown) {
      setError(
        "JSON 格式错误: " + (err instanceof Error ? err.message : String(err))
      );
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/mcp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          method: "tools/execute",
          params: { name: selectedTool, arguments: parsedArgs },
        }),
      });

      const data = await res.json();
      const duration = Date.now() - startTime;
      const success = !data.error;

      setResponse(JSON.stringify(data, null, 2));

      // 添加到执行历史
      const newHistoryItem: ExecutionHistory = {
        id: Date.now().toString(),
        toolName: selectedTool,
        timestamp: new Date(),
        success,
        duration,
        params: parsedArgs,
        result: success ? "Success" : "Error",
      };

      setExecutionHistory((prev) => [newHistoryItem, ...prev.slice(0, 9)]); // 保持最近10条

      // 更新统计
      setToolStats((prev) => {
        const current = prev[selectedTool] || {
          totalExecutions: 0,
          successCount: 0,
          avgDuration: 0,
        };

        return {
          ...prev,
          [selectedTool]: {
            totalExecutions: current.totalExecutions + 1,
            successCount: current.successCount + (success ? 1 : 0),
            avgDuration:
              (current.avgDuration * current.totalExecutions + duration) /
              (current.totalExecutions + 1),
            lastExecution: new Date(),
          },
        };
      });
    } catch (err: unknown) {
      setError(
        "请求失败: " + (err instanceof Error ? err.message : String(err))
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleClearResponse = () => {
    setResponse("");
    setError("");
  };

  // 生成API调用示例
  const generateApiExample = (format: "curl" | "javascript" | "python") => {
    const baseUrl =
      typeof window !== "undefined"
        ? window.location.origin
        : "http://localhost:3000";
    const payload = {
      method: "tools/execute",
      params: { name: selectedTool, arguments: JSON.parse(jsonInput) },
    };

    switch (format) {
      case "curl":
        return `curl -X POST ${baseUrl}/api/mcp \\
  -H "Content-Type: application/json" \\
  -d '${JSON.stringify(payload, null, 2)}'`;

      case "javascript":
        return `const response = await fetch('${baseUrl}/api/mcp', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(${JSON.stringify(payload, null, 2)})
});

const data = await response.json();
console.log(data);`;

      case "python":
        return `import requests
import json

url = "${baseUrl}/api/mcp"
payload = ${JSON.stringify(payload, null, 2).replace(/"/g, '"')}
headers = {"Content-Type": "application/json"}

response = requests.post(url, json=payload, headers=headers)
data = response.json()
print(data)`;

      default:
        return "";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* 全屏模式覆盖层 */}
      {fullscreenMode && (
        <div className="fixed inset-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm">
          <div className="h-full p-6">
            <div className="h-full border shadow-2xl bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl rounded-2xl border-white/20">
              {/* 全屏模式头部 */}
              <div className="p-6 border-b border-slate-200/50 dark:border-slate-700/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br ${
                        fullscreenMode === "params"
                          ? "from-orange-500 to-red-600"
                          : fullscreenMode === "result"
                          ? "from-cyan-500 to-blue-600"
                          : "from-indigo-500 to-blue-600"
                      }`}>
                      <svg
                        className="w-5 h-5 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d={
                            fullscreenMode === "params"
                              ? "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              : fullscreenMode === "result"
                              ? "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                              : "M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                          }
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200">
                        {fullscreenMode === "params"
                          ? "参数配置"
                          : fullscreenMode === "result"
                          ? "执行结果"
                          : "API 示例"}
                      </h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        全屏模式
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setFullscreenMode(null)}
                    className="p-2 transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-600"
                    title="退出全屏">
                    <svg
                      className="w-6 h-6 text-slate-600 dark:text-slate-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              {/* 全屏模式内容 */}
              <div className="p-6" style={{ height: "calc(100% - 80px)" }}>
                {fullscreenMode === "params" && (
                  <div style={{ height: "100%" }}>
                    <textarea
                      className="w-full p-4 font-mono text-sm border rounded-lg resize-none bg-slate-50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                      style={{ height: "100%" }}
                      value={jsonInput}
                      onChange={(e) => setJsonInput(e.target.value)}
                      placeholder="输入 JSON 格式的参数..."
                      spellCheck="false"
                    />
                  </div>
                )}

                {fullscreenMode === "result" && (
                  <div style={{ height: "100%" }}>
                    <pre
                      className="w-full p-4 overflow-auto font-mono text-sm break-all whitespace-pre-wrap border rounded-lg bg-slate-50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300"
                      style={{ height: "100%" }}>
                      {response || (
                        <span className="italic text-slate-400 dark:text-slate-500">
                          执行结果将在这里显示...
                        </span>
                      )}
                    </pre>
                  </div>
                )}

                {fullscreenMode === "api" && selectedTool && (
                  <div style={{ height: "100%", overflowY: "auto" }}>
                    <div className="space-y-4">
                      {["curl", "javascript", "python"].map((format) => (
                        <div key={format}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-lg font-medium text-slate-700 dark:text-slate-300">
                              {format === "curl"
                                ? "cURL"
                                : format === "javascript"
                                ? "JavaScript"
                                : "Python"}
                            </span>
                            <button
                              onClick={() =>
                                handleCopy(
                                  generateApiExample(
                                    format as "curl" | "javascript" | "python"
                                  ),
                                  format
                                )
                              }
                              className="flex items-center gap-2 px-3 py-2 transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-600">
                              {copied === format ? (
                                <>
                                  <svg
                                    className="w-4 h-4 text-green-500"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24">
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M5 13l4 4L19 7"
                                    />
                                  </svg>
                                  已复制
                                </>
                              ) : (
                                <>
                                  <svg
                                    className="w-4 h-4 text-slate-500"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24">
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                                    />
                                  </svg>
                                  复制代码
                                </>
                              )}
                            </button>
                          </div>
                          <pre className="p-4 overflow-x-auto font-mono text-sm border rounded text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600">
                            {generateApiExample(
                              format as "curl" | "javascript" | "python"
                            )}
                          </pre>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      {/* 背景装饰 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute rounded-full -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 blur-3xl"></div>
        <div className="absolute rounded-full -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-indigo-400/20 to-cyan-400/20 blur-3xl"></div>
      </div>

      <div className="relative z-10 min-h-screen p-4">
        {/* 顶部状态栏 */}
        <div className="mb-6">
          <div className="mx-auto max-w-7xl">
            <div className="p-6 border shadow-xl bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl border-white/20">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  {/* 返回首页按钮 */}
                  <Link
                    href="/"
                    className="flex items-center gap-2 px-3 py-2 text-sm bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition-colors">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 19l-7-7m0 0l7-7m-7 7h18"
                      />
                    </svg>
                    <span>返回首页</span>
                  </Link>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
                      <svg
                        className="w-6 h-6 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 10V3L4 14h7v7l9-11h-7z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-200">
                        MCP 工具调试台
                      </h1>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        现代化工具执行与管理平台
                      </p>
                    </div>
                  </div>
                </div>

                {/* 实时统计 */}
                <div className="flex gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {totalStats.totalExecutions}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      总执行次数
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {totalStats.successRate.toFixed(1)}%
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      成功率
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {totalStats.avgDuration.toFixed(0)}ms
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      平均耗时
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 主体内容区 */}
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-6 lg:grid-cols-[350px_1fr]">
            {/* 左侧工具选择区 */}
            <div className="space-y-4">
              {/* 工具选择区 */}
              <div className="border shadow-xl bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl border-white/20">
                <div className="p-4 border-b border-slate-200/50 dark:border-slate-700/50">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600">
                      <svg
                        className="w-4 h-4 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                        />
                      </svg>
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
                        工具选择
                      </h2>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {filteredTools.length} / {tools.length} 个工具
                      </p>
                    </div>
                  </div>

                  {/* 搜索和筛选 */}
                  <div className="space-y-2">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="搜索工具..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-3 py-2 pl-8 text-sm border rounded-lg bg-slate-50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                      />
                      <svg
                        className="absolute left-2.5 top-2.5 w-4 h-4 text-slate-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                    </div>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full px-3 py-2 text-sm border rounded-lg bg-slate-50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50">
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat === "all" ? "全部" : cat}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* 工具列表 */}
                <div className="p-4">
                  <div
                    className="space-y-2 overflow-y-auto"
                    style={{
                      maxHeight: "calc(100vh - 650px)",
                      minHeight: "300px",
                    }}>
                    {filteredTools.length === 0 ? (
                      <div className="py-6 text-center text-slate-500 dark:text-slate-400">
                        <div className="text-xs">
                          {tools.length === 0
                            ? "加载中..."
                            : "未找到匹配的工具"}
                        </div>
                      </div>
                    ) : (
                      filteredTools.map((tool) => (
                        <button
                          key={tool.name}
                          onClick={() => handleToolSelect(tool.name)}
                          className={`w-full text-left p-3 rounded-lg transition-all duration-200 ${
                            selectedTool === tool.name
                              ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/25"
                              : "bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-transparent hover:border-slate-200 dark:hover:border-slate-600"
                          }`}>
                          <div>
                            <div className="text-sm font-semibold truncate">
                              {tool.name}
                            </div>
                            <div className="mt-1 text-xs opacity-80 line-clamp-2">
                              {tool.description}
                            </div>
                            <div className="flex items-center justify-between mt-2">
                              {tool.category && (
                                <span className="inline-block px-2 py-0.5 text-xs rounded bg-white/20">
                                  {tool.category}
                                </span>
                              )}
                              {toolStats[tool.name] && (
                                <div className="text-right">
                                  <div className="text-xs opacity-70">
                                    {toolStats[tool.name].totalExecutions}次
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* 执行历史和API示例 */}
              <div className="space-y-4">
                {/* 执行历史 */}
                <div className="border shadow-lg bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-xl border-white/20">
                  <div className="p-3 border-b border-slate-200/50 dark:border-slate-700/50">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center justify-center w-6 h-6 rounded bg-gradient-to-br from-violet-500 to-purple-600">
                        <svg
                          className="w-3 h-3 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                          执行历史
                        </h3>
                      </div>
                    </div>
                  </div>

                  <div className="p-3">
                    <div className="space-y-2 overflow-y-auto max-h-32">
                      {executionHistory.length === 0 ? (
                        <div className="py-4 text-center text-slate-500 dark:text-slate-400">
                          <div className="text-xs">暂无历史</div>
                        </div>
                      ) : (
                        executionHistory.slice(0, 3).map((item) => (
                          <div
                            key={item.id}
                            className="p-2 rounded bg-slate-50 dark:bg-slate-700/50">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-medium truncate text-slate-800 dark:text-slate-200">
                                {item.toolName}
                              </span>
                              <div className="flex items-center gap-1">
                                <span
                                  className={`w-1 h-1 rounded-full ${
                                    item.success ? "bg-green-500" : "bg-red-500"
                                  }`}></span>
                                <span className="text-xs text-slate-500 dark:text-slate-400">
                                  {item.duration}ms
                                </span>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                {/* API 调用 */}
                <div className="border shadow-lg bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-xl border-white/20">
                  <div className="p-3 border-b border-slate-200/50 dark:border-slate-700/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center justify-center w-6 h-6 rounded bg-gradient-to-br from-indigo-500 to-blue-600">
                          <svg
                            className="w-3 h-3 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                            />
                          </svg>
                        </div>
                        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                          API 示例
                        </h3>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() =>
                            setFullscreenMode(
                              fullscreenMode === "api" ? null : "api"
                            )
                          }
                          className="p-1 transition-colors rounded hover:bg-slate-100 dark:hover:bg-slate-600"
                          title="全屏显示">
                          <svg
                            className="w-3 h-3 text-slate-600 dark:text-slate-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d={
                                fullscreenMode === "api"
                                  ? "M6 18L18 6M6 6l12 12"
                                  : "M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
                              }
                            />
                          </svg>
                        </button>
                        <button
                          onClick={() => setShowApiExample(!showApiExample)}
                          className="p-1 transition-colors rounded hover:bg-slate-100 dark:hover:bg-slate-600">
                          <svg
                            className={`w-3 h-3 transition-transform ${
                              showApiExample ? "rotate-180" : ""
                            }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>

                  {showApiExample && selectedTool && (
                    <div className="p-3">
                      <div
                        className="space-y-2"
                        style={{
                          maxHeight:
                            fullscreenMode === "api" ? "none" : "200px",
                          overflowY: "auto",
                        }}>
                        {["curl", "javascript"].map((format) => (
                          <div key={format}>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                                {format === "curl" ? "cURL" : "JavaScript"}
                              </span>
                              <button
                                onClick={() =>
                                  handleCopy(
                                    generateApiExample(
                                      format as "curl" | "javascript" | "python"
                                    ),
                                    format
                                  )
                                }
                                className="p-1 transition-colors rounded hover:bg-slate-100 dark:hover:bg-slate-600">
                                {copied === format ? (
                                  <svg
                                    className="w-3 h-3 text-green-500"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24">
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M5 13l4 4L19 7"
                                    />
                                  </svg>
                                ) : (
                                  <svg
                                    className="w-3 h-3 text-slate-500"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24">
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                                    />
                                  </svg>
                                )}
                              </button>
                            </div>
                            <pre
                              className="p-2 overflow-x-auto overflow-y-auto font-mono text-xs rounded text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-700/50"
                              style={{
                                maxHeight:
                                  fullscreenMode === "api" ? "400px" : "80px",
                              }}>
                              {generateApiExample(
                                format as "curl" | "javascript" | "python"
                              )}
                            </pre>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 右侧主工作区 */}
            <div className="space-y-6">
              {/* 参数配置和执行结果 */}
              <div className="grid gap-6 lg:grid-rows-[auto_1fr]">
                {/* 参数输入 */}
                <div className="border shadow-xl bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl border-white/20">
                  <div className="p-6 border-b border-slate-200/50 dark:border-slate-700/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-red-600">
                          <svg
                            className="w-5 h-5 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200">
                            参数配置
                          </h3>
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            JSON 格式输入
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() =>
                          setFullscreenMode(
                            fullscreenMode === "params" ? null : "params"
                          )
                        }
                        className="p-2 transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-600"
                        title="全屏显示">
                        <svg
                          className="w-5 h-5 text-slate-600 dark:text-slate-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d={
                              fullscreenMode === "params"
                                ? "M6 18L18 6M6 6l12 12"
                                : "M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
                            }
                          />
                        </svg>
                      </button>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="relative">
                      <textarea
                        className="w-full p-4 font-mono text-sm border rounded-lg resize-none bg-slate-50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        style={{
                          height:
                            fullscreenMode === "params"
                              ? "calc(100vh - 200px)"
                              : "160px",
                          minHeight: "160px",
                        }}
                        value={jsonInput}
                        onChange={(e) => setJsonInput(e.target.value)}
                        placeholder="输入 JSON 格式的参数..."
                        spellCheck="false"
                      />
                      <button
                        onClick={() => handleCopy(jsonInput, "params")}
                        className="absolute p-2 transition-colors rounded-lg top-3 right-3 bg-white/80 dark:bg-slate-600/80 hover:bg-white dark:hover:bg-slate-600">
                        {copied === "params" ? (
                          <svg
                            className="w-4 h-4 text-green-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        ) : (
                          <svg
                            className="w-4 h-4 text-slate-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                            />
                          </svg>
                        )}
                      </button>
                    </div>

                    <div className="flex gap-3 mt-4">
                      <button
                        onClick={handleSend}
                        disabled={loading || !selectedTool}
                        className="flex items-center gap-2 px-6 py-3 font-medium text-white transition-all rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed">
                        {loading ? (
                          <>
                            <div className="w-5 h-5 border-2 rounded-full border-white/30 border-t-white animate-spin"></div>
                            执行中
                          </>
                        ) : (
                          <>
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M13 10V3L4 14h7v7l9-11h-7z"
                              />
                            </svg>
                            执行工具
                          </>
                        )}
                      </button>

                      <button
                        onClick={handleClearResponse}
                        className="flex items-center gap-2 px-4 py-3 transition-all rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                        清空结果
                      </button>
                    </div>

                    {error && (
                      <div className="p-4 mt-4 border border-red-200 rounded-lg bg-red-50 dark:bg-red-900/20 dark:border-red-800">
                        <div className="flex items-center gap-3">
                          <svg
                            className="flex-shrink-0 w-6 h-6 text-red-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          <span className="text-sm font-medium text-red-700 dark:text-red-300">
                            {error}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* 执行结果 */}
                <div className="border shadow-xl bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl border-white/20">
                  <div className="p-6 border-b border-slate-200/50 dark:border-slate-700/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600">
                          <svg
                            className="w-5 h-5 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200">
                            执行结果
                          </h3>
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            实时输出显示
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            setFullscreenMode(
                              fullscreenMode === "result" ? null : "result"
                            )
                          }
                          className="p-2 transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-600"
                          title="全屏显示">
                          <svg
                            className="w-5 h-5 text-slate-600 dark:text-slate-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d={
                                fullscreenMode === "result"
                                  ? "M6 18L18 6M6 6l12 12"
                                  : "M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
                              }
                            />
                          </svg>
                        </button>
                        {response && (
                          <button
                            onClick={() => handleCopy(response, "result")}
                            className="flex items-center gap-2 px-4 py-2 text-sm transition-all rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600">
                            {copied === "result" ? (
                              <>
                                <svg
                                  className="w-4 h-4 text-green-500"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24">
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                                已复制
                              </>
                            ) : (
                              <>
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24">
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                                  />
                                </svg>
                                复制结果
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="relative">
                      {response ? (
                        <SmartResultDisplay
                          result={JSON.parse(response)?.result}
                          toolName={selectedTool}
                        />
                      ) : (
                        <div
                          className="flex items-center justify-center italic text-slate-400 dark:text-slate-500"
                          style={{
                            height:
                              fullscreenMode === "result"
                                ? "calc(100vh - 200px)"
                                : "calc(50vh - 240px)",
                            minHeight: "200px",
                          }}>
                          执行结果将在这里显示...
                        </div>
                      )}

                      {loading && (
                        <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
                          <div className="text-center">
                            <div className="w-12 h-12 mx-auto mb-4 border-4 border-blue-200 rounded-full border-t-blue-500 animate-spin"></div>
                            <span className="text-lg font-medium text-slate-600 dark:text-slate-400">
                              正在执行...
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
