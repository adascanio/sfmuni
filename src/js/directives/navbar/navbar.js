angular.module('NavBar', [])
    .directive('navbar', [function () {

        return {
            restrict: 'E',
            templateUrl: 'navbar/navbar.tpl.html',
            scope: {
                cities: "=cities",
                routes: "=routes",
                routesListVisible : "=routesVisible",
                toggleRoutesList : "&onToggleRoutes"
            }

        };
    }]);