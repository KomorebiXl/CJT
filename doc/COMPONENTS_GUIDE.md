# 通用组件使用文档（src/components）

本文档覆盖 `src/components` 目录下的**通用组件**：组件本身不绑定任何业务域、不含业务接口依赖，可跨模块复用。业务组件不收录（甄别结论见文末附录）。

所有 Props / Emits / Slots / Expose 均提取自组件源码（`defineProps` / `withDefaults` / `defineEmits` / `defineSlots` / `defineExpose` 及各 `*.ts` 类型文件），默认值照抄源码，未设置默认的写 `—`。

## 一、组件总览与注册方式

### 1.1 组件清单

| 分类 | 组件 | 一句话用途 |
| --- | --- | --- |
| 资源页族 | `ScResourcePage` | 一站式资源列表页容器（搜索 + 操作按钮 + 表格 + 分页） |
| 资源页族 | `ScSearchbar` | 配置驱动的搜索栏（CSS Grid 布局，内置防抖搜索/重置） |
| 资源页族 | `ScTable` | el-table + el-pagination 封装，配置化生成列 |
| 资源页族 | `ScButton` | el-button 封装，onClick 返回 Promise 自动 loading |
| 表单族 | `ScBaseForm` | 配置驱动的 el-form，十种内置控件 + 自定义插槽 |
| 表单族 | `ScBaseFormItems`（十件） | 表单控件族：Input / Select / Cascader / Checkbox / Radio / Switch / DatePicker / DateRangePicker / Tree / TreeSelect |
| 表单族 | `ScBaseDate` | el-date-picker 统一薄封装（单值与区间共用） |
| 表单族 | `ScDialogForm` | ScDialog + ScBaseForm 组合体，弹窗内配置驱动表单 |
| 表单族 | `DynamicFormList` | 卡片列表 + 弹窗编辑的动态行表单 |
| 表单族 | `ScSearchDateRangeSelector` | 类 select 外观的日期区间选择器（搜索场景） |
| 上传族 | `ScBaseUpload` | 完整文件上传弹窗（含模板下载、状态反馈） |
| 上传族 | `ScUploadDragger` | 拖拽/点击选文件控件（只选不上传） |
| 弹窗与反馈 | `ScDialog` | 统一风格通用对话框（默认关闭/确认 footer） |
| 弹窗与反馈 | `ScConfirmDialog` | 删除确认弹窗（由 useScConfirm 命令式挂载） |
| 基础展示 | `ScIconPicker` | 图标选择器（Element + 本地 svg 双来源） |
| 基础展示 | `ScLinkText` | 单行省略文本，溢出 tooltip 全文 |
| 基础展示 | `SvgIcon` | 本地 svg 雪碧图图标（`<use href="#icon-xxx">`） |

### 1.2 注册方式

- **全局注册**：`ScButton`、`ScTable`、`ScSearchbar`、`ScResourcePage` 四件经 `src/components/ScBaseComponents/register.ts` 在 `main.ts` 中 `app.use()` 安装，模板中直接使用，无需 import。
- **自动导入**：其余组件由 `unplugin-vue-components` 按模板标签自动导入（见 `src/components.d.ts`），同样无需手动 import。

### 1.3 全局类型别名（src/types/schema.d.ts）

| 全局类型 | 实际类型 |
| --- | --- |
| `PageConfig<T>` | `ScResourcePageConfig<T>` |
| `PageInstance` | `ScResourcePageInstance` |
| `SearchbarItems<T>` | `Array<ScSearchbarItem<T>>` |
| `TableColumns` | `Array<ScTableColumn>` |
| `ExportConfig` | `ScExportConfig` |

---

## 二、资源页族（ScBaseComponents）

### 2.1 ScResourcePage

一站式资源列表页容器：聚合 ScSearchbar（搜索区）+ 操作按钮区（新增/导入/导出/自定义，含权限过滤、列显示配置、树展开控制、刷新）+ ScTable（表格区），由 `pageConfig` 驱动并托管数据请求、分页与多选。

#### Props

| 属性名 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| pageConfig | `ScResourcePageConfig`（必填） | — | 页面总配置，结构见下 |
| exportConfig | `ExportConfig` | — | 导出配置，结构见下 |

#### pageConfig 结构

```ts
ScResourcePageConfig<TRow = any> {
  searchConfig: SearchConfig                      // 必填
  operateConfig?: OperateConfig
  tableConfig: TableConfig<TRow>                  // 必填
  fetchData: (params: any) => Promise<FetchTableData>   // 必填
  pageExtraParams?: Record<string, any>           // 请求时附加在参数末位
  treeConfig?: TreeConfig
}
```

**SearchConfig**

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| searchbarItems | `Array<ScSearchbarItem>` | 搜索项配置（见 2.2），组件据此生成初始表单：dateRange 置 `undefined`，其余置 `null` |
| searchExtraParams | `Record<string, any>` | 并入初始搜索表单 |
| showSearch | `boolean` | 已声明但模板未消费（待确认） |

**OperateConfig**

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| defaultButtons | `Array<'add' \| 'import' \| 'export'>` | 顶部默认按钮组，兜底 `['add']`；内置映射：add=新增/primary、import=导入/warning、export=导出/danger |
| customButtons | `Array<PageButton>` | 自定义顶部按钮 |
| defaultButtonsConfig | `Partial<Record<id, DefaultButtonConfig>>` | 覆盖默认按钮的 name/icon/type/permission/order/onClick 等 |

`PageButton`：`id?`、`name?`、`icon?`、`type?`、`text?`、`disabled?`、`order?`、`tourId?`、`permission?: string | string[]`、`onClick?: () => void | Promise<void>`（设置后优先于 id 分发）。

**TableConfig\<TRow\>**

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| tableColumns | `Array<ScTableColumn>`（必填） | 列配置（见 2.3） |
| showActionColumn | `boolean` | 是否显示操作列，默认 true |
| showDefaultButtons | `boolean` | 是否显示默认编辑/删除按钮，默认 true |
| defaultButtonsConfig | `{ edit?; delete?: DefaultButtonsConfig<TRow> }` | 默认按钮的 disabled/order/permission/show 配置 |
| customActionButtons | `Array<ActionButton<TRow>>` | 操作列自定义按钮 |
| showSelection / reserveSelection / showIndex | `boolean` | 多选列 / 跨页保留选中 / 序号列 |
| showPagination | `boolean` | 默认 true |
| pageSize | `number` | 已声明但未被读取，分页大小实际为 30（待确认） |
| rowClassName | `string \| (({ row, rowIndex }) => string)` | 行类名 |

`ActionButton<TRow>`：`name: string | ((row) => string)`、`type`（必填）、`text?`、`disabled?: boolean | ((row) => boolean)`、`icon?`、`order?`、`permission?`、`show?: (row) => boolean`、`onClick: (row) => void`（必填）。

**FetchTableData**：`{ rows: TRow[]（必填，缺 rows 时 console.error）; total?: number }` —— fetchData 的返回约定。

**TreeConfig**（ScResourcePage 版，较 ScTable 多两个字段）：`children?`（默认 `'children'`）、`hasChildren?`、`rowKey?`（默认 `'id'`）、`showExpandButton?`（控制「全部展开/收起」圆形按钮）、`defaultExpandAll?`（首屏加载后自动展开全部）。

**ExportConfig**：`exportUrl: string`（必填）、`exportExtraParams?`、`fileName?`、`beforeExport?: () => Promise<boolean> | boolean`（返回 false 取消）、`afterExport?: (success: boolean) => void`。

#### Emits

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| add | — | 新增按钮 |
| edit | `row` | 默认操作列「编辑」 |
| delete | `row` | 默认操作列「删除」 |
| import | — | 导入按钮 |
| operateClick | `btnId` | 自定义按钮点击（未设置 onClick 时按 id 分发） |
| export / selection-change | — | 已声明但组件内无对应 emit 调用（导出走 useExport，多选走 ref 方法获取，待确认） |

#### Slots

| 插槽名 | 作用域参数 | 说明 |
| --- | --- | --- |
| `column-*` | `{ row, column, $index }` | 单元格自定义渲染；去掉 `column-` 前缀后须等于列的 `slot` 值 |
| operate-button-slot | — | 追加在顶部操作按钮组末尾 |
| extra-operate-left | — | 右侧工具区（树展开/列配置/刷新按钮之前） |
| action-custom | — | 追加在操作列按钮之后 |

#### 实例方法（ref：PageInstance）

| 方法 | 签名 | 说明 |
| --- | --- | --- |
| refresh | `() => Promise<void>` | 重新请求表格数据 |
| getSearchParams | `() => Record<string, any>` | 获取当前搜索参数 |
| resetSearch | `() => Promise<void>` | 重置搜索表单并重新请求 |
| getSelectedRows | `() => TRow[]` | 获取多选行 |
| clearSelection | `() => void` | 清空选中 |
| toggleRowSelection | `(row, selected) => void` | 按行勾选/取消（配合 reserveSelection 恢复选中） |

#### 内部 Hooks（ScResourcePage/hooks/，页面上一般不直接用，了解即可）

`usePermission`（权限判断，`*:*:*` 超管放行）、`useTableData`（请求托管，分页初始 1/30，showPagination 为 false 时不带分页参数）、`useOperateButtons`（顶部按钮集合与点击分发）、`useActionButtons`（操作列按钮：编辑 order 10 / 删除 order 20 + 自定义，按 permission 过滤）、`useColumnConfig`（列显示配置，动态新增列自动补选）、`useExport`（导出落盘）、`useTreeExpand`（全部展开/收起）。

#### 典型用法（摘自 `src/views/system/post/index.vue`）

