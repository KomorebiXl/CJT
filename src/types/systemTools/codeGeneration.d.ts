export type CodeGenerationFlag = '0' | '1'
export type CodeGenerationTemplate = 'crud' | 'tree' | 'sub'
export type CodeGenerationJavaType =
  | 'Long'
  | 'String'
  | 'Integer'
  | 'Double'
  | 'BigDecimal'
  | 'Date'
  | 'Boolean'
export type CodeGenerationQueryType =
  | 'EQ'
  | 'NE'
  | 'GT'
  | 'GTE'
  | 'LT'
  | 'LTE'
  | 'LIKE'
  | 'BETWEEN'
export type CodeGenerationHtmlType =
  | 'input'
  | 'textarea'
  | 'select'
  | 'radio'
  | 'checkbox'
  | 'inputNumber'
  | 'datetime'

export type CodeGenerationSearchParams = {
  tableName?: string
  tableComment?: string
}

export type CodeGenerationRow = {
  tableId: number | string
  tableName: string
  tableComment: string
  className: string
  createTime: string
  updateTime: string
  genType: CodeGenerationFlag
  genPath?: string
}

export type ImportTableSearchParams = {
  tableName?: string
  tableComment?: string
}

export type ImportableTableRow = {
  tableId?: number | string
  tableName: string
  tableComment: string
  createTime: string
  updateTime: string
}

export type CodeGenerationColumn = {
  columnId: number | string
  columnName: string
  columnComment: string
  columnType: string
  javaType: CodeGenerationJavaType
  javaField: string
  isInsert: CodeGenerationFlag
  isEdit: CodeGenerationFlag
  isList: CodeGenerationFlag
  isQuery: CodeGenerationFlag
  isRequired: CodeGenerationFlag
  queryType: CodeGenerationQueryType
  htmlType: CodeGenerationHtmlType
  dictType?: string
}

export type CodeGenerationOptionsFormData = {
  tplCategory: CodeGenerationTemplate
  packageName: string
  moduleName: string
  businessName: string
  functionName: string
  parentMenuId?: number | string
  genType: CodeGenerationFlag
  genPath?: string
  treeCode?: string
  treeParentCode?: string
  treeName?: string
  subTableName?: string
  subTableFkName?: string
}

export type CodeGenerationBasicFormData = {
  tableId?: number | string
  tableName: string
  tableComment: string
  className: string
  functionAuthor: string
  remark: string
}

export type CodeGenerationDetail = CodeGenerationBasicFormData &
  CodeGenerationOptionsFormData & {
    columns?: CodeGenerationColumn[]
    params?: Record<string, string | number | undefined>
  }

export type CodeGenerationRelatedTable = {
  tableName: string
  tableComment: string
  columns: Array<Pick<CodeGenerationColumn, 'columnName' | 'columnComment'>>
}

export type CodeGenerationDetailResponse = {
  rows: CodeGenerationColumn[]
  info: CodeGenerationDetail
  tables: CodeGenerationRelatedTable[]
}

export type CodeGenerationUpdateData = CodeGenerationDetail & {
  tplWebType: 'lmw'
}

export type CodePreviewData = Record<string, string>
