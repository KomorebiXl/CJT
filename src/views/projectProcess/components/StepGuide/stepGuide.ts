export interface StepItem {
  title: string
  desc: string[]
  action: {
    text: string
    handler: () => unknown
    disabled?: boolean
  }
  permission?: string | string[]
}

export type StepItems = Array<StepItem>