```ts
const pageConfig: PageConfig<PostData> = {
  searchConfig: { searchbarItems },
  operateConfig: {
    defaultButtonsConfig: { add: { permission: 'system:post:add' } }
  },
  tableConfig: {
    tableColumns,
    defaultButtonsConfig: {
      edit: { permission: 'system:post:edit' },
      delete: { permission: 'system:post:remove' }
    }
  },
  fetchData: getPostDataAPI
}
```

```vue
<ScResourcePage
  ref="scResourcePageRef"
  :page-config="pageConfig"
  @add="handlePageClick"
  @edit="handlePageClick"
  @delete="handleDelete"
>
  <template #column-statusSlot="{ row }">
    <el-tag :type="row.status === '1' ? 'danger' : 'success'">
      {{ row.status === '1' ? '停用' : '正常' }}
    </el-tag>
  </template>
</ScResourcePage>
```

（`scResourcePageRef` 经 `useTemplateRef<PageInstance>('scResourcePageRef')` 获取，删除/表单成功后调用 `refresh()`。）

### 2.2 ScSearchbar

配置驱动的搜索栏：CSS Grid 布局，内置搜索（防抖）/重置按钮和可选展开收起，v-model 表单对象。

#### Props

| 属性名 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| searchbarItems | `Array<ScSearchbarItem>`（必填） | — | 搜索项配置 |
| modelValue | `Record<string, any>`（必填） | — | 表单数据对象（组件**原地修改**该对象） |
| cols | `number` | `7` | 网格列数 |
| showReset | `boolean` | `true` | 显示重置按钮 |
| truncate | `boolean` | `false` | 截断超出首行的搜索项（配合 showCollapse） |
| showCollapse | `boolean` | `false` | 显示展开/收起按钮 |
| searchText / resetText | `string` | `'搜索'` / `'重置'` | 按钮文字 |
| size | `'large' \| 'small' \| 'default'` | `'default'` | 按钮与控件尺寸 |
| gap | `number` | `16` | 网格间距（px） |
| loading | `boolean` | `false` | 搜索按钮 loading（父组件控制） |
| debounceDelay | `number` | `300` | 搜索防抖延迟（ms） |

#### Emits

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| search | `Record<string, any>` | 点击搜索或 input 项回车（防抖），载荷为表单副本 |
| reset | — | 重置后触发；dateRange 置 `undefined`、treeSelect 多选置 `[]`、其余置 `null` |

注意：v-model 为「变异式」双向绑定——`update:modelValue` 的 emit 调用被注释，靠直接修改 modelValue 对象生效。

#### searchbarItems 每项字段

公共字段：`prop`（必填）、`label`（用于生成默认 placeholder `请输入/请选择${label}`）、`placeholder`、`disabled`、`clearable`（实际默认 true）、`span`（占几列，默认 1）、`componentProps`（透传底层组件，优先级最高）。

按 `type` 分五种变体（未知 type 会 `console.warn`）：

| type | 底层组件 | 变体专有字段 |
| --- | --- | --- |
| `input` | ScInput | `inputType?: 'text' \| 'number' \| 'password'` |
| `select` | ScSelect | `options?`、`dictField?`（字典自动加载）、`filterable?`、`multiple?` |
| `date` | ScDatePicker | `dateType?`（默认 `'date'`）、`format?`、`valueFormat?` |
| `dateRange` | ScDateRangePicker | `dateType?`（默认 `'daterange'`）、`format?`、`valueFormat?`、`startPlaceholder?`（默认 `开始${label}`）、`endPlaceholder?`、`rangeSeparator?` |
| `treeSelect` | ScTreeSelect | `options?`、`multiple?`、`checkStrictly?`、`nodeKey?`、`fieldNames?`、`filterable?`、`defaultExpandAll?` |

### 2.3 ScTable

el-table + el-pagination 封装：配置化生成列（ScColumnItem），内置选择列/序号列/操作列、跨页连续序号、树形配置与单选行高亮。非 style/class 的 attrs（含 `on*` 事件）透传给 el-table。

#### Props（节选，完整以 `scTable.ts` 为准）

| 属性名 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| data | `Array<Record<string, any>>`（必填） | — | 表格数据 |
| tableColumns | `Array<ScTableColumn>`（必填） | — | 列配置 |
| loading | `boolean` | `false` | v-loading |
| border / stripe | `boolean` | `true` / `false` | 边框 / 斑马纹 |
| showSelection | `boolean` | `false` | 多选列（width 50，fixed left） |
| reserveSelection | `boolean` | `false` | 数据刷新后保留选中（依赖 row-key，默认 id） |
| showIndex | `boolean` | `false` | 序号列（跨页连续：`(page-1)*size+index+1`） |
| showAction | `boolean` | `true` | 操作列 |
| actionWidth / actionFixed | — | `150` / `'right'` | 操作列宽 / 固定方向 |
| highlightCurrentRow | `boolean` | `true` | 单选行高亮 |
| showPagination | `boolean` | `true` | 分页（data 为空时不渲染） |
| total / pageSize / pageSizes | — | `0` / `30` / `[30,60,90,120]` | 分页参数 |
| treeConfig | `TreeConfig` | `{}` | 树形配置（见下） |
| rowClassName | `string \| (({ row, rowIndex }) => string)` | — | 行类名 |

**treeConfig**：`rowKey`（默认 `'id'`）、`children`（默认 `'children'`）、`hasChildren`（默认 `'hasChildren'`，懒加载标记）、`defaultExpandAll`（默认 false）。树字段非 `children` 时直接声明即可，内部会平铺归并进 tree-props。

#### Emits

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| pageChange | `[page, size]` | 页码或每页条数变化（size 变化时 page 重置 1） |
| selection-change | `[selection]` | 多选变化 |
| current-change | `[currentRow, oldRow]` | 单选高亮行变化 |

#### Slots

| 插槽名 | 作用域参数 | 说明 |
| --- | --- | --- |
| action | `{ row, $index }` | 操作列内容 |
| empty | — | 空状态（默认 el-empty「暂无数据」） |
| 动态列插槽 | `{ row, column, $index }` | 名称为列的 `slot` 值 |

#### 实例方法

`toggleRowExpansion(row, expanded)`、`toggleRowSelection(row, selected)`、`setCurrentRow(row)`。

#### tableColumns 列定义（ScTableColumn）

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| prop | `string` | 是 | 字段名 |
| label | `string` | 是 | 列标题 |
| width / minWidth | `string \| number` | 否 | 列宽；均未设置时按 label 字符宽自动估算 |
| fixed | `'left' \| 'right'` | 否 | 固定列 |
| align | `'left' \| 'right' \| 'center'` | 否 | 未设置默认 `'center'` |
| slot | `string` | 否 | 自定义单元格插槽名（**必须与模板 `#column-x` 配对**，漏 slot 键则静默显示原始值） |
| showOverflowTooltip | `boolean` | 否 | 两行截断 + tooltip 展示全文 |

空值兜底：无 slot 时直接渲染 `row[prop] ?? '--'`。

### 2.4 ScButton

el-button 封装。核心增强：`onClick` 返回 Promise 时按钮自动进入 loading/禁用；`stop` prop 替代 `@click.stop` 修饰符。

#### Props

| 属性名 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| type / size / plain / text / bg / link / round / circle / disabled / icon / loadingIcon / autofocus / nativeType / autoInsertSpace / color / tag | 与 el-button 对齐 | — | 透传 el-button（size 默认 `'default'`、nativeType 默认 `'button'`，其余布尔默认 false） |
| stop | `boolean` | `false` | 点击时 `e.stopPropagation()` |
| onClick | `(e: MouseEvent) => unknown` | — | 返回 Promise 自动 loading，其余返回值忽略 |
| dark | `boolean` | `false` | 已声明但未绑定模板（不生效，待确认） |

无 defineEmits（点击经 `onClick` prop 处理）、无 defineExpose；`inheritAttrs: false`，attrs 全量透传 el-button，所有插槽（含作用域）透传。

---

## 三、表单族

### 3.1 ScBaseForm

基于 el-form 的配置驱动表单：`formItems` 数组声明式渲染十种内置控件（或自定义插槽），支持分组折叠、按字段隐藏、动态 label/rules、栅格列数与跨列，并代理 el-form 校验方法。

#### Props

| 属性名 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| modelValue | `Record<string, any>`（必填） | — | 表单数据对象（控件直接写入 `modelValue[item.prop]`，无 update 事件） |
| formItems | `Array<ScBaseFormItem>`（必填） | — | 表单项配置 |
| labelWidth | `number \| string` | `'110px'` | 透传 el-form |
| inline | `boolean` | `false` | 透传 el-form |
| isGroup | `boolean` | `false` | 分组模式：按 groupName 聚合，未设置的项归入 `'基本信息'`，组头可点击折叠 |
| columns | `number` | `2` | 网格列数（CSS grid） |

#### Slots

| 插槽名 | 作用域参数 | 说明 |
| --- | --- | --- |
| `before-{prop}` | `{ item, data }` | 渲染在某项控件之前 |
| `custom-{customSlot}` | `{ item, data }` | item 设置 `customSlot` 时由该插槽渲染 |

#### 实例方法

`validate()`（校验失败时自动展开对应分组再 rethrow）、`resetFields()`、`clearValidate(props?)`、`getItemRef<T>(prop)`（取该项子组件实例）。

#### formItems 每项字段（types/formItem.ts）

公共字段：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| prop | `string`（必填） | 绑定字段 |
| label | `string \| ((formData) => string)` | 支持函数动态计算 |
| rules | `FormItemRule \| FormItemRule[] \| ((formData) => ...)` | 支持函数式——**隐藏项校验陷阱的标准解法**（见 8.1） |
| customSlot | `string` | 自定义插槽名（渲染 `custom-{customSlot}`） |
| hide | `(formData) => boolean` | 返回 true 时 `v-show=false`（**不卸载**，见 8.1） |
| groupName | `string` | 分组名（isGroup 模式） |
| colSpan | `number` | 跨列数（`grid-column: span N`） |
| onChange | `(value, formData) => void` | 控件 change 回调 |

type 变体：`'input' | 'select' | 'date' | 'dateRange' | 'radio' | 'checkbox' | 'switch' | 'treeSelect' | 'tree' | 'cascader'`（与 ScBaseFormItems 十件一一对应）+ 各自 `componentProps`；纯自定义项为 `customSlot`（必填）+ 无 type。

行为细节：placeholder 自动推断（input 类 `请输入{label}`，select 类 `请选择{label}`，componentProps.placeholder 优先）；rules 不是透传 prop，由 formItems 各项 rules 聚合计算，函数式 rules 以当前 formData 求值。

### 3.2 ScBaseFormItems（十个表单控件）

`src/components/ScBaseFormItems/index.ts` 导出十个控件，主要作为 ScBaseForm / ScSearchbar 的底层渲染件，也可单独使用。公共约定：透传 $attrs 与插槽、宽度撑满容器。

#### ScInput（el-input 封装）

`modelValue: string | number`（默认 `''`）、`type`（text/number/textarea/password）、`clearable` 默认 true、`maxLength`、`showWordLimit`、`prefixIcon/suffixIcon`、`autosize`、`rows`（默认 5）、`placeholder` 默认 `'请输入'`。Emits：update/input/change/blur/focus/clear。Expose：`focus/blur/select/clear`。

#### ScSelect（el-select 封装，字典驱动）

| 属性名 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| modelValue | 单值或数组 | — | |
| options | `Array<{ label; value; disabled?; options? }>` | `[]` | 静态选项，支持分组（嵌套 options） |
| dictField | `string` | `''` | 非空时经 getDictOptions 拉字典（**字典优先**，失败降级 options） |
| customConfig | `{ label?; value?; disabled?; options? }` | `{ label: 'label', value: 'value' }` | 自定义字段映射（label/disabled 可为函数） |
| filterable / multiple / collapseTags / collapseTagsTooltip / multipleLimit | — | `true` / `false` / `false` / `false` / `0` | |
| labelMaxWidth | `number \| string` | — | label 超长省略 + tooltip |

Emits：update/change/visible-change/remove-tag/clear/blur/focus。Expose：`focus/blur/refresh/getOptions/getSelectRef`。default 插槽存在时跳过内置选项渲染。

#### ScCascader（el-cascader 封装）

`options` 静态与 `request: () => Promise<options[]>` 异步二选一（options 优先）；`fieldNames` 字段映射；`multiple/checkStrictly/emitPath(默认 true)/showAllLevels(默认 true)`；`cascaderProps: Partial<ElCascaderProps>` 逃生舱（最后 merge，可覆盖以上全部）。Expose：`refresh/getCheckedNodes/clearCheckedNodes`。

#### ScCheckbox（el-checkbox-group 封装）

`modelValue: Array<string | number>`；`dictField` 或 `checkboxOptions` 二选一（字典优先）；`fieldNames` 映射；`showInput: Array<value>` —— 选中值命中列表时附加一个 ScInput，附输入值经 `v-model:inputValue` 双模型传出。

#### ScRadio（el-radio-group 封装）

`modelValue: string | number | undefined`；`dictField` 字典优先、`radioOptions` 兜底；`fieldNames`、`border`。Emits 仅 update。

#### ScSwitch（el-switch 薄封装）

`modelValue: string | number | boolean`；`activeValue/inactiveValue`（默认 `true`/`false`）；`activeText/inactiveText`；`inlinePrompt` 默认 true。Emits 仅 update。

#### ScDatePicker / ScDateRangePicker（ScBaseDate 的两个门面）

- ScDatePicker：单值 `string`；`type` 限 `'date' | 'week' | 'month' | 'year'`（默认 date）；format/valueFormat 默认 `'YYYY-MM-DD'`。
- ScDateRangePicker：区间 `[string, string]`；`type` 限 `'daterange' | 'monthrange' | 'yearrange'`（默认 daterange）；`startPlaceholder/endPlaceholder` 默认 `'开始日期'`/`'结束日期'`；rangeSeparator 默认 `'至'`。

#### ScTree（带复选框的 el-tree 封装）

`modelValue: Array<string | number>`（checkedKeys）；`options`、`fieldNames`（label/children/disabled）、`nodeKey` 默认 `'value'`、`checkStrictly`、`defaultExpandAll`、`filterable`（显示关键字过滤框）、`maxHeight` 默认 300。Expose：`expandAll/collapseAll/checkAll/uncheckAll`。

#### ScTreeSelect（el-tree-select 封装）

`modelValue: 单值或数组`；`options`、`fieldNames`、`multiple`（多选时显示复选框）、`checkStrictly` 默认 true、`nodeKey` 默认 `'value'`、`checkOnClickNode` 默认 true、`labelMaxWidth`（节点 label 省略 + title）。Emits：update/change/node-click/clear/visible-change。

### 3.3 ScBaseDate

el-date-picker 统一薄封装（单值与区间共用），ScDatePicker / ScDateRangePicker 均由它渲染。

`modelValue: string | [string, string]`、`type`（必填）、`format/valueFormat` 默认 `'YYYY-MM-DD'`、`clearable` 默认 true、`rangeSeparator` 默认 `'至'`。Emits：update / change。

### 3.4 ScDialogForm

ScDialog + ScBaseForm 组合体：弹窗内配置驱动表单，confirm 前先 `validate()`，透传全部插槽给内层 ScBaseForm，并整体代理其暴露方法。

#### Props

| 属性名 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| modelValue | `boolean`（必填） | — | 弹窗显隐 |
| formData | `Record<string, any>`（必填） | — | 表单数据 |
| config | `ScDialogFormConfig`（必填） | — | 见下 |
| confirmLoading | `boolean` | — | 确认按钮 loading |

**config**：`{ title?; confirmText?; cancelText?; dialogWidth?; draggable?; fullscreen?; destroyOnClose?（含大数据树时可设 false 提升再次打开速度）; formItems（必填）; labelWidth?; inline?; columns?; groupModel?（分组默认开启） }`。

#### Emits

`update:modelValue(val)`、`confirm(data)`——**仅在 validate 通过后触发**。

#### 实例方法

同 ScBaseForm：`validate / resetFields / clearValidate / getItemRef`。

#### 配套 Hook：useDialogForm（src/hooks/useDialogForm.ts）

新增/编辑弹窗的状态与提交逻辑标准解法，与 ScDialogForm 一一接线：

```ts
const { visible, formData, confirmLoading, dialogTitle, open, handleConfirm } =
  useDialogForm<FormData>({
    defaultFormData,            // 必填：表单初始值
    title: '常用测试环境',        // 必填：dialogTitle 计算 新增/编辑{title}
    idKey?: 'id',
    fetchDetail?: id => getDetailAPI(id),   // 编辑回显（优先）；否则直接 assignObject(row)
    transformRequest?: data => …,           // 提交前转换（如 FormData）
    onCreate: data => createAPI(data),      // 必填
    onUpdate: data => updateAPI(data),      // 必填
    onSuccess: () => scResourcePageRef.value?.refresh(),
    beforeOpen?: (formData, row?) => …
  })
```

接线：`v-model="visible"`、`:form-data="formData"`、`:confirm-loading="confirmLoading"`、`@confirm="handleConfirm"`、`config.title = dialogTitle.value`。成功后自动关窗 + 成功提示。注意 `fetchDetail` 返回值会被解构 `{ data }`，字段适配器须保留 `{ data }` 包装。

### 3.5 DynamicFormList

卡片列表 + 弹窗编辑的动态行表单（泛型 `T`）：列表只读卡片展示，点「添加/编辑」弹出 ScDialog 表单（input/textarea/select 三种控件），确认后增改行。

#### Props

| 属性名 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| modelValue | `T[]`（必填） | — | 行数据数组（行对象经 WeakMap 分配稳定 key） |
| items | `DynamicFormListItem<T>[]`（必填） | — | 行字段配置 |
| createRow | `() => T` | — | 不传时按 items 的 defaultValue 自动构建（仅覆盖声明过的字段） |
| dialogTitle | `{ add?; edit? }` | `{ add: '添加', edit: '编辑' }` | |
| dialogWidth | `string \| number` | `'600px'` | |
| emptyText / addButtonText | `string` | `'暂无数据,点击下方按钮添加'` / `'添加'` | |

#### Emits 与 Expose

`update:modelValue(rows)`、`add(row)`、`edit(row, index)`、`remove(row, index)`；Expose：`openAddDialog()`、`openEditDialog(index)`。

#### items 每项字段

`prop`（必填）、`label`（不传不展示）、`placeholder`、`defaultValue`、`viewClamp`（只读截断行数：textarea 缺省 3、其余缺省 1，false 不截断）；变体：`'input'`、`'textarea' + rows?`、`'select' + dictField?/options?`。

#### Slots 与注意事项

插槽：`header`（作用域 `{ row, index, on-edit, on-remove }`，覆盖默认头部按钮区）、`header-extra`、`view-{prop}`（`{ row, index, value, item }`）。

- 只读卡片 select 值自动翻译 label（options 优先 → `getDictLabel(dictField, value)` → 回退原值），空值显示 `--`。
- 弹窗编辑态 `structuredClone(toRaw(row))` 深拷贝隔离；**弹窗内无校验逻辑**（不支持 rules，待确认）。
- 行内多项布局无 flex 分配时内容宽会挤压留白（宽度陷阱，注意给行内项分配宽度）。

### 3.6 ScSearchDateRangeSelector

搜索栏用的日期区间下拉触发器：类 select 外观（图标 + 文本 + 箭头），点击弹出 popover 内嵌 ScDateRangePicker，选中即回填并收起；被 ScSearchbar 的 dateRange 类型集成使用。

