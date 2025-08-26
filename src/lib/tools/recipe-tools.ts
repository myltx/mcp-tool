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
  getCookingMethod,
  getCuisineType,
  getFlavorProfile,
  generateShoppingList,
  calculateCookingTimeStats,
  analyzeDifficulty,
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
  description:
    "智能菜单推荐助手，根据人数和偏好推荐适合的菜品组合。支持多样化配置：鱼类偏好、素食模式、食材规避、固定菜数等。自动分析烹饪时间、难度分布、风味搭配，并生成购物清单。",
  defaultArgs: {
    peopleCount: 4,
    preferFish: false,
    vegetarian: false,
    avoidIngredients: [],
    dishCount: null,
  },
  execute: async (args) => {
    const peopleCount = parseNumberParam(args, "peopleCount") || 2;
    const preferFish = Boolean(args?.preferFish);
    const vegetarian = Boolean(args?.vegetarian);
    const avoidIngredients: string[] = parseStringArrayParam(
      args,
      "avoidIngredients"
    );
    const dishCount = args?.dishCount
      ? parseNumberParam(args, "dishCount")
      : null;
    const seed = (args?.seed as number) || Date.now();

    // 验证人数范围
    if (peopleCount < 1 || peopleCount > 10) {
      return { error: "用餐人数必须在1-10之间" };
    }

    let recipes = await RecipeService.fetchRecipes();
    if (recipes.length === 0) {
      return { message: "暂无可用菜谱数据" };
    }

    // 过滤掉用户不想要的食材
    if (avoidIngredients.length > 0) {
      recipes = recipes.filter(
        (recipe) =>
          !avoidIngredients.some((bad) =>
            recipe.ingredients?.some((ing) => ing.name.includes(bad))
          )
      );
    }

    // 全素食模式下过滤菜谱
    if (vegetarian) {
      recipes = recipes.filter((r) => isVegetableDish(r));
      if (recipes.length === 0) {
        return { error: "没有找到符合全素要求的菜谱" };
      }
    }

    // 改进的荤素数量计算
    let meatCount = 0;
    let vegetableCount = 0;
    let totalDishCount = 0;

    if (vegetarian) {
      // 全素模式：所有菜品都是素菜
      meatCount = 0;
      vegetableCount = dishCount || Math.max(peopleCount, 3); // 至少3道菜
      totalDishCount = vegetableCount;
    } else {
      // 非素食模式：按比例分配
      if (dishCount && dishCount > 0) {
        totalDishCount = dishCount;
        meatCount = Math.ceil(dishCount * 0.6);
        vegetableCount = dishCount - meatCount;
      } else {
        meatCount = Math.ceil(peopleCount * 0.6);
        vegetableCount = Math.ceil(peopleCount * 0.4);
        totalDishCount = meatCount + vegetableCount;
      }
    }

    // 固定随机函数（可复现）
    function seededRandom(seedValue: number) {
      const x = Math.sin(seedValue) * 10000;
      return x - Math.floor(x);
    }

    // 多样性选择算法
    function selectDiverseRecipes(
      candidates: Recipe[],
      count: number,
      seedBase: number
    ): Recipe[] {
      if (candidates.length === 0) return [];

      const selected: Recipe[] = [];
      const usedCuisines = new Set<string>();
      const usedMethods = new Set<string>();
      const usedFlavors = new Set<string>();
      let currentSeed = seedBase;

      // 按多样性评分排序候选菜谱
      const scoredCandidates = candidates.map((recipe) => {
        const cuisine = getCuisineType(recipe);
        const method = getCookingMethod(recipe);
        const flavors = getFlavorProfile(recipe);

        return {
          recipe,
          cuisine,
          method,
          flavors,
          diversityScore: 0,
        };
      });

      // 选择算法：优先多样性，然后随机
      for (let i = 0; i < count && scoredCandidates.length > 0; i++) {
        // 计算每个候选菜谱的多样性得分
        scoredCandidates.forEach((candidate) => {
          let score = 0;
          if (!usedCuisines.has(candidate.cuisine)) score += 3;
          if (!usedMethods.has(candidate.method)) score += 2;
          if (candidate.flavors.every((f: string) => !usedFlavors.has(f)))
            score += 1;
          candidate.diversityScore = score;
        });

        // 按得分分组
        const maxScore = Math.max(
          ...scoredCandidates.map((c) => c.diversityScore)
        );
        const bestCandidates = scoredCandidates.filter(
          (c) => c.diversityScore === maxScore
        );

        // 从最高分组中随机选择
        const randomIndex = Math.floor(
          seededRandom(currentSeed++) * bestCandidates.length
        );
        const chosen = bestCandidates[randomIndex];

        selected.push(chosen.recipe);
        usedCuisines.add(chosen.cuisine);
        usedMethods.add(chosen.method);
        chosen.flavors.forEach((f: string) => usedFlavors.add(f));

        // 从候选列表中移除已选择的
        const chosenIndex = scoredCandidates.findIndex(
          (c) => c.recipe.id === chosen.recipe.id
        );
        scoredCandidates.splice(chosenIndex, 1);
      }

      return selected;
    }

    // 分类选择菜谱
    const meatDishes = recipes.filter((r) => isMeatDish(r));
    const vegetableDishes = recipes.filter((r) => isVegetableDish(r));
    const soupDishes = recipes.filter((r) => r.category === "汤类");
    const stapleDishes = recipes.filter((r) => r.category === "主食");

    // 选择鱼类（仅在非素食模式下）
    let fishDish: Recipe | null = null;
    if (!vegetarian && (preferFish || peopleCount > 8)) {
      const fishDishes = recipes.filter(
        (r) =>
          r.category === "水产" ||
          r.ingredients?.some(
            (ing) =>
              ing.name.includes("鱼") ||
              ing.name.includes("虾") ||
              ing.name.includes("蟹") ||
              ing.name.includes("蛤") ||
              ing.name.includes("鳗")
          )
      );
      if (fishDishes.length > 0) {
        const fishIndex = Math.floor(
          seededRandom(seed + 1) * fishDishes.length
        );
        fishDish = fishDishes[fishIndex];
      }
    }

    // 选择菜品的逻辑
    let selectedMeatDishes: Recipe[] = [];
    let selectedVegetableDishes: Recipe[] = [];

    if (vegetarian) {
      // 全素模式：只选素菜
      selectedVegetableDishes = selectDiverseRecipes(
        vegetableDishes,
        vegetableCount,
        seed + 200
      );
    } else {
      // 非素食模式：选择荤菜和素菜

      // 智能选择荤菜（排除鱼类，确保多样性）
      const nonFishMeatDishes = meatDishes.filter(
        (dish) => !fishDish || dish.id !== fishDish.id
      );
      selectedMeatDishes = selectDiverseRecipes(
        nonFishMeatDishes,
        fishDish ? meatCount - 1 : meatCount,
        seed + 100
      );

      // 智能选择素菜
      selectedVegetableDishes = selectDiverseRecipes(
        vegetableDishes,
        vegetableCount,
        seed + 200
      );
    }

    // 汤和主食推荐（考虑素食限制）
    const extraDishes: Recipe[] = [];
    if (peopleCount >= 5 && soupDishes.length > 0) {
      const suitableSoups = vegetarian
        ? soupDishes.filter((soup) => isVegetableDish(soup))
        : soupDishes;

      if (suitableSoups.length > 0) {
        const soupIndex = Math.floor(
          seededRandom(seed + 300) * suitableSoups.length
        );
        extraDishes.push(suitableSoups[soupIndex]);
      }
    }

    if (peopleCount >= 6 && stapleDishes.length > 0) {
      const suitableStaples = vegetarian
        ? stapleDishes.filter((staple) => isVegetableDish(staple))
        : stapleDishes;

      if (suitableStaples.length > 0) {
        const stapleIndex = Math.floor(
          seededRandom(seed + 400) * suitableStaples.length
        );
        extraDishes.push(suitableStaples[stapleIndex]);
      }
    }

    // 合并所有推荐菜谱
    const allSelectedDishes = [
      ...(fishDish ? [fishDish] : []),
      ...selectedMeatDishes,
      ...selectedVegetableDishes,
      ...extraDishes,
    ];

    // 检查结果
    if (allSelectedDishes.length === 0) {
      return {
        error: vegetarian ? "没有找到符合全素要求的菜谱" : "没有找到合适的菜谱",
      };
    }

    // 生成增强的分析数据
    const shoppingList = generateShoppingList(allSelectedDishes);
    const cookingTimeStats = calculateCookingTimeStats(allSelectedDishes);
    const difficultyAnalysis = analyzeDifficulty(allSelectedDishes);

    // 分析菜品多样性
    const cuisineVariety: string[] = [
      ...new Set(allSelectedDishes.map(getCuisineType)),
    ];
    const cookingMethods: string[] = [
      ...new Set(allSelectedDishes.map(getCookingMethod)),
    ];

    // 统计荤素菜数量（更精确）
    const actualMeatCount = allSelectedDishes.filter((dish) =>
      isMeatDish(dish)
    ).length;
    const actualVegetableCount = allSelectedDishes.filter((dish) =>
      isVegetableDish(dish)
    ).length;

    // 构建详细的推荐结果
    const recommendationDetails: DishRecommendation = {
      peopleCount,
      meatDishCount: actualMeatCount,
      vegetableDishCount: actualVegetableCount,
      extraDishCount: extraDishes.length,
      dishes: allSelectedDishes.map(simplifyRecipe),
      shoppingList,
      cookingTimeStats,
      difficultyAnalysis,
      cuisineVariety,
      cookingMethods,
      message: `为${peopleCount}人定制的${
        vegetarian ? "全素" : "多样化"
      }菜单：共${allSelectedDishes.length}道菜，包含${
        cuisineVariety.length
      }种风味（${cuisineVariety.join("、")}），预计${
        cookingTimeStats.estimatedTotalTime
      }分钟完成，平均难度${difficultyAnalysis.averageDifficulty}星。${
        extraDishes.length > 0 ? "已包含汤品/主食。" : ""
      }${
        avoidIngredients.length > 0
          ? `已避免：${avoidIngredients.join("、")}。`
          : ""
      }${vegetarian ? "已确保所有菜品不含动物成分。" : ""}`,
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
