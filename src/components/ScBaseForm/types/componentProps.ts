import type { ScInputType } from '@/components/ScBaseFormItems/ScInput/scInput.ts'
import type {
  CustomConfig,
  ScSelectOption
} from '@/components/ScBaseFormItems/ScSelect'
import type { DictOption } from '@/api/system/dict'
import type { ScDatePickerType } from '@/components/ScBaseFormItems/ScDatePicker'
import type { ScDateRangePickerType } from '@/components/ScBaseFormItems/ScDateRangePicker'
import type {
  ScRadioFieldName,
  ScRadioOption
} from '@/components/ScBaseFormItems/ScRadio'
import type {
  ScCheckboxFieldName,
  ScCheckboxOption
} from '@/components/ScBaseFormItems/ScCheckbox'
import type {
  ScTreeSelectFieldName,
  ScTreeSelectOption
} from '@/components/ScBaseFormItems/ScTreeSelect'
import type {
  ScTreeFieldName,
  ScTreeOption
} from '@/components/ScBaseFormItems/ScTree'

export interface ScFormInputProps {
  type?: ScInputType
  size?: 'large' | 'small' | 'default'
  placeholder?: string
  clearable?: boolean
  disabled?: boolean
  maxLength?: number
  showWordLimit?: boolean
  prefixIcon?: string
  suffixIcon?: string
  autosize?: boolean
  rows?: number
}

export interface ScFormSelectProps {
  options?: Array<ScSelectOption> | Array<DictOption>
  dictField?: string
  customConfig?: CustomConfig
  disabled?: boolean
  size?: 'large' | 'small' | 'default'
  placeholder?: string
  clearable?: boolean
  filterable?: boolean
  multiple?: boolean
  collapseTags?: boolean
  collapseTagsTooltip?: boolean
  multipleLimit?: number
  loadingText?: string
  noDataText?: string
  noMatchText?: string
  labelMaxWidth?: number | string
  onChange?: (value: any) => void
}

export interface ScFormDateProps {
  type?: ScDatePickerType
  format?: string
  valueFormat?: string
  placeholder?: string
  disabled?: boolean
  clearable?: boolean
  size?: 'large' | 'default' | 'small'
}

export interface ScFormDateRangeProps {
  type?: ScDateRangePickerType
  format?: string
  valueFormat?: string
  startPlaceholder?: string
  endPlaceholder?: string
  disabled?: boolean
  clearable?: boolean
  size?: 'large' | 'default' | 'small'
  rangeSeparator?: string
}

export interface ScFormRadioProps {
  radioOptions?: Array<ScRadioOption>
  dictField?: string
  fieldNames?: ScRadioFieldName
  disabled?: boolean
  size?: 'large' | 'default' | 'small'
  border?: boolean
}

export interface ScFormCheckboxProps {
  inputValue?: string
  disabled?: boolean
  dictField?: string
  checkboxOptions?: Array<ScCheckboxOption>
  fieldNames?: ScCheckboxFieldName
  showInput?: Array<string | number>
}

export interface ScFormSwitchProps {
  inactiveText?: string
  activeText?: string
  inlinePrompt?: boolean
  activeValue?: string | number | boolean
  inactiveValue?: string | number | boolean
  disabled?: boolean
}

export interface ScFormTreeSelectProps {
  options?: Array<ScTreeSelectOption> | Array<Record<string, any>>
  multiple?: boolean
  checkStrictly?: boolean
  nodeKey?: string
  fieldNames?: ScTreeSelectFieldName
  disabled?: boolean
  size?: 'large' | 'small' | 'default'
  placeholder?: string
  clearable?: boolean
  filterable?: boolean
  collapseTags?: boolean
  collapseTagsTooltip?: boolean
  multipleLimit?: number
  defaultExpandAll?: boolean
  renderAfterExpand?: boolean
  checkOnClickNode?: boolean
  accordion?: boolean
  noDataText?: string
  labelMaxWidth?: number | string
}

export interface ScFormTreeProps {
  options?: Array<ScTreeOption> | Array<Record<string, any>>
  fieldNames?: ScTreeFieldName
  nodeKey?: string
  checkStrictly?: boolean
  defaultExpandAll?: boolean
  disabled?: boolean
  filterable?: boolean
  emptyText?: string
}
