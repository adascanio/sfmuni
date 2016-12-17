angular.module('HomeCtrl', ['NextBusService', 'MapCtrl', 'SFMapService'])
    .controller('HomeController', function ($scope, NextBusFactory, SFMap, $routeParams, $q) {

        $scope.pollVehiclesSubscribers = [];

        $scope.loadSuccess = false;

        $scope.selectedRoutes = {};
        $scope.vehicles = {};

        /**
         * API register for after polling event
         */
        $scope.addPollVehiclesSubscriber = function (fn) {
            $scope.pollVehiclesSubscribers.push(fn);
        }

        /**
         * Load load Map data
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
            angular.forEach($scope.selectedRoutes, function (value, routeId) {

                NextBusFactory.getVehicleLocations({ r: routeId })
                    .then(function (data) {


                        angular.forEach($scope.pollVehiclesSubscribers, function (fn) {

                            fn(convertToPointFeature(data.body.vehicle), routeId);
                        });

                        console.log(data.body.vehicle);
                        console.log(routeId)
                        /*console.log(JSON.stringify($scope.vehicles[routeId]))*/
                    })

            });
        }



        

        /**
         * API method toggle the activation of routes which might be displayed
         * @param {Object} data
         * <pre>
         *   {String} _tag - the route tag
         *   {String} _title - the route title 
         * </pre>
         */
        $scope.toggleRoute = function (data) {
            var routeId = data._tag;

            
            if ($scope.selectedRoutes[routeId]) {
                delete $scope.selectedRoutes[routeId];
                $scope.command = "remove";
                $scope.selectedRoute = null;
                
            }
            else {

                $scope.selectedRoutes[routeId] = { _title: data._title };
                NextBusFactory.getRouteConfig(routeId).then(function (data) {
                    $scope.selectedRoutes[routeId] = convertToPathFeature(data.body.route);

                    $scope.selectedRoute = routeId;

                })

            }

        }

        //TODO doc
        function convertToPathFeature(config) {

            var features = [];
            angular.forEach(config.path, function (path) {
                var route = {
                    "type": "Feature",
                    "properties": {
                        "color": config._color,
                        "oppositeColor": config._oppositeColor,
                        "title": config._title
                    },
                    "geometry": {
                        "type": "LineString",
                        "coordinates": []
                    }
                };
                angular.forEach(path.point, function (point) {
                    var p = [point._lon, point._lat];
                    route.geometry.coordinates.push(p);
                })

                features.push(route);
            });
            return features;
        }

        //TODO doc
        function convertToPointFeature(vehicles) {

            if (!angular.isArray(vehicles)) {
                vehicles = vehicles ? [vehicles] : [];
            }

            var features = [];
            angular.forEach(vehicles, function (vehicle) {
                var v = {
                    "type": "Feature",
                    "properties": {
                        "id": vehicle._id,
                        "speedKmHr": vehicle._speedKmHr,
                        "routeTag": vehicle._routeTag
                    },
                    "geometry": {
                        "type": "Point",
                        "coordinates": [vehicle._lon, vehicle._lat]
                    }
                };

                features.push(v);
            });

            return features;
        }


        /**
         * Execute polling to fetch the vehicle locations
         */
        function pollVeichels() {

            fetchVehiclesLocation()

            setTimeout(pollVeichels, 15000)
        };

        /**
         * Entry point function
         */
        function init() {


            //TODO: otpimize load map data
            loadMapData('neighborhoods')
            .then ( function () {
                
                return loadMapData('streets')
            })
            .then(function(){
                
                return $q.all([loadMapData('freeways'), loadMapData('arteries')])
              
            })
            .then(function(){
                    $scope.loadSuccess = true;
                    return NextBusFactory.getRoutes();
            })
            //Load routes and set them in the scope
            .then(function (data) {

                $scope.toggleRoute(data.body.route[0])
                $scope.routes = data.body.route;
            });
            
            pollVeichels();
            
        }

        //init
        init();

        

    });