angular.module('appRoutes', []).config(['$routeProvider', '$locationProvider',
    function ($routeProvider, $locationProvider) {

        $routeProvider

            // home page
            .when('/', {
                templateUrl: 'static/views/home.html',
                controller: 'HomeController'
            })
            .when('/new', {
                templateUrl: 'static/views/map.html'
                //controller: 'Controller'
            })

        $locationProvider.html5Mode(true);

    }]);