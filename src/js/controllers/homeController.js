angular.module('HomeCtrl', ['CitiesServiceFactoryModule'])
    .controller('HomeController',
    ["$scope", "CitiesServiceFactory"
        , function($scope, CitiesServiceFactory) {
           
           $scope.cities = CitiesServiceFactory.cities;

           $scope.mapService = CitiesServiceFactory.getMapService("SFO");
           $scope.busService = CitiesServiceFactory.getBusService("SFO");

           //Config inherited by the controller
           $scope.mapConfig = $scope.mapService.mapConfig;


        }]);