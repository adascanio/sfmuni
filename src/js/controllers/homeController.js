angular.module('HomeCtrl', ['NextBusService', 'SFMapService', 'RouteModule', 'RouteCollectionModule', 'VehicleModule', 'VehicleCollectionModule'])
    .controller('HomeController',
    ["$scope", "$timeout", "NextBusFactory", "SFMap", "$routeParams", "$q", "Route", "RouteCollection", "Vehicle", "VehicleCollection"
        , function ($scope, $timeout, NextBusFactory, SFMap, $routeParams, $q, Route, RouteCollection, Vehicle, VehicleCollection) {

            $scope.pollVehiclesSubscribers = [];

            $scope.toggleRoutesSubscribers = [];

            $scope.loadSuccess = false;

            $scope.selectedRoutes = new RouteCollection();

            /** list of available routes */
            $scope.routes = new RouteCollection();

            $scope.routesListVisible = false;

            $scope.mapConfig = {
                scale: 500000,
                rotate: [122.370, 0],
                center: [0, 37.770]
            }

            /**
             * API register for after polling event
             */
            $scope.addPollVehiclesSubscriber = function (fn) {
                $scope.pollVehiclesSubscribers.push(fn);
            };

            /**
             * API register for toggle routes
             */
            $scope.addToggleRoutesSubscribers = function (fn) {
                $scope.toggleRoutesSubscribers.push(fn);
            };

            /**
             * Toggle routesList panel
             */
            $scope.toggleRoutesList = function () {
                $scope.routesListVisible = !$scope.routesListVisible;
                console.log($scope.routesListVisible)
            };

            /**
             * Load Map data
             */
            function loadMapData(type) {
                console.log("Loading " + type);
                if ($scope[type]) {
                    console.log("From cache");
                    return;
                }
                return SFMap.get(type)()
                    .then(function (res) {
                        console.log("Setting " + type);
                        $scope[type] = res.data;

                    }, function (res) {
                        console.log("Impossible to load " + type);

                    });
            }

            /**
             * fetch the vehicle locations according to the list of current selected routes
             */
            function fetchVehiclesLocation() {
                angular.forEach($scope.selectedRoutes.getAll(), function (route, routeId) {

                    NextBusFactory.getVehicleLocations({ r: routeId })
                        .then(function (data) {

                            angular.forEach($scope.pollVehiclesSubscribers, function (fn) {

                                var rawVehicles = data.body.vehicle;

                                var vehicles = createVehicles(rawVehicles);

                                fn(vehicles, routeId, route.getColor());
                            });

                            console.log(data.body.vehicle);
                            console.log(routeId)
                        })

                });
            };

            function createVehicles(rawVehicles) {
                var vehicles = new VehicleCollection();

                if (!angular.isArray(vehicles)) {
                    rawVehicles = rawVehicles ? [rawVehicles] : [];
                }
                angular.forEach(rawVehicles, function (rawVehicle) {
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

                var newRoute = $scope.routes.get(route.getTag())

                newRoute.setColor(route.getColor())
                newRoute.setOppositeColor(route.getOppositeColor())
                newRoute.setSelected(isSelected);

                $scope.routes.set(newRoute)

            };

            /**
             * API method toggle the activation of routes which should be displayed
             * @param {Route} route the route to be toggled
             */
            $scope.toggleRoute = function (route, poll) {
                var routeTag = route.getTag();;

                if ($scope.selectedRoutes.get(routeTag)) {
                    $scope.selectedRoutes.remove(routeTag)
                    angular.forEach($scope.toggleRoutesSubscribers, function (fn) {
                        fn(routeTag, false);
                    })
                    toggleSelectedRoute(route, false);

                }
                else {

                    NextBusFactory.getRouteConfig(routeTag).then(function (data) {
                        var resRoute = data.body.route;
                        var routeModel = new Route({
                            tag: resRoute._tag,
                            title: resRoute._title,
                            color: "#" + resRoute._color,
                            oppositeColor: "#" + resRoute._oppositeColor,
                            features: NextBusFactory.convertToPathFeature(resRoute)
                        })

                        $scope.selectedRoutes.set(routeModel);

                        angular.forEach($scope.toggleRoutesSubscribers, function (fn) {
                            fn(routeTag, true);
                        })
                        toggleSelectedRoute(routeModel, true);

                        if (poll) {
                            pollVeichels();
                        }

                    })

                }

            };

            $scope.onRouteToggle = function (fn, data, show) {
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


                //TODO: otpimize load map data
                loadMapData('neighborhoods')
                    .then(function () {

                        return loadMapData('streets')
                    })
                    .then(function () {

                        return $q.all([loadMapData('freeways'), loadMapData('arteries')])

                    })
                    .then(function () {
                        $scope.loadSuccess = true;
                        return NextBusFactory.getRoutes();
                    })
                    //Load routes and set them in the scope
                    .then(function (data) {

                        var rawRoutes = data.body.route;


                        angular.forEach(rawRoutes, function (rawRoute, index) {

                            var routeModel = new Route({
                                tag: rawRoute._tag,
                                title: rawRoute._title
                            });
                            $scope.routes.set(routeModel);

                            if (index === 0) {
                                $scope.toggleRoute(routeModel, true);
                            }
                        });


                    });


            }

            //init
            init();

        }]);