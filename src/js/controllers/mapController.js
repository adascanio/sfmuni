angular.module('MapCtrl', ['NextBusService', 'SFMapService', 'RouteModule', 'RouteCollectionModule', 'VehicleModule', 'VehicleCollectionModule'])
    .controller('MapController',
    ["$scope", "$timeout", "NextBusFactory", "SFMap", "$routeParams", "$q", "Route", "RouteCollection", "Vehicle", "VehicleCollection", "$log"
        , function($scope, $timeout, NextBusFactory, SFMap, $routeParams, $q, Route, RouteCollection, Vehicle, VehicleCollection, $log) {


            /*$scope.mapConfig = {
                scale: 500000,
                rotate: [122.370, 0],
                center: [0, 37.770]
            }*/

            $scope.vehicles = {};

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

                        $scope.$emit("map:loaded");

                    });


            } // init

            $scope.selectedRoutes = {}

            //flag for checking when any route has been requested for the first time
            $scope.firstLoad = true;          
            
            $scope.$on("route:selected", function(event, routeTag, poll){
                $scope.toggleRoute(routeTag, poll);
            });

            /*$scope.$on("polling:start", function(event){
                polling();
            });*/

            $scope.toggleRoute = function(routeTag, poll) {
                

                if ($scope.selectedRoutes[routeTag]) {
                    delete $scope.selectedRoutes[routeTag]
                    
                    $scope.$emit("map:route:hide", routeTag);

                }
                else {

                    NextBusFactory.getRouteConfig(routeTag).then(function(data) {
                        var resRoute = data;
                        var routeModel = {
                            tag: resRoute._tag,
                            title: resRoute._title,
                            color: "#" + resRoute._color,
                            oppositeColor: "#" + resRoute._oppositeColor,
                            features: NextBusFactory.convertToPathFeature(resRoute)
                        }
                        $scope.selectedRoutes[routeTag] = routeModel;

                       $scope.$emit("map:route:show", routeModel);

                       if ($scope.firstLoad) {
                           polling();
                           $scope.firstLoad =false;
                       }

                    },
                        rejectHandler)

                }

            }; // toggle route

            function polling() {

                fetchVehiclesLocation ();

                $timeout(polling, 15000);
            }

            $scope.updateVehicles = 0;

            /**
             * fetch the vehicle locations according to the list of current selected routes
             */
            function fetchVehiclesLocation() {
                angular.forEach($scope.selectedRoutes, function(route, routeTag) {

                    NextBusFactory.getVehicleLocations({ r: routeTag })
                        .then(function(data) {

                            var rawVehicles = data;

                            var vehicles = createVehicles(rawVehicles);

                            $scope.vehicles = vehicles;

                            //$scope.routes.get(routeTag).setWaiting(false);

                            //fn(vehicles, routeTag, route.getColor());
                            $scope.updateVehicles = !$scope.updateVehicles;


                            $scope.$emit("map:route:vehicle:loaded", routeTag);
                            

                        }
                        , rejectHandler)

                });
            };


            function createVehicles(rawVehicles) {
                var vehicles = {};

                if (!angular.isArray(rawVehicles)) {
                    rawVehicles = rawVehicles ? [rawVehicles] : [];
                }
                angular.forEach(rawVehicles, function(rawVehicle) {
                    var vehicle = {
                        id: rawVehicle._id,
                        routeTag: rawVehicle._routeTag,
                        speedKmHr: rawVehicle._speedKmHr,
                        secsSinceReport: rawVehicle._secsSinceReport,
                        lat: rawVehicle._lat,
                        lon: rawVehicle._lon,
                        heading : rawVehicle._heading,
                        feature: NextBusFactory.convertToPointFeature(rawVehicle)

                    };
                    vehicles[vehicle.id] = vehicle;
                });
                return vehicles;
            }
 

             function rejectHandler(res) {
                $log.error("An error has occurred");
                $log.error(res);
            }

            // CSS functions
            $scope.getInfoHeaderStyle = function(routeTag) {
                if( !routeTag) {
                    return {};
                }
                var route = $scope.selectedRoutes[routeTag];
                return {
                    'background-color' : route.color,
                    'color' : route.oppositeColor,
                }
            }

            $scope.getInfoHeadingStyle = function(vehicle) {
                if( !vehicle) {
                    return {};
                }
                var route = $scope.selectedRoutes[vehicle.routeTag];
                return {
                    'transform' : 'rotate(' + vehicle.heading + 'deg)',
                    'color' : route.color,
                }
            }


            //init
            init();

        }]);