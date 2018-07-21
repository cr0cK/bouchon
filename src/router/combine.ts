import { TRouteMapping } from './combine'
import { IActionPayload, IActionMeta } from './../types/index'
import { isFunction } from 'lodash'
import { createReducer, Reducer, Handler } from 'redux-act'
import { RequestHandler } from 'express'
import { Selector } from 'reselect'

import { IFullState, IBouchonAction, IBackEndAction } from '../types'
import { combineReducers, ReducersMapObject } from 'redux'

// json output
export type TData = object

export type FStatusHandler = (selectedData: any) => number | number

export type TRouteMiddlewareHandler = (params: any) => RequestHandler

// FIXME
export interface ISelectorParameters {}

export interface IRoute {
  action: IBouchonAction
  backendAction?: IBackEndAction
  selector?: Selector<IFullState, ISelectorParameters>
  middlewares?: TRouteMiddlewareHandler[]
  status: FStatusHandler
}

export type TRouteMapping = Record<string, IRoute>

export interface IFixture {
  name: string
  endpoint: string
  routes: TRouteMapping
  reducer: Handler<IFullState, IActionPayload, IActionMeta>
  data: TData
}

export type TFixturesMapping = Record<string, IFixture>

export interface ICombinedFixtures {
  routes: TRouteMapping
  reducer: Reducer<IFullState>
}

/**
 * Create reducers and combine them.
 */
export const combineFixturesReducers = (
  fixtures: TFixturesMapping
): Reducer<IFullState> => {
  const reducers = Object.keys(fixtures).reduce<ReducersMapObject>(
    (acc, fixtureName) => {
      const fixture = fixtures[fixtureName]

      if (!fixture.name) {
        throw new Error(
          `Error in the fixture '${fixtureName}': ` +
            "You have to specify a 'name' property " +
            'that will be used as the Redux state key.'
        )
      }

      // create a reducer if fixture.reducer is just an object definition
      // (case in fixture definition)
      acc[fixture.name] = isFunction(fixture.reducer)
        ? fixture.reducer
        : createReducer(fixture.reducer, fixture.data || {})

      return acc
    },
    {}
  )

  // @ts-ignore Reducer types are not compatible between redux-act and redux...
  return combineReducers<IFullState>(reducers)
}

/**
 * Return a new Route object with all endpoint of routes concatened
 * with `endpoint`.
 */
export const concatRoutesEndpoint = (
  routes: TRouteMapping,
  endpoint: string
): TRouteMapping => {
  // console.log('routes', routes);

  return Object.keys(routes).reduce((acc, verbUrl) => {
    const [verb, url] = verbUrl.split(/\s+/)
    const finalUrl = `/${[endpoint, url].join('/')}`.replace(/\/{2,}/g, '/')
    const concatenatedEndpoint = [verb, finalUrl].join(' ')

    return {
      ...acc,
      [concatenatedEndpoint]: routes[verbUrl]
    }
  }, {})
}

/**
 * Combine routes endpoints of fixtures.
 */
export const combineFixturesRoutes = (
  fixtures: TFixturesMapping
): TRouteMapping =>
  Object.keys(fixtures).reduce((acc, fixtureName) => {
    const fixture = fixtures[fixtureName]

    if (!fixture.routes) {
      return acc
    }

    return {
      ...acc,
      ...concatRoutesEndpoint(fixture.routes, fixture.endpoint)
    }
  }, {})

/**
 * Combine reducers and routes from fixtures definitions.
 */
export const combineFixtures = (
  fixtures: TFixturesMapping
): ICombinedFixtures => ({
  reducer: combineFixturesReducers(fixtures),
  routes: combineFixturesRoutes(fixtures)
})
