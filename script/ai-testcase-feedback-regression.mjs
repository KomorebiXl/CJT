// Run: node --test script/ai-testcase-feedback-regression.mjs
// Execute actual TS/SFC scripts with controlled network responses, without AI or a database.
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import vm from 'node:vm'
import ts from 'typescript'
import * as Vue from 'vue'
import { createPinia, defineStore, setActivePinia } from 'pinia'

function loadScript(path, mocks = {}, globals = {}, expose = '') {
  const source = readFileSync(new URL('../' + path, import.meta.url), 'utf8')
  const script = path.endsWith('.vue')
    ? source.match(/<script setup lang="ts">([\s\S]*?)<\/script>/)[1]
    : source
  const code = ts.transpileModule(script + '\n' + expose, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      esModuleInterop: false
    }
  }).outputText
  const context = vm.createContext({
    exports: {},
    require: name => {
      assert.ok(name in mocks, `Unexpected import: ${name}`)
      return mocks[name]
    },
    ...globals
  })
  vm.runInContext(code, context, { filename: path })
  return context
}

test('A项目任务切到B：真实API、download包装器及拦截器始终保留A项目', async () => {
  const intercepted = []
  const interceptors = loadScript(
    'src/utils/request/interceptors.ts',
    {
      '@/constant/errorCode.ts': { HTTP_ERROR_CODE: {} },
      './handler/errorHandler': { handleBusinessError() {} },
      '../auth': { getToken: () => '' },
      '@/constant/globalVariables': { PROCESS_PROJECT_ID_KEY: 'project' },
      '@/utils/storage': { sessionStorage: { get: () => 'B' } }
    },
    { FormData, Blob, console }
  ).exports
  const request = loadScript('src/utils/request/index.ts', {
    axios: {
      default: {
        create: () => ({
          interceptors: { request: { use() {} }, response: { use() {} } },
          request: async config => {
            intercepted.push(interceptors.globalRequestInterceptor(config))
            return {}
          }
        })
      }
    },
    './interceptors.ts': interceptors,
    './config.ts': { BASE_URL: '', TIME_OUT: 100000 }
  }).exports.default
  const api = loadScript('src/api/projectProcess/testCases-api.ts', {
    '@/utils/request': { default: request },
    '@/utils/pageRequest.ts': { createListAPI: () => () => {} }
  }).exports
  await api.getAiTestCaseProgressAPI('A')
  await api.stopAiTestCaseAPI({ subjectId: 'A' })
  await api.downloadAiTestCaseAPI({ subjectId: 'A', caseType: 'simple' })
  await api.generateAiTestCaseAPI({ subjectId: 'A', feature: '1' })
  await api.extractFunctionPointsAPI({ subjectId: 'A', feature: '1' })
  await api.generateDocSetAPI({ subjectId: 'A' })
  await api.getDocSetAPI('A')
  assert.equal(intercepted.length, 7)
  for (const config of intercepted) {
    assert.equal(config.needSubjectId, false)
    assert.equal((config.params ?? config.data).subjectId, 'A')
  }
  assert.equal(intercepted[2].responseType, 'blob')
  assert.equal(intercepted[2].params.caseType, 'simple')
  await api.regenerateAiTestCaseAPI({ resultIds: ['one'] })
  await api.extractFunctionPointsSyncAPI({ resultIds: ['one', 'two'] })
  assert.equal(intercepted[7].timeout, 1200000)
  assert.equal(intercepted[8].timeout, 2400000)
})

const settle = async () => {
  for (let i = 0; i < 12; i++) await Promise.resolve()
}
const deferred = () => {
  let resolve, reject
  const promise = new Promise((yes, no) => {
    resolve = yes
    reject = no
  })
  return { promise, resolve, reject }
}
const fp = (id, status = '0') => ({
  id,
  resultId: id.split('-')[0],
  name: id,
  pointType: '1',
  status,
  sourceHash: 'hash'
})
function panel(api) {
  const props = Vue.reactive({ resultId: 'A' })
  const messages = []
  const scope = Vue.effectScope()
  const state = scope.run(
    () =>
      loadScript(
        'src/views/projectProcess/testCases/components/FunctionPointPanel.vue',
        {
          'element-plus': {
            ElMessage: new Proxy(
              {},
              { get: () => message => messages.push(message) }
            )
          },
          '@/api/projectProcess/testCases-api': api,
          '@/hooks/useScConfirmDialog.ts': {
            useScConfirm: () => ({ scConfirm: async () => {} })
          }
        },
        {
          ...Vue,
          defineProps: () => props,
          defineExpose() {},
          onBeforeUnmount() {}
        },
        'exports.h = { fpPoints, fpDirty, fpBusy, fpExtracting, fpSaving, loadedResultId, fetchFunctionPoints, persist, confirmPoint, removePoint, moveToFp, deleteFp, confirmAllFp, editPoint, ensureSaved, refresh, extractCurrent };'
      ).exports.h
  )
  return { ...state, props, messages, dispose: () => scope.stop() }
}
function savedPayload(payload, revision) {
  return payload.items
    .map((point, sort) => ({
      ...point,
      id: `${payload.resultId}-${revision}-${sort}`,
      sort
    }))
    .sort((a, b) => Number(b.pointType) - Number(a.pointType))
}

test('功能点请求乱序/保存时切项：A的响应不得回写B或把A保存到B', async t => {
  const a = deferred(),
    b = deferred(),
    saving = deferred()
  const submitted = []
  const p = panel({
    getFunctionPointsAPI: id =>
      id === 'A'
        ? a.promise
        : id === 'B'
          ? b.promise
          : Promise.resolve({ data: [fp('C-1')] }),
    saveFunctionPointsAPI: payload => {
      submitted.push(payload)
      return saving.promise
    }
  })
  t.after(p.dispose)
  p.props.resultId = 'B'
  b.resolve({ data: [fp('B-1')] })
  await settle()
  a.resolve({ data: [fp('A-1')] })
  await settle()
  assert.equal(p.fpPoints.value[0].name, 'B-1')
  const save = p.confirmPoint(p.fpPoints.value[0])
  await settle()
  assert.equal(submitted[0].resultId, 'B')
  assert.equal(submitted[0].items[0].name, 'B-1')
  p.props.resultId = 'C'
  await settle()
  saving.resolve({ data: savedPayload(submitted[0], 1) })
  await save
  await settle()
  assert.equal(p.loadedResultId.value, 'C')
  assert.equal(p.fpPoints.value[0].status, '0')
})

test('连续确认/剔除串行保存，新ID和服务端重排不会错认下一条', async t => {
  const first = deferred(),
    submitted = []
  const p = panel({
    getFunctionPointsAPI: async () => ({ data: [fp('A-1'), fp('A-2')] }),
    saveFunctionPointsAPI: async payload => {
      submitted.push(JSON.parse(JSON.stringify(payload)))
      if (submitted.length === 1) await first.promise
      return { data: savedPayload(payload, submitted.length) }
    }
  })
  t.after(p.dispose)
  await settle()
  const [one, two] = p.fpPoints.value
  const remove = p.removePoint(one)
  const confirm = p.confirmPoint(two)
  await settle()
  assert.equal(submitted.length, 1)
  assert.equal(
    p.fpPoints.value[1].status,
    '0',
    'cannot claim confirmation before server success'
  )
  first.resolve()
  await Promise.all([remove, confirm])
  await settle()
  assert.equal(submitted.length, 2)
  const latest = submitted[1].items
  assert.equal(latest.find(point => point.name === 'A-2').status, '1')
  assert.equal(latest.find(point => point.name === 'A-1').status, '2')
  assert.ok(submitted[1].expectedIds.every(id => id.startsWith('A-1-')))
})

test('已确认文字编辑需保存再确认；自动刷新保留草稿；失败或校验失败不假确认', async t => {
  const submitted = []
  let fail = false
  const p = panel({
    getFunctionPointsAPI: async () => ({ data: [fp('A-1', '1')] }),
    saveFunctionPointsAPI: async payload => {
      if (fail) throw new Error('offline')
      submitted.push(payload)
      return { data: savedPayload(payload, submitted.length) }
    }
  })
  t.after(p.dispose)
  await settle()
  p.fpPoints.value[0].name = '修改后的功能'
  p.editPoint(p.fpPoints.value[0])
  assert.equal(await p.ensureSaved(), false)
  await p.refresh()
  assert.equal(p.fpPoints.value[0].name, '修改后的功能')
  assert.equal(p.fpPoints.value[0].status, '0')
  await p.persist()
  await p.confirmPoint(p.fpPoints.value[0])
  assert.equal(submitted[1].items[0].name, '修改后的功能')
  assert.equal(await p.ensureSaved(), true)
  fail = true
  await p.confirmPoint(p.fpPoints.value[0])
  assert.equal(p.fpPoints.value[0].status, '0')
  assert.equal(await p.ensureSaved(), false)
  fail = false
  p.fpPoints.value[0].name = ' '
  await p.confirmPoint(p.fpPoints.value[0])
  assert.equal(p.fpPoints.value[0].status, '0')
  assert.equal(submitted.length, 2)
})

test('A提取在途切B：B可独立操作，A晚返回不会清除B状态', async t => {
  const a = deferred(),
    b = deferred()
  let calls = 0
  const p = panel({
    getFunctionPointsAPI: async id => ({ data: [fp(id + '-1')] }),
    extractFunctionPointsSyncAPI: () => (++calls === 1 ? a.promise : b.promise)
  })
  t.after(p.dispose)
  await settle()
  const extractA = p.extractCurrent()
  await settle()
  p.props.resultId = 'B'
  await settle()
  assert.equal(p.fpExtracting.value, false)
  const extractB = p.extractCurrent()
  await settle()
  a.resolve({ data: [{ status: 1 }] })
  await extractA
  assert.equal(p.fpExtracting.value, true)
  b.resolve({ data: [{ status: 1 }] })
  await extractB
  assert.equal(p.loadedResultId.value, 'B')
  assert.equal(p.fpExtracting.value, false)
})

function storeHarness(api) {
  setActivePinia(createPinia())
  const timers = new Map()
  let nextTimer = 0
  const module = loadScript(
    'src/store/modules/ai-task-store.ts',
    {
      'element-plus': { ElMessage: { error() {}, warning() {}, success() {} } },
      '@/api/projectProcess/testCases-api': api,
      '@/utils/file': { downloadFile: async () => {} }
    },
    {
      ...Vue,
      defineStore,
      sessionStorage: {},
      window: {
        setTimeout: fn => {
          timers.set(++nextTimer, fn)
          return nextTimer
        },
        clearTimeout: id => timers.delete(id)
      }
    }
  ).exports
  return { store: module.useAiTaskStore(), timers }
}
const fallback = {
  subjectId: 'A',
  scopeLabel: '当前页面的详细版范围',
  fileName: 'wrong.docx',
  downloadParams: { subjectId: 'A', feature: '1', caseType: 'detail' }
}
test('新会话恢复以服务端simple和子系统范围下载；旧快照缺字段禁止猜测下载', async () => {
  const downloads = []
  let snapshot = {
    status: 'running',
    subjectId: 'A',
    taskId: 'task-2',
    feature: '2',
    subFeature: 'sub',
    subsystem: 'system',
    caseType: 'simple'
  }
  const { store, timers } = storeHarness({
    getAiTestCaseProgressAPI: async () => ({ data: snapshot }),
    downloadAiTestCaseAPI: async params => {
      downloads.push(params)
      return {}
    }
  })
  await store.resume('A', fallback)
  await store.download()
  assert.equal(downloads[0].caseType, 'simple')
  assert.equal(downloads[0].feature, '2')
  assert.equal(downloads[0].subsystem, 'system')
  store.closeCard() // running card only hides, retain live context
  snapshot = { status: 'success', subjectId: 'A', taskType: 'generate' }
  const poll = [...timers.values()][0]
  await poll()
  assert.equal(store.meta.downloadParams, null)
  await store.download()
  assert.equal(downloads.length, 1)
})

test('旧恢复响应不可覆盖新提交任务，跨项目页面恢复不可清掉在途任务', async () => {
  const old = deferred()
  const { store } = storeHarness({
    getAiTestCaseProgressAPI: () => old.promise,
    generateAiTestCaseAPI: async () => ({
      data: {
        status: 'running',
        subjectId: 'A',
        taskId: 'new',
        feature: '1',
        caseType: 'simple'
      }
    })
  })
  const resume = store.resume('B', { ...fallback, subjectId: 'B' })
  await store.start(
    { subjectId: 'A', feature: '1', caseType: 'simple' },
    fallback
  )
  old.resolve({
    data: {
      status: 'running',
      subjectId: 'B',
      taskId: 'old',
      feature: '2',
      caseType: 'detail'
    }
  })
  await resume
  assert.equal(store.meta.taskId, 'new')
  await store.resume('B')
  assert.equal(store.meta.subjectId, 'A')
})

test('提交在途不被resume或重复start抢占；停止结果不被旧轮询回退', async () => {
  const submitting = deferred(),
    oldPoll = deferred()
  let queryCount = 0
  const snapshot = {
    subjectId: 'A',
    taskId: 'task',
    feature: '1',
    caseType: 'simple'
  }
  const { store, timers } = storeHarness({
    getAiTestCaseProgressAPI: () => {
      queryCount++
      return oldPoll.promise
    },
    generateAiTestCaseAPI: () => submitting.promise,
    stopAiTestCaseAPI: async () => ({
      data: { ...snapshot, status: 'stopped', cleanupPending: false }
    })
  })
  const start = store.start(
    { subjectId: 'A', feature: '1', caseType: 'simple' },
    fallback
  )
  await store.resume('A')
  assert.equal(queryCount, 0)
  await assert.rejects(
    store.start({ subjectId: 'A', feature: '1' }, fallback),
    /处理中/
  )
  submitting.resolve({ data: { ...snapshot, status: 'running' } })
  await start
  assert.equal(store.meta.taskId, 'task')
  const polling = [...timers.values()][0]()
  await store.stop()
  assert.equal(store.progress.status, 'stopped')
  oldPoll.resolve({
    data: { ...snapshot, status: 'failed', cleanupPending: true }
  })
  await polling
  assert.equal(store.progress.status, 'stopped')
  assert.equal(store.progress.cleanupPending, false)
})

test('作废失败的任务收起后保留元信息，禁止新任务覆盖待清理范围', async () => {
  const { store } = storeHarness({
    getAiTestCaseProgressAPI: async () => ({
      data: {
        subjectId: 'A',
        taskId: 'task',
        feature: '1',
        caseType: 'simple',
        status: 'failed',
        cleanupPending: true
      }
    })
  })
  await store.resume('A')
  store.closeCard()
  assert.equal(store.meta.subjectId, 'A')
  await assert.rejects(
    store.start({ subjectId: 'B', feature: '1' }, fallback),
    /重试作废/
  )
})
