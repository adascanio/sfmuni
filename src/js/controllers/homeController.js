angular.module('HomeCtrl', ['NextBusService','MapCtrl','SFMapService']).controller('HomeController', function($scope, NextBusFactory, SFMap, $routeParams, $q) {
    
   $scope.loadSuccess = false;

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