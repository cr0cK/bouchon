// // @flow

// export type Store = {
//   getState: () => Object,
//   dispatch: Function,
// };

// export type Reducer = Object;

// export type ActionMeta = {
//   req: Object,
//   res: Object,
//   // eslint-disable-next-line no-use-before-define
//   backendAction?: RouteBackendAction,
//   isBouchonAction: boolean,
// };

// export type Action = (payload: Object, meta: Object) => void;

// export type Selector = (fullState: Object, props: Object) => Object;

// export type DispatchedAction = {
//   type: string,
//   payload: Object,
//   meta: ActionMeta,
// };

// export type RouterOptions = {
//   directory?: string,
//   // eslint-disable-next-line no-use-before-define
//   rootFixture?: Fixture,
//   logger?: Logger,
// };

// export type CLIOptions = {
//   directory: string,
//   port: string,
//   hot: boolean,
// };

// export type RouteBackendAction = {
//   action: Array<Action>,
//   delay: number,
// };

// export type RouteAction =
//   Action |
//   Array<Action> |
//   {
//     action: Action | Array<Action>,
//     delay: number,
//   };

// export type RouteActionParams = {
//   actions: Array<Action>,
//   delay: number,
// };

// export type RouteMiddleware = {
//   (params: ?Object): {
//     (req: Object, res: Object, next: Function): void,
//   }
// };

// export type StatusHandler = (selectedData: any) => number | number

// export type Route = {
//   action: RouteAction,
//   backendAction?: RouteBackendAction,
//   selector?: (fullState: Object, props: Object) => any,
//   middlewares?: Array<RouteMiddleware>,
//   status: StatusHandler,
// };

// export type Routes = {
//   [verbUrl: string]: Route,
// };

// export type ExtendedRoute = {
//   verb: string,
//   url: string,
// } & Route;

// export type Fixture = {
//   name: string,
//   endpoint: string,
//   routes: Routes,
//   reducer: Reducer,
//   data: Object, // json data
// };

// export type Fixtures = {
//   [name: string]: Fixture,
// };

// export type CombinedFixtures = {
//   routes: Routes,
//   reducer: Reducer,
// };

// export type ServerOptions = {
//   directory: string,
//   port: string,
// };
