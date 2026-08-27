import type { MenuFormData, MenuSearchParams } from '@/types/system/menu'
import { defineFormItems } from '@/utils/form.ts'

export const searchbarItems: SearchbarItems<MenuSearchParams> = [
  { label: '菜单名称', prop: 'menuName', type: 'input' },
  {
    label: '状态',
    prop: 'status',
    type: 'select',
    dictField: 'sys_normal_disable'
  }
]

export const tableColumns: TableColumns = [
  { label: '菜单名称', prop: 'menuName', slot: 'menuName' },
  { label: '图标', prop: 'icon', slot: 'icon' },
  { label: '菜单排序', prop: 'orderNum' },
  { label: '权限字符', prop: 'perms', showOverflowTooltip: true },
  { label: '组件路径', prop: 'component', showOverflowTooltip: true },
  { label: '创建时间', prop: 'createTime' }
]

export const dialogFormData: MenuFormData = {
  parentId: '',
  menuType: 'M',
  icon: '',
  subjectLargeType: '',
  // 后端实体是 List<String>，空值必须给数组，字符串会导致 JSON 反序列化失败
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
  status: ''
}

export const formItems = defineFormItems<MenuFormData>([
  {
    label: '上级菜单',
    prop: 'parentId',
    groupName: '基本信息',
    type: 'treeSelect',
    componentProps: {
      options: [],
      nodeKey: 'menuId',
      fieldNames: { label: 'menuName', children: 'children' }
    },
    colSpan: 2
  },
  {
    label: '菜单类型',
    prop: 'menuType',
    groupName: '基本信息',
    type: 'radio',
    componentProps: {
      // 按钮类型（F）已拆至按钮权限管理页维护
      radioOptions: [
        {
          label: '目录',
          value: 'M'
        },
        {
          label: '菜单',
          value: 'C'
        }
      ],
      border: true
    }
  },
  {
    label: '菜单图标',
    prop: 'icon',
    groupName: '目录信息',
    customSlot: 'menuIconSlot',
    colSpan: 2,
    hide: formData => formData.menuType === 'F'
  },
  {
    label: '项目大类',
    prop: 'subjectLargeType',
    groupName: '基本信息',
    type: 'select',
    componentProps: {
      dictField: 'background_subject_type',
      filterable: true,
      clearable: true
    }
  },
  {
    label: '项目类型',
    prop: 'subjectType',
    groupName: '基本信息',
    type: 'select',
    componentProps: {
      dictField: 'background_subject_second_type',
      filterable: true,
      clearable: true,
      multiple: true
    }
  },
  {
    label: (formData: MenuFormData) =>
      `${formData.menuType !== 'F' ? '菜单' : '权限'}名称`,
    prop: 'menuName',
    groupName: '基本信息',
    type: 'input',
    rules: (formData: MenuFormData) => [
      {
        required: true,
        message: `请输入${formData.menuType !== 'F' ? '菜单' : '权限'}名称`,
        trigger: 'blur'
      }
    ]
  },
  {
    label: '菜单排序',
    prop: 'orderNum',
    groupName: '基本信息',
    type: 'input',
    componentProps: {
      type: 'number'
    },
    rules: [{ required: true, message: '菜单顺序不能为空', trigger: 'blur' }]
  },
  {
    label: '是否外链',
    prop: 'isFrame',
    groupName: '目录信息',
    type: 'radio',
    hide: formData => formData.menuType === 'F',
    componentProps: {
      border: true,
      radioOptions: [
        {
          label: '是',
          value: '0'
        },
        {
          label: '否',
          value: '1'
        }
      ]
    }
  },
  {
    label: '路由地址',
    prop: 'path',
    groupName: '目录信息',
    type: 'input',
    hide: formData => formData.menuType === 'F',
    rules: formData => [
      {
        required: formData.menuType !== 'F',
        message: '路由地址不能为空',
        trigger: 'blur'
      }
    ]
  },
  {
    label: '组件路径',
    prop: 'component',
    groupName: '菜单信息',
    type: 'input',
    colSpan: 2,
    hide: formData => !(formData.menuType === 'C')
  },
  {
    label: '权限字符',
    prop: 'perms',
    groupName: '按钮信息',
    type: 'input',
    hide: formData => formData.menuType === 'M'
  },
  {
    label: '路由参数',
    prop: 'query',
    groupName: '菜单信息',
    type: 'input',
    hide: formData => formData.menuType !== 'C'
  },
  {
    label: '是否缓存',
    prop: 'isCache',
    groupName: '菜单信息',
    type: 'radio',
    hide: formData => !(formData.menuType === 'C'),
    componentProps: {
      radioOptions: [
        {
          label: '缓存',
          value: '0'
        },
        {
          label: '不缓存',
          value: '1'
        }
      ]
    }
  },
  {
    label: '显示状态',
    prop: 'visible',
    groupName: '基本信息',
    type: 'radio',
    hide: formData => formData.menuType === 'F',
    componentProps: { dictField: 'sys_show_hide', border: true }
  },
  {
    label: '菜单状态',
    prop: 'status',
    groupName: '基本信息',
    type: 'radio',
    componentProps: {
      dictField: 'sys_normal_disable',
      border: true
    }
  }
])
