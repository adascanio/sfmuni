angular.module('HomeCtrl', ['NextBusService', 'MapCtrl', 'SFMapService', 'RouteModule','RouteCollectionModule'])
    .controller('HomeController', ["$scope", "NextBusFactory", "SFMap", "$routeParams", "$q", "Route", "RouteCollection"
    ,function ($scope, NextBusFactory, SFMap, $routeParams, $q, Route, RouteCollection) {

        $scope.pollVehiclesSubscribers = [];

        $scope.toggleRoutesSubscribers = [];

        $scope.loadSuccess = false;

        $scope.selectedRoutes = {};
        $scope.vehicles = {};

        /** list of routes available */
        $scope.routes = [];

        $scope.routesListVisible = false;

        $scope.mapConfig = { scale : 500000,
            rotate : [122.436,0],
            center :[0, 37.796]
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
        $scope.toggleRoutesList = function() {
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
            angular.forEach($scope.selectedRoutes, function (routeData, routeId) {

                NextBusFactory.getVehicleLocations({ r: routeId })
                    .then(function (data) {


                        angular.forEach($scope.pollVehiclesSubscribers, function (fn) {

                            fn(NextBusFactory.convertToPointFeature(data.body.vehicle), routeId);
                        });

                        console.log(data.body.vehicle);
                        console.log(routeId)
                        /*console.log(JSON.stringify($scope.vehicles[routeId]))*/
                    })

            });
        }

        /**
         * Toggle the selected flag to route object
         */
        function toggleSelectedRoute(routeId, isSelected) {

            var found = $scope.routes.find(function(item){

                           return  item._tag == routeId;
                        });
            
            found._selected = isSelected
            
        };

        /**
         * API method toggle the activation of routes which should be displayed
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
                angular.forEach($scope.toggleRoutesSubscribers, function(fn) {
                    fn(routeId, false);
                })
                toggleSelectedRoute(routeId, false);
                
            }
            else {

                //$scope.selectedRoutes[routeId] = { _title: data._title };
                NextBusFactory.getRouteConfig(routeId).then(function (data) {
                    var resRoute = data.body.route;
                    var routeModel = new Route({
                        tag : resRoute._tag,
                        title : resRoute._title,
                        color : "#" + resRoute._color,
                        oppositeColor : "#" + resRoute._oppositeColor,
                        features : NextBusFactory.convertToPathFeature(resRoute)
                    })

                    //$scope.selectedRoutes[routeId] = NextBusFactory.convertToPathFeature(data.body.route);
                    $scope.selectedRoutes[routeId] = routeModel;

                    angular.forEach($scope.toggleRoutesSubscribers, function(fn) {
                        fn(routeId, true);
                    })
                    toggleSelectedRoute(routeId, true);

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

    }]);