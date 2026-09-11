import request from '@/utils/request'
import type {
  SaveSupportingDocsRelationParams,
  SupportingDocsData,
  SupportingDocsFormData,
  SupportingDocsQuestionData,
  SupportingDocsQuestionSearchParams,
  SupportingDocsSearchParams,
  SupportingDocsSubsystemOption
} from '@/types/projectProcess/homeInfo/supportingDocs'

const supportingDocsBaseUrl = '/asset/acceptance/result'
const fileBaseUrl = '/business/file'

/** 支持性文件列表（源接口为 POST body 分页查询，不走 createListAPI 的 GET 模板） */
export const getSupportingDocsListAPI = (
  data: ListQuery<SupportingDocsSearchParams>
) =>
  request.post<ListResponse<SupportingDocsData>>({
    url: `${supportingDocsBaseUrl}/knowledgeFileList`,
    data
  })

/** 支持性文件详情（别名编辑回填） */
export const getSupportingDocsDetailAPI = (id: string) =>
  request.get<DataResponse<SupportingDocsData>>({ url: `${fileBaseUrl}/${id}` })

/** 支持性文件上传（FormData：files + nickName） */
export const addSupportingDocsAPI = (data: FormData) =>
  request.post<BaseResponse>({
    url: `${supportingDocsBaseUrl}/addKnowledgeFile`,
    data
  })

/** 更新文件别名 */
export const updateSupportingDocsAPI = (
  data: SupportingDocsFormData & { id: string }
) => request.put<BaseResponse>({ url: `${fileBaseUrl}`, data })

/** 删除支持性文件（源页面按单个 fileId 提交；接口声明的数组契约待线上复核） */
export const removeSupportingDocsAPI = (fileId: string) =>
  request.post<BaseResponse>({
    url: `${supportingDocsBaseUrl}/removeKnowledgeFile`,
    data: { fileId }
  })

/** 关联问题候选列表 */
export const getSupportingDocsQuestionListAPI = (
  data: ListQuery<SupportingDocsQuestionSearchParams>
) =>
  request.post<ListResponse<SupportingDocsQuestionData>>({
    url: `${supportingDocsBaseUrl}/selectKnowledgeFileDataList`,
    data
  })

/** 已关联问题列表 */
export const getSupportingDocsRelatedQuestionsAPI = (fileId: string) =>
  request.get<DataResponse<Array<SupportingDocsQuestionData>>>({
    url: `${supportingDocsBaseUrl}/getKnowledgeFileRelation`,
    params: { fileId }
  })

/** 保存关联问题 */
export const saveSupportingDocsRelationAPI = (
  data: SaveSupportingDocsRelationParams
) =>
  request.post<BaseResponse>({
    url: `${supportingDocsBaseUrl}/saveKnowledgeFileRelation`,
    data
  })

/** 子系统下拉选项 */
export const getSubsystemOptionsAPI = () =>
  request.get<DataResponse<Array<SupportingDocsSubsystemOption>>>({
    url: '/ras/subsystem/selectList'
  })
