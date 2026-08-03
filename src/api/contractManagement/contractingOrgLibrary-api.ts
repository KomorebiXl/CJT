import request from '@/utils/request'
import { createListAPI } from '@/utils/pageRequest.ts'
import type {
  ContractingOrgLibraryData,
  ContractingOrgLibraryFormData,
  ContractingOrgLibrarySearchParams
} from '@/types/contractManagement/contractingOrgLibrary'

const contractingOrgLibraryBaseUrl = '/asset/business/contractingUnit'

export const getContractingOrgLibraryDataAPI = createListAPI<
  ContractingOrgLibrarySearchParams,
  ContractingOrgLibraryData
>(`${contractingOrgLibraryBaseUrl}/list`)

export const createContractingOrgLibraryAPI = (
  data: ContractingOrgLibraryFormData
) =>
  request.post<BaseResponse>({ url: `${contractingOrgLibraryBaseUrl}`, data })

export const getContractingOrgLibraryDetailAPI = (id: string) =>
  request.get<DataResponse<ContractingOrgLibraryData>>({
    url: `${contractingOrgLibraryBaseUrl}/${id}`
  })

export const updateContractingOrgLibraryAPI = (
  data: ContractingOrgLibraryFormData & { id: string }
) => request.put<BaseResponse>({ url: `${contractingOrgLibraryBaseUrl}`, data })

export const deleteContractingOrgLibraryAPI = (data: { ids: Array<string> }) =>
  request.post<BaseResponse>({
    url: `${contractingOrgLibraryBaseUrl}/delete`,
    data
  })
