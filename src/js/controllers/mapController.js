angular.module('MapCtrl', ['RouteModule', 'RouteCollectionModule', 'VehicleModule', 'VehicleCollectionModule'])
    .controller('MapController',
    ["$scope", "$timeout", "$routeParams", "$q", "Route", "RouteCollection", "Vehicle", "VehicleCollection", "$log"
        , function ($scope, $timeout, $routeParams, $q, Route, RouteCollection, Vehicle, VehicleCollection, $log) {

            /**
             * Default Polling frequency in milliseconds
             */
            var DEFAULT_POLLING_TICK = 15000;

            /**
             * Bus service 
             */
            var BusService = $scope.busService || $scope.$parent.busService;

            /**
             * Map service
             */
            var MapService = $scope.mapService || $scope.$parent.mapService;

            /**
             * Map configuration
             */

            var mapConfig = $scope.mapConfig || $scope.$parent.mapConfig;

            /**
             * Polling frequency in milliseconds
             */
            var POLLING_TICK = $scope.$parent.POLLING_TICK || DEFAULT_POLLING_TICK;

            /**
             * Visible vehicles 
             * */
            $scope.vehicles = {};

            /**
             * Trigger for checking vehicles position update
             */
            $scope.updateVehicles = 0;

            /**
             * Routes to be shown
             */
            $scope.selectedRoutes = {};

            /**
             * The map
             */
            $scope.map = {
                neighborhoods: null,
                streets: null,
                arteries: null,
                freeways: null,
            };


            /**
             * Promises reject function
             * @param {Object} res the promise result
             */
            function rejectHandler(res) {
                $log.error("An error has occurred");
                $log.error(res);
            };

            /**
             * Load Map data
             * @param {String} type type of map to be loaded (neighborhoods|streets|arteries|freeways)
             */
            function loadMapData(type) {
                if ($scope.map[type]) {
                    return;
                }
                return MapService.get(type)
                    .then(function (res) {
                        $scope.map[type] = res;

                    }, function (res) {
                        $log.error("Impossible to load " + type);
                        $log.error(res);

                    });
            };

            /**
             * Poll vehicle data every <pre>POLLING_TICK</pre> milliseconds
             */
            function polling() {

                fetchVehiclesLocation();

                $scope.timer = $timeout(polling, POLLING_TICK);
            };


            /**
             * Toggle Route path and start polling if requested
             * Set <pre>$scope.firstLoad</pre> to false
             * @param {String} routeTag
             * @param {boolean} poll start polling vehicles locationa after route has been loaded
             * 
             */
            $scope.toggleRoute = function (routeTag, poll) {


                if ($scope.selectedRoutes[routeTag]) {
                    delete $scope.selectedRoutes[routeTag]

                    $scope.$emit("map:route:hide", routeTag);

                }
                else {

                    BusService.getRouteConfig(routeTag).then(function (routeModel) {
                        
                        $scope.selectedRoutes[routeTag] = routeModel;

                        $scope.$emit("map:route:show", routeModel);

                        if (poll) {
                            polling();
                        }

                    },
                        rejectHandler)

                }

            }; // toggle route


            /**
             * fetch the vehicle locations according to the list of current selected routes
             */
            function fetchVehiclesLocation() {
                angular.forEach($scope.selectedRoutes, function (route, routeTag) {

                    BusService.getVehicleLocations({ r: routeTag })
                        .then(function (vehicles) {

                            $scope.vehicles = vehicles;

                            $scope.updateVehicles = !$scope.updateVehicles;

                            $scope.$emit("map:route:vehicle:loaded", routeTag);

                        }
                        , rejectHandler)

                });
            };

            /**
             * Get style for panel header information
             * @param {string} routeTag
             * @return {json} object containing the style to be applied to the header
             */
            $scope.getInfoHeaderStyle = function (routeTag) {
                var route = $scope.selectedRoutes[routeTag];
                if (routeTag == null || route == null) {
                    return {};
                }
                
                return {
                    'background-color': route.color,
                    'color': route.oppositeColor,
                }
            }

            /**
             * Get style for the heading (the arrow) information
             * @param {Object} vehicle
             * @return {json} object containing the style to be applied to the heaing (arrows indicating the direction)
             */
            $scope.getInfoHeadingStyle = function (vehicle) {
                if (vehicle == null || $scope.selectedRoutes[vehicle.routeTag] == null) {
                    return {};
                }
                var route = $scope.selectedRoutes[vehicle.routeTag];
                return {
                    'transform': 'rotate(' + vehicle.heading + 'deg)',
                    'color': route.color,
                }
            }

            function isMapLoaded(map) {
                
                var availableMaps = mapConfig.availableMaps;
                for (var i = 0, len = availableMaps.length; i < len; i++) {
                    if (!map[availableMaps[i]]) {
                        return false;
                    }
                }
                return true;
            }

            /**
             * Entry point function
             */
            function init() {

                $scope.$on("$destroy", function() {
                    if ($scope.timer) {
                        $timeout.cancel($scope.timer);
                    }
                });

                /**
                 * Register listener to toggle route
                 * @param {event} event the event
                 * @param {String} routeTag
                 * @param {boolean} poll if route is displayed, start polling for vehicle location
                 */
                $scope.$on("route:toggle", function (event, routeTag, poll) {
                    $scope.toggleRoute(routeTag, poll);
                });

                angular.forEach(mapConfig.availableMaps, function(value) {
                     loadMapData(value);
                })

                $scope.$watchCollection('map', function(newMap, oldMap){
                     if (isMapLoaded(newMap)) {
                        $scope.mapLoaded = true;
                        $scope.$emit("map:loaded");
                    }
                })



            } // init

            //START
            init();

        }]);