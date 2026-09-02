import { getProcessProjectDetail } from '@/utils/processProject'

/**
 * 返回一次性写入的 ref——缓存冷时 getProcessProjectDetail 走 HTTP 回退，
 * 值晚于首次渲染到达，computed 需要响应式依赖才能重算。
 */
const useProcessProjectFlag = (
  key: 'ifUsePlanStealer' | 'ifUseResultStealer'
) => {
  const flag = ref(false)
  getProcessProjectDetail().then(detail => (flag.value = detail?.[key] === '0'))
  return flag
}

/**
 * @description 是否启动方案合并列
 * 启动-->显示测试项说明
 * 关闭-->隐藏测试项说明
 */
export const useIfUsePlanStealer = () =>
  useProcessProjectFlag('ifUsePlanStealer')

/** @description 是否启用报告合并列
 * 启动-->显示测试项说明
 * 关闭-->隐藏测试项说明
 */
export const useIfUseResultStealer = () =>
  useProcessProjectFlag('ifUseResultStealer')
