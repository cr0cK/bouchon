import { Request } from 'express'
import { Action } from 'redux-act'

export interface IActionPayload {}

export interface IBouchonAction extends Action<IActionPayload, IActionMeta> {}

export interface IBackEndAction {
  action: IBouchonAction[]
  delay: number
}

export interface IActionMeta {
  req: Request
  isBouchonAction: boolean
  backendAction: IBackEndAction
}

export type IFullState = Record<string, any>
