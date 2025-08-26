"use client";

import { useState } from "react";

interface Dish {
  id?: string | number;
  name: string;
  description: string;
  category: string;
  difficultyText: string;
  total_time_minutes?: number;
  servings: number;
}

interface ShoppingItem {
  name: string;
  quantity?: string;
}

interface CookingTimeStats {
  estimatedTotalTime: number;
  complexity: "simple" | "medium" | "complex";
}

interface DifficultyAnalysis {
  averageDifficulty: number;
  simpleCount: number;
  mediumCount: number;
  hardCount: number;
}

interface DishRecommendationDisplayProps {
  data: {
    peopleCount: number;
    meatDishCount: number;
    vegetableDishCount: number;
    dishes: Dish[];
    shoppingList?: ShoppingItem[];
    cookingTimeStats?: CookingTimeStats;
    difficultyAnalysis?: DifficultyAnalysis;
    cuisineVariety?: string[];
    cookingMethods?: string[];
    message: string;
  };
}

export function DishRecommendationDisplay({
  data,
}: DishRecommendationDisplayProps) {
  const [activeTab, setActiveTab] = useState<"dishes" | "shopping" | "stats">(
    "dishes"
  );

  return (
    <div className="space-y-6">
      {/* 头部概览 */}
      <div className="p-6 border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl dark:border-blue-800">
        <h2 className="mb-2 text-xl font-bold text-slate-800 dark:text-slate-200">
          {data.peopleCount}人菜单推荐
        </h2>
        <p className="mb-4 text-slate-600 dark:text-slate-400">
          {data.message}
        </p>

        <div className="grid grid-cols-3 gap-4">
          <div className="p-3 text-center rounded-lg bg-white/60 dark:bg-slate-800/60">
            <div className="text-lg font-semibold text-orange-600 dark:text-orange-400">
              {data.meatDishCount}
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400">
              荤菜
            </div>
          </div>
          <div className="p-3 text-center rounded-lg bg-white/60 dark:bg-slate-800/60">
            <div className="text-lg font-semibold text-green-600 dark:text-green-400">
              {data.vegetableDishCount}
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400">
              素菜
            </div>
          </div>
          <div className="p-3 text-center rounded-lg bg-white/60 dark:bg-slate-800/60">
            <div className="text-lg font-semibold text-blue-600 dark:text-blue-400">
              {data.dishes.length}
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400">
              总数
            </div>
          </div>
        </div>
      </div>

      {/* 选项卡 */}
      <div className="flex gap-1 p-1 rounded-lg bg-slate-100 dark:bg-slate-800">
        {[
          { key: "dishes", label: "菜品详情", icon: "👨‍🍳" },
          { key: "shopping", label: "购物清单", icon: "🛒" },
          { key: "stats", label: "统计信息", icon: "📊" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() =>
              setActiveTab(tab.key as "dishes" | "shopping" | "stats")
            }
            className={`flex items-center gap-2 px-4 py-2 text-sm rounded-md transition-all flex-1 justify-center ${
              activeTab === tab.key
                ? "bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
            }`}>
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* 内容区 */}
      {activeTab === "dishes" && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {data.dishes.map((dish, index: number) => (
            <DishCard key={dish.id || index} dish={dish} />
          ))}
        </div>
      )}

      {activeTab === "shopping" && (
        <ShoppingList items={data.shoppingList || []} />
      )}

      {activeTab === "stats" && <StatsDisplay data={data} />}
    </div>
  );
}

function DishCard({ dish }: { dish: Dish }) {
  return (
    <div className="p-4 bg-white border rounded-lg border-slate-200 dark:border-slate-700 dark:bg-slate-800">
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-medium text-slate-800 dark:text-slate-200">
          {dish.name}
        </h4>
        <span className="px-2 py-1 text-xs rounded bg-slate-100 dark:bg-slate-700">
          {dish.difficultyText}
        </span>
      </div>
      <p className="mb-2 text-sm text-slate-600 dark:text-slate-400">
        {dish.description}
      </p>
      <div className="flex gap-4 text-xs text-slate-500">
        <span>{dish.category}</span>
        {dish.total_time_minutes && <span>{dish.total_time_minutes}分</span>}
        <span>{dish.servings}人份</span>
      </div>
    </div>
  );
}

function ShoppingList({ items }: { items: ShoppingItem[] }) {
  if (items.length === 0) {
    return <div className="py-8 text-center text-slate-500">暂无购物清单</div>;
  }

  return (
    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
      {items.map((item: ShoppingItem, index: number) => (
        <div
          key={index}
          className="flex justify-between p-3 bg-white border rounded-lg dark:bg-slate-800">
          <span className="text-slate-800 dark:text-slate-200">
            {item.name}
          </span>
          <span className="text-slate-600 dark:text-slate-400">
            {item.quantity || "适量"}
          </span>
        </div>
      ))}
    </div>
  );
}

function StatsDisplay({
  data,
}: {
  data: DishRecommendationDisplayProps["data"];
}) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* 风味多样性 */}
      {data.cuisineVariety && (
        <div className="p-4 bg-white border rounded-lg dark:bg-slate-800">
          <h3 className="mb-3 font-medium">地区风味</h3>
          <div className="flex flex-wrap gap-2">
            {data.cuisineVariety.map((cuisine: string, i: number) => (
              <span
                key={i}
                className="px-2 py-1 text-sm text-orange-700 bg-orange-100 rounded dark:bg-orange-900/30 dark:text-orange-300">
                {cuisine}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 烹饪方式 */}
      {data.cookingMethods && (
        <div className="p-4 bg-white border rounded-lg dark:bg-slate-800">
          <h3 className="mb-3 font-medium">烹饪方式</h3>
          <div className="flex flex-wrap gap-2">
            {data.cookingMethods.map((method: string, i: number) => (
              <span
                key={i}
                className="px-2 py-1 text-sm text-blue-700 bg-blue-100 rounded dark:bg-blue-900/30 dark:text-blue-300">
                {method}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 时间统计 */}
      {data.cookingTimeStats && (
        <div className="p-4 bg-white border rounded-lg dark:bg-slate-800">
          <h3 className="mb-3 font-medium">时间统计</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>预计总时间:</span>
              <span>{data.cookingTimeStats.estimatedTotalTime}分钟</span>
            </div>
            <div className="flex justify-between">
              <span>复杂度:</span>
              <span>
                {data.cookingTimeStats.complexity === "simple"
                  ? "简单"
                  : data.cookingTimeStats.complexity === "medium"
                  ? "中等"
                  : "复杂"}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 难度分析 */}
      {data.difficultyAnalysis && (
        <div className="p-4 bg-white border rounded-lg dark:bg-slate-800">
          <h3 className="mb-3 font-medium">难度分析</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>平均难度:</span>
              <span>{data.difficultyAnalysis.averageDifficulty}星</span>
            </div>
            <div className="flex justify-between">
              <span>简单菜品:</span>
              <span>{data.difficultyAnalysis.simpleCount}道</span>
            </div>
            <div className="flex justify-between">
              <span>中等菜品:</span>
              <span>{data.difficultyAnalysis.mediumCount}道</span>
            </div>
            <div className="flex justify-between">
              <span>困难菜品:</span>
              <span>{data.difficultyAnalysis.hardCount}道</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