`modelValue: [string, string]`、`type`（默认 `'daterange'`）、`format/valueFormat`（默认 `'YYYY-MM-DD'`）、`placeholder`（默认 `'请选择时间范围'`）、`rangeSeparator`（默认 `'至'`）。Emits：update / change（载荷可为 `undefined`）。点击外部自动收起。

---

## 四、上传族

### 4.1 ScBaseUpload

完整的文件上传对话框（内部组合 ScDialog + ScUploadDragger）：文件选择/拖拽、文件列表与状态管理、模板下载、上传执行与成功/失败反馈。

#### Props

| 属性名 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| modelValue | `boolean`（必填） | — | 弹窗显隐 |
| uploadConfig | `ScUploadConfig`（必填） | — | `{ uploadUrl: string（必填）; headers?; accept?: string[]; multiple?; successMsg?（默认「文件导入成功！」）; formatSuccessMessage?: (response) => string }` |
| templateConfig | `ScTemplateConfig` | — | `{ templateUrl: string; requestMethod: 'GET' \| 'POST'; showTemplateDownload?; templates?: Array<{ label; fileName?; extraParams? }> }`（fileName 缺省用「弹窗标题 + 模板」） |
| title | `string` | `'文件上传'` | 弹窗标题 |
| uploadFn | `(files: File[]) => Promise<any>` | — | 自定义上传函数，配置后覆盖默认 uploadFile 工具函数 |
| uploadExtraParams | `Record<string, any>` | — | 上传额外参数，同时并入模板下载请求 |

#### Emits

`update:modelValue(val)`、`uploadSuccess(response)`。

行为要点：`multiple` 控制单/多文件（单文件时新选择会清空列表）；无文件大小限制 prop，类型限制仅 `accept`；确认按钮在无文件或已成功时禁用；`formatSuccessMessage` 返回非空则弹窗保留（手动关闭模式）。

#### 配套 Hook：useUploadDialog（src/hooks/useUploadDialog.ts）

命令式挂载 ScBaseUpload 到 body，页面无需写模板：

```ts
const { open } = useUploadDialog({
  uploadConfig: { uploadUrl: FEATURE_SCREENSHOT_UPLOAD_URL, accept: ['.docx'] },
  title: '回归测试截图记录导入',
  extraParams: screenshotExtraParams,
  onSuccess: () => scResourcePageRef.value?.refresh()
})
```

注意：hook 创建时**闭包捕获 extraParams**——query 驱动页面须传 reactive 对象并在 watch 中 mutate，请求时才会读到新值。

### 4.2 ScUploadDragger

拖拽/点击选择文件的录入控件（`auto-upload=false`、只选不上传），带扩展名复检（拖拽路径不经过 accept 过滤，组件在 change 中按扩展名复检并移除非法文件）。ScBaseUpload 内部即用它做文件选择。

| 属性名 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| accept | `string[]` | 内部常量兜底（jpg/jpeg/png/pdf/doc/docx/xls/xlsx） | 接受的扩展名数组 |
| multiple | `boolean` | `false` | |
| hint | `string` | 自动生成 `仅支持 ${accept} 格式` | 提示文案 |
| invalidMessage | `string` | 自动生成 | 类型不合法提示 |

Emits：`change(file, fileList)`（转发 el-upload on-change 签名）。Expose：`clearFiles()`、`handleRemove(file)`。

---

## 五、弹窗与反馈

### 5.1 ScDialog

基于 el-dialog 的统一风格弹窗：默认「关闭/确认」footer、`v-bind="$attrs"` 透传、`provide(OverlayVisibleKey, visible)`、固定 `append-to-body`。

| 属性名 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| modelValue | `boolean`（必填） | — | 显隐 |
| title | `string` | `'弹窗标题'` | |
| confirmText / cancelText | `string` | `'确认'` / `'关闭'` | |
| confirmLoading / confirmDisabled | `boolean` | — | 确认按钮状态 |
| dialogWidth | `string \| number` | `'50%'` | |
| draggable / fullscreen | `boolean` | `true` / `false` | |
| autoHeight | `boolean` | — | body min-height 置 auto |
| showConfirmButton / showFooterOperate | `boolean` | `true` / `true` | 隐藏确认按钮 / 底部操作栏 |
| destroyOnClose | `boolean` | `true` | 关闭时销毁内容（含大数据量组件时可设 false） |

Emits：`confirm`、`cancel`、`update:modelValue(val)`、`closed`、`open`。注意关闭会同时触发 `update:modelValue(false)` 与 `cancel`。Slots：`default`、`footer`（覆盖默认按钮）、`header`（透传 el-dialog header 作用域参数）。

### 5.2 ScConfirmDialog 与 useScConfirm

深色标题栏 + 红色渐变分割线的删除确认弹窗（自绘 overlay + Transition，非 el-dialog）。**交互全靠 props 回调而非 emits**：`title`（默认 `'确认删除'`）、`message`（默认 `'此操作不可撤销，确定要删除吗？'`）、`confirmText`（默认 `'确认删除'`）、`cancelText`（默认 `'取消'`）、`onConfirm?: () => void | Promise<void>`（成功后自动关闭）、`onCancel?`、`onClose?`。

