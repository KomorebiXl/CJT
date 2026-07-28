import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import localIconNames from 'virtual:svg-icons-names'
import type { Component } from 'vue'

export interface IconOption {
  name: string
  type: 'svg' | 'element'
  component?: Component // 仅 element 类型需要，svg 靠 name 拼 symbolId 渲染
}

/** 获取本地 SVG 图标列表 */
export const getLocalSvgIcons = (): IconOption[] => {
  return localIconNames.map(item => ({
    name: item.replace(/^icon-/, ''), // 去掉 symbolId 前缀，还原成约定里存的裸名
    type: 'svg'
  }))
}

/** 获取 Element Plus 图标列表 */
export const getElementPlusIcons = (): IconOption[] => {
  return Object.entries(ElementPlusIconsVue).map(([name, component]) => ({
    name,
    type: 'element',
    component: component as Component
  }))
}

export const encodeIconValue = (
  type: 'svg' | 'element',
  name: string
): string => (type === 'element' ? `el-icon-${name}` : name)

export const decodeIconValue = (
  value: string
): { type: 'svg' | 'element'; name: string } => {
  if (value.startsWith('el-icon-')) {
    return { type: 'element', name: value.replace('el-icon-', '') }
  }
  return { type: 'svg', name: value }
}
