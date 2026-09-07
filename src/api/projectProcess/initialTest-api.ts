import request from '@/utils/request'
import type {
  InitialTestFeatureListResponse,
  InitialTestFeatureSearchParams,
  InitialTestRebuildSerialParams,
  InitialTestRegressExportParams,
  InitialTestStatisticsData,
  InitialTestSystemDetailListResponse,
  InitialTestSystemDetailResult,
  InitialTestSystemDetailSearchParams
} from '@/types/projectProcess/initialTest'

const acceptanceResultBaseUrl = '/asset/acceptance/result'
const planBaseUrl = '/asset/plan'
const testLogBaseUrl = '/asset/acceptance/test/log'

/** 首轮测试统计 */
export const getInitialTestStatisticsAPI = () =>
  request.get<DataResponse<Array<InitialTestStatisticsData>>>({
    url: `${acceptanceResultBaseUrl}/count`
  })

/** 生成并下载执行记录表 */
export const exportExecutionRecordAPI = () =>
  request.download({
    url: `${planBaseUrl}/resultBatchExportSoftWare`,
    method: 'POST',
    params: {}
  })

/** 生成测试日志前检查 */
export const checkGenerateTestLogAPI = (projectId: string) =>
  request.get<BaseResponse>({
    url: `${acceptanceResultBaseUrl}/checkFirstNODO/${projectId}`
  })

/** 生成测试日志 */
export const generateTestLogAPI = (params: { flgFirst: boolean }) =>
  request.get<BaseResponse>({
    url: `${testLogBaseUrl}/export`,
    params
  })

/** 首轮测试功能性-系统详情列表 */
export const getInitialTestSystemDetailListAPI = (
  params: ListQuery<
    InitialTestSystemDetailSearchParams & {
      feature: string
      subFeature: string
      subsystem: string
      dataType: string
    }
  >
) =>
  request.get<InitialTestSystemDetailListResponse>({
    url: `${acceptanceResultBaseUrl}/list`,
    params
  })

/** 首轮测试功能性-系统详情单条 */
export const getInitialTestSystemDetailDetailAPI = (id: string) =>
  request.get<DataResponse<{ result: InitialTestSystemDetailResult }>>({
    url: `${acceptanceResultBaseUrl}/${id}`
  })

/** 更新首轮测试功能性-系统详情记录 */
export const updateInitialTestSystemDetailAPI = (data: FormData) =>
  request.put<BaseResponse>({ url: acceptanceResultBaseUrl, data })

/** 删除首轮测试功能性-系统详情记录 */
export const deleteInitialTestSystemDetailAPI = (data: {
  ids: Array<string>
}) =>
  request.post<BaseResponse>({
    url: `${acceptanceResultBaseUrl}/delete`,
    data
  })

/** 重构当前子系统序号 */
export const rebuildInitialTestSystemDetailSerialAPI = (
  data: InitialTestRebuildSerialParams
) =>
  request.post<BaseResponse>({
    url: `${acceptanceResultBaseUrl}/rebuildSerial`,
    data
  })

/** 回归（未通过记录）导出 */
export const exportInitialTestRegressReportAPI = (
  params: InitialTestRegressExportParams
) =>
  request.download({
    url: `${acceptanceResultBaseUrl}/resultRegressExport`,
    method: 'GET',
    params
  })

/** 回归（全部记录）导出 */
export const exportInitialTestResultReportAPI = (
  params: InitialTestRegressExportParams &
    Partial<InitialTestSystemDetailSearchParams>
) =>
  request.download({
    url: `${acceptanceResultBaseUrl}/resultExport`,
    method: 'GET',
    params
  })

/** 首轮测试特性页-常规导入（可靠性的 file/80 分流与性能的 250 字段由页面 uploadFn 构建 FormData） */
export const importInitialTestFeatureAPI = (data: FormData) =>
  request.post<BaseResponse>({
    url: `${acceptanceResultBaseUrl}/importSoftware`,
    data
  })

/** 首轮测试特性页列表 */
export const getInitialTestFeatureListAPI = (
  params: ListQuery<InitialTestFeatureSearchParams & { feature: string }>
) =>
  request.get<InitialTestFeatureListResponse>({
    url: `${acceptanceResultBaseUrl}/softWare/list`,
    params
  })

/** 首轮测试特性页-回归（未通过记录）导出（用户文档集经第二参覆盖 /regressExport 地址） */
export const exportInitialTestFeatureRegressAPI = (
  params: { feature: string },
  url: string = `${acceptanceResultBaseUrl}/resultRegressExportSoftWare`
) =>
  request.download({
    url,
    method: 'GET',
    params
  })

/** 首轮测试特性页-回归（全部记录）导出（携当前搜索条件；用户文档集经第二参覆盖 /export 地址） */
export const exportInitialTestFeatureReportAPI = (
  params: { feature: string } & Partial<InitialTestFeatureSearchParams>,
  url: string = `${acceptanceResultBaseUrl}/resultExportSoftWare`
) =>
  request.download({
    url,
    method: 'GET',
    params
  })

/** 重构当前特性序号 */
export const rebuildInitialTestFeatureSerialAPI = (data: {
  feature: string
}) =>
  request.post<BaseResponse>({
    url: `${acceptanceResultBaseUrl}/rebuildSerial`,
    data
  })
