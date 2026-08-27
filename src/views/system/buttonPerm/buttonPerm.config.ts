import type { MenuFormData } from '@/types/system/menu'
import { defineFormItems } from '@/utils/form.ts'

/** 左树「未挂载按钮」虚拟节点 id：孤儿按钮（父级不是任何目录/菜单）的兜底入口 */
export const ORPHAN_MENU_ID = '__orphan__'
export const ORPHAN_MENU_NAME = '未挂载按钮'

export type ButtonPermSearchParams = {
  menuName: string
  perms: string
}

export const searchbarItems: SearchbarItems<ButtonPermSearchParams> = [
  {
    label: '权限名称',
    prop: 'menuName',
    type: 'input',
    placeholder: '请输入权限名称'
  },
  {
    label: '权限字符',
    prop: 'perms',
    type: 'input',
    placeholder: '请输入权限字符'
  }
]

export const tableColumns: TableColumns = [
  { label: '权限名称', prop: 'menuName' },
  { label: '权限字符', prop: 'perms', showOverflowTooltip: true },
  { label: '排序', prop: 'orderNum' },
  { label: '状态', prop: 'status', slot: 'statusSlot' },
  { label: '创建时间', prop: 'createTime' }
]

// 按钮权限本质是 menuType='F' 的菜单行，其余字段仅占位满足 MenuFormData 契约；
// subjectType 后端实体是 List<String>，占位必须是数组而非字符串
export const dialogFormData: MenuFormData = {
  parentId: '',
  menuType: 'F',
  icon: '',
  subjectLargeType: '',
  subjectType: [],
  menuName: '',
  orderNum: '',
  isFrame: '',
  path: '',
  component: '',
  perms: '',
  query: '',
  isCache: '',
  visible: '',
  status: '0'
}

export const formItems = defineFormItems<MenuFormData>([
  {
    label: '权限名称',
    prop: 'menuName',
    type: 'input',
    rules: [{ required: true, message: '请输入权限名称', trigger: 'blur' }],
    componentProps: { placeholder: '请输入权限名称' }
  },
  {
    label: '权限字符',
    prop: 'perms',
    type: 'input',
    rules: [{ required: true, message: '请输入权限字符', trigger: 'blur' }],
    componentProps: { placeholder: '如 system:user:add' }
  },
  {
    label: '显示排序',
    prop: 'orderNum',
    type: 'input',
    componentProps: { type: 'number', placeholder: '请输入显示排序' },
    rules: [{ required: true, message: '显示排序不能为空', trigger: 'blur' }]
  },
  {
    label: '状态',
    prop: 'status',
    type: 'radio',
    componentProps: { dictField: 'sys_normal_disable' }
  }
])
