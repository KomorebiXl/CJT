import type { ExportConfig } from '@/components/ScBaseComponents/ScResourcePage'
import { useDownloadFilesStore } from '@/store/modules/download-store.ts'
import { ElMessage, type MessageHandler } from 'element-plus'
import { isJsonBlob } from '@/utils/validate.ts'
import { downloadFile } from '@/utils/file.ts'

export const useExport = (
  getExportConfig: () => ExportConfig | undefined,
  getSearchParams: () => Record<string, unknown>
) => {
  const downloadFilesStore = useDownloadFilesStore()
  const handleExport = async (): Promise<void> => {
    const exportConfig = getExportConfig()
    if (!exportConfig?.exportUrl) {
      ElMessage.error('无效的请求地址，请检查是否有传入URL！')
      return
    }
    const { exportUrl, exportExtraParams, beforeExport, afterExport } = exportConfig
    let loadingMessage: MessageHandler | null = null
    try {
      if (beforeExport) {
        const canExport = await beforeExport()
        if (!canExport) {
          ElMessage.info('已取消导出')
          afterExport?.(false)
          return
        }
      }
      loadingMessage = ElMessage.info({ message: '正在导出...', duration: 0 })
      const params = {
        ...getSearchParams(),
        ...exportExtraParams
      }
      const res = await downloadFilesStore.downloadFilesRequest({
        requestUrl: exportUrl,
        extraParams: params
      })
      if (res.data instanceof Blob) {
        const isBlob = await isJsonBlob(res.data)
        if (isBlob) {
          const fileName = exportConfig.fileName
          await downloadFile(res, fileName)
          loadingMessage?.close()
          ElMessage.success('导出成功！')
          afterExport?.(true)
        } else {
          loadingMessage?.close()
          ElMessage.error('导出失败')
        }
      } else {
        loadingMessage?.close()
        ElMessage.error('导出失败')
        afterExport?.(false)
      }
    } catch (e) {
      loadingMessage?.close()
    }
  }

  return { handleExport }
}
