
angular.module('NextBusService', []).factory('NextBusFactory', ['$http', function($http) {

    function getRoutes() {
        return $http.get('http://webservices.nextbus.com/service/publicXMLFeed?command=routeList&a=sf-muni');
    };

    function getRouteConfig(routeId) {
        return $http.get('http://webservices.nextbus.com/service/publicXMLFeed?command=routeConfig&a=sf-muni&r=' + routeId);
    };

    function getStopPrediction (stopId) {
        return $http.get('http://webservices.nextbus.com/service/publicXMLFeed?command=predictions&a=sf-muni&stopId=' + stopId);
    }

    function getVehicleLocations(routeId) {
        return $http.get('http://webservices.nextbus.com/service/publicXMLFeed?command=vehicleLocations&a=sf-muni&t=1144953500233&routeId=' + routeId);
        
    }


    return {
        get : function() {
            return $http.get('/api/cards');
        },

         getOne : function(id) {
            return $http.get('/api/cards/' + id);
        }
    }       

}]);