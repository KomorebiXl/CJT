import request from '@/utils/request'
import { createListAPI } from '@/utils/pageRequest.ts'
import type {
  CodeGenerationDetail,
  CodeGenerationDetailResponse,
  CodeGenerationRow,
  CodeGenerationSearchParams,
  CodeGenerationUpdateData,
  CodePreviewData,
  ImportableTableRow,
  ImportTableSearchParams
} from '@/types/systemTools/codeGeneration'

const codeGenerationBaseUrl = '/tool/gen'

export const getCodeGenerationListAPI = createListAPI<
  CodeGenerationSearchParams,
  CodeGenerationRow
>(`${codeGenerationBaseUrl}/list`)

export const deleteCodeGenerationAPI = (ids: string[]) =>
  request.post<BaseResponse>({
    url: `${codeGenerationBaseUrl}/delete`,
    data: { ids }
  })

export const getImportableTableListAPI = createListAPI<
  ImportTableSearchParams,
  ImportableTableRow
>(`${codeGenerationBaseUrl}/db/list`)

export const importCodeGenerationTablesAPI = (tables: string) =>
  request.post<BaseResponse>({
    url: `${codeGenerationBaseUrl}/importTable`,
    params: { tables }
  })

export const getCodeGenerationDetailAPI = (tableId: number | string) =>
  request.get<DataResponse<CodeGenerationDetailResponse>>({
    url: `${codeGenerationBaseUrl}/${tableId}`
  })

export const updateCodeGenerationAPI = (data: CodeGenerationUpdateData) =>
  request.put<BaseResponse>({ url: codeGenerationBaseUrl, data })

export const previewGeneratedCodeAPI = (tableId: number | string) =>
  request.get<DataResponse<CodePreviewData>>({
    url: `${codeGenerationBaseUrl}/preview/${tableId}`
  })

export const generateCodeToPathAPI = (tableName: string) =>
  request.get<BaseResponse>({
    url: `${codeGenerationBaseUrl}/genCode/${encodeURIComponent(tableName)}`
  })

export const downloadGeneratedCodeAPI = (tableName: string) =>
  request.download({
    url: `${codeGenerationBaseUrl}/batchGenCode`,
    params: { tables: tableName }
  })

export const syncCodeGenerationTableAPI = (tableName: string) =>
  request.get<BaseResponse>({
    url: `${codeGenerationBaseUrl}/synchDb/${encodeURIComponent(tableName)}`
  })
