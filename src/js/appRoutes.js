angular.module('appRoutes', []).config(['$routeProvider', '$locationProvider',
    function ($routeProvider, $locationProvider) {

        $routeProvider

            // home page
            .when('/', {
                redirectTo : '/city/SFO'
            })
            .when('/city/:cityCode', {
                templateUrl: 'static/views/mapPage.html',
                controller: 'MapPageController'
            })
            .otherwise( '/')

        $locationProvider.html5Mode(true);

    }]);