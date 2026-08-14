import { uploadFileAPI } from '@/api/file-api.ts'
import type { AxiosResponse } from 'axios'

/**
 * 递归将对象拍平追加到 FormData
 */
const appendToFormData = (
  formData: FormData,
  data: Record<string, any>,
  parentKey = ''
): void => {
  Object.entries(data).forEach(([key, value]) => {
    const fullKey = parentKey ? `${parentKey}[${key}]` : key
    if (value === null || value === undefined) return
    if (value instanceof File) {
      formData.append(fullKey, value, value.name)
    } else if (Array.isArray(value)) {
      value.forEach((item, index) => {
        if (item instanceof File) {
          formData.append(`${fullKey}[${index}]`, item, item.name)
        } else if (typeof item === 'object') {
          appendToFormData(formData, item, `${fullKey}[${index}]`)
        } else {
          formData.append(`${fullKey}[${index}]`, String(item))
        }
      })
    } else if (typeof value === 'object') {
      appendToFormData(formData, value, fullKey)
    } else {
      formData.append(fullKey, String(value))
    }
  })
}

/**
 * 将文件列表及额外参数构建为 FormData
 */
const buildFormData = (
  fileList: any[],
  extraParams?: Record<string, any>,
  filesFieldPrefix = 'files'
): FormData => {
  const formData = new FormData()
  if (fileList.length === 1) {
    // 单文件：字段名固定为 file
    const rawFile = fileList[0].raw ?? fileList[0]
    if (rawFile instanceof File) {
      formData.append('file', rawFile, rawFile.name)
    }
  } else {
    // 多文件：files[0].file / files[1].file / ...
    fileList.forEach((file, index) => {
      const rawFile = file.raw ?? file
      if (rawFile instanceof File) {
        formData.append(
          `${filesFieldPrefix}[${index}].file`,
          rawFile,
          rawFile.name
        )
      }
    })
  }
  if (extraParams) {
    appendToFormData(formData, extraParams)
  }
  return formData
}

/**
 * 文件上传工具函数
 * @param uploadUrl        上传接口地址
 * @param fileList         文件列表（支持 el-upload 原始项或 File 对象）
 * @param extraParams      附加业务参数
 * @param filesFieldPrefix 多文件时的字段前缀，默认 'files'
 */
export const uploadFile = async (
  uploadUrl: string,
  fileList: any[],
  extraParams?: Record<string, any>,
  filesFieldPrefix = 'files'
): Promise<any> => {
  if (!fileList.length) {
    return Promise.reject(new Error('文件列表不能为空'))
  }
  const formData = buildFormData(fileList, extraParams, filesFieldPrefix)
  return uploadFileAPI(uploadUrl, formData)
}

/**
 * 从响应头中解析文件名
 */
export const getFileName = (disposition?: string): string => {
  if (!disposition) return ''
  // 优先匹配 RFC 5987 格式的 filename*
  const utf8Match = disposition.match(
    /(?:^|;)\s*filename\*\s*=\s*(?:UTF-8'')?([^;]+)/i
  )
  const normalMatch = disposition.match(
    /(?:^|;)\s*filename\s*=\s*(?:"([^"]*)"|([^;\s]*))/i
  )
  const fileName = utf8Match?.[1] ?? normalMatch?.[1] ?? normalMatch?.[2]
  if (!fileName) return ''
  try {
    return decodeURIComponent(fileName)
  } catch {
    return fileName
  }
}

/**
 * 文件下载工具函数
 * @param data
 * @param fileName
 */
export const downloadFile = async (
  data: AxiosResponse,
  fileName?: string | null | undefined
): Promise<void> => {
  if (data.data instanceof Blob) {
    const url = window.URL.createObjectURL(data.data)
    const a = document.createElement('a')
    a.href = url
    a.download = fileName ?? getFileName(data.headers['content-disposition'])
    a.click()
    window.URL.revokeObjectURL(url)
  } else {
    const errorMsg = '文件流错误，服务器返回了错误信息，请检查！'
    console.error(errorMsg)
  }
}

/**
 * 将 Base64 字符串转换为 Blob 对象
 * @param base64   Base64 字符串（不含 Data URL 前缀）
 * @param mimeType MIME 类型，如 image/png
 */
export const base64ToBlob = (base64: string, mimeType: string): Blob => {
  const byteCharacters = atob(base64)
  const byteNumbers = new Array(byteCharacters.length)
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i)
  }
  const byteArray = new Uint8Array(byteNumbers)
  return new Blob([byteArray], { type: mimeType })
}
