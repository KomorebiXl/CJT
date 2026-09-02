<script setup lang="ts">
import type { DictOption } from '@/types/system/dict'
import type { UploadFile } from 'element-plus'
import type { ScUploadDraggerInstance } from '@/components/ScUploadDragger/ScUploadDragger.ts'
import {
  CircleCheck,
  Close,
  Document,
  InfoFilled,
  Tickets,
  Upload
} from '@element-plus/icons-vue'
import { batchImportTestPlanAPI } from '@/api/projectProcess/planGuidelines-api.ts'
import { getDictOptions } from '@/utils/dict.ts'
import { safeRequest } from '@/utils/safeRequest.ts'
import { ScMessage } from '@/utils/ElUtils'

const visible = defineModel<boolean>('visible', { required: true })

// 文件项类型
type FileItem = {
  uid: number | string
  name: string
  file: UploadFile
  selectedValue: string
  isAutoMatched: boolean
}

const dictOptions = ref<DictOption[]>([])
const fileItems = ref<FileItem[]>([])
const uploadRef = useTemplateRef<ScUploadDraggerInstance>('uploadRef')

// 获取已被使用的字典值（包括自动匹配和手动选择的）
const getUsedDictValues = (): string[] => {
  return fileItems.value
    .filter(item => item.selectedValue)
    .map(item => item.selectedValue)
}

// 为指定文件项获取可用的字典选项
const getAvailableOptionsForItem = (currentItem: FileItem): DictOption[] => {
  const usedValues = getUsedDictValues()

  return dictOptions.value.filter(option => {
    // 如果是当前项已选中的值，保留（允许显示自己选中的）
    if (option.value === currentItem.selectedValue) {
      return true
    }
    // 如果该值未被其他项使用，保留
    return !usedValues.includes(option.value)
  })
}

const handleOpen = async () => {
  const [err, options] = await safeRequest(getDictOptions('parent_property'))
  if (err || !options) return
  dictOptions.value = options
}

const msg = ref<string>()

const handleClosed = () => {
  // 清空数据与上传组件的文件列表
  fileItems.value = []
  uploadRef.value?.clearFiles()
  // 清空提示信息
  msg.value = ''
  isDone.value = false
}

// 根据文件名自动匹配字典项
const autoMatchDict = (
  fileName: string
): { value: string; isMatched: boolean } => {
  // 遍历字典项，查找文件名中是否包含label
  for (const option of dictOptions.value) {
    if (fileName.includes(option.label)) {
      return {
        value: option.value,
        isMatched: true
      }
    }
  }
  // 未匹配到
  return {
    value: '',
    isMatched: false
  }
}

const handleChange = (_: UploadFile, uploadFiles: UploadFile[]) => {
  // 直接根据uploadFiles重新构建fileItems（不依赖旧数据）
  const newFileItems = uploadFiles.map(file => {
    // 自动匹配字典值
    const matchResult = autoMatchDict(file.name)
    return {
      uid: file.uid,
      name: file.name,
      file: file,
      selectedValue: matchResult.value,
      isAutoMatched: matchResult.isMatched
    }
  })

  // 找出重复的字典值
  const valueCountMap = new Map<string, number>()
  newFileItems.forEach(item => {
    if (item.isAutoMatched && item.selectedValue) {
      const count = valueCountMap.get(item.selectedValue) || 0
      valueCountMap.set(item.selectedValue, count + 1)
    }
  })

  // 找出重复的值（出现次数 > 1）
  const duplicateValues = Array.from(valueCountMap.entries())
    .filter(([_, count]) => count > 1)
    .map(([value]) => value)
  if (duplicateValues.length > 0) {
    // 找出重复的label
    const duplicateLabels = duplicateValues.map(value => {
      const option = dictOptions.value.find(opt => opt.value === value)
      return option?.label || value
    })
    // 过滤掉重复的文件（只保留不重复的）
    const validFileItems = newFileItems.filter(item => {
      // 如果是自动匹配的，检查是否是重复值
      if (item.isAutoMatched && item.selectedValue) {
        return !duplicateValues.includes(item.selectedValue)
      }
      // 未匹配的保留
      return true
    })
    // 提示用户哪些文件因为重复被排除
    ScMessage.warning(
      `检测到重复的文件类型：${duplicateLabels.join('、')}，已自动排除重复文件`
    )
    fileItems.value = validFileItems
    // 同步更新upload组件的文件列表
    const validUids = validFileItems.map(item => item.uid)
    // 从upload组件中移除被排除的文件
    uploadFiles.forEach(file => {
      if (!validUids.includes(file.uid)) {
        uploadRef.value?.handleRemove(file)
      }
    })
  } else {
    // 没有重复，全部添加
    fileItems.value = newFileItems
  }
}

// 删除文件
const handleRemove = (uid: number | string) => {
  const targetItem = fileItems.value.find(item => item.uid === uid)
  fileItems.value = fileItems.value.filter(item => item.uid !== uid)
  if (targetItem) {
    uploadRef.value?.handleRemove(targetItem.file)
  }
}

const isDone = ref<boolean>(false)

const handleImport = async () => {
  // 检查是否所有文件都已选择类型
  const hasUnselected = fileItems.value.some(item => !item.selectedValue)
  if (hasUnselected) {
    ScMessage.warning('请为所有文件选择类型')
    return
  }
  // 检查是否有重复的字典值（二次检查，防止手动选择重复）
  const allValues = fileItems.value.map(item => item.selectedValue)
  const duplicateValues = allValues.filter(
    (value, index) => allValues.indexOf(value) !== index
  )
  if (duplicateValues.length > 0) {
    const duplicateLabels = duplicateValues.map(value => {
      const option = dictOptions.value.find(opt => opt.value === value)
      return option?.label || value
    })
    ScMessage.error(`存在重复的文件类型：${duplicateLabels.join('、')}`)
    return
  }
  const formData = new FormData()
  fileItems.value.forEach(item => {
    if (item.file.raw) {
      formData.append(item.selectedValue, item.file.raw)
    }
  })
  // subjectId 由项目流程请求拦截器自动注入，无需手动追加
  const [err, res] = await safeRequest(batchImportTestPlanAPI(formData), {
    message: '批量导入失败'
  })
  if (err || !res) return
  msg.value = res.data
  isDone.value = true
}
</script>

<template>
  <ScDialog
    v-model="visible"
    title="验收测试方案批量导入"
    dialog-width="45%"
    @open="handleOpen"
    @closed="handleClosed"
  >
    <div class="batch-import-body">
      <ScUploadDragger
        ref="uploadRef"
        multiple
        :accept="['.xls', '.xlsx']"
        hint="支持 Excel（.xlsx / .xls）格式文件"
        @change="handleChange"
      />

      <transition name="list-fade">
        <div v-if="fileItems.length !== 0" class="file-section">
          <div class="file-section-header">
            <el-icon class="header-icon"><Document /></el-icon>
            <span>已选文件</span>
            <span class="file-count">{{ fileItems.length }} 个</span>
          </div>
          <div class="file-list">
            <transition-group
              name="file-item-anim"
              tag="div"
              class="file-list-inner"
            >
              <div v-for="item in fileItems" :key="item.uid" class="file-item">
                <div class="file-icon-wrap">
                  <el-icon class="file-icon"><Tickets /></el-icon>
                </div>
                <div class="file-name" :title="item.name">{{ item.name }}</div>
                <div class="file-action">
                  <ScSelect
                    v-if="!item.isAutoMatched"
                    v-model="item.selectedValue"
                    :options="getAvailableOptionsForItem(item)"
                    placeholder="请选择类型"
                    class="type-select"
                  />
                  <el-tag v-else type="success" size="small" class="match-tag">
                    <el-icon style="margin-right: 3px"><CircleCheck /></el-icon>
                    文件识别成功
                  </el-tag>
                </div>
                <div
                  class="delete-btn"
                  @click="handleRemove(item.uid)"
                  title="移除"
                >
                  <el-icon><Close /></el-icon>
                </div>
              </div>
            </transition-group>
          </div>
        </div>
      </transition>
      <transition name="msg-fade">
        <div v-if="msg && fileItems.length !== 0" class="msg-section">
          <div class="msg-header">
            <el-icon class="msg-header-icon"><InfoFilled /></el-icon>
            <span>导入结果</span>
          </div>
          <div class="msg-content">{{ msg }}</div>
        </div>
      </transition>
    </div>

    <template #footer>
      <div class="dialog-footer-operate">
        <ScButton @click="visible = false">取消</ScButton>
        <ScButton
          type="primary"
          @click="handleImport"
          :disabled="fileItems.length === 0"
        >
          <el-icon style="margin-right: 5px"><Upload /></el-icon>
          {{ isDone ? '重新导入' : '开始导入' }}
        </ScButton>
      </div>
    </template>
  </ScDialog>
</template>

<style lang="scss" scoped>
.batch-import-body {
  padding: 4px 8px 8px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

/* ── 文件区块 ── */
.file-section {
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 10px;
  overflow: hidden;
}

.file-section-header {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 14px;
  background: var(--el-fill-color-light);
  border-bottom: 1px solid var(--el-border-color-lighter);
  font-size: 13px;
  font-weight: 500;
  color: var(--el-text-color-primary);

  .header-icon {
    font-size: 15px;
    color: var(--el-color-primary);
  }

  .file-count {
    margin-left: auto;
    font-size: 12px;
    color: var(--el-text-color-placeholder);
    font-weight: normal;
  }
}

.file-list-inner {
  display: flex;
  flex-direction: column;
}

.file-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  border-bottom: 1px solid var(--el-border-color-extra-light);
  transition: background 0.2s;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: var(--el-fill-color-lighter);
  }
}

.file-icon-wrap {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  border-radius: 6px;
  background: var(--el-color-success-light-8);
  display: flex;
  align-items: center;
  justify-content: center;

  .file-icon {
    font-size: 16px;
    color: var(--el-color-success);
  }
}

.file-name {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 13px;
  color: var(--el-text-color-primary);
}

.file-action {
  flex-shrink: 0;

  .type-select {
    width: 140px;
  }

  .match-tag {
    display: inline-flex;
    align-items: center;
  }
}

.delete-btn {
  flex-shrink: 0;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--el-text-color-placeholder);
  cursor: pointer;
  transition:
    background 0.2s,
    color 0.2s;

  &:hover {
    background: var(--el-color-danger-light-8);
    color: var(--el-color-danger);
  }
}

/* ── 导入结果 ── */
.msg-section {
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 10px;
  overflow: hidden;
}

.msg-header {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 9px 14px;
  background: var(--el-fill-color-light);
  border-bottom: 1px solid var(--el-border-color-lighter);
  font-size: 13px;
  font-weight: 500;
  color: var(--el-text-color-primary);

  .msg-header-icon {
    font-size: 15px;
    color: var(--el-color-primary);
  }
}

.msg-content {
  padding: 12px 14px;
  font-size: 13px;
  color: var(--el-text-color-regular);
  white-space: pre-wrap;
  overflow-y: auto;
  max-height: 260px;
  line-height: 1.7;

  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: var(--el-border-color);
    border-radius: 4px;
  }
}

/* ── 过渡动画 ── */
.list-fade-enter-active,
.list-fade-leave-active {
  transition:
    opacity 0.25s,
    transform 0.25s;
}

.list-fade-enter-from,
.list-fade-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

.msg-fade-enter-active,
.msg-fade-leave-active {
  transition: opacity 0.25s;
}

.msg-fade-enter-from,
.msg-fade-leave-to {
  opacity: 0;
}

.file-item-anim-enter-active,
.file-item-anim-leave-active {
  transition:
    opacity 0.2s,
    transform 0.2s;
}

.file-item-anim-enter-from,
.file-item-anim-leave-to {
  opacity: 0;
  transform: translateX(-10px);
}
</style>
