import { createSvgIconsPlugin } from 'vite-plugin-svg-icons'
import path from 'path'

export default function createSvgIcon() {
  return createSvgIconsPlugin({
    iconDirs: [path.resolve(process.cwd(), 'src/assets/icons')],
    symbolId: 'icon-[name]',
    svgoOptions: {
      plugins: [
        'preset-default',
        // 先把 style="fill:xxx" 转成 fill 属性，兼容两种写法
        'convertStyleToAttrs',
        // 统一剥离 fill/stroke，交给 CSS 的 currentColor 接管
        {
          name: 'removeAttrs',
          params: { attrs: '(fill|stroke)' }
        }
      ]
    }
  })
}
