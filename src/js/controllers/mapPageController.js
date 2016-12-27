angular.module('MapPageCtrl', ['NextBusService', 'SFMapService', 'RouteModule', 'RouteCollectionModule', 'VehicleModule', 'VehicleCollectionModule'])
    .controller('MapPageController',
    ["$scope", "$timeout", "NextBusFactory", "SFMap", "$routeParams", "$q", "Route", "RouteCollection", "Vehicle", "VehicleCollection", "$log"
        , function($scope, $timeout, NextBusFactory, SFMap, $routeParams, $q, Route, RouteCollection, Vehicle, VehicleCollection, $log) {
           
           function rejectHandler(res) {
                $log.error("An error has occurred");
                $log.error(res);
            };

            //Config inherited by the controller
            $scope.mapConfig = {
                scale: 500000,
                rotate: [122.370, 0],
                center: [0, 37.770]
            }

           //load the route list
           $scope.routes = new RouteCollection()

           //Load routes and set them in the scope
                NextBusFactory.getRoutes().then(function(data) {
                    
                    //display the route list panel at startup
                    $scope.routesListVisible = true;

                    var rawRoutes = data;

                    angular.forEach(rawRoutes, function(rawRoute, index) {

                        var routeModel = new Route({
                            tag: rawRoute._tag,
                            title: rawRoute._title,
                            rank: index
                        });
                        $scope.routes.set(routeModel);

                       
                    });


                }
                , rejectHandler);

            //select route
            $scope.$on("map:loaded", function(){

                var firstRoute = $scope.routes.getAllAsArray()[0];

                if (firstRoute) {
                    //toggleRoute(firstRoute, true);
                    $scope.$broadcast("route:selected", firstRoute.tag);
                    
                }

                
            });

            $scope.$on("map:route:show", function(event, route){
                
                var newRoute = $scope.routes.get(route.tag);

                newRoute.setColor(route.color)
                newRoute.setOppositeColor(route.oppositeColor)
                newRoute.setSelected(true);
                newRoute.setWaiting(true);
                $scope.routes.set(newRoute)

            });

            $scope.$on("map:route:hide", function(event, routeTag){
                
                var newRoute = $scope.routes.get(routeTag);

                newRoute.setSelected(false);
                newRoute.setWaiting(false);
                $scope.routes.set(newRoute)

            });

            $scope.$on("map:route:vehicle:loaded", function(event, routeTag){
                var newRoute = $scope.routes.get(routeTag);
                newRoute.setWaiting(false);
                $scope.routes.set(newRoute)
            })


            $scope.toggleRoute = function (route, isSelected) {

                $scope.$broadcast("route:selected", route.tag);

            };

            

            
           
        }]);