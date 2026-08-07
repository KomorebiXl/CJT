import type {
  TestEntrustmentContractData,
  TestEntrustmentContractFormData,
  TestEntrustmentContractSearchParams
} from '@/types/contractManagement/testEntrustmentContract'
import { createListAPI } from '@/utils/pageRequest.ts'
import request from '@/utils/request'

export const testEntrustmentContractBaseUrl = '/asset/business/testEntrustmentContract'

export const getTestEntrustmentContractDataAPI = createListAPI<
  TestEntrustmentContractSearchParams,
  TestEntrustmentContractData
>(`${testEntrustmentContractBaseUrl}/list`)

export const createTestEntrustmentContractAPI = (
  data: TestEntrustmentContractFormData
) => request.post<BaseResponse>({ url: testEntrustmentContractBaseUrl, data })

export const getTestEntrustmentContractDetailAPI = (id: string) =>
  request.get<DataResponse<TestEntrustmentContractData>>({
    url: `${testEntrustmentContractBaseUrl}/${id}`
  })

export const updateTestEntrustmentContractAPI = (
  data: TestEntrustmentContractFormData & { id: string }
) => request.put<BaseResponse>({ url: testEntrustmentContractBaseUrl, data })

export const deleteTestEntrustmentContractAPI = (data: {
  ids: Array<string>
}) =>
  request.post<BaseResponse>({
    url: `${testEntrustmentContractBaseUrl}/delete`,
    data
  })
