import { ElLoading } from 'element-plus'
import {
  generateAiTestCaseAPI,
  getAiTestCaseProgressAPI
} from '@/api/projectProcess/testCases-api'
import type { TestCaseAiGenerateParams } from '@/types/projectProcess/testCases'

/** 轮询间隔（毫秒） */
const POLL_INTERVAL = 2000

/** 完成提示停留时长（毫秒），让用户看清计数后关闭遮罩 */
const DONE_LINGER = 800

/**
 * 提交 AI 批量生成任务并轮询至完成（全屏 Loading 展示进度）。
 * 任务失败/无待生成项均以 reject 结束，由调用方提示。
 */
export const runAiTestCaseTask = (params: TestCaseAiGenerateParams) => {
  const loading = ElLoading.service({
    text: 'AI 生成任务提交中…',
    fullscreen: true
  })
  return new Promise<void>((resolve, reject) => {
    const fail = (message: string) => {
      loading.close()
      reject(new Error(message))
    }
    generateAiTestCaseAPI(params)
      .then(({ data }) => {
        if (data.status === 'failed') {
          fail(data.message || '任务启动失败')
          return
        }
        if (data.status === 'success') {
          // 无待生成项等瞬时完成场景
          loading.close()
          resolve()
          return
        }
        const timer = window.setInterval(async () => {
          try {
            const { data: progress } = await getAiTestCaseProgressAPI(params.subjectId)
            if (progress.status === 'running') {
              loading.setText(
                `AI 生成中：${progress.processed ?? 0}/${progress.total ?? 0}（成功 ${
                  progress.success ?? 0
                }）`
              )
              return
            }
            window.clearInterval(timer)
            if (progress.status === 'failed') {
              fail(progress.message || '生成任务失败')
            } else if (progress.status === 'idle') {
              fail('生成任务不存在，请重试')
            } else {
              const total = progress.total ?? 0
              if (total === 0) {
                loading.close()
                resolve()
                return
              }
              loading.setText(
                `生成完成：成功 ${progress.success ?? 0}，降级 ${
                  progress.degraded ?? 0
                }，失败 ${progress.failed ?? 0}`
              )
              window.setTimeout(() => {
                loading.close()
                resolve()
              }, DONE_LINGER)
            }
          } catch {
            // 单次轮询失败静默忽略，下个周期重试
          }
        }, POLL_INTERVAL)
      })
      .catch(error => {
        fail(error?.message || '任务提交失败')
      })
  })
}
