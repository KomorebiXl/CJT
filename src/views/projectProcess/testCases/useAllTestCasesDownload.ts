import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { downloadAiTestCaseAPI } from '@/api/projectProcess/testCases-api'
import { PROCESS_PROJECT_ID_KEY } from '@/constant/globalVariables'
import { sessionStorage } from '@/utils/storage'
import { getProcessProjectDetail } from '@/utils/processProject'
import { downloadFile } from '@/utils/file'

const currentProjectId = () =>
  sessionStorage.get<string>(PROCESS_PROJECT_ID_KEY)

/** 两个「全部」入口共用同一范围；点击即绑定项目，异步期间不重新读取全局项目。 */
export const useAllTestCasesDownload = () => {
  const route = useRoute()
  const downloadingAll = ref(false)
  const downloadError = ref('')
  watch(
    () => route.query.projectId,
    () => {
      downloadError.value = ''
    }
  )

  const handleDownloadAllTestCases = async () => {
    if (downloadingAll.value) return
    downloadingAll.value = true
    downloadError.value = ''
    const subjectId = currentProjectId()
    try {
      if (!subjectId) throw new Error('未获取到项目信息，请重新进入项目')
      const detail = await getProcessProjectDetail()
      if (!detail || String(detail.id) !== subjectId) {
        throw new Error('未获取到点击时的项目信息，请重新进入项目后下载')
      }
      const response = await downloadAiTestCaseAPI({
        subjectId,
        scope: 'allFeatures',
        caseType: 'detail'
      })
      if (!(response.data instanceof Blob) || response.data.size === 0) {
        throw new Error('服务器未返回有效的用例文档，请稍后重试')
      }
      await downloadFile(response, `测试用例-九特性-详细版-${detail.code}.docx`)
    } catch (error: unknown) {
      const failure = error as {
        msg?: string
        message?: string
        response?: { data?: unknown }
      }
      let message =
        failure?.msg || failure?.message || '用例文档下载失败，请稍后重试'
      const data = failure?.response?.data
      if (data instanceof Blob) {
        try {
          const body = JSON.parse(await data.text()) as { msg?: string }
          message = body.msg || message
        } catch {
          /* 非 JSON 网络错误保留原提示 */
        }
      }
      if (currentProjectId() === subjectId) {
        downloadError.value = message
        ElMessage.error(message)
      }
    } finally {
      downloadingAll.value = false
    }
  }
  return { downloadingAll, downloadError, handleDownloadAllTestCases }
}
