import request from '@/utils/request'
import { createListAPI } from '@/utils/pageRequest.ts'
import type {
  DatabaseManagementData,
  DatabaseManagementFormData,
  DatabaseManagementSearchParams
} from '@/types/projectProcess/informationCollection/databaseManagement'

const databaseManagementBaseUrl = '/asset/system'

export const getDatabaseManagementDataAPI = createListAPI<
  DatabaseManagementSearchParams,
  DatabaseManagementData
>(`${databaseManagementBaseUrl}/list`)

export const createDatabaseManagementAPI = (data: DatabaseManagementFormData) =>
  request.post<BaseResponse>({ url: `${databaseManagementBaseUrl}`, data })

export const getDatabaseManagementDetailAPI = (id: string) =>
  request.get<DataResponse<DatabaseManagementData>>({
    url: `${databaseManagementBaseUrl}/${id}`
  })

export const updateDatabaseManagementAPI = (
  data: DatabaseManagementFormData & { id: string }
) => request.put<BaseResponse>({ url: `${databaseManagementBaseUrl}`, data })

export const deleteDatabaseManagementAPI = (data: { ids: Array<string> }) =>
  request.post<BaseResponse>({
    url: `${databaseManagementBaseUrl}/delete`,
    data
  })
