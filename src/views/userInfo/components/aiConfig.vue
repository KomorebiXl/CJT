<script setup lang="ts">
import type { FormInstance, FormRules } from 'element-plus'
import { View, Hide } from '@element-plus/icons-vue'
import type { AiUserConfigCurrentData } from '@/types/adminManagement/aiUserConfig'
import {
  clearAiUserConfigCurrentAPI,
  getAiUserConfigCurrentAPI,
  saveAiUserConfigCurrentAPI,
  testAiUserConfigCurrentAPI
} from '@/api/adminManagement/aiUserConfig-api.ts'
import { safeRequest } from '@/utils/safeRequest.ts'
import { ScMessage } from '@/utils/ElUtils'
import { useScConfirm } from '@/hooks/useScConfirmDialog.ts'

type AiConfigFormData = {
  apiKey: string
  baseUrl: string
  remark: string
}

const { scConfirm } = useScConfirm()

const formData = reactive<AiConfigFormData>({
  apiKey: '',
  baseUrl: '',
  remark: ''
})

const rules: FormRules<AiConfigFormData> = {
  apiKey: [
    { required: true, message: 'API Key 不能为空', trigger: 'blur' },
    { min: 8, message: 'API Key 格式不正确', trigger: 'blur' }
  ]
}

const formRef = useTemplateRef<FormInstance>('formRef')
const showKey = ref(false)
const saving = ref(false)
const testing = ref(false)
const testResult = ref<{ ok: boolean; message: string } | null>(null)

/** 已配置状态（掩码视图，接口不回明文） */
const current = ref<AiUserConfigCurrentData | null>(null)

const loadCurrent = async () => {
  const [err, res] = await safeRequest(getAiUserConfigCurrentAPI(), {
    showError: false
  })
  if (err) return
  current.value = res!.data
  formData.baseUrl = res!.data.baseUrl ?? ''
  formData.remark = res!.data.remark ?? ''
}

loadCurrent()

/** 保存：明文仅本次提交，后端加密落库；成功后回到掩码视图 */
const handleSave = async () => {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return
  saving.value = true
  const [err] = await safeRequest(
    saveAiUserConfigCurrentAPI({
      apiKey: formData.apiKey.trim(),
      baseUrl: formData.baseUrl.trim() || undefined,
      remark: formData.remark.trim() || undefined
    }),
    { showError: false }
  )
  saving.value = false
  if (err) return
  ScMessage.success('已保存，后续生成将优先使用你的个人密钥')
  formData.apiKey = ''
  testResult.value = null
  await loadCurrent()
}

/** 用填写中的密钥探测连通性（不落库） */
const handleTest = async () => {
  if (!formData.apiKey.trim()) {
    ScMessage.warning('请先填写 API Key')
    return
  }
  testing.value = true
  const [err, res] = await safeRequest(
    testAiUserConfigCurrentAPI({
      apiKey: formData.apiKey.trim(),
      baseUrl: formData.baseUrl.trim() || undefined
    }),
    { showError: false }
  )
  testing.value = false
  if (err) return
  testResult.value = res!.data
}

/** 清除：回退使用全局密钥 */
const handleClear = async () => {
  try {
    await scConfirm({
      message: '清除后将回退使用全局密钥（未配置全局密钥时 AI 生成不可用），确认清除？'
    })
  } catch {
    return
  }
  const [err] = await safeRequest(clearAiUserConfigCurrentAPI(), { showError: false })
  if (err) return
  ScMessage.success('已清除')
  current.value = null
  formData.baseUrl = ''
  formData.remark = ''
}
</script>

<template>
  <div class="tab-ai">
    <el-alert
      v-if="current?.configured"
      type="success"
      :closable="false"
      show-icon
      class="state-alert"
    >
      <template #title>
        已配置个人密钥：{{ current.apiKeyMasked }}（更新于 {{ current.updateTime }}），生成时优先使用
      </template>
    </el-alert>
    <el-alert v-else type="info" :closable="false" show-icon class="state-alert">
      <template #title>
        未配置个人密钥，当前使用系统全局密钥；配置后 AI 生成将消耗你自己的额度
      </template>
    </el-alert>

    <el-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      label-position="top"
      @submit.prevent
    >
      <div class="form-grid">
        <el-form-item label="API Key" prop="apiKey" class="field full narrow">
          <el-input
            v-model="formData.apiKey"
            :type="showKey ? 'text' : 'password'"
            :suffix-icon="showKey ? Hide : View"
            placeholder="sk-...（DeepSeek 开放平台获取，加密存储仅用于生成调用）"
            @click-suffix-icon="showKey = !showKey"
          />
        </el-form-item>
        <el-form-item label="接口地址（可选）" prop="baseUrl" class="field full narrow">
          <el-input
            v-model="formData.baseUrl"
            placeholder="留空使用系统配置；私有化部署时填写完整地址，如 https://xxx/v1"
          />
        </el-form-item>
        <el-form-item label="备注（可选）" prop="remark" class="field full narrow">
          <el-input
            v-model="formData.remark"
            type="textarea"
            :rows="2"
            placeholder="如：个人测试 key、有效期至 xx"
          />
        </el-form-item>
      </div>
    </el-form>
    <div v-if="testResult" class="test-result" :class="testResult.ok ? 'is-ok' : 'is-bad'">
      {{ testResult.ok ? '√ ' : '× ' }}{{ testResult.message }}
    </div>
    <div class="foot">
      <button type="button" class="btn btn-primary" :disabled="saving" @click="handleSave">
        {{ saving ? '保存中…' : '保存密钥' }}
      </button>
      <button type="button" class="btn btn-ghost" :disabled="testing" @click="handleTest">
        {{ testing ? '测试中…' : '测试连接' }}
      </button>
      <button
        v-if="current?.configured"
        type="button"
        class="btn btn-ghost btn-danger"
        @click="handleClear"
      >
        清除密钥
      </button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use '../account-form.scss';

.state-alert {
  margin-bottom: 16px;
}

.test-result {
  font-size: 13px;

  &.is-ok {
    color: var(--el-color-success);
  }

  &.is-bad {
    color: var(--el-color-danger);
  }
}

.btn-danger {
  color: var(--danger, var(--el-color-danger));

  &:hover {
    background: var(--primary-weak);
  }
}
</style>
