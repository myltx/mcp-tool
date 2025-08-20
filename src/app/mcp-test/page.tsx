"use client";

import { useEffect, useState } from "react";

type ToolInfo = {
  name: string;
  description: string;
  defaultArgs: Record<string, unknown>;
};

export default function MCPPlayground() {
  const [expanded, setExpanded] = useState(false);
  const [tools, setTools] = useState<ToolInfo[]>([]);
  const [selectedTool, setSelectedTool] = useState<string>("");
  const [jsonInput, setJsonInput] = useState("{}");
  const [response, setResponse] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  // 获取工具列表
  useEffect(() => {
    fetch("/api/mcp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ method: "tools/list" }),
    })
      .then((res) => res.json())
      .then((data: { result: ToolInfo[] }) => {
        setTools(data.result);
        if (data.result.length > 0) {
          const firstTool = data.result[0];
          setSelectedTool(firstTool.name);
          setJsonInput(JSON.stringify(firstTool.defaultArgs || {}, null, 2));
        }
      });
  }, []);

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
      setResponse(JSON.stringify(data, null, 2));
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* 背景装饰 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute rounded-full -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 blur-3xl"></div>
        <div className="absolute rounded-full -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-indigo-400/20 to-cyan-400/20 blur-3xl"></div>
      </div>

      <div className="relative z-10 min-h-screen p-6 md:p-10">
        {/* 页头 */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 mb-6 shadow-lg bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl">
            <svg
              className="w-10 h-10 text-white"
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
          <h1 className="mb-4 text-5xl font-bold text-transparent md:text-6xl bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text">
            MCP Playground
          </h1>
          <p className="max-w-2xl mx-auto text-lg text-slate-600 dark:text-slate-300">
            调试与验证 MCP 工具的现代化工作台，支持实时执行和结果预览
          </p>
        </div>

        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-[1fr_2fr]">
            {/* 工具列表 */}
            <div className="border shadow-xl bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl border-white/20">
              <div className="p-6 border-b border-slate-200/50 dark:border-slate-700/50">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
                    <svg
                      className="w-5 h-5 text-white"
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
                    <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200">
                      工具列表
                    </h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      选择要执行的工具
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                {tools.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-40 text-slate-500 dark:text-slate-400">
                    <div className="w-12 h-12 mb-4 border-4 border-blue-200 rounded-full border-t-blue-500 animate-spin"></div>
                    <span>加载工具列表中...</span>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {tools.map((tool) => (
                      <button
                        key={tool.name}
                        onClick={() => handleToolSelect(tool.name)}
                        className={`w-full text-left p-4 rounded-xl transition-all duration-200 transform hover:scale-[1.02] ${
                          selectedTool === tool.name
                            ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/25"
                            : "bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-transparent hover:border-slate-200 dark:hover:border-slate-600"
                        }`}>
                        <div className="text-base font-semibold">
                          {tool.name}
                        </div>
                        <div className="mt-1 text-sm opacity-80 line-clamp-2">
                          {tool.description}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* 右侧内容区 */}
            <div className="space-y-6">
              {/* 参数输入 */}
              <div className="border shadow-xl bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl border-white/20">
                <div className="p-6 border-b border-slate-200/50 dark:border-slate-700/50">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600">
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
                      <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200">
                        参数输入
                      </h2>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        配置工具执行参数
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="relative">
                    <textarea
                      className="w-full h-48 p-4 font-mono text-sm transition-all duration-200 border resize-none bg-slate-50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent"
                      value={jsonInput}
                      onChange={(e) => setJsonInput(e.target.value)}
                      placeholder="输入 JSON 格式的参数..."
                      spellCheck="false"
                    />
                    <button
                      onClick={() => handleCopy(jsonInput, "params")}
                      className="absolute p-2 transition-colors duration-200 rounded-lg shadow-sm top-3 right-3 bg-white/80 dark:bg-slate-600/80 hover:bg-white dark:hover:bg-slate-600"
                      title="复制参数">
                      {copied === "params" ? (
                        <svg
                          className="w-5 h-5 text-green-500"
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
                          className="w-5 h-5 text-slate-500"
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

                  <div className="flex flex-wrap gap-3 mt-6">
                    <button
                      onClick={handleSend}
                      disabled={loading}
                      className="flex items-center gap-2 px-6 py-3 font-medium text-white transition-all duration-200 transform shadow-lg bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-xl shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none">
                      {loading ? (
                        <>
                          <div className="w-5 h-5 border-2 rounded-full border-white/30 border-t-white animate-spin"></div>
                          执行中...
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
                          执行
                        </>
                      )}
                    </button>

                    <button
                      onClick={handleClearResponse}
                      className="flex items-center gap-2 px-6 py-3 font-medium transition-all duration-200 transform border bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-xl border-slate-200 dark:border-slate-600 hover:scale-105">
                      <svg
                        className="w-5 h-5"
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
                    <div className="p-4 mt-4 border border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center flex-shrink-0 w-8 h-8 bg-red-100 rounded-full dark:bg-red-800/50">
                          <svg
                            className="w-5 h-5 text-red-600 dark:text-red-400"
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
                        </div>
                        <span className="font-medium text-red-700 dark:text-red-300">
                          {error}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* 返回结果 */}
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
                            d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                          />
                        </svg>
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200">
                          执行结果
                        </h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          查看工具执行输出
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleCopy(response, "result")}
                        disabled={!response}
                        className="flex items-center gap-2 px-4 py-2 transition-all duration-200 border rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-600 disabled:opacity-50 disabled:cursor-not-allowed">
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

                      <button
                        onClick={() => setExpanded(!expanded)}
                        disabled={!response}
                        className="flex items-center gap-2 px-4 py-2 transition-all duration-200 border rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-600 disabled:opacity-50 disabled:cursor-not-allowed">
                        {expanded ? (
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
                                d="M5 15l7-7 7 7"
                              />
                            </svg>
                            折叠
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
                                d="M19 9l-7 7-7-7"
                              />
                            </svg>
                            展开
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="relative">
                    <pre
                      className={`w-full p-4 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl overflow-auto font-mono text-sm text-slate-700 dark:text-slate-300 transition-all duration-300 whitespace-pre-wrap break-all ${
                        expanded ? "max-h-[600px]" : "max-h-48"
                      }`}>
                      {response || (
                        <span className="italic text-slate-400 dark:text-slate-500">
                          执行结果将在这里显示...
                        </span>
                      )}
                    </pre>

                    {loading && (
                      <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl">
                        <div className="text-center">
                          <div className="w-12 h-12 mx-auto mb-3 border-4 border-blue-200 rounded-full border-t-blue-500 animate-spin"></div>
                          <span className="text-slate-600 dark:text-slate-400">
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

        {/* 页脚 */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-2 px-6 py-3 border rounded-full shadow-lg bg-white/50 dark:bg-slate-800/50 backdrop-blur-xl border-white/20">
            <svg
              className="w-5 h-5 text-slate-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="text-sm text-slate-600 dark:text-slate-400">
              © {new Date().getFullYear()} MCP Tool - 现代化工具调试平台
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
