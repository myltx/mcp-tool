/**
 * whatToEat 工具优化功能测试示例
 */

// 基础推荐（4人聚餐）
const basicRecommendation = {
  peopleCount: 4,
};

// 偏好鱼类推荐（6人聚餐）
const fishPreferenceRecommendation = {
  peopleCount: 6,
  preferFish: true,
};

// 纯素食推荐（3人聚餐）
const vegetarianRecommendation = {
  peopleCount: 3,
  vegetarian: true,
};

// 避免特定食材（5人聚餐，避免羊肉和辣椒）
const avoidIngredientsRecommendation = {
  peopleCount: 5,
  avoidIngredients: ["羊肉", "辣椒"],
};

// 固定菜品数量（2人聚餐，只要3道菜）
const fixedDishCountRecommendation = {
  peopleCount: 2,
  dishCount: 3,
};

// 复杂场景（8人聚餐，偏好鱼类，避免牛肉，固定6道菜）
const complexRecommendation = {
  peopleCount: 8,
  preferFish: true,
  avoidIngredients: ["牛肉"],
  dishCount: 6,
};

// 可复现推荐（使用固定种子）
const reproducibleRecommendation = {
  peopleCount: 4,
  seed: 12345,
};

export const whatToEatTestCases = {
  basicRecommendation,
  fishPreferenceRecommendation,
  vegetarianRecommendation,
  avoidIngredientsRecommendation,
  fixedDishCountRecommendation,
  complexRecommendation,
  reproducibleRecommendation,
};

/**
 * 预期的功能改进说明：
 *
 * 1. 参数扩展 ✅
 *    - preferFish: 是否偏好带鱼类的推荐
 *    - vegetarian: 是否需要纯素菜单
 *    - avoidIngredients: 允许用户传入不想要的食材
 *    - dishCount: 固定推荐总数
 *    - seed: 可复现的随机推荐
 *
 * 2. 菜谱多样性优化 ✅
 *    - 类别均衡：覆盖不同烹饪方式（炒、煮、蒸、炖）
 *    - 地区风味：川菜、粤菜、湘菜等风味多样化
 *    - 避免重复口味：不连续选择相同口味的菜
 *
 * 3. 推荐逻辑改进 ✅
 *    - 荤菜 = ceil(peopleCount * 0.6)
 *    - 素菜 = ceil(peopleCount * 0.4)
 *    - 自动推荐汤和主食：
 *      - >= 5人 推荐汤品
 *      - >= 6人 推荐主食
 *
 * 4. 返回结果更丰富 ✅
 *    - 每道菜附带难度级别和烹饪时间
 *    - 返回购物清单（自动合并食材数量）
 *    - 烹饪时间统计和复杂度评估
 *    - 难度分析和风味多样性分析
 */
