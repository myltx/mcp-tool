/**
 * 菜谱相关工具函数
 */

import type {
  Recipe,
  RecipeWithDifficulty,
  Ingredient,
  SimplifiedRecipe,
  ShoppingItem,
  CookingTimeStats,
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
 * 检查菜谱是否为荒菜（根据分类和食材判断）
 */
export function isMeatDish(recipe: Recipe): boolean {
  // 分类判断
  if (recipe.category === "荒菜" || recipe.category === "水产") {
    return true;
  }

  // 食材判断 - 检查是否包含动物蛋白
  return containsAnimalProtein(recipe);
}

/**
 * 检查菜谱是否包含动物蛋白（更精确的判断）
 */
export function containsAnimalProtein(recipe: Recipe): boolean {
  const animalProteins = [
    "猪",
    "牛",
    "鸡",
    "鸭",
    "羊",
    "兔",
    "鹅", // 畜禽肉
    "鱼",
    "虾",
    "蟹",
    "蛤",
    "蚝",
    "蚌",
    "贝",
    "鳗",
    "鲳",
    "鲤",
    "鲫",
    "带鱼",
    "黄鱼",
    "鲑鱼",
    "三文鱼", // 水产
    "肉",
    "蛋",
    "奶",
    "奶酪",
    "黄油",
    "奶油",
    "酸奶", // 通用动物制品
    "火腿",
    "腊肉",
    "香肠",
    "培根",
    "肉松",
    "肉丸", // 肉制品
  ];

  return (
    recipe.ingredients?.some((ingredient) => {
      const name = ingredient.name?.toLowerCase() || "";
      return animalProteins.some((protein) => name.includes(protein));
    }) || false
  );
}

/**
 * 检查菜谱是否为素菜（更严格的判断）
 */
export function isVegetableDish(recipe: Recipe): boolean {
  // 排除明确的荒菜分类
  if (recipe.category === "荒菜" || recipe.category === "水产") {
    return false;
  }

  // 排除早餐和主食（可能含动物制品）
  if (recipe.category === "早餐" || recipe.category === "主食") {
    return !containsAnimalProtein(recipe);
  }

  // 检查是否不含动物蛋白
  return !containsAnimalProtein(recipe);
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

/**
 * 获取菜谱的烹饪方式
 */
export function getCookingMethod(recipe: Recipe): string {
  const name = recipe.name;
  if (name.includes("炒")) return "炒";
  if (name.includes("煮") || name.includes("汤")) return "煮";
  if (name.includes("蒸")) return "蒸";
  if (name.includes("炖") || name.includes("煲")) return "炖";
  if (name.includes("烤") || name.includes("焗")) return "烤";
  if (name.includes("炸")) return "炸";
  if (name.includes("凉拌") || name.includes("拌")) return "凉拌";
  if (name.includes("红烧") || name.includes("烧")) return "红烧";
  return "其他";
}

/**
 * 获取菜谱的地区风味（基于名称和标签推断）
 */
export function getCuisineType(recipe: Recipe): string {
  const name = recipe.name;
  const tags = recipe.tags.join(" ");
  const text = `${name} ${tags}`;

  if (text.includes("川") || text.includes("麻辣") || text.includes("辣"))
    return "川菜";
  if (text.includes("粤") || text.includes("广") || text.includes("港"))
    return "粤菜";
  if (text.includes("湘") || text.includes("湖南")) return "湘菜";
  if (text.includes("鲁") || text.includes("山东")) return "鲁菜";
  if (text.includes("苏") || text.includes("江苏")) return "苏菜";
  if (text.includes("浙") || text.includes("杭州")) return "浙菜";
  if (text.includes("闽") || text.includes("福建")) return "闽菜";
  if (text.includes("徽") || text.includes("安徽")) return "徽菜";
  if (text.includes("京") || text.includes("北京")) return "京菜";
  if (text.includes("东北")) return "东北菜";
  if (text.includes("西北") || text.includes("新疆")) return "西北菜";
  return "家常菜";
}

/**
 * 获取菜谱的口味特征
 */
export function getFlavorProfile(recipe: Recipe): string[] {
  const name = recipe.name;
  const desc = recipe.description;
  const text = `${name} ${desc}`.toLowerCase();

  const flavors: string[] = [];
  if (text.includes("辣") || text.includes("麻")) flavors.push("辣");
  if (text.includes("甜") || text.includes("糖")) flavors.push("甜");
  if (text.includes("酸") || text.includes("醋")) flavors.push("酸");
  if (text.includes("咸") || text.includes("盐")) flavors.push("咸");
  if (text.includes("鲜") || text.includes("嫩")) flavors.push("鲜");
  if (text.includes("香") || text.includes("蒜") || text.includes("葱"))
    flavors.push("香");

  return flavors.length > 0 ? flavors : ["清淡"];
}

/**
 * 生成购物清单（智能合并相同食材）
 */
export function generateShoppingList(recipes: Recipe[]) {
  const itemMap = new Map<
    string,
    { name: string; quantity: string; unit?: string; count: number }
  >();

  recipes.forEach((recipe) => {
    recipe.ingredients?.forEach((ingredient) => {
      const key = ingredient.name;
      const existing = itemMap.get(key);

      if (existing) {
        existing.count += 1;
        if (ingredient.quantity && ingredient.unit) {
          existing.quantity += ` + ${
            ingredient.text_quantity ||
            ingredient.quantity + (ingredient.unit || "")
          }`;
        }
      } else {
        itemMap.set(key, {
          name: ingredient.name,
          quantity:
            ingredient.text_quantity ||
            (ingredient.quantity
              ? `${ingredient.quantity}${ingredient.unit || ""}`
              : "适量"),
          unit: ingredient.unit || undefined,
          count: 1,
        });
      }
    });
  });

  return Array.from(itemMap.values());
}

/**
 * 计算菜单的烹饪时间统计
 */
export function calculateCookingTimeStats(recipes: Recipe[]) {
  let totalPrepTime = 0;
  let totalCookTime = 0;
  let validPrepCount = 0;
  let validCookCount = 0;

  recipes.forEach((recipe) => {
    if (recipe.prep_time_minutes) {
      totalPrepTime += recipe.prep_time_minutes;
      validPrepCount++;
    }
    if (recipe.cook_time_minutes) {
      totalCookTime += recipe.cook_time_minutes;
      validCookCount++;
    }
  });

  // 如果没有时间数据，根据难度估算
  if (validPrepCount === 0) {
    totalPrepTime = recipes.reduce(
      (sum, recipe) => sum + recipe.difficulty * 10,
      0
    );
  }
  if (validCookCount === 0) {
    totalCookTime = recipes.reduce(
      (sum, recipe) => sum + recipe.difficulty * 15,
      0
    );
  }

  const estimatedTotalTime = Math.max(
    totalPrepTime + totalCookTime * 0.7,
    totalCookTime
  ); // 部分并行处理

  let complexity: "simple" | "medium" | "complex" = "simple";
  if (estimatedTotalTime > 90) complexity = "complex";
  else if (estimatedTotalTime > 45) complexity = "medium";

  return {
    totalPrepTime,
    totalCookTime,
    estimatedTotalTime: Math.round(estimatedTotalTime),
    complexity,
  };
}

/**
 * 分析菜单的难度分布
 */
export function analyzeDifficulty(recipes: Recipe[]) {
  const difficulties = recipes.map((r) => r.difficulty);
  const averageDifficulty =
    difficulties.reduce((sum, d) => sum + d, 0) / difficulties.length;

  const simpleCount = difficulties.filter((d) => d <= 2).length;
  const mediumCount = difficulties.filter((d) => d === 3).length;
  const hardCount = difficulties.filter((d) => d >= 4).length;

  return {
    averageDifficulty: Math.round(averageDifficulty * 10) / 10,
    hasComplexDishes: hardCount > 0,
    simpleCount,
    mediumCount,
    hardCount,
  };
}
