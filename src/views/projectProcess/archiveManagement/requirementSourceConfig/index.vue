<script setup lang="ts">
import type {
  RequirementSourceConfigData,
  RequirementSourceConfigFormData,
  RequirementSourceConfigSearchParams
} from '@/types/projectProcess/archiveManagement/requirementSourceConfig'
import {
  getRequirementSourceConfigDataAPI,
  getRequirementSourceConfigDetailAPI,
  updateRequirementSourceConfigAPI
} from '@/api/projectProcess/archiveManagement/requirementSourceConfig-api.ts'
import { ScMessage } from '@/utils/ElUtils'
import { defineFormItems } from '@/utils/form.ts'
import { useDialogForm } from '@/hooks/useDialogForm.ts'
import { safeRequest } from '@/utils/safeRequest.ts'

const searchbarItems = reactive<
  SearchbarItems<RequirementSourceConfigSearchParams>
>([
  {
    label: '字段名称',
    prop: 'name',
    type: 'input',
    placeholder: '请输入字段名'
  },
  {
    label: '验收测试类型',
    prop: 'type',
    type: 'select',
    dictField: 'acceptance_testing_types',
    placeholder: '请选择验收测试类型'
  }
])

const tableColumns = reactive<TableColumns>([
  { label: '序号', prop: 'sort' },
  { label: '字段名称', prop: 'name' },
  { label: '对应字段', prop: 'field' },
  { label: '是否启用', prop: 'enable', slot: 'enable' },
  { label: '验收测试类型', prop: 'typeLabel' },
  { label: '备注', prop: 'remark' }
])

const pageConfig: PageConfig<RequirementSourceConfigData> = {
  searchConfig: { searchbarItems },
  operateConfig: { defaultButtons: [] },
  tableConfig: {
    tableColumns,
    defaultButtonsConfig: {
      delete: { show: () => false }
    }
  },
  fetchData: getRequirementSourceConfigDataAPI
}

const dialogFormData = reactive<RequirementSourceConfigFormData>({
  type: '',
  field: '',
  name: '',
  enable: '1',
  sort: 1,
  remark: ''
})

const formItems = defineFormItems<RequirementSourceConfigFormData>([
  {
    label: '验收测试类型',
    prop: 'type',
    type: 'select',
    componentProps: {
      dictField: 'acceptance_testing_types',
      placeholder: '请选择验收测试类型',
      disabled: true
    },
    rules: [
      { required: true, message: '请选择验收测试类型', trigger: 'change' }
    ]
  },
  {
    label: '对应字段',
    prop: 'field',
    type: 'input',
    componentProps: { placeholder: '请输入对应字段', disabled: true },
    rules: [{ required: true, message: '请填写字段名称', trigger: 'blur' }]
  },
  {
    label: '字段名称',
    prop: 'name',
    type: 'input',
    componentProps: { placeholder: '请输入字段名称' },
    rules: [{ required: true, message: '请填写对应字段', trigger: 'blur' }]
  },
  {
    label: '是否启用',
    prop: 'enable',
    type: 'switch',
    componentProps: { activeValue: '1', inactiveValue: '0' }
  },
  {
    label: '排序',
    prop: 'sort',
    type: 'input',
    componentProps: { type: 'number' },
    rules: [{ min: 1, message: '排序不能小于1', trigger: 'blur' }]
  },
  {
    label: '备注',
    prop: 'remark',
    type: 'input',
    componentProps: { type: 'textarea', placeholder: '备注' }
  }
])

const scResourcePageRef = useTemplateRef<PageInstance>('scResourcePageRef')

const handlePageClick = (row: RequirementSourceConfigData) => open(row)

const handleSwitchChange = async (row: RequirementSourceConfigData) => {
  const [err] = await safeRequest(
    updateRequirementSourceConfigAPI({ id: row.id, enable: row.enable })
  )
  if (!err) {
    ScMessage.success(row.enable === '1' ? '启用成功' : '停用成功')
  }
  await scResourcePageRef.value?.refresh()
}

const { visible, formData, confirmLoading, open, handleConfirm, dialogTitle } =
  useDialogForm<RequirementSourceConfigFormData>({
    defaultFormData: dialogFormData,
    title: '需求来源配置',
    fetchDetail: id => getRequirementSourceConfigDetailAPI(id),
    onUpdate: data => updateRequirementSourceConfigAPI(data),
    onSuccess: () => scResourcePageRef.value?.refresh()
  })

const pageDialogConfig = computed<DialogFormConfig>(() => ({
  formItems,
  title: dialogTitle.value
}))
</script>

<template>
  <div class="page-card">
    <ScResourcePage
      ref="scResourcePageRef"
      :page-config="pageConfig"
      @edit="handlePageClick"
    >
      <template #column-enable="{ row }">
        <ScSwitch
          v-model="row.enable"
          active-value="1"
          inactive-value="0"
          active-text="已启用"
          inactive-text="未启用"
          style="--el-switch-on-color: #13ce66; --el-switch-off-color: #ff4949"
          @click="handleSwitchChange(row as RequirementSourceConfigData)"
        />
      </template>
    </ScResourcePage>
    <ScDialogForm
      v-model="visible"
      :form-data="formData"
      :config="pageDialogConfig"
      :confirm-loading="confirmLoading"
      @confirm="handleConfirm"
    />
  </div>
</template>

<style scoped lang="scss"></style>
