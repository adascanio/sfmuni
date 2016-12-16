angular.module('HomeCtrl', ['NextBusService','MapCtrl','SFMapService']).controller('HomeController', function($scope, NextBusFactory, SFMap, $routeParams, $q) {
    
   $scope.loadSuccess = false;

   $scope.selectedRoutes = {};
   $scope.vehicles = {};

  function loadData (type ) {
       console.log("Loading " + type);
        if ($scope[type]) {
            console.log("From cache");
            return;
        }
        return SFMap.get(type)()
            .then(function(res){
            console.log("Setting "+ type);
            $scope[type] = res.data;
    
            }, function(res){
                console.log("Impossible to load " + type);
                
            });
   }

   $q.all([loadData('neighborhoods'),loadData('freeways'),loadData('arteries'),loadData('streets')]).then(function(){
       $scope.loadSuccess = true;
       console.log("DONE");
   });

   NextBusFactory.getRoutes().then(function(data){
        $scope.routes = data.body.route;
   });
  
   $scope.onSelectRoute = function(data) {
       var routeId = data._tag;
       
       if ($scope.selectedRoutes[routeId]) {
           delete $scope.selectedRoutes[routeId];
           $scope.command = "remove";
           $scope.selectedRoute = null;
       }
       else {
           $scope.selectedRoutes[routeId] = {_title : data._title };
           NextBusFactory.getRouteConfig(routeId).then(function(data){
                $scope.selectedRoutes[routeId] =  convertToPathFeature(data.body.route);
                
                $scope.selectedRoute = routeId;
                         
           })
           
       }
       
   }

   function convertToPathFeature(config) {
       
       var features = [];
       angular.forEach(config.path, function(path) {
           var route =  {
                    "type" : "Feature", 
                        "properties" : {
                            "color" : config._color,
                            "oppositeColor" : config._oppositeColor,
                            "title" : config._title
                        },
                        "geometry" : {
                        "type" : "LineString",
                        "coordinates" : [] 
                        }
                    };
            angular.forEach(path.point, function(point) {
                var p = [point._lon, point._lat];
                route.geometry.coordinates.push(p);
            })

            features.push(route);
       } );
      return features;
   }

   function convertToPointFeature(vehicles) {
       
       var features = [];
       angular.forEach(vehicles, function(vehicle) {
           var v =  {
                    "type" : "Feature",
                        "properties" : {
                            "id" : vehicle._id,
                            "speedKmHr" : vehicle._speedKmHr,
                            "routeTag" : vehicle._routeTag
                        },
                        "geometry" : {
                        "type" : "Point",
                        "coordinates" : [vehicle._lon, vehicle._lat] 
                        }
                    };
            
            features.push(v);
       } );

      return features;
   }

   //TODO see if it can be done with an API from here
   
  function pollVeichels(fn, scope) {
            $scope.pollVehicles = !$scope.pollVehicles;
            
            angular.forEach($scope.selectedRoutes, function(value, routeId){
               
                NextBusFactory.getVehicleLocations({r : routeId})
                    .then(function(data){
                    $scope.vehicles[routeId] = convertToPointFeature(data.body.vehicle);
                    
                    console.log($scope.vehicles[routeId])

                    console.log(JSON.stringify($scope.vehicles[routeId]))
                })

            });

            setTimeout(pollVeichels, 15000)
        };

pollVeichels();


 
   
    /*if ($routeParams.id != null) {
        Sprint.getOne($routeParams.id).then(function(res){
            $scope.sprint =  res.data;
        });
    }
    else {
        Sprint.get().then(function(res){
            $scope.sprints =  res.data;
        });
    }*/
    
});