
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

    function getVehicleLocations(params) {
        var t = params.t;
        var r = params.r;
        if (t == null) {
            t = new Date().getTime() - 15000;
        }

        var routeParam = '';
        if (r) {
            routeParam += '&r=' + r;
        }
        
        return $http.get('http://webservices.nextbus.com/service/publicXMLFeed?command=vehicleLocations&a=sf-muni&t='+ t + routeParam)
                        .then(function(res){
                            return toJson(res.data);
                        })
    }

    
    function toJson(data){
        var x2js = new X2JS(); 
        return x2js.xml2js(data);
    }

    return {
        getRoutes : getRoutes,
        getRouteConfig : getRouteConfig,
        getVehicleLocations :getVehicleLocations
    }

}]);