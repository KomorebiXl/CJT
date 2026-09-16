<script setup lang="ts">
import type { FormInstance, FormRules } from 'element-plus'
import { updateUserPwdAPI } from '@/api/system/user-api.ts'
import { safeRequest } from '@/utils/safeRequest.ts'
import { ScMessage } from '@/utils/ElUtils'
import { useTabsStore } from '@/store/modules/tabs-store.ts'

type ResetPwdFormData = {
  oldPassword: string
  newPassword: string
  confirmPassword: string
}

const formData = reactive<ResetPwdFormData>({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const equalToPassword = (_rule: any, value: any, callback: any) => {
  if (formData.newPassword !== value) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

const rules: FormRules<ResetPwdFormData> = {
  oldPassword: [
    { required: true, message: '当前密码不能为空', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '新密码不能为空', trigger: 'blur' },
    {
      pattern: /^(?=.*[A-Za-z])(?=.*\d).{8,}$/,
      message: '密码长度至少 8 位，且需同时包含字母和数字',
      trigger: 'blur'
    }
  ],
  confirmPassword: [
    { required: true, message: '确认密码不能为空', trigger: 'blur' },
    { required: true, validator: equalToPassword, trigger: 'blur' }
  ]
}

const formRef = useTemplateRef<FormInstance>('formRef')

const handleSubmit = async () => {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return
  const [err] = await safeRequest(
    updateUserPwdAPI(formData.oldPassword, formData.newPassword),
    { showError: false }
  )
  if (err) return
  ScMessage.success('修改成功')
}

const route = useRoute()
const router = useRouter()
const tabsStore = useTabsStore()

/** 取消：关闭当前页（沿 TabsBar 关闭逻辑，delView + 跳相邻标签） */
const handleClose = () => {
  const idx = tabsStore.visitedViews.findIndex(v => v.path === route.path)
  tabsStore.delView({
    name: route.name as string,
    path: route.path,
    meta: route.meta
  })
  const views = tabsStore.visitedViews
  // 直接刷新进本页时标签栏只有「个人信息」，关闭后无相邻标签，兜底回首页
  const next = views[idx] ?? views[idx - 1] ?? views[0]
  router.push(next?.path ?? '/index')
}
</script>

<template>
  <div class="tab-pwd">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      label-position="top"
      @submit.prevent
    >
      <div class="form-grid">
        <el-form-item label="当前密码" prop="oldPassword" class="field full narrow">
          <el-input
            v-model="formData.oldPassword"
            type="password"
            show-password
            placeholder="请输入当前密码"
          />
        </el-form-item>
        <el-form-item label="新密码" prop="newPassword" class="field full narrow">
          <el-input
            v-model="formData.newPassword"
            type="password"
            show-password
            placeholder="请输入新密码"
          />
        </el-form-item>
        <el-form-item
          label="确认新密码"
          prop="confirmPassword"
          class="field full narrow"
        >
          <el-input
            v-model="formData.confirmPassword"
            type="password"
            show-password
            placeholder="请确认新密码"
          />
        </el-form-item>
      </div>
    </el-form>
    <div class="foot">
      <button type="button" class="btn btn-primary" @click="handleSubmit">
        更新密码
      </button>
      <button type="button" class="btn btn-ghost" @click="handleClose">
        取消
      </button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use '../account-form.scss';
</style>
