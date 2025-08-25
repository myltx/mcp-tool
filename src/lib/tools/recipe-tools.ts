/**
 * 菜谱相关 MCP 工具
 */

import type {
  ToolBase,
  Recipe,
  RecipeWithMatch,
  RecipeWithDifficulty,
  CategoryStats,
  DifficultyStats,
  DishRecommendation,
} from "../types";
import { RecipeService } from "../services";
import {
  getDifficultyText,
  addDifficultyText,
  recipeMatchesQuery,
  calculateIngredientMatch,
  parseStringParam,
  parseNumberParam,
  parseStringArrayParam,
  simplifyRecipe,
  isMeatDish,
  isVegetableDish,
  containsMeatType,
} from "../utils";

/**
 * 搜索菜谱工具
 */
export const searchRecipes: ToolBase = {
  description: "根据菜名搜索菜谱，返回完整菜谱信息",
  defaultArgs: { query: "西红柿" },
  execute: async (args) => {
    const query = parseStringParam(args, "query");

    if (!query.trim()) {
      return { recipes: [], message: "请输入搜索关键词" };
    }

    const recipes = await RecipeService.fetchRecipes();
    const results = recipes
      .filter((recipe) => recipeMatchesQuery(recipe, query))
      .map((recipe) => addDifficultyText(recipe));

    return {
      recipes: results,
      total: results.length,
      query: query,
      message: `找到 ${results.length} 个包含"${query}"的菜谱`,
    };
  },
};

/**
 * 随机推荐菜谱工具
 */
export const randomRecipe: ToolBase = {
  description: "随机推荐一个菜谱，解决'今天吃什么'的难题，返回完整菜谱信息",
  defaultArgs: {},
  execute: async (args) => {
    const difficultyFilter = parseNumberParam(args, "difficulty");

    const recipes = await RecipeService.fetchRecipes();
    let filteredRecipes = recipes;
    if (difficultyFilter) {
      filteredRecipes = recipes.filter(
        (recipe) => recipe.difficulty === difficultyFilter
      );
    }

    if (filteredRecipes.length === 0) {
      return { message: "没有找到符合条件的菜谱" };
    }

    const randomIndex = Math.floor(Math.random() * filteredRecipes.length);
    const recipe = filteredRecipes[randomIndex];

    return {
      recipe: addDifficultyText(recipe),
      message: `为您推荐: ${recipe.name} (难度: ${getDifficultyText(
        recipe.difficulty
      )})`,
    };
  },
};

/**
 * 智能推荐菜谱工具（根据人数推荐菜品组合）
 */
export const whatToEat: ToolBase = {
  description: "不知道吃什么？根据人数直接推荐适合的菜品组合，返回完整菜谱信息",
  defaultArgs: { peopleCount: 2 },
  execute: async (args) => {
    const peopleCount = parseNumberParam(args, "peopleCount") || 2;

    // 验证人数范围
    if (peopleCount < 1 || peopleCount > 10) {
      return { error: "用餐人数必须在01-10之间" };
    }

    const recipes = await RecipeService.fetchRecipes();

    if (recipes.length === 0) {
      return { message: "暂无可用菜谱数据" };
    }

    // 根据人数计算荒素菜数量
    const vegetableCount = Math.floor((peopleCount + 1) / 2);
    const meatCount = Math.ceil((peopleCount + 1) / 2);

    // 获取所有荒菜
    let meatDishes = recipes.filter((recipe) => isMeatDish(recipe));

    // 获取其他可能的菜品（当做素菜）
    const vegetableDishes = recipes.filter((recipe) => isVegetableDish(recipe));

    // 特别处理：如果人数超过8人，增加鱼类荒菜
    let recommendedDishes: Recipe[] = [];
    let fishDish: Recipe | null = null;

    if (peopleCount > 8) {
      const fishDishes = recipes.filter((recipe) => recipe.category === "水产");
      if (fishDishes.length > 0) {
        fishDish = fishDishes[Math.floor(Math.random() * fishDishes.length)];
        recommendedDishes.push(fishDish);
      }
    }

    // 打乱肉类优先级顺序，增加随机性
    const meatTypes = ["猪肉", "鸡肉", "牛肉", "羊肉", "鸭肉", "鱼肉"];
    // 使用 Fisher-Yates 洗牌算法打乱数组
    for (let i = meatTypes.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [meatTypes[i], meatTypes[j]] = [meatTypes[j], meatTypes[i]];
    }

    const selectedMeatDishes: Recipe[] = [];

    // 需要选择的荒菜数量
    const remainingMeatCount = fishDish ? meatCount - 1 : meatCount;

    // 尝试按照随机化的肉类优先级选择荒菜
    for (const meatType of meatTypes) {
      if (selectedMeatDishes.length >= remainingMeatCount) break;

      const meatTypeOptions = meatDishes.filter((dish) => {
        // 检查菜品的材料是否包含这种肉类
        return containsMeatType(dish, meatType);
      });

      if (meatTypeOptions.length > 0) {
        // 随机选择一道这种肉类的菜
        const selected =
          meatTypeOptions[Math.floor(Math.random() * meatTypeOptions.length)];
        selectedMeatDishes.push(selected);
        // 从可选列表中移除，避免重复选择
        meatDishes = meatDishes.filter((dish) => dish.id !== selected.id);
      }
    }

    // 如果通过肉类筛选的荒菜不够，随机选择剩余的
    while (
      selectedMeatDishes.length < remainingMeatCount &&
      meatDishes.length > 0
    ) {
      const randomIndex = Math.floor(Math.random() * meatDishes.length);
      selectedMeatDishes.push(meatDishes[randomIndex]);
      meatDishes.splice(randomIndex, 1);
    }

    // 随机选择素菜
    const selectedVegetableDishes: Recipe[] = [];
    while (
      selectedVegetableDishes.length < vegetableCount &&
      vegetableDishes.length > 0
    ) {
      const randomIndex = Math.floor(Math.random() * vegetableDishes.length);
      selectedVegetableDishes.push(vegetableDishes[randomIndex]);
      vegetableDishes.splice(randomIndex, 1);
    }

    // 合并推荐菜单
    recommendedDishes = recommendedDishes.concat(
      selectedMeatDishes,
      selectedVegetableDishes
    );

    // 构建推荐结果
    const recommendationDetails: DishRecommendation = {
      peopleCount,
      meatDishCount: selectedMeatDishes.length + (fishDish ? 1 : 0),
      vegetableDishCount: selectedVegetableDishes.length,
      dishes: recommendedDishes.map(simplifyRecipe),
      message: `为${peopleCount}人推荐的菜品，包含${
        selectedMeatDishes.length + (fishDish ? 1 : 0)
      }个荤菜和${selectedVegetableDishes.length}个素菜。`,
    };

    return recommendationDetails;
  },
};

