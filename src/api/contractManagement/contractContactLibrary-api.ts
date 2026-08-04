import request from '@/utils/request'
import { createListAPI } from '@/utils/pageRequest.ts'
import type {
  ContractContactLibraryData,
  ContractContactLibraryFormData,
  ContractContactLibrarySearchParams
} from '@/types/contractManagement/contractContactLibrary'

const contractContactLibraryBaseUrl = '/asset/business/contractLinkman'

export const getContractContactLibraryDataAPI = createListAPI<
  ContractContactLibrarySearchParams,
  ContractContactLibraryData
>(`${contractContactLibraryBaseUrl}/list`)

export const createContractContactLibraryAPI = (
  data: ContractContactLibraryFormData
) =>
  request.post<BaseResponse>({ url: `${contractContactLibraryBaseUrl}`, data })

export const getContractContactLibraryDetailAPI = (id: string) =>
  request.get<DataResponse<ContractContactLibraryData>>({
    url: `${contractContactLibraryBaseUrl}/${id}`
  })

export const updateContractContactLibraryAPI = (
  data: ContractContactLibraryFormData & { id: string }
) =>
  request.put<BaseResponse>({ url: `${contractContactLibraryBaseUrl}`, data })

export const deleteContractContactLibraryAPI = (data: { ids: Array<string> }) =>
  request.post<BaseResponse>({
    url: `${contractContactLibraryBaseUrl}/delete`,
    data
  })

export const getContractContactLibraryOptionsAPI = () => {
  return request.get<ListResponse<ContractContactLibraryData>>({
    url: `${contractContactLibraryBaseUrl}/select`
  })
}
