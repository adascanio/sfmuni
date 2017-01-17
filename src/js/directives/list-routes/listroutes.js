angular.module('ListRoutes', [])
    .directive('listRoutes', [function () {

        return {
            restrict: 'E',
            templateUrl: 'list-routes/listroutes.tpl.html',
            scope: {
                routesListVisible: "=routesVisible",
                routes: "=routes", 
                toggleRoute : "=onToggleRoute"
            }

        };
    }]);