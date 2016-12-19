
angular.module('NextBusService', [])
    .factory('NextBusFactory', ['$http', '$cacheFactory', '$q', '$location', function ($http, $cacheFactory, $q, $location) {

        var cache = $cacheFactory('map-cache');

        cache.put('routes-config', {});

        var protocol = $location.protocol();

        var url = protocol + "://webservices.nextbus.com/service/publicXMLFeed?";

        function getRoutes() {

            var routesCache = cache.get("routes");

            if (routesCache) {
                return $q(function (resolve, reject) {
                    resolve(routesCache);
                });
            }

            return $http.get(url + 'command=routeList&a=sf-muni')
                .then(function (res) {
                    var jsonRoutes = toJson(res.data);
                    cache.put('routes', jsonRoutes);
                    return jsonRoutes;
                })
        };

        function getRouteConfig(routeId) {

            var routesConfigCache = cache.get("routes-config");

            if (routesConfigCache && routesConfigCache[routeId]) {
                return $q(function (resolve, reject) {
                    resolve(routesConfigCache[routeId]);
                });
            }
            return $http.get(url + 'command=routeConfig&a=sf-muni&r=' + routeId)
                .then(function (res) {
                    var routeConfig = toJson(res.data);
                    routesConfigCache[routeId] = routeConfig;
                    cache.put('routes-config', routesConfigCache)
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

            return $http.get(url + 'command=vehicleLocations&a=sf-muni&t=' + t + routeParam)
                .then(function (res) {
                    return toJson(res.data);
                })
        }


        /**
         * Convert xml to json
         */
        function toJson(data) {
            var x2js = new X2JS();
            return x2js.xml2js(data);
        }

        /**
         * convert data to Geolocation features
         */
        function convertToPathFeature(config) {

            var features = [];
            angular.forEach(config.path, function (path) {
                var route = {
                    "type": "Feature",
                    "properties": {
                        "color": config._color,
                        "oppositeColor": config._oppositeColor,
                        "title": config._title
                    },
                    "geometry": {
                        "type": "LineString",
                        "coordinates": []
                    }
                };
                angular.forEach(path.point, function (point) {
                    var p = [point._lon, point._lat];
                    route.geometry.coordinates.push(p);
                })

                features.push(route);
            });
            return features;
        };

        /**
         * Convert point returned by the service in Geolocation point feature
         */
        function convertToPointFeature(vehicles) {

            if (!angular.isArray(vehicles)) {
                vehicles = vehicles ? [vehicles] : [];
            }

            var features = [];
            angular.forEach(vehicles, function (vehicle) {
                var v = {
                    "type": "Feature",
                    "properties": {
                        "id": vehicle._id,
                        "speedKmHr": vehicle._speedKmHr,
                        "routeTag": vehicle._routeTag
                    },
                    "geometry": {
                        "type": "Point",
                        "coordinates": [vehicle._lon, vehicle._lat]
                    }
                };

                features.push(v);
            });

            return features;
        }

        return {
            getRoutes: getRoutes,
            getRouteConfig: getRouteConfig,
            getVehicleLocations: getVehicleLocations,
            convertToPathFeature: convertToPathFeature,
            convertToPointFeature: convertToPointFeature

        }

    }]);