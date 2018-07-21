import * as express from 'express'

import { IConfig } from '../libs/config'

export function middleware(config: IConfig) {
  const router = express.Router()

  router.get('/', (req, res, next) => {
    res.send('hello bouchon')
  })

  return router
}
