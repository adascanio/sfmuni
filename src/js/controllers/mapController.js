angular.module('MapCtrl', ['RouteModule', 'RouteCollectionModule', 'VehicleModule', 'VehicleCollectionModule'])
    .controller('MapController',
    ["$scope", "$timeout", "$routeParams", "$q", "Route", "RouteCollection", "Vehicle", "VehicleCollection", "$log"
        , function ($scope, $timeout, $routeParams, $q, Route, RouteCollection, Vehicle, VehicleCollection, $log) {


            /**
             * Bus service 
             */
            var BusService = $scope.$parent.busService;

            /**
             * Map service
             */
            var MapService = $scope.$parent.mapService;

            /**
             * Polling frequency in milliseconds
             */
            var POLLING_TICK = $scope.$parent.POLLING_TICK || 15000;

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
                return MapService.get(type)()
                    .then(function (res) {
                        $scope.map[type] = res.data;

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

                $timeout(polling, POLLING_TICK);
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

            // CSS functions
            $scope.getInfoHeaderStyle = function (routeTag) {
                if (!routeTag) {
                    return {};
                }
                var route = $scope.selectedRoutes[routeTag];
                return {
                    'background-color': route.color,
                    'color': route.oppositeColor,
                }
            }

            $scope.getInfoHeadingStyle = function (vehicle) {
                if (!vehicle) {
                    return {};
                }
                var route = $scope.selectedRoutes[vehicle.routeTag];
                return {
                    'transform': 'rotate(' + vehicle.heading + 'deg)',
                    'color': route.color,
                }
            }

            /**
             * Entry point function
             */
            function init() {

                /**
                 * Register listener to toggle route
                 * @param {event} event the event
                 * @param {String} routeTag
                 * @param {boolean} poll if route is displayed, start polling for vehicle location
                 */
                $scope.$on("route:toggle", function (event, routeTag, poll) {
                    $scope.toggleRoute(routeTag, poll);
                });

                loadMapData('neighborhoods')
                    .then(function () {

                        return $q.all([loadMapData('streets'), loadMapData('arteries'), loadMapData('freeways')]);
                    })
                    .then(function () {

                        $scope.$emit("map:loaded");

                    });


            } // init

            //START
            init();

        }]);