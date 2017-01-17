angular.module('appRoutes', []).config(['$routeProvider', '$locationProvider',
    function ($routeProvider, $locationProvider) {

        $routeProvider

            // home page
            .when('/', {
                redirectTo : '/city/SFO'
            })
            .when('/city/:cityCode', {
                templateUrl: 'views/mapPage.tpl.html',
                controller: 'MapPageController',
                resolve : {
                    checkCityCode : ['$q','CitiesServiceFactory','$route','$location',function($q,CitiesServiceFactory, $route, $location) {
                        var deferred = $q.defer();

                        var cityCode = $route.current.params.cityCode.toUpperCase();

                        if (CitiesServiceFactory.cities[cityCode]) {
                            deferred.resolve({cityCode : cityCode});
                        }
                        else {
                            deferred.reject();
                            $location.path("/city/SFO")
                        }
                        
                        return deferred.promise;
                        
                    }]
                }
            })
            .otherwise( '/')

        $locationProvider.html5Mode(true);

    }]);