angular.module('ListRoutes', [])
    .directive('listRoutes', [function () {

        return {
            restrict: 'E',
            templateUrl: 'static/js/directives/list-routes/listroutes.tpl.html',
            scope: {
                routesListVisible: "=routesVisible",
                routes: "=routes", 
                toggleRoute : "=onToggleRoute"
            }

        };
    }]);