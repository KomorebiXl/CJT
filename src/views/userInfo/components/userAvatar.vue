<script setup lang="ts">
import type { UploadRawFile } from 'element-plus'
// 走 dist 编译产物并配合 src/types/vue-cropper.d.ts 接管类型，
// 绕开包内 typings 回引 TS 源码与 verbatimModuleSyntax 的冲突
import 'vue-cropper/dist/index.css'
import { VueCropper } from 'vue-cropper/dist/vue-cropper.es.js'
import {
  Edit,
  Minus,
  Plus,
  RefreshLeft,
  RefreshRight,
  Upload
} from '@element-plus/icons-vue'
import { uploadAvatarAPI } from '@/api/system/user-api.ts'
import { useUserStore } from '@/store/modules/user-store.ts'
import { safeRequest } from '@/utils/safeRequest.ts'
import { ScMessage } from '@/utils/ElUtils'
import { useVisible } from '@/hooks/useVisible.ts'

/** vue-cropper 实例方法（组件未随包导出实例类型，按用到的子集声明） */
interface CropperInstance {
  changeScale: (num?: number) => void
  rotateLeft: () => void
  rotateRight: () => void
  getCropBlob: (callback: (data: Blob) => void) => void
}

const userStore = useUserStore()
const { visible, setVisible } = useVisible()

// 头像兜底首字（图片缺失/加载失败时展示）
const avatarFallback = computed(() => {
  const name = userStore.nickName || userStore.username || '用'
  return name.charAt(0)
})

const imgError = ref(false)

watch(
  () => userStore.avatar,
  () => {
    imgError.value = false
  }
)

// 裁剪弹窗状态（img 为裁剪源图，previews 为实时预览数据）
const cropperRef = useTemplateRef<CropperInstance>('cropperRef')
const options = reactive({
  img: '',
  autoCrop: true,
  autoCropWidth: 200,
  autoCropHeight: 200,
  fixedBox: true,
  outputType: 'png',
  previews: {
    url: '',
    img: {} as Record<string, string>
  }
})

/** 打开裁剪弹窗，以当前头像为初始裁剪图 */
const openDialog = () => {
  options.img = userStore.avatar
  setVisible(true)
}

/** 选择文件预处理：校验图片类型后读入裁剪区，不走直传 */
const handleBeforeUpload = (file: UploadRawFile) => {
  if (file.type.indexOf('image/') === -1) {
    ScMessage.error('文件格式错误，请上传图片类型,如：JPG，PNG后缀的文件。')
    return false
  }
  const reader = new FileReader()
  reader.readAsDataURL(file)
  reader.onload = () => {
    options.img = reader.result as string
  }
  return false
}

/** 图片缩放 */
const changeScale = (num: number) => {
  cropperRef.value?.changeScale(num || 1)
}

/** 向左旋转 */
const rotateLeft = () => {
  cropperRef.value?.rotateLeft()
}

/** 向右旋转 */
const rotateRight = () => {
  cropperRef.value?.rotateRight()
}

/** 实时预览 */
const realTime = (data: any) => {
  options.previews = data
}

/** 提交裁剪结果 */
const uploading = ref(false)

const handleUpload = () => {
  cropperRef.value?.getCropBlob(async (data: Blob) => {
    const formData = new FormData()
    formData.append('avatarfile', data)
    uploading.value = true
    const [err, res] = await safeRequest(uploadAvatarAPI(formData), {
      showError: false
    })
    uploading.value = false
    if (err || !res) return
    userStore.avatar = import.meta.env.VITE_APP_BASE_API + res.imgUrl
    ScMessage.success('修改成功')
    setVisible(false)
  })
}

/** 关闭弹窗后还原裁剪图 */
const handleClosed = () => {
  options.img = userStore.avatar
  options.previews = { url: '', img: {} }
}
</script>

<template>
  <div class="avatar-shell">
    <div
      class="avatar"
      title="点击上传头像"
      @click="openDialog"
    >
      <img
        v-if="userStore.avatar && !imgError"
        :src="userStore.avatar"
        alt="avatar"
        @error="imgError = true"
      />
      <template v-else>{{ avatarFallback }}</template>
    </div>
    <button
      class="avatar-edit"
      type="button"
      title="更换头像"
      @click="openDialog"
    >
      <el-icon :size="13"><Edit /></el-icon>
    </button>
  </div>

  <ScDialog
    v-model="visible"
    title="修改头像"
    dialog-width="800px"
    destroy-on-close
    @closed="handleClosed"
  >
    <el-row :gutter="16">
      <el-col :xs="24" :md="12">
        <VueCropper
          ref="cropperRef"
          class="cropper-area"
          :img="options.img"
          :info="true"
          :auto-crop="options.autoCrop"
          :auto-crop-width="options.autoCropWidth"
          :auto-crop-height="options.autoCropHeight"
          :fixed-box="options.fixedBox"
          :output-type="options.outputType"
          @real-time="realTime"
        />
      </el-col>
      <el-col :xs="24" :md="12" class="preview-col">
        <div class="avatar-upload-preview">
          <img
            v-if="options.previews.url"
            :src="options.previews.url"
            :style="options.previews.img"
            alt="preview"
          />
        </div>
      </el-col>
    </el-row>
    <template #footer>
      <div class="cropper-toolbar">
        <el-upload
          :show-file-list="false"
          :before-upload="handleBeforeUpload"
        >
          <ScButton type="warning" :icon="Upload" stop>选择</ScButton>
        </el-upload>
        <ScButton :icon="Plus" @click="changeScale(1)" />
        <ScButton :icon="Minus" @click="changeScale(-1)" />
        <ScButton :icon="RefreshLeft" @click="rotateLeft" />
        <ScButton :icon="RefreshRight" @click="rotateRight" />
        <ScButton
          type="primary"
          class="submit-btn"
          :loading="uploading"
          @click="handleUpload"
        >
          提 交
        </ScButton>
      </div>
    </template>
  </ScDialog>
</template>

<style lang="scss" scoped>
.avatar-shell {
  position: relative;
  flex-shrink: 0;
}

.avatar {
  width: 72px;
  height: 72px;
  border-radius: 18px;
  background: linear-gradient(135deg, #5a7fb5, #3a5a86);
  display: grid;
  place-items: center;
  overflow: hidden;
  color: #fff;
  font-size: 26px;
  font-weight: 600;
  box-shadow: 0 8px 20px -8px rgba(0, 0, 0, 0.5);
  cursor: pointer;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.avatar-edit {
  position: absolute;
  right: -6px;
  bottom: -6px;
  width: 26px;
  height: 26px;
  padding: 0;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: var(--surface);
  border: 1px solid var(--line-strong);
  color: var(--muted);
  cursor: pointer;
  transition: all 0.15s;

  &:hover {
    color: var(--primary);
    border-color: var(--primary);
  }
}

.cropper-area {
  height: 350px;
}

.preview-col {
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-upload-preview {
  position: relative;
  width: 200px;
  height: 200px;
  border-radius: 50%;
  box-shadow: 0 0 4px #ccc;
  overflow: hidden;

  img {
    position: absolute;
    top: 0;
    left: 0;
  }
}

.cropper-toolbar {
  display: flex;
  align-items: center;
  gap: 8px;

  .submit-btn {
    margin-left: auto;
  }
}
</style>
