/**
 * 菜谱相关工具函数
 */

import type {
  Recipe,
  RecipeWithDifficulty,
  Ingredient,
  SimplifiedRecipe,
} from "../types";

/**
 * 获取难度级别的中文描述
 */
export function getDifficultyText(difficulty: number): string {
  switch (difficulty) {
    case 1:
      return "非常简单";
    case 2:
      return "简单";
    case 3:
      return "中等";
    case 4:
      return "较难";
    case 5:
      return "困难";
    default:
      return "未知";
  }
}

/**
 * 提取食材名称列表
 */
export function extractIngredientNames(ingredients: Ingredient[]): string[] {
  return ingredients.map((ing) => ing.name);
}

/**
 * 为菜谱添加难度文本
 */
export function addDifficultyText(recipe: Recipe): RecipeWithDifficulty {
  return {
    ...recipe,
    difficultyText: getDifficultyText(recipe.difficulty),
  };
}

/**
 * 检查菜谱是否包含指定食材
 */
export function recipeContainsIngredient(
  recipe: Recipe,
  ingredient: string
): boolean {
  const recipeIngredients = extractIngredientNames(recipe.ingredients);
  return recipeIngredients.some((recipeIngredient) =>
    recipeIngredient.includes(ingredient)
  );
}

/**
 * 检查菜谱是否匹配查询条件
 */
export function recipeMatchesQuery(recipe: Recipe, query: string): boolean {
  return (
    recipe.name.includes(query) ||
    recipe.description.includes(query) ||
    recipe.tags.some((tag) => tag.includes(query)) ||
    extractIngredientNames(recipe.ingredients).some((ingredient) =>
      ingredient.includes(query)
    )
  );
}

/**
 * 计算食材匹配情况
 */
export function calculateIngredientMatch(
  recipe: Recipe,
  ingredients: string[]
): { matchedIngredients: string[]; matchCount: number } {
  const recipeIngredients = extractIngredientNames(recipe.ingredients);
  const matchedIngredients = ingredients.filter((ingredient) =>
    recipeIngredients.some((recipeIngredient) =>
      recipeIngredient.includes(ingredient)
    )
  );

  return {
    matchedIngredients,
    matchCount: matchedIngredients.length,
  };
}

/**
 * 简化菜谱信息（用于推荐结果）
 */
export function simplifyRecipe(recipe: Recipe): SimplifiedRecipe {
  return {
    id: recipe.id,
    name: recipe.name,
    description: recipe.description,
    category: recipe.category,
    difficulty: recipe.difficulty,
    difficultyText: getDifficultyText(recipe.difficulty),
    tags: recipe.tags,
    servings: recipe.servings,
    ingredients: recipe.ingredients,
    prep_time_minutes: recipe.prep_time_minutes,
    cook_time_minutes: recipe.cook_time_minutes,
    total_time_minutes: recipe.total_time_minutes,
  };
}

/**
 * 检查菜谱是否为荒菜（根据分类判断）
 */
export function isMeatDish(recipe: Recipe): boolean {
  return recipe.category === "荒菜" || recipe.category === "水产";
}

/**
 * 检查菜谱是否为素菜（根据分类判断）
 */
export function isVegetableDish(recipe: Recipe): boolean {
  return (
    recipe.category !== "荒菜" &&
    recipe.category !== "水产" &&
    recipe.category !== "早餐" &&
    recipe.category !== "主食"
  );
}

/**
 * 检查菜谱中是否包含指定肉类
 */
export function containsMeatType(recipe: Recipe, meatType: string): boolean {
  return (
    recipe.ingredients?.some((ingredient) => {
      const name = ingredient.name?.toLowerCase() || "";
      return name.includes(meatType.toLowerCase());
    }) || false
  );
}
