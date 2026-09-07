/**
 * projectProcess 跨模块共享常量
 */

/**
 * sub_property 字典按 feature 过滤白名单（照源 acceptanceTest/constant/index.ts DICT_FILTER_MAP）。
 * 特性编码 2-9：信息安全性/兼容性/可靠性/易用性/可移植性/维护性/用户文档集/性能效率；
 * testPlanReview、initialTest 的特性页共用，回归测试模块落地后同样由此取用。
 */
export const DICT_FILTER_MAP: Record<string, string[]> = {
  '2': ['10', '20', '30', '40'],
  '3': ['50', '60', '70'],
  '4': ['80', '90', '100', '110'],
  '5': ['120', '130', '140', '150', '160', '170'],
  '6': ['180', '190', '200'],
  '7': ['210', '220', '230', '240'],
  '8': ['245'],
  '9': ['250']
}
