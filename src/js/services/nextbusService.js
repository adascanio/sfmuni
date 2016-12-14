
angular.module('NextBusService', []).factory('NextBusFactory', ['$http', function($http) {

    return {
        get : function() {
            return $http.get('/api/cards');
        },

         getOne : function(id) {
            return $http.get('/api/cards/' + id);
        }
    }       

}]);