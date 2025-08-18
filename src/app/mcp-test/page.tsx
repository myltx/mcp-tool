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
    let parsedArgs: Record<string, unknown>;
    try {
      parsedArgs = JSON.parse(jsonInput);
    } catch (err: unknown) {
      setError(
        "JSON 格式错误: " + (err instanceof Error ? err.message : String(err))
      );
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
    }
  };

  const handleCopyParams = () => navigator.clipboard.writeText(jsonInput);
  const handleClearResponse = () => {
    setResponse("");
    setError("");
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-6 font-sans">
      <h1 className="text-4xl font-extrabold text-center mb-8">
        MCP Playground
      </h1>

      <div className="flex flex-col lg:flex-row gap-6 max-w-6xl mx-auto">
        {/* 工具列表 */}
        <div className="lg:w-1/3 card">
          <h2 className="text-xl font-semibold mb-4 border-b pb-2">工具列表</h2>
          <ul className="space-y-2">
            {tools.map((tool) => (
              <li key={tool.name}>
                <button
                  className={`w-full text-left p-3 rounded-lg transition-colors duration-200 ${
                    selectedTool === tool.name
                      ? "bg-primary text-white shadow-lg"
                      : "hover:bg-primary/10 text-foreground"
                  }`}
                  onClick={() => handleToolSelect(tool.name)}>
                  <div className="font-medium">{tool.name}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {tool.description}
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* 参数和结果区 */}
        <div className="lg:w-2/3 flex flex-col gap-4">
          {/* 参数输入 */}
          <div className="card">
            <h2 className="text-xl font-semibold mb-2 border-b pb-2">
              参数输入
            </h2>
            <textarea
              className="w-full h-48 p-3 border border-gray-300 rounded-lg font-mono text-foreground dark:text-white dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary"
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
            />
            <div className="flex gap-3 mt-3 flex-wrap">
              <button className="button" onClick={handleSend}>
                执行
              </button>
              <button className="button" onClick={handleCopyParams}>
                复制参数
              </button>
              <button
                className="button bg-gray-400 hover:bg-gray-500 text-white"
                onClick={handleClearResponse}>
                清空结果
              </button>
            </div>
            {error && (
              <div className="mt-2 text-red-600 font-medium">{error}</div>
            )}
          </div>

          {/* 返回结果 */}
          {/* 返回结果 */}
          <div className="card flex-1 flex flex-col">
            <div className="flex justify-between items-center mb-2 border-b pb-2">
              <h2 className="text-xl font-semibold">返回结果</h2>
              <div className="flex gap-2">
                <button
                  className="button px-3 py-1 text-sm bg-gray-400 hover:bg-gray-500"
                  onClick={() => {
                    navigator.clipboard.writeText(response);
                  }}>
                  复制结果
                </button>
                <button
                  className="button px-3 py-1 text-sm bg-gray-400 hover:bg-gray-500"
                  onClick={() => setExpanded(!expanded)}>
                  {expanded ? "折叠" : "展开"}
                </button>
              </div>
            </div>
            <pre
              className={`p-3 bg-gray-50 rounded-lg overflow-auto text-foreground dark:text-white dark:bg-gray-800 font-mono transition-all duration-200 ${
                expanded ? "max-h-[600px]" : "max-h-32"
              }`}>
              {response || "结果将在这里显示"}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
