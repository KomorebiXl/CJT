<script setup lang="ts">
const props = defineProps<{ modelValue: string }>()
const emit = defineEmits<{ 'update:modelValue': [value: string] }>()
const visible = ref(false)
const draft = ref(props.modelValue)
const fields = ['秒', '分', '时', '日', '月', '周', '年']
const open = () => { draft.value = props.modelValue; visible.value = true }
const confirm = () => { emit('update:modelValue', draft.value.trim()); visible.value = false }
const reset = () => { draft.value = '* * * * * ?' }
watch(() => props.modelValue, value => { if (!visible.value) draft.value = value })
defineExpose({ open })
</script>

<template>
  <div class="cron-editor">
    <el-input :model-value="modelValue" maxlength="200" @update:model-value="emit('update:modelValue', $event)">
      <template #append><el-button type="primary" @click="open">生成表达式</el-button></template>
    </el-input>
    <el-dialog v-model="visible" title="Cron表达式生成器" width="760px" destroy-on-close append-to-body>
      <el-alert title="支持 Quartz 六段或七段表达式；具体合法性以服务端校验为准。" type="info" :closable="false" />
      <el-space wrap class="field-hint">
        <el-tag v-for="field in fields" :key="field">{{ field }}</el-tag>
      </el-space>
      <el-input v-model="draft" placeholder="例如：0 0/5 * * * ?" />
      <template #footer>
        <el-button @click="visible = false">取消</el-button>
        <el-button @click="reset">重置</el-button>
        <el-button type="primary" @click="confirm">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped lang="scss">
.field-hint { margin: 16px 0 }
</style>
