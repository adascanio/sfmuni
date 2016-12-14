
angular.module('NextBusService', []).factory('NextBusFactory', ['$http', function($http) {

    function getRoutes() {
        return $http.get('http://webservices.nextbus.com/service/publicXMLFeed?command=routeList&a=sf-muni')
                .then(function(res){
                    return toJson(res.data);
                })
    };

    function getRouteConfig(routeId) {
        return $http.get('http://webservices.nextbus.com/service/publicXMLFeed?command=routeConfig&a=sf-muni&r=' + routeId)
            .then(function(res){
                return toJson(res.data);
            });
    };

    function getStopPrediction (stopId) {
        return $http.get('http://webservices.nextbus.com/service/publicXMLFeed?command=predictions&a=sf-muni&stopId=' + stopId);
    }

    function getVehicleLocations(routeId) {
        return $http.get('http://webservices.nextbus.com/service/publicXMLFeed?command=vehicleLocations&a=sf-muni&t=1144953500233&routeId=' + routeId);
    }

    function toJson(data){
        var x2js = new X2JS(); 
        return x2js.xml2js(data);
    }

    return {
        getRoutes : getRoutes,
        getRouteConfig : getRouteConfig
    }

}]);