angular.module('MapCtrl', ['NextBusService', 'SFMapService', 'RouteModule', 'RouteCollectionModule', 'VehicleModule', 'VehicleCollectionModule'])
    .controller('MapController',
    ["$scope", "$timeout", "NextBusFactory", "SFMap", "$routeParams", "$q", "Route", "RouteCollection", "Vehicle", "VehicleCollection", "$log"
        , function($scope, $timeout, NextBusFactory, SFMap, $routeParams, $q, Route, RouteCollection, Vehicle, VehicleCollection, $log) {


            $scope.mapConfig = {
                scale: 500000,
                rotate: [122.370, 0],
                center: [0, 37.770]
            }
            /**
             * Load Map data
             */
            function loadMapData(type) {
                if ($scope.map[type]) {
                    return;
                }
                return SFMap.get(type)()
                    .then(function(res) {
                        $scope.map[type] = res.data;

                    }, function(res) {
                        $log.error("Impossible to load " + type);
                        $log.error(res);

                    });
            }

            
            function init() {

                   $scope.map = {
                    neighborhoods : null,
                    streets : null,
                    arteries : null,
                    freeways : null,
                }

                $scope.mapTypes = ['neighborhoods', 'streets', 'arteries', 'freeways']

                $scope.neighborhoodsLoaded = false;
                $scope.restOfMapLoaded = false;
                
                loadMapData('neighborhoods')
                    .then(function() {

                        //display the neighborhoods in the background while still loading
                        $scope.neighborhoodsLoaded = true;
                        
                        return $q.all([loadMapData('streets'), loadMapData('arteries'), loadMapData('freeways')]);
                    })
                    .then(function() {
                        $scope.loaded = true;
                        //the page can be displayed
                        $scope.restOfMapLoaded = true;

                        //open first route if available
                      //  opneFirstRoute();

                    });

                $scope.firstRouteAvailable = false;

                //Load routes and set them in the scope
               /*NextBusFactory.getRoutes().then(function(data) {
                    $scope.routesListVisible = true;

                    var rawRoutes = data;

                    angular.forEach(rawRoutes, function(rawRoute, index) {

                        var routeModel = new Route({
                            tag: rawRoute._tag,
                            title: rawRoute._title,
                            rank: index
                        });
                        $scope.routes.set(routeModel);

                        if (index === 0 ) {
                            $scope.firstRouteAvailable = true;
                            //open first route if available
                            opneFirstRoute();
                        }
                    });


                }
                    , rejectHandler);*/


            }

            function opneFirstRoute () {
                if( $scope.firstRouteAvailable && $scope.restOfMapLoaded){
                    $scope.toggleRoute($scope.routes.getAllAsArray()[0], true);
                }
            }

             function rejectHandler(res) {
                $log.error("An error has occurred");
                $log.error(res);
            }

            //init
            init();

        }]);