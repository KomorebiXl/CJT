<script setup lang="ts">
import type { HomeContentForm } from '@/types/projectProcess/homeContent'
import type { ScBaseFormInstance } from '@/components/ScBaseForm'
import { updateHomeContentAPI } from '@/api/projectProcess/homeContent-api.ts'
import { getUserOptionsAPI } from '@/api/projectManagement-api.ts'
import {
  getProcessProjectDetail,
  refreshProcessProjectDetail
} from '@/utils/processProject'
import { safeRequest } from '@/utils/safeRequest.ts'
import { ScMessage } from '@/utils/ElUtils'
import { defineFormItems } from '@/utils/form.ts'
import { findFormItem } from '@/utils/formItemUtils.ts'
import { mapSelectOptions } from '@/utils/optionUtils.ts'
import { useScConfirm } from '@/hooks/useScConfirmDialog.ts'

const PRECAUTIONS_DEFAULT_CONTENT =
  '1、报告无评测单位公章或检测专用章无效。\n2、复制报告未重新加盖评测单位公章或检测专用章无效。\n3、报告无测试、审核、批准人签名或签章无效。\n4、报告涂改无效。\n5、本测试报告只对该项目有效。\n6、本报告结论的有效性建立在用户提供材料的真实性基础上。'

const TC_PRECAUTIONS_CONTENT =
  '1、报告无评测单位公章或检测专用章无效。\n2、复制报告未重新加盖评测单位公章或检测专用章无效。\n3、报告无测试、审核、批准人签名或签章无效。\n4、报告涂改无效。\n5、本测试报告只对该项目有效。\n6、报告未经实验室书面批准，不得节选复制本报告。\n7、本报告结论的有效性建立在用户提供材料的真实性基础上。'

/** 测试内容及方法默认文案，项目名称随填充动作取一次当次详情 */
const getAssessDefaultContent = (projectName: string) =>
  `本次测试根据相关国家及行业测试标准、项目招标文件、项目合同书、需求规格说明书的要求对${projectName}进行验收测试包括信息应用系统测试。\n信息应用系统：主要从功能性、信息安全性、兼容性、可靠性、易用性、可移植性、维护性、用户文档集和性能效率等方面进行测试，功能性、信息安全性、兼容性、可靠性、易用性、可移植性、维护性，主要采用等价类划分法、场景法和经验法等黑盒测试方法进行手工测试。用户文档集测试主要结合功能性测试，采用检查法，对系统相关用户文档进行检查。性能效率测试，结合系统功能，使用性能效率测试工具、网页数据分析工具，对项目性能指标进行确认。`

const formData = reactive<HomeContentForm>({
  name: '',
  testCategory: '',
  commissionUnitName: '',
  commissionUnitAddress: '',
  constructionDept: '',
  contractorName: '',
  designUnit: '',
  supervisionUnit: '',
  assessAddress: '',
  assessMethod: [],
  description: '',
  assessResult: '',
  reportTime: '',
  reportCreator: '',
  reportName: '',
  version: '',
  scene: '',
  precautions: '',
  assessContent: '',
  largeType: '',
  reportType: '',
  showTestDate: ''
})

const TEXTAREA_PROPS = { type: 'textarea', rows: 6 } as const

const baseFormItems = defineFormItems<HomeContentForm>([
  {
    label: '项目名称',
    prop: 'name',
    type: 'input',
    rules: [{ required: true, message: '项目名称不能为空', trigger: 'blur' }]
  },
  {
    label: '测试类别',
    prop: 'testCategory',
    type: 'input',
    rules: [{ required: true, message: '测试类别不能为空', trigger: 'blur' }]
  },
  {
    label: '委托单位名称',
    prop: 'commissionUnitName',
    type: 'input',
    componentProps: TEXTAREA_PROPS,
    colSpan: 2,
    rules: [
      { required: true, message: '委托单位名称不能为空', trigger: 'blur' }
    ]
  },
  {
    label: '委托单位地址',
    prop: 'commissionUnitAddress',
    type: 'input',
    componentProps: TEXTAREA_PROPS,
    colSpan: 2,
    rules: [
      { required: true, message: '委托单位地址不能为空', trigger: 'blur' }
    ]
  },
  {
    label: '建设单位',
    prop: 'constructionDept',
    type: 'input',
    rules: [{ required: true, message: '建设单位不能为空', trigger: 'blur' }]
  },
  {
    label: '施工单位',
    prop: 'contractorName',
    type: 'input',
    rules: [{ required: true, message: '施工单位不能为空', trigger: 'blur' }]
  },
  {
    label: '设计单位',
    prop: 'designUnit',
    type: 'input',
    rules: [{ required: true, message: '设计单位不能为空', trigger: 'blur' }]
  },
  {
    label: '监理单位',
    prop: 'supervisionUnit',
    type: 'input',
    rules: [{ required: true, message: '监理单位不能为空', trigger: 'blur' }]
  },
  {
    label: '测试地址',
    prop: 'assessAddress',
    type: 'input',
    componentProps: TEXTAREA_PROPS,
    colSpan: 2,
    rules: [{ required: true, message: '测试地址不能为空', trigger: 'blur' }]
  },
  {
    label: '测试方式',
    prop: 'assessMethod',
    type: 'select',
    componentProps: {
      dictField: 'background_subject_test_method',
      multiple: true
    },
    colSpan: 2,
    rules: [{ required: true, message: '测试方式不能为空', trigger: 'blur' }]
  },
  {
    label: '项目描述',
    prop: 'description',
    type: 'input',
    componentProps: TEXTAREA_PROPS,
    colSpan: 2,
    rules: [{ required: true, message: '项目描述不能为空', trigger: 'blur' }]
  },
  {
    label: '测试结论',
    prop: 'assessResult',
    type: 'input',
    componentProps: TEXTAREA_PROPS,
    colSpan: 2,
    rules: [{ required: true, message: '测试结论不能为空', trigger: 'blur' }]
  },
  {
    label: '报告时间',
    prop: 'reportTime',
    type: 'date',
    componentProps: { valueFormat: 'YYYY-MM-DD' },
    rules: [{ required: true, message: '报告时间不能为空', trigger: 'blur' }]
  },
  {
    label: '报告编制人',
    prop: 'reportCreator',
    type: 'select',
    componentProps: { options: [] },
    rules: [{ required: true, message: '报告编制人不能为空', trigger: 'blur' }]
  },
  {
    label: '测试报告',
    prop: 'reportName',
    type: 'input',
    rules: [{ required: true, message: '测试报告不能为空', trigger: 'blur' }]
  },
  {
    label: '软件版本号',
    prop: 'version',
    type: 'input',
    rules: [{ required: true, message: '软件版本号不能为空', trigger: 'blur' }]
  },
  {
    label: '使用场景',
    prop: 'scene',
    type: 'select',
    componentProps: { dictField: 'background_subject_scene' },
    rules: [{ required: true, message: '使用场景不能为空', trigger: 'blur' }]
  },
  {
    label: '注意事项',
    prop: 'precautions',
    type: 'input',
    componentProps: TEXTAREA_PROPS,
    colSpan: 2,
    rules: [{ required: true, message: '注意事项不能为空', trigger: 'blur' }]
  },
  {
    label: '测试内容及方法',
    prop: 'assessContent',
    type: 'input',
    componentProps: TEXTAREA_PROPS,
    colSpan: 2,
    rules: [
      { required: true, message: '测试内容及方法不能为空', trigger: 'blur' }
    ]
  }
])

const formItems = computed(() => {
  const isHainan = formData.largeType === '10'
  return baseFormItems.filter(item => {
    switch (item.prop) {
      case 'description':
      case 'assessResult':
        return isHainan
      case 'scene':
        return !isHainan
      case 'version':
        return formData.reportType === '10-2'
      default:
        return true
    }
  })
})

/** 报告编制人选项 */
const loadReportCreatorOptions = async () => {
  const { data } = await getUserOptionsAPI()
  const creatorItem = findFormItem(baseFormItems, 'reportCreator', 'select')
  if (creatorItem?.componentProps) {
    creatorItem.componentProps.options = mapSelectOptions(data, {
      label: 'nickName',
      value: 'userId'
    })
  }
}

/** 默认报告文案填充：||= 仅在字段为空时写入，不覆盖服务端已有内容 */
const setPrecautionsContent = (templateType: string, projectName: string) => {
  switch (templateType) {
    case '10-4':
      formData.precautions ||= TC_PRECAUTIONS_CONTENT
      formData.assessContent ||= getAssessDefaultContent(projectName)
      break
    default:
      formData.precautions ||= PRECAUTIONS_DEFAULT_CONTENT
      formData.testCategory ||= '验收测试'
      formData.assessContent ||= getAssessDefaultContent(projectName)
      formData.reportName = '测 试 报 告'
  }
}

/**
 * 详情回填：默认读流程作用域缓存（进入项目时已预热，读穿透），避免重复请求详情接口；
 * force 为 true 时强制刷新缓存（保存成功后），本页是流程域内唯一会修改项目属性的页面，缓存快照须同步为新值
 */
const getPageData = async (force = false) => {
  const detail = force
    ? await refreshProcessProjectDetail()
    : await getProcessProjectDetail()
  if (!detail) return
  Object.assign(formData, detail)
  setPrecautionsContent(formData.reportType, detail.name)
}

const scBaseFormRef = useTemplateRef<ScBaseFormInstance>('scBaseFormRef')

const { scConfirm } = useScConfirm()

const handleSubmit = async () => {
  const valid = await scBaseFormRef.value?.validate().catch(() => false)
  if (!valid) return
  try {
    await scConfirm({
      title: '提示',
      message: '是否保存当前内容',
      confirmText: '确定',
      cancelText: '取消'
    })
  } catch {
    return
  }
  const [err] = await safeRequest(updateHomeContentAPI(formData), {
    showError: false
  })
  if (err) return
  ScMessage.success('保存内容成功！')
  await getPageData(true)
}

onMounted(() => {
  getPageData()
  loadReportCreatorOptions()
})
</script>

<template>
  <div class="page-card h-viewport home-content">
    <el-tag type="success">
      测试日期：{{ formData.showTestDate || '无' }}
    </el-tag>
    <el-divider />
    <ScBaseForm
      ref="scBaseFormRef"
      class="form-scroll-area"
      :model-value="formData"
      :form-items="formItems"
      label-width="110px"
    />
    <div class="form-actions">
      <ScButton type="primary" @click="handleSubmit">保存</ScButton>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.home-content {
  .form-scroll-area {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    padding: 0 16px 16px 0;
  }

  .form-actions {
    flex-shrink: 0;
    display: flex;
    justify-content: flex-end;
    padding: 12px 0;
    border-top: 1px solid var(--el-border-color-lighter);
  }
}
</style>
