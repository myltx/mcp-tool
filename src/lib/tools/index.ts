/**
 * MCP 工具统一导出
 */

import type { ToolBase } from "../types";

// 菜谱相关工具
import {
  searchRecipes,
  randomRecipe,
  whatToEat,
  findRecipesByIngredients,
  getRecipeDetail,
  getRecipeCategories,
} from "./recipe-tools";

// 基础工具
import { hello, time, getAllWebsites } from "./basic-tools";

/**
 * 所有 MCP 工具集合
 */
export const tools: Record<string, ToolBase> = {
  // 基础工具
  hello,
  time,
  getAllWebsites,

  // 菜谱相关工具
  searchRecipes,
  randomRecipe,
  whatToEat,
  findRecipesByIngredients,
  getRecipeDetail,
  getRecipeCategories,
};

// 单独导出工具（便于测试和独立使用）
export {
  // 基础工具
  hello,
  time,
  getAllWebsites,

  // 菜谱相关工具
  searchRecipes,
  randomRecipe,
  whatToEat,
  findRecipesByIngredients,
  getRecipeDetail,
  getRecipeCategories,
};
