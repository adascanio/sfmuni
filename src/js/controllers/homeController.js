angular.module('HomeCtrl', ['CitiesServiceFactoryModule'])
    .controller('HomeController',
    ["$scope", "CitiesServiceFactory"
        , function($scope, CitiesServiceFactory) {
           
           $scope.cities = CitiesServiceFactory.cities;

           $scope.mapsProperties = [];

           angular.forEach( $scope.cities, function (value, key){
               var props = {};
               props.key = key;
               props.mapService = CitiesServiceFactory.getMapService(key);
               props.busService = CitiesServiceFactory.getBusService(key);
               props.static = true;
               props.mapConfig = props.mapService.mapConfig;

               $scope.mapsProperties.push(props);
                
           })

        }]);