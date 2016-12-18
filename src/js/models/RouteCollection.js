
angular.module('RouteCollectionModule', [])
.factory('RouteCollection',[function() {

    function RouteCollection (routes){

        this.routes = routes || {};
    }

    RouteCollection.prototype.getAll = function () {
        return this.routes;
    }

    RouteCollection.prototype.getRoute = function (routeTag) {
        return this.routes[routeTag];
    }

    RouteCollection.prototype.set = function (route){
        this.routes[route.getTag()] = route;
    }

    RouteCollection.prototype.remove = function (route){
        delete this.routes[route.getTag()];
    }

    return RouteCollection


}]);