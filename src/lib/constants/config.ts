/**
 * 项目配置常量
 */

export const CONFIG = {
  // 菜谱数据源配置
  RECIPE_API_URL: "https://weilei.site/all_recipes.json",

  // 缓存配置
  CACHE_DURATION: 30 * 60 * 1000, // 30分钟

  // Dream Hub API 配置
  DREAM_HUB_API_URL: "https://dream-hub.api.myltx.top/website/queryAll",

  // 难度级别映射
  DIFFICULTY_MAPPING: {
    1: "非常简单",
    2: "简单",
    3: "中等",
    4: "较难",
    5: "困难",
  } as const,
} as const;

export type DifficultyLevel = keyof typeof CONFIG.DIFFICULTY_MAPPING;
