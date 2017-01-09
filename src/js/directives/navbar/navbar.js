angular.module('NavBar', [])
    .directive('navbar', [function () {

        return {
            restrict: 'E',
            templateUrl: 'static/js/directives/navbar/navbar.tpl.html',
            scope: {
                cities: "=cities",
                routes: "=routes",
                routesListVisible : "=routesVisible",
                toggleRoutesList : "&onToggleRoutes"
            }

        };
    }]);