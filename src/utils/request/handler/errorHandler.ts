import { ElMessage, ElMessageBox } from 'element-plus'
import { BUSINESS_CODE } from '@/constant/businessCode.ts'

export let isRelogin: { show: boolean } = { show: false }

/** 重新登录确认后的动作（登出+跳登录页），由路由层通过 setConfirmReloginAction 注册，
 * 请求层不反向依赖 router/user-store（会构成循环引用，且默认导出类型在环上解析失败） */
let confirmReloginAction: (() => Promise<void>) | null = null

export const setConfirmReloginAction = (action: () => Promise<void>) => {
  confirmReloginAction = action
}

/** 登录过期走弹窗确认而非消息条，且全局同时只保留一个 */
const showReloginConfirm = () => {
  if (!isRelogin.show) {
    isRelogin.show = true
    ElMessageBox.confirm(
      BUSINESS_CODE[401],
      '系统提示',
      {
        confirmButtonText: '重新登录',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
      .then(async () => {
        // 动作内部先登出再跳转：登出请求若因会话失效再报 401，仍被当前标记抑制，不会二次弹窗
        if (confirmReloginAction) await confirmReloginAction()
        isRelogin.show = false
      })
      .catch(() => {
        isRelogin.show = false
      })
  }
}

/** 业务码是否已在 BUSINESS_CODE 登记统一提示（消费方据此避免对同一错误重复弹窗） */
export const hasBusinessErrorHandler = (code: number): boolean =>
  code in BUSINESS_CODE

export const handleBusinessError = (code: number, message: string) => {
  if (!hasBusinessErrorHandler(code)) {
    console.warn(`未定义的业务错误码 ${code}，请在 BUSINESS_CODE 中补充`)
    return
  }
  if (code === 401) {
    showReloginConfirm()
    return
  }
  ElMessage.error(message ?? BUSINESS_CODE[code])
}
