<script setup lang="ts">
import type {
  TestPlanData,
  TestPlanSearchParams
} from '@/types/projectProcess/archiveManagement/testPlan'
import type { DictOption } from '@/types/system/dict'
import {
  deleteSubjectPlanAPI,
  generateSubjectPlanAPI,
  getTestPlanBlobAPI,
  getTestPlanDataAPI,
  updateSubjectPlanLanguageAPI
} from '@/api/projectProcess/archiveManagement/testPlan-api.ts'
import { ScMessage } from '@/utils/ElUtils'
import { useScConfirm } from '@/hooks/useScConfirmDialog.ts'
import { useLoading } from '@/hooks/useLoading.ts'
import { useVisible } from '@/hooks/useVisible.ts'
import { safeRequest } from '@/utils/safeRequest.ts'
import { downloadFile } from '@/utils/file.ts'
import { getDictOptions } from '@/utils/dict.ts'
import { useDeleteAction } from '@/hooks/useDeleteAction.ts'
import { sessionStorage } from '@/utils/storage'
import { PROCESS_PROJECT_ID_KEY } from '@/constant/globalVariables'

const getProcessProjectId = () =>
  sessionStorage.get<string>(PROCESS_PROJECT_ID_KEY) ?? ''

const route = useRoute()

/** 语言设置按入口显隐：路径参数 language=0 时隐藏按钮、Tag 与弹窗，缺省显示 */
const showLanguageSetting = route.query.language !== '0'

const searchbarItems = reactive<SearchbarItems<TestPlanSearchParams>>([
  { label: '测试方案名称', prop: 'name', type: 'input' }
])

const tableColumns = reactive<TableColumns>([
  { label: '测试方案名称', prop: 'name' },
  { label: '生成日期', prop: 'createTime' },
  { label: '生成人', prop: 'createByName', width: 150 }
])

const scResourcePageRef = useTemplateRef<PageInstance>('scResourcePageRef')

/** 语言类型设置：language 由列表响应回填，提交时映射为 testCategory */
const languageSetting = reactive<{ language: Array<string> }>({ language: [] })

/** 语言类型字典选项 */
const languageOptions = ref<Array<DictOption>>([])

/** 操作栏 Tag 文案：语言类型值映射字典 label，未匹配回退原值 */
const languageTagText = computed(() =>
  languageSetting.language
    .map(
      value =>
        languageOptions.value.find(item => item.value === value)?.label ?? value
    )
    .join('、')
)

const { visible: languageVisible, setVisible: setLanguageVisible } =
  useVisible()

const {
  loading: languageLoading,
  startLoading: startLanguageLoading,
  stopLoading: stopLanguageLoading
} = useLoading()

const { scConfirm } = useScConfirm()

/** 提交生成测试方案：服务端返回更高 confirmStep 时，确认后带新步骤继续，取消则终止 */
const submitGeneratePlan = async (confirmStep: number, id: string) => {
  const closeLoading = ScMessage.loading('正在生成测试方案，请稍候...')
  const [err, res] = await safeRequest(
    generateSubjectPlanAPI({ confirmStep, id }),
    { showError: false }
  )
  closeLoading()
  if (err || !res) return
  if (res.confirmStep && res.confirmStep > confirmStep) {
    try {
      await scConfirm({ message: res.msg })
    } catch {
      return
    }
    await submitGeneratePlan(res.confirmStep, id)
    return
  }
  ScMessage.success('测试方案生成成功')
  await scResourcePageRef.value?.refresh()
}

/** 生成测试方案 */
const handleGeneratePlan = () => submitGeneratePlan(1, getProcessProjectId())

/** 语言类型设置确认：提交多选数组，成功后关闭弹窗 */
const handleLanguageConfirm = async () => {
  startLanguageLoading()
  const [err, res] = await safeRequest(
    updateSubjectPlanLanguageAPI({
      subjectId: getProcessProjectId(),
      testCategory: languageSetting.language
    })
  )
  stopLanguageLoading()
  if (err || !res) return
  ScMessage.success(res.msg)
  setLanguageVisible(false)
}

/** 下载测试方案 */
const handleDownloadPlan = async (row: TestPlanData) => {
  const [err, res] = await safeRequest(getTestPlanBlobAPI(row), {
    message: '文件下载失败'
  })
  if (err) return
  await downloadFile(res!, row.name)
}

const pageConfig: PageConfig<TestPlanData> = {
  searchConfig: { searchbarItems },
  operateConfig: {
    defaultButtons: [],
    customButtons: [
      {
        name: '生成测试方案',
        type: 'primary',
        onClick: () => handleGeneratePlan()
      },
      ...(showLanguageSetting
        ? [
            {
              name: '语言设置',
              onClick: () => {
                setLanguageVisible(true)
              }
            }
          ]
        : [])
    ]
  },
  tableConfig: {
    tableColumns,
    showPagination: false,
    defaultButtonsConfig: {
      edit: { show: () => false }
    },
    customActionButtons: [
      {
        name: '下载',
        type: 'text',
        onClick: row => handleDownloadPlan(row)
      }
    ]
  },
  fetchData: async params => {
    const { language, data } = await getTestPlanDataAPI({
      ...params,
      id: getProcessProjectId()
    })
    languageSetting.language = language ?? []
    return { rows: data ?? [] }
  }
}

const { handleDelete } = useDeleteAction<TestPlanData>(
  (_ids, rows) => deleteSubjectPlanAPI(rows[0]),
  {
    message: '确定删除该测试方案吗？删除后不可恢复。',
    onSuccess: () => scResourcePageRef.value?.refresh()
  }
)

onMounted(async () => {
  languageOptions.value =
    (await getDictOptions('background_code_category')) ?? []
})
</script>

<template>
  <div class="page-card">
    <ScResourcePage
      ref="scResourcePageRef"
      :page-config="pageConfig"
      @delete="handleDelete"
    >
      <template #extra-operate-left>
        <el-tag v-if="showLanguageSetting && languageTagText" type="info">
          {{ languageTagText }}
        </el-tag>
      </template>
    </ScResourcePage>
    <ScDialog
      v-if="showLanguageSetting"
      v-model="languageVisible"
      title="语言类型设置"
      autoHeight
      :confirm-loading="languageLoading"
      @confirm="handleLanguageConfirm"
    >
      <ScCheckbox
        v-model="languageSetting.language"
        dict-field="background_code_category"
      />
    </ScDialog>
  </div>
</template>
