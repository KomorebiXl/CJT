// vue-cropper 官方 typings（lib/typings/index.d.ts）回引包内 TS 源码，
// 与本项目 verbatimModuleSyntax 冲突（TS1484）。改从 dist 编译产物导入
// （与 package.json main 同一文件，运行时不变），该路径无包内类型，
// 环境声明接管其类型（先例：sm-crypto.d.ts）
declare module 'vue-cropper/dist/vue-cropper.es.js' {
  import type { DefineComponent } from 'vue'

  export const VueCropper: DefineComponent<
    Record<string, any>,
    Record<string, any>,
    any
  >
}
