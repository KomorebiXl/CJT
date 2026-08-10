import request from '@/utils/request'
import type {
  ProjectManagementData,
  ProjectManagementFormData,
  ProjectManagementSearchParams
} from '@/types/projectManagement'

const subjectBaseUrl = '/background/subject'

export const getProjectManagementList = (
  params: PaginationParams & ProjectManagementSearchParams
) => {
  return request.get<ListResponse<ProjectManagementData>>({
    url: `${subjectBaseUrl}/list`,
    params
  })
}

export const getProjectManagementDetailAPI = (id: number | string) =>
  request.get<DataResponse<ProjectManagementData>>({
    url: `${subjectBaseUrl}/${id}`
  })

export const createProjectManagementAPI = (data: ProjectManagementFormData) =>
  request.post<BaseResponse>({ url: subjectBaseUrl, data })

export const updateProjectManagementAPI = (
  data: ProjectManagementFormData & { id: number | string }
) => request.put<BaseResponse>({ url: subjectBaseUrl, data })

export const deleteProjectManagementAPI = (data: { ids: Array<string> }) =>
  request.post<BaseResponse>({ url: `${subjectBaseUrl}/delete`, data })

/** 用户选项（报告/方案编制人、用户角色列表） */
export const getUserOptionsAPI = () =>
  request.get<DataResponse<Array<{ userId: string; nickName: string }>>>({
    url: '/system/user/list/option'
  })

/** 项目角色选项 */
export const getSubjectRoleOptionsAPI = () =>
  request.get<DataResponse<Array<{ id: string; name: string }>>>({
    url: '/ras/role/list/option'
  })