日常使用走命令式 hook（`src/hooks/useScConfirmDialog.ts`）：

```ts
const { scConfirm } = useScConfirm()
await scConfirm({ message: `确定删除选中的 ${ids.length} 条记录吗？` })  // 确认 resolve
// 取消走 reject(new Error('cancel'))
```

**取消是 reject 不是 resolve(false)**：需要「取消即中止」时用 try/catch 包裹，勿用 `await safeRequest(scConfirm())` 之类包裹（不中止流程且可能弹假错误）。

---

## 六、基础展示

### 6.1 ScIconPicker

popover 触发的图标选择输入框：展示当前图标，内嵌可搜索、双来源（Element Plus 图标 + 本地 svg）切换的面板。

`modelValue: string`（必填，编码规则：`el-icon-xxx` = element 图标，裸名 = 本地 svg）、`placeholder`（默认 `'请选择图标'`）、`clearable`（默认 true）。Emits：`update:modelValue`、`change`（选择与清空都触发）。

### 6.2 ScLinkText

单行省略文本：溢出时 tooltip 显示全文（ResizeObserver 动态检测），clickable 时呈主色可点击。

`content: string`（必填，同时作 tooltip 内容）、`clickable?`（默认 true）。Emits：`click`（clickable 为 false 时不触发）。

### 6.3 SvgIcon

本地 svg 雪碧图图标：`<use :href="#icon-${name}">`，尺寸随 size。

`name: string`（必填，svg 裸名，不带 `icon-` 前缀）、`size?`（默认 `'1em'`，同时设宽高）。图标来源为 `src/assets/icons` 目录（vite-plugin-svg-icons，symbolId `icon-[name]`），非 iconfont；当前可用：404、account、dashboard、dict、home-page、post、project、system、user、users。

---

## 七、配套工具索引（src/utils）

| 工具 | 签名 | 用途 |
| --- | --- | --- |
| `defineFormItems<T>()` | `(items: WithTypedProps<T, ScBaseFormItem>[]) => ScBaseFormItem[]` | 为 formItems 提供表单数据类型 T 的类型增强（prop/hide/label/rules/onChange 收窄到 keyof T），运行时原样返回 |
| `findFormItem()` | `<Type>(items, prop: keyof T, type: Type) => Extract<ScBaseFormItem, { type: Type }> \| undefined` | 按 prop + type 查找表单项并类型收窄，典型用于异步回填 `componentProps.options` |
| `findFormSelectItem()` | 同上（仅 select） | 已标 `@deprecated`，由 findFormItem 代替 |

> `defineFormItems` 返回的宽化数组不能再嵌套进另一个 `defineFormItems` 字面量（TS2322）；多段表单用分段工厂 + index.vue 外部组合。

## 八、常见注意事项（踩坑记录）

1. **ScBaseForm 的 hide 是 v-show 不是 v-if**：隐藏项不卸载，带 required 的隐藏项仍会阻断 `validate()`。标准解法是 rules 用函数式（随 formData 求值），在函数内按显隐条件返回/过滤 required；勿用「hide + 静态 required」组合。
2. **列插槽生效双条件**：列定义必须有 `slot` 键 + 模板必须有 `#column-x`（x = slot 值）。漏 slot 键会静默失效、显示原始值。
3. **ScSearchbar 搜索初值是 null 不是 undefined**：ScResourcePage 初始化搜索表单时 dateRange 置 `undefined`、其余置 `null`；自定义 fetchData 处理参数时用 `??` 归一。
4. **scConfirm 取消走 reject**：取消即中止的场景用 try/catch；裸 await 会有 unhandled rejection 噪音；勿用 safeRequest 包裹。
5. **useUploadDialog 闭包捕获 extraParams**：query 驱动页面须传 reactive 对象 + watch mutate。
6. **DynamicFormList 行内宽度**：行内项无 flex 分配时内容宽会挤压留白，注意分配列宽。
7. **声明但未生效/不一致的 API（勿依赖）**：ScButton 的 `dark`；ScSearchbar 的 `update:modelValue` emit；`ScTableColumn.isDict`；ScResourcePage 的 `export`/`selection-change` emit、`SearchConfig.showSearch`、`TableConfig.pageSize`。

## 附录：业务组件甄别说明

**FileReferenceInput（未收录）** —— 判定为业务组件，依据：

- 核心数据契约 `FileItem`（含 base64 `image`/`fileType` 回显字段）与 projectProcess 后端字段一一对应；
- `{{@名称_序号}}` 占位符替换协议是与后端共约的内容存储格式；
- 消费面全部位于 `src/views/projectProcess` 业务域（10 个视图），绑定具体业务字段（如 portTest 的 `resultDescription` / `resultDescription_files`）。

虽然它自身不 import `@/api`、无硬编码端点，但迁往通用组件库需先解耦上述三点，故按「业务组件不收录」原则排除。若后续其他业务域出现同构需求，可考虑解耦后升级为通用组件。
