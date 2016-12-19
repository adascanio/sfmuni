
angular.module('RouteCollectionModule', [])
    .factory('RouteCollection', [function () {

        function RouteCollection(routes) {

            this.routes = routes || {};
           
        }

        RouteCollection.prototype.getAll = function () {
            return this.routes;
        }

        RouteCollection.prototype.get = function (routeTag) {
            return this.routes[routeTag];
        }

        RouteCollection.prototype.set = function (route) {
            this.routes[route.getTag()] = route;
        }

        RouteCollection.prototype.remove = function (routeTag) {
            delete this.routes[routeTag];
        }

        return RouteCollection


    }]);