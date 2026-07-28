import type { ScRouteRecordRaw } from 'vue-router'
import Layout from '@/layout/index.vue'

export const staticRoutes: Array<ScRouteRecordRaw> = [
  {
    path: '',
    component: Layout,
    redirect: '/index',
    children: [
      {
        path: '/index',
        component: () => import('@/views/home/index.vue'),
        meta: {
          title: '首页',
          icon: 'dashboard',
          affix: true
        }
      }
    ]
  },
  {
    path: '/login',
    component: () => import('@/views/login/index.vue'),
    hidden: true
  },
  {
    path: '/redirect/:path(.*)',
    component: () => import('@/views/redirect/index.vue'),
    hidden: true
  },
  {
    path: '/:pathMatch(.*)*',
    component: () => import('@/views/error/404.vue'),
    hidden: true
  },
  {
    path: '/controlPoint',
    hidden: true,
    component: Layout,
    permissions: ['background:point:list'],
    meta: { title: '测评项详情', activeMenu: '/controlPoint' },
    children: [
      {
        path: 'controlPointItem/:id',
        name: 'ControlPointItem',
        component: () =>
          import('@/views/adminManagement/controlPoint/controlPointItem.vue')
      }
    ]
  },
  {
    path: '/codeVulnerabilityLibrary',
    hidden: true,
    component: Layout,
    permissions: ['background:code:list'],
    meta: {
      title: '源代码-标准漏洞库',
      activeMenu: '/codeVulnerabilityLibrary'
    },
    children: [
      {
        path: 'codeVulnerabilityLibraryDetail/:id',
        name: 'CodeVulnerabilityLibraryDetail',
        component: () =>
          import('@/views/adminManagement/codeVulnerabilityStandard/index.vue')
      }
    ]
  },
  {
    path: '/toolLibrary',
    hidden: true,
    component: Layout,
    permissions: ['background:code:list'],
    meta: {
      title: '工具库版本',
      activeMenu: '/toolLibrary'
    },
    children: [
      {
        path: 'toolVersion/:id',
        name: 'ToolVersion',
        component: () =>
          import('@/views/adminManagement/toolVersion/index.vue')
      }
    ]
  },
  {
    path: '/system/dict-data',
    hidden: true,
    component: Layout,
    permissions: ['system:dict:list'],
    meta: { title: '字典数据', activeMenu: '/system/dict' },
    children: [
      {
        path: ':dictId',
        name: 'DictData',
        component: () => import('@/views/system/dict/dictData.vue')
      }
    ]
  }
]
