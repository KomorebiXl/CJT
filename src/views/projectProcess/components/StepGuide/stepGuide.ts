export interface StepItem {
  title: string
  desc: string[]
  action: {
    text: string
    handler: () => void
  }
  permission?: string | string[]
}

export type StepItems = Array<StepItem>
