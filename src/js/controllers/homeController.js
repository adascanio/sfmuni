angular.module('HomeCtrl', ['NextBusService', 'SFOMapService', 'RouteModule', 'RouteCollectionModule', 'VehicleModule', 'VehicleCollectionModule'])
    .controller('HomeController',
    ["$scope", "$timeout", "NextBusFactory", "SFOMap", "$routeParams", "$q", "Route", "RouteCollection", "Vehicle", "VehicleCollection", "$log"
        , function($scope, $timeout, NextBusFactory, SFOMap, $routeParams, $q, Route, RouteCollection, Vehicle, VehicleCollection, $log) {

            $scope.pollVehiclesSubscribers = [];

            $scope.toggleRoutesSubscribers = [];

            $scope.selectedRoutes = new RouteCollection();

            /** list of available routes */
            $scope.routes = new RouteCollection();

            //open it by default when @see loadSuccess becomes true
            $scope.routesListVisible = false;

            $scope.mapConfig = {
                scale: 500000,
                rotate: [122.370, 0],
                center: [0, 37.770]
            }

            /**
             * API register for after polling event
             */
            $scope.addPollVehiclesSubscriber = function(fn) {
                $scope.pollVehiclesSubscribers.push(fn);
            };

            /**
             * API register for toggle routes
             */
            $scope.addToggleRoutesSubscribers = function(fn) {
                $scope.toggleRoutesSubscribers.push(fn);
            };

            /**
             * Toggle routesList panel
             */
            $scope.toggleRoutesList = function() {
                $scope.routesListVisible = !$scope.routesListVisible;
            };

            function rejectHandler(res) {
                $log.error("An error has occurred");
                $log.error(res);
            }

            /**
             * Load Map data
             */
            function loadMapData(type) {
                if ($scope[type]) {
                    return;
                }
                return SFOMap.get(type)()
                    .then(function(res) {
                        $scope[type] = res.data;

                    }, function(res) {
                        $log.error("Impossible to load " + type);
                        $log.error(res);

                    });
            }

            /**
             * fetch the vehicle locations according to the list of current selected routes
             */
            function fetchVehiclesLocation() {
                angular.forEach($scope.selectedRoutes.getAll(), function(route, routeTag) {

                    NextBusFactory.getVehicleLocations({ r: routeTag })
                        .then(function(data) {

                            angular.forEach($scope.pollVehiclesSubscribers, function(fn) {

                                var rawVehicles = data;

                                var vehicles = createVehicles(rawVehicles);

                                $scope.routes.get(routeTag).setWaiting(false);

                                fn(vehicles, routeTag, route.getColor());
                            });

                        }
                        , rejectHandler)

                });
            };

            function createVehicles(rawVehicles) {
                var vehicles = new VehicleCollection();

                if (!angular.isArray(vehicles)) {
                    rawVehicles = rawVehicles ? [rawVehicles] : [];
                }
                angular.forEach(rawVehicles, function(rawVehicle) {
                    var vehicle = new Vehicle({
                        id: rawVehicle._id,
                        routeTag: rawVehicle._routeTag,
                        speedKmHr: rawVehicle._speedKmHr,
                        secsSinceReport: rawVehicle._secsSinceReport,
                        lat: rawVehicle._lat,
                        lon: rawVehicle._lon,
                        feature: NextBusFactory.convertToPointFeature(rawVehicle)

                    });
                    vehicles.set(vehicle);
                });
                return vehicles;
            }

            /**
             * Toggle the selected flag to route object
             */
            function toggleSelectedRoute(route, isSelected) {

                var newRoute = $scope.routes.get(route.getTag());

                newRoute.setColor(route.getColor())
                newRoute.setOppositeColor(route.getOppositeColor())
                newRoute.setSelected(isSelected);
                newRoute.setWaiting(isSelected);

                $scope.routes.set(newRoute)

            };

            /**
             * API method toggle the activation of routes which should be displayed
             * @param {Route} route the route to be toggled
             */
            $scope.toggleRoute = function(route, poll) {
                var routeTag = route.getTag();;

                if ($scope.selectedRoutes.get(routeTag)) {
                    $scope.selectedRoutes.remove(routeTag)
                    angular.forEach($scope.toggleRoutesSubscribers, function(fn) {
                        fn(routeTag, false);
                    })
                    toggleSelectedRoute(route, false);

                }
                else {

                    NextBusFactory.getRouteConfig(routeTag).then(function(data) {
                        var resRoute = data;
                        var routeModel = new Route({
                            tag: resRoute._tag,
                            title: resRoute._title,
                            color: "#" + resRoute._color,
                            oppositeColor: "#" + resRoute._oppositeColor,
                            features: NextBusFactory.convertToPathFeature(resRoute)
                        })

                        $scope.selectedRoutes.set(routeModel);

                        angular.forEach($scope.toggleRoutesSubscribers, function(fn) {
                            fn(routeTag, true);
                        })
                        toggleSelectedRoute(routeModel, true);

                        if (poll) {
                            pollVeichels();
                        }

                    },
                        rejectHandler)

                }

            };

            $scope.onRouteToggle = function(fn, data, show) {
                fn(data, show);
            };

            /**
             * Execute polling to fetch the vehicle locations
             */
            function pollVeichels() {

                fetchVehiclesLocation()

                $timeout(pollVeichels, 15000)
            };

            /**
             * Entry point function
             */
            function init() {

                $scope.mapLoaded = {
                    neighborhoods: false,
                    streets: false,
                    arteries: false,
                    freeways: false
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

                        //the page can be displayed
                        $scope.restOfMapLoaded = true;

                        //open first route if available
                        opneFirstRoute();

                    });

                $scope.firstRouteAvailable = false;

                //Load routes and set them in the scope
                NextBusFactory.getRoutes().then(function(data) {
                    $scope.routesListVisible = true;

                    var rawRoutes = data;

                    angular.forEach(rawRoutes, function(rawRoute, index) {

                        var routeModel = new Route({
                            tag: rawRoute._tag,
                            title: rawRoute._title,
                            rank: index
                        });
                        $scope.routes.set(routeModel);

                        if (index === 0) {
                            $scope.firstRouteAvailable = true;
                            //open first route if available
                            opneFirstRoute();
                        }
                    });


                }
                    , rejectHandler);


            }

            function opneFirstRoute () {
                if( $scope.firstRouteAvailable && $scope.restOfMapLoaded){
                    $scope.toggleRoute($scope.routes.getAllAsArray()[0], true);
                }
            }

            //init
            init();

        }]);