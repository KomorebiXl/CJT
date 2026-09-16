<script setup lang="ts">
import type { UserProfileData, UserProfileUpdateParams } from '@/types/system/user'
import type { FormInstance, FormRules } from 'element-plus'
import { Check } from '@element-plus/icons-vue'
import { updateUserProfileAPI } from '@/api/system/user-api.ts'
import { safeRequest } from '@/utils/safeRequest.ts'
import { ScMessage } from '@/utils/ElUtils'
import { useTabsStore } from '@/store/modules/tabs-store.ts'

const props = defineProps<{ user: UserProfileData }>()

const formData = reactive<UserProfileUpdateParams>({
  userId: 0,
  nickName: '',
  phonenumber: '',
  email: '',
  sex: ''
})

const rules: FormRules<UserProfileUpdateParams> = {
  nickName: [{ required: true, message: '用户昵称不能为空', trigger: 'blur' }],
  phonenumber: [
    { required: true, message: '手机号码不能为空', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '邮箱地址不能为空', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ]
}

// 父页面拉取 profile 后回填表单
watch(
  () => props.user,
  user => {
    formData.userId = user.userId ?? 0
    formData.nickName = user.nickName ?? ''
    formData.phonenumber = user.phonenumber ?? ''
    formData.email = user.email ?? ''
    formData.sex = user.sex ?? ''
  },
  { immediate: true }
)

const formRef = useTemplateRef<FormInstance>('formRef')

const handleSubmit = async () => {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return
  const [err] = await safeRequest(updateUserProfileAPI(formData), {
    showError: false
  })
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
  <div class="tab-info">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      label-position="top"
      @submit.prevent
    >
      <div class="form-grid">
        <el-form-item label="用户昵称" prop="nickName" class="field">
          <el-input v-model="formData.nickName" maxlength="30" />
        </el-form-item>
        <el-form-item label="手机号码" prop="phonenumber" class="field">
          <el-input v-model="formData.phonenumber" maxlength="11" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email" class="field full">
          <el-input v-model="formData.email" maxlength="50" />
        </el-form-item>
        <el-form-item label="性别" prop="sex" class="field full">
          <el-radio-group v-model="formData.sex">
            <el-radio value="0">男</el-radio>
            <el-radio value="1">女</el-radio>
          </el-radio-group>
        </el-form-item>
      </div>
    </el-form>
    <div class="foot">
      <button type="button" class="btn btn-primary" @click="handleSubmit">
        <el-icon :size="14"><Check /></el-icon>
        保存修改
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
