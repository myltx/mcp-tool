/**
 * 菜谱数据服务
 */

import type { Recipe } from "../types";
import { CONFIG } from "../constants";

// 菜谱数据缓存
let recipesCache: Recipe[] | null = null;
let cacheTimestamp: number = 0;

/**
 * 菜谱数据服务类
 */
export class RecipeService {
  /**
   * 从远程 API 获取菜谱数据
   */
  static async fetchRecipes(): Promise<Recipe[]> {
    const now = Date.now();

    // 检查缓存
    if (recipesCache && now - cacheTimestamp < CONFIG.CACHE_DURATION) {
      return recipesCache;
    }

    try {
      const response = await fetch(CONFIG.RECIPE_API_URL);
      if (!response.ok) {
        throw new Error(`Failed to fetch recipes: ${response.status}`);
      }

      const recipes: Recipe[] = await response.json();

      // 更新缓存
      recipesCache = recipes;
      cacheTimestamp = now;

      return recipes;
    } catch (error) {
      console.error("Error fetching recipes:", error);
      // 如果获取失败且有缓存，返回缓存数据
      if (recipesCache) {
        return recipesCache;
      }
      // 否则返回空数组
      return [];
    }
  }

  /**
   * 根据ID查找菜谱
   */
  static async findRecipeById(id: string): Promise<Recipe | null> {
    const recipes = await this.fetchRecipes();
    return recipes.find((recipe) => recipe.id === id) || null;
  }

  /**
   * 获取所有菜谱分类
   */
  static async getCategories(): Promise<string[]> {
    const recipes = await this.fetchRecipes();
    return [...new Set(recipes.map((r) => r.category))];
  }

  /**
   * 获取所有难度等级
   */
  static async getDifficulties(): Promise<number[]> {
    const recipes = await this.fetchRecipes();
    return [...new Set(recipes.map((r) => r.difficulty))].sort((a, b) => a - b);
  }

  /**
   * 获取所有标签
   */
  static async getTags(): Promise<string[]> {
    const recipes = await this.fetchRecipes();
    return [...new Set(recipes.flatMap((r) => r.tags))];
  }

  /**
   * 清除缓存
   */
  static clearCache(): void {
    recipesCache = null;
    cacheTimestamp = 0;
  }

  /**
   * 获取缓存信息
   */
  static getCacheInfo(): { hasCache: boolean; cacheAge: number } {
    return {
      hasCache: recipesCache !== null,
      cacheAge: recipesCache ? Date.now() - cacheTimestamp : 0,
    };
  }
}
