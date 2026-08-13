import { createListAPI } from '@/utils/pageRequest.ts'
import type {
  GuidelineData,
  GuidelineFormData,
  GuidelineSearchParams
} from '@/types/adminManagement/guideline'
import request from '@/utils/request'

const guidelineBaseUrl = '/background/guide'

export const getGuidelineDataAPI = createListAPI<
  GuidelineSearchParams,
  GuidelineData
>(`${guidelineBaseUrl}/list`)

export const createGuidelineDataAPI = (data: GuidelineFormData) => {
  return request.post<BaseResponse>({ url: guidelineBaseUrl, data })
}

export const updateGuidelineDataAPI = (
  data: GuidelineFormData & { id: string }
) => {
  return request.put<BaseResponse>({ url: guidelineBaseUrl, data })
}

export const getGuidelineDetailAPI = (id: string) => {
  return request.get<DataResponse<GuidelineData>>({
    url: `${guidelineBaseUrl}/${id}`
  })
}

export const deleteGuidelineAPI = (data: { ids: Array<string> }) => {
  return request.post<BaseResponse>({
    url: `${guidelineBaseUrl}/delete`,
    data
  })
}

export const getGuideOptionsAPI = () => {
  return request.get<DataResponse<Array<GuidelineData>>>({
    url: `${guidelineBaseUrl}/option`
  })
}
