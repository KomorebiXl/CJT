/* 项目全局变量 */
export const TOKEN_KEY = 'CJT_TOKEN'

export const PROJECT_ID_KEY = 'PROJECT_ID_KEY'

/** 当前项目流程作用域绑定的项目 id，进入项目流程页时写入、退出时清除 */
export const PROCESS_PROJECT_ID_KEY = 'PROCESS_PROJECT_ID_KEY'

/** 当前项目流程作用域的项目详情缓存，进入/切换项目时预热写入、退出时清除，页面经 processProject 工具读取 */
export const PROCESS_PROJECT_DETAIL_KEY = 'PROCESS_PROJECT_DETAIL_KEY'
