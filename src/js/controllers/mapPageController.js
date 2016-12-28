angular.module('MapPageCtrl', ['CitiesServiceFactoryModule', 'RouteModule', 'RouteCollectionModule'])
    .controller('MapPageController',
    ["$scope", "$timeout", "CitiesServiceFactory", "$routeParams", "$q", "Route", "RouteCollection", "$log"
        , function ($scope, $timeout, CitiesServiceFactory, $routeParams, $q, Route, RouteCollection, $log) {

            function rejectHandler(res) {
                $log.error("An error has occurred");
                $log.error(res);
            };

            var cityCode = $routeParams.cityCode;

            $scope.cities = CitiesServiceFactory.cities;

            $scope.mapService = CitiesServiceFactory.getMapService(cityCode);
            $scope.busService = CitiesServiceFactory.getBusService(cityCode);
            

            //Config inherited by the controller
            $scope.mapConfig = $scope.mapService.config;

            //load the route list
            $scope.routes = new RouteCollection();

            //Display flag for routes list
            $scope.routesListVisible = false;

            //Load routes and set them in the scope
            $scope.busService.getRoutes().then(function (data) {

                $scope.routesListVisible = true;

                var rawRoutes = data;

                angular.forEach(rawRoutes, function (rawRoute, index) {

                    var routeModel = new Route({
                        tag: rawRoute._tag,
                        title: rawRoute._title,
                        rank: index
                    });
                    $scope.routes.set(routeModel);


                });
                $scope.routesLoaded = true;

            }
                , rejectHandler);

            //select route
            $scope.$on("map:loaded", function () {

                $scope.$watch("routesLoaded", function (newValue, oldValue) {

                    if (newValue) {

                        var firstRoute = $scope.routes.getAllAsArray()[0];

                        if (firstRoute) {

                            //Toggle the first route and ask for immediate polling
                            $scope.$broadcast("route:toggle", firstRoute.tag, true);

                        }

                    }

                })

            });


            /**
             * Update route status for routeslist display
             */
            $scope.$on("map:route:show", function (event, route) {

                var newRoute = $scope.routes.get(route.tag);

                newRoute.setColor(route.color)
                newRoute.setOppositeColor(route.oppositeColor)
                newRoute.setSelected(true);
                newRoute.setWaiting(true);
                $scope.routes.set(newRoute)

            });

            /**
             * Update route status for hiding routes in routeslist
             */
            $scope.$on("map:route:hide", function (event, routeTag) {

                var newRoute = $scope.routes.get(routeTag);

                newRoute.setSelected(false);
                newRoute.setWaiting(false);
                $scope.routes.set(newRoute)

            });

            /**
             * Update route waiting status whens vehicle locations have been fetched
             */
            $scope.$on("map:route:vehicle:loaded", function (event, routeTag) {
                var newRoute = $scope.routes.get(routeTag);
                newRoute.setWaiting(false);
                $scope.routes.set(newRoute)
            })


            /**
             * Inform sub controllers that a route has been toggled 
             */
            $scope.toggleRoute = function (route) {

                $scope.$broadcast("route:toggle", route.tag);

            };

            /**
             * Toggle the route list
             */
            $scope.toggleRoutesList = function () {
                $scope.routesListVisible = !$scope.routesListVisible;
            }


        }]);