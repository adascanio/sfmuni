
angular.module('RouteCollectionModule', [])
    .factory('RouteCollection', [function () {

        function RouteCollection(routes) {

            this.routes = routes || {};
           
        }

        RouteCollection.prototype.getAll = function () {
            return this.routes;
        }

        RouteCollection.prototype.getAllAsArray = function () {
            var that = this;
            var res = Object.keys(this.routes)
                    .map(function (key, index, array) {
                        return that.routes[key];
                    });
            return res;
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