"use client";

import { useState } from "react";

export function SmartResultDisplay({
  result,
  toolName,
}: {
  result: any;
  toolName: string;
}) {
  const [viewMode, setViewMode] = useState<"smart" | "json">("smart");

  const isWhatToEatResult = toolName === "whatToEat" && result?.dishes;
  const canUseSmartDisplay = isWhatToEatResult;

  return (
    <div className="w-full space-y-4">
      {/* 简化的切换按钮 */}
      {canUseSmartDisplay && (
        <div className="flex gap-1 p-1 rounded-lg bg-slate-100 dark:bg-slate-700">
          <button
            onClick={() => setViewMode("smart")}
            className={`px-3 py-2 text-sm rounded-md transition-all flex-1 text-center ${
              viewMode === "smart"
                ? "bg-white dark:bg-slate-600 text-slate-800 dark:text-slate-200 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
            }`}>
            智能展示
          </button>
          <button
            onClick={() => setViewMode("json")}
            className={`px-3 py-2 text-sm rounded-md transition-all flex-1 text-center ${
              viewMode === "json"
                ? "bg-white dark:bg-slate-600 text-slate-800 dark:text-slate-200 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
            }`}>
            JSON
          </button>
        </div>
      )}

      {/* 结果展示区域 */}
      {viewMode === "smart" && isWhatToEatResult ? (
        <div className="space-y-4">
          {/* 紧凑的头部概览 */}
          <div className="p-4 border border-blue-200 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 dark:border-blue-800">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
                {result.peopleCount}人菜单推荐
              </h3>
              <span className="px-2 py-1 text-xs text-blue-700 bg-blue-100 rounded dark:bg-blue-900/30 dark:text-blue-300">
                共{result.dishes?.length}道菜
              </span>
            </div>

            {result.message && (
              <p className="mb-3 text-sm text-slate-600 dark:text-slate-400">
                {result.message}
              </p>
            )}

            <div className="grid grid-cols-3 gap-3">
              <div className="p-2 text-center rounded bg-white/60 dark:bg-slate-800/60">
                <div className="text-lg font-semibold text-orange-600 dark:text-orange-400">
                  {result.meatDishCount}
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400">
                  荤菜
                </div>
              </div>
              <div className="p-2 text-center rounded bg-white/60 dark:bg-slate-800/60">
                <div className="text-lg font-semibold text-green-600 dark:text-green-400">
                  {result.vegetableDishCount}
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400">
                  素菜
                </div>
              </div>
              <div className="p-2 text-center rounded bg-white/60 dark:bg-slate-800/60">
                <div className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                  {result.dishes?.length}
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400">
                  总数
                </div>
              </div>
            </div>
          </div>

          {/* 菜品列表 */}
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {result.dishes?.map((dish: any, i: number) => (
              <div
                key={i}
                className="p-3 transition-shadow bg-white border rounded-lg dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:shadow-md">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-slate-800 dark:text-slate-200">
                    {dish.name}
                  </h4>
                  {dish.difficultyText && (
                    <span className="text-xs px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded">
                      {dish.difficultyText}
                    </span>
                  )}
                </div>
                {dish.description && (
                  <p className="mb-2 text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                    {dish.description}
                  </p>
                )}
                <div className="flex flex-wrap gap-2 text-xs text-slate-500 dark:text-slate-400">
                  {dish.category && (
                    <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 rounded">
                      {dish.category}
                    </span>
                  )}
                  {dish.total_time_minutes && (
                    <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 rounded">
                      {dish.total_time_minutes}分钟
                    </span>
                  )}
                  {dish.servings && (
                    <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 rounded">
                      {dish.servings}人份
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* 修复的JSON展示区域 - 添加完整的滚动条支持 */
        <div className="bg-white border rounded-lg border-slate-200 dark:border-slate-700 dark:bg-slate-800">
          <div className="p-3 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2">
              <svg
                className="w-4 h-4 text-slate-500"
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
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                JSON 数据
              </span>
            </div>
          </div>
          <div className="relative">
            <pre className="p-4 overflow-x-auto overflow-y-auto font-mono text-sm break-all whitespace-pre-wrap text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/50 max-h-96">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
