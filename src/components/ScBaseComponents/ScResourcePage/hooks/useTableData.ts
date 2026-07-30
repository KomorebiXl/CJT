import type { ScResourcePageConfig } from '@/components/ScBaseComponents'
import { useLoading } from '@/hooks/useLoading.ts'

export const useTableData = (
  getPageConfig: () => ScResourcePageConfig,
  getSearchParams: () => Record<string, any>
) => {
  const tableData = ref<Array<Record<string, any>>>([])
  const tableTotal = ref<number>(0)
  const paginationParams = reactive<PaginationParams>({
    pageNum: 1,
    pageSize: 30
  })
  const { loading, startLoading, stopLoading } = useLoading()

  const fetchTableData = async () => {
    const { showPagination = true } = getPageConfig().tableConfig
    try {
      startLoading()
      const pageParams = {
        ...(showPagination ? paginationParams : {}),
        ...getSearchParams(),
        ...getPageConfig().pageExtraParams
      }
      const { rows, total } = await getPageConfig().fetchData(pageParams)
      if (!rows) {
        console.error('无法检测到【rows】字段，请检查数据格式！')
        return
      }
      tableData.value = rows
      tableTotal.value = total ?? 0
    } catch (e) {
      console.error('获取表格数据失败===>', e)
    } finally {
      stopLoading()
    }
  }

  const handlePageChange = async (pageNum: number, pageSize: number) => {
    paginationParams.pageNum = pageNum
    paginationParams.pageSize = pageSize
    await fetchTableData()
  }

  return {
    tableData,
    tableTotal,
    paginationParams,
    loading,
    fetchTableData,
    handlePageChange
  }
}
