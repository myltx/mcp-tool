/**
 * 菜谱相关类型定义
 */

/**
 * 食材类型
 */
export interface Ingredient {
  name: string;
  quantity: number | null;
  unit: string | null;
  text_quantity: string;
  notes: string;
}

/**
 * 制作步骤类型
 */
export interface Step {
  step: number;
  description: string;
}

/**
 * 菜谱类型
 */
export interface Recipe {
  id: string;
  name: string;
  description: string;
  source_path: string;
  image_path: string | null;
  images: string[];
  category: string;
  difficulty: number; // 1-5
  tags: string[];
  servings: number;
  ingredients: Ingredient[];
  steps: Step[];
  prep_time_minutes: number | null;
  cook_time_minutes: number | null;
  total_time_minutes: number | null;
  additional_notes: string[];
}

/**
 * 带难度文本的菜谱类型
 */
export interface RecipeWithDifficulty extends Recipe {
  difficultyText: string;
}

/**
 * 带匹配信息的菜谱类型（用于按食材搜索）
 */
export interface RecipeWithMatch extends Recipe {
  matchedIngredients: string[];
  matchCount: number;
  difficultyText: string;
}

/**
 * 分类统计类型
 */
export interface CategoryStats {
  name: string;
  count: number;
}

/**
 * 难度统计类型
 */
export interface DifficultyStats {
  level: number;
  levelText: string;
  count: number;
}

// 参数类型定义
export interface RecipeSearchParams {
  query: string;
}

export interface RecipesByIngredientsParams {
  ingredients: string[];
}

export interface RecipeDetailParams {
  recipeId: string;
}

export interface RandomRecipeParams {
  difficulty?: number;
}

export interface WhatToEatParams {
  peopleCount: number;
  preferFish?: boolean; // 是否偏好带鱼类的推荐
  vegetarian?: boolean; // 是否需要纯素菜单
  avoidIngredients?: string[]; // 不想要的食材列表
  dishCount?: number; // 固定推荐总数
  seed?: number; // 随机种子，用于可复现的推荐
}

/**
 * 简化的菜谱类型（用于推荐结果）
 */
export interface SimplifiedRecipe {
  id: string;
  name: string;
  description: string;
  category: string;
  difficulty: number;
  difficultyText: string;
  tags: string[];
  servings: number;
  ingredients: Ingredient[];
  prep_time_minutes: number | null;
  cook_time_minutes: number | null;
  total_time_minutes: number | null;
}

/**
 * 购物清单类型
 */
export interface ShoppingItem {
  name: string;
  quantity?: string;
  unit?: string;
  count: number; // 所需数量汇总
}

/**
 * 烹饪时间统计
 */
export interface CookingTimeStats {
  totalPrepTime: number; // 总备料时间（分钟）
  totalCookTime: number; // 总烹饪时间（分钟）
  estimatedTotalTime: number; // 预计总用时（分钟）
  complexity: "simple" | "medium" | "complex"; // 复杂度评估
}

/**
 * 菜品推荐结果类型
 */
export interface DishRecommendation {
  peopleCount: number;
  meatDishCount: number;
  vegetableDishCount: number;
  extraDishCount?: number; // 汤、主食等额外菜品数量
  dishes: SimplifiedRecipe[];
  shoppingList: ShoppingItem[]; // 购物清单
  cookingTimeStats: CookingTimeStats; // 烹饪时间统计
  difficultyAnalysis: {
    // 难度分析
    averageDifficulty: number;
    hasComplexDishes: boolean;
    simpleCount: number;
    mediumCount: number;
    hardCount: number;
  };
  cuisineVariety: string[]; // 风味多样性列表
  cookingMethods: string[]; // 烹饪方式列表
  message: string;
}
