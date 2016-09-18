import _ from 'lodash';


/**
 * Return a new object with the endpoint concatenated to the url of each route.
 *
 * @param  {Object} routes   Object of routes
 * @param  {String} endpoint Endpoint
 * @return {Object}
 */
export const concatEndpoint = (routes, endpoint) => (
  Object.keys(routes).reduce((acc, routeKey) => {
    const [verb, url] = routeKey.split(/\s+/);
    const finalUrl = (`/${[endpoint, url].join('/')}`).replace(/\/{2,}/g, '/');
    const newRouteKey = [verb, finalUrl].join(' ');
    return {
      ...acc,
      [newRouteKey]: routes[routeKey],
    };
  }, {})
);


/**
 * Combine routes of all fixtures.
 *
 * @param  {Object} fixturesContent The exported definition of each fixture
 * @return {Object}
 */
export const combineFixturesRoutes = (fixturesContent) => {
  let routes = {};

  Object.keys(fixturesContent).forEach(fixtureName => {
    const fixture = fixturesContent[fixtureName];
    const fixtureRoutes = _.isObject(fixture.routes) ?
      concatEndpoint(fixture.routes, fixture.endpoint) :
      {};

    routes = Object.assign(routes, fixtureRoutes);
  });

  return routes;
};