/**
 * 根据食材查找菜谱工具
 */
export const findRecipesByIngredients: ToolBase = {
  description: "根据现有食材查找可以制作的菜谱，返回完整菜谱信息",
  defaultArgs: { ingredients: ["鸡蛋", "西红柿"] },
  execute: async (args) => {
    const ingredients = parseStringArrayParam(args, "ingredients");

    if (ingredients.length === 0) {
      return { recipes: [], message: "请提供至少一个食材" };
    }

    const recipes = await RecipeService.fetchRecipes();
    const results = recipes
      .map((recipe) => {
        const match = calculateIngredientMatch(recipe, ingredients);

        // 只保留有匹配的菜谱
        if (match.matchCount === 0) {
          return null;
        }

        return {
          ...recipe,
          ...match,
          difficultyText: getDifficultyText(recipe.difficulty),
        } as RecipeWithMatch;
      })
      .filter((recipe): recipe is RecipeWithMatch => recipe !== null)
      .sort((a, b) => b.matchCount - a.matchCount); // 按匹配度排序

    return {
      recipes: results,
      total: results.length,
      searchIngredients: ingredients,
      message: `根据食材 [${ingredients.join(", ")}] 找到 ${
        results.length
      } 个菜谱`,
    };
  },
};

/**
 * 获取菜谱详情工具
 */
export const getRecipeDetail: ToolBase = {
  description: "获取菜谱的详细制作步骤和完整信息",
  defaultArgs: { recipeId: "dishes-aquatic-咖喱炒蟹" },
  execute: async (args) => {
    const recipeId = parseStringParam(args, "recipeId");

    if (!recipeId) {
      return { error: "请提供菜谱ID" };
    }

    const recipe = await RecipeService.findRecipeById(recipeId);
    if (!recipe) {
      return { error: "菜谱不存在" };
    }

    return {
      recipe: addDifficultyText(recipe),
      message: `获取到菜谱详情: ${recipe.name}`,
    };
  },
};

/**
 * 获取菜谱分类统计工具
 */
export const getRecipeCategories: ToolBase = {
  description: "获取所有菜谱分类和统计信息",
  defaultArgs: {},
  execute: async () => {
    const recipes = await RecipeService.fetchRecipes();
    const categories = await RecipeService.getCategories();
    const difficulties = await RecipeService.getDifficulties();
    const allTags = await RecipeService.getTags();

    const categoryStats: CategoryStats[] = categories.map((category) => ({
      name: category,
      count: recipes.filter((r) => r.category === category).length,
    }));

    const difficultyStats: DifficultyStats[] = difficulties.map(
      (difficulty) => ({
        level: difficulty,
        levelText: getDifficultyText(difficulty),
        count: recipes.filter((r) => r.difficulty === difficulty).length,
      })
    );

    return {
      total: recipes.length,
      categories: categoryStats,
      difficulties: difficultyStats,
      tags: allTags,
      message: `共有 ${recipes.length} 个菜谱，${categories.length} 个分类`,
    };
  },
};
