import request from '@/utils/request'
import { createListAPI } from '@/utils/pageRequest.ts'
import type {
  TestBasisData,
  TestBasisFormData,
  TestBasisSearchParams
} from '@/types/projectProcess/testBasis'

const testBasisBaseUrl = '/asset/standard'

export const getTestBasisDataAPI = createListAPI<
  TestBasisSearchParams,
  TestBasisData
>(`${testBasisBaseUrl}/list`)

export const createTestBasisAPI = (data: TestBasisFormData) =>
  request.post<BaseResponse>({ url: `${testBasisBaseUrl}`, data })

export const getTestBasisDetailAPI = (id: string) =>
  request.get<DataResponse<TestBasisData>>({ url: `${testBasisBaseUrl}/${id}` })

export const updateTestBasisAPI = (data: TestBasisFormData & { id: string }) =>
  request.put<BaseResponse>({ url: `${testBasisBaseUrl}`, data })

export const deleteTestBasisAPI = (data: { ids: Array<string> }) =>
  request.post<BaseResponse>({ url: `${testBasisBaseUrl}/delete`, data })
