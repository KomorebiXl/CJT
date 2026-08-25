import request from '@/utils/request'
import { createListAPI } from '@/utils/pageRequest.ts'
import type {
  SourceCodeInformationData,
  SourceCodeInformationFormData,
  SourceCodeInformationSearchParams
} from '@/types/projectProcess/informationCollection/sourceCodeInformation'

const sourceCodeInformationBaseUrl = '/asset/system'

export const getSourceCodeInformationDataAPI = createListAPI<
  SourceCodeInformationSearchParams,
  SourceCodeInformationData
>(`${sourceCodeInformationBaseUrl}/list`)

export const createSourceCodeInformationAPI = (
  data: SourceCodeInformationFormData
) =>
  request.post<BaseResponse>({
    url: `${sourceCodeInformationBaseUrl}`,
    data
  })

export const getSourceCodeInformationDetailAPI = (id: string) =>
  request.get<DataResponse<SourceCodeInformationData>>({
    url: `${sourceCodeInformationBaseUrl}/${id}`
  })

export const updateSourceCodeInformationAPI = (
  data: SourceCodeInformationFormData & { id: string }
) =>
  request.put<BaseResponse>({
    url: `${sourceCodeInformationBaseUrl}`,
    data
  })

export const deleteSourceCodeInformationAPI = (data: { ids: Array<string> }) =>
  request.post<BaseResponse>({
    url: `${sourceCodeInformationBaseUrl}/delete`,
    data
  })
