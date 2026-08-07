import { createListAPI } from '@/utils/pageRequest.ts'
import type {
  TestEntrustmentContractFilesData,
  TestEntrustmentContractFilesSearchParams
} from '@/types/contractManagement/testEntrustmentContractFiles'
import request from '@/utils/request'
import { testEntrustmentContractBaseUrl } from '@/api/contractManagement/testEntrustmentContract-api.ts'

const testEntrustmentContractFilesBaseUrl = '/asset/business/contract/record'

export const getTestEntrustmentContractDataAPI = createListAPI<
  TestEntrustmentContractFilesSearchParams,
  TestEntrustmentContractFilesData
>(`${testEntrustmentContractFilesBaseUrl}/list`)

export const getTestEntrustmentContractBlobAPI = (params: { id: string }) => {
  return request.download({
    url: `${testEntrustmentContractBaseUrl}/download`,
    method: 'POST',
    params
  })
}

export const generateTestEntrustmentContractFileAPI = async (params: {
  id: string
}) => {
  return request.post<BaseResponse>({
    url: `${testEntrustmentContractBaseUrl}/generateTestContract`,
    params
  })
}

export const deleteTestEntrustmentContractFileAPI = (data: {
  ids: Array<string>
}) => {
  return request.post<BaseResponse>({
    url: `${testEntrustmentContractFilesBaseUrl}/delete`,
    data
  })
}
