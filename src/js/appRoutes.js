angular.module('appRoutes', []).config(['$routeProvider', '$locationProvider',
    function ($routeProvider, $locationProvider) {

        $routeProvider

            // home page
            .when('/', {
                templateUrl: 'static/views/home.html',
                controller: 'HomeController'
            })
            .when('/city/:cityCode', {
                templateUrl: 'static/views/mapPage.html',
                controller: 'MapPageController'
            })
            .otherwise( '/')

        $locationProvider.html5Mode(true);

    }]);