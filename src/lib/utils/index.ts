/**
 * 工具函数统一导出
 */

// 菜谱相关工具函数
export {
  getDifficultyText,
  extractIngredientNames,
  addDifficultyText,
  recipeContainsIngredient,
  recipeMatchesQuery,
  calculateIngredientMatch,
  simplifyRecipe,
  isMeatDish,
  isVegetableDish,
  containsMeatType,
} from "./recipe-utils";

// MCP 相关工具函数
export {
  makeResponse,
  parseArgs,
  parseStringParam,
  parseNumberParam,
  parseStringArrayParam,
} from "./mcp-utils";
