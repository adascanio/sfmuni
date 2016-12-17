
angular.module('NextBusService', [])
.factory('NextBusFactory', ['$http', '$cacheFactory', '$q', '$location', function($http, $cacheFactory, $q, $location) {

    var cache = $cacheFactory('map-cache');

    cache.put('routes-config', {});

    var protocol = $location.protocol();

    var url =  protocol + "://webservices.nextbus.com/service/publicXMLFeed?";

    function getRoutes() {

        var routesCache = cache.get("routes");

        if (routesCache) {
            return $q(function(resolve, reject){
                resolve(routesCache);
            });
        }

        return $http.get(url + 'command=routeList&a=sf-muni')
                .then(function(res){
                    var jsonRoutes = toJson(res.data);
                    cache.put('routes', jsonRoutes);
                    return jsonRoutes;
                })
    };

    function getRouteConfig(routeId) {

        var routesConfigCache = cache.get("routes-config");

        if (routesConfigCache && routesConfigCache[routeId]) {
            return $q(function(resolve, reject){
                resolve(routesConfigCache[routeId]);
            });
        }
        return $http.get(url + 'command=routeConfig&a=sf-muni&r=' + routeId)
            .then(function(res){
                var routeConfig = toJson(res.data);
                routesConfigCache[routeId] = routeConfig;
                cache.put('routes-config', routesConfigCache )
                return routeConfig;
            });
    };

    function getVehicleLocations(params) {
        var t = params.t;
        var r = params.r;
        if (t == null) {
            t = new Date().getTime() - 60000;
        }

        var routeParam = '';
        if (r) {
            routeParam += '&r=' + r;
        }
        
        return $http.get(url + 'command=vehicleLocations&a=sf-muni&t='+ t + routeParam)
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