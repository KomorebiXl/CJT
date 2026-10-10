import request from '@/utils/request'
import { createListAPI } from '@/utils/pageRequest.ts'
import type {
  SkillsManagementData,
  SkillsManagementFormData,
  SkillsManagementSearchParams
} from '@/types/adminManagement/skillsManagement'

const skillsManagementBaseUrl = '/system/aiSkill'

export const getSkillsManagementDataAPI = createListAPI<
  SkillsManagementSearchParams,
  SkillsManagementData
>(`${skillsManagementBaseUrl}/list`)

export const createSkillsManagementAPI = (data: SkillsManagementFormData) =>
  request.post<BaseResponse>({ url: `${skillsManagementBaseUrl}`, data })

export const getSkillsManagementDetailAPI = (id: string) =>
  request.get<DataResponse<SkillsManagementData>>({ url: `${skillsManagementBaseUrl}/${id}` })

export const updateSkillsManagementAPI = (data: SkillsManagementFormData & { id: string }) =>
  request.put<BaseResponse>({ url: `${skillsManagementBaseUrl}`, data })

export const deleteSkillsManagementAPI = (data: { ids: Array<string> }) =>
  request.post<BaseResponse>({ url: `${skillsManagementBaseUrl}/delete`, data })

/** 恢复该技能的提示词为出厂默认模板 */
export const resetSkillTemplateAPI = (id: string) =>
  request.post<BaseResponse>({ url: `${skillsManagementBaseUrl}/resetTemplate`, data: { id } })
