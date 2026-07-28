export type TreeMenuData = {
  id: string
  label: string
  disabled: boolean
  children: Array<TreeMenuData>
}

export type TreeMenuDataByRoleId = {
  menus: Array<TreeMenuData>
  checkedKeys: Array<number>
} & BaseResponse

export type MenuSearchParams = {
  menuName: string
  status: string
}

export type MenuFormData = {
  parentId: string | number
  menuType: string
  icon: string
  subjectLargeType: string
  subjectType: string | Array<string>
  menuName: string
  orderNum: string
  isFrame: string
  path: string
  component: string
  perms: string
  query: string
  isCache: string
  visible: string
  status: string
}

export type MenuData = MenuFormData & {
  menuId: string | number
  createTime: string
  children: Array<MenuData>
}
