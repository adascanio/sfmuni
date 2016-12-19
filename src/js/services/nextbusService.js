
angular.module('NextBusService', [])
    .factory('NextBusFactory', ['$http', '$cacheFactory', '$q', '$location', function($http, $cacheFactory, $q, $location) {

        
        var cache = $cacheFactory('map-cache');

        //Cache the route configuration
        cache.put('routes-config', {});

        var protocol = $location.protocol();

        var url = protocol + "://webservices.nextbus.com/service/publicXMLFeed?";

        /**
         * Reject function for {@see service.get}
         */
        function fnReject(res) {
            return toJson(res);
        }

        /**
         * Error from nextbusService returns with status 200.
         * In case of Error message a reject is called instead
         */
        var service = {
            get: function(options) {
                return $http.get(options).then(function(res) {
                    return $q(function(resolve, reject) {
                        var json = toJson(res.data);
                        if (!json || json.body.Error) {
                            var error = json? json.body.Error : {Error : "An error has occurrd for the request " + options }
                            reject(error);
                        }
                        else {
                            resolve(json.body);
                        }
                    });
                }
                , fnReject)
            }
        }

        /**
         * Get the list of all routes for agency sf-muni
         */
        function getRoutes() {

            var routesCache = cache.get("routes");

            if (routesCache) {
                return $q(function(resolve, reject) {
                    resolve(routesCache);
                });
            }

            return service.get(url + 'command=routeList&a=sf-muni')
                .then(function(res) {
                    var jsonRoutes = res.route;

                    cache.put('routes', jsonRoutes);
                    return jsonRoutes;
                }
                );
        };

        /**
         * Get the route configuration
         * @param {string} routeTag
         */
        function getRouteConfig(routeTag) {

            var routesConfigCache = cache.get("routes-config");

            if (routesConfigCache && routesConfigCache[routeTag]) {
                return $q(function(resolve, reject) {
                    resolve(routesConfigCache[routeTag]);
                });
            }
            return service.get(url + 'command=routeConfig&a=sf-muni&r=' + routeTag)
                .then(function(res) {

                    var routeConfig = res.route;
                    routesConfigCache[routeTag] = routeConfig;
                    cache.put('routes-config', routesConfigCache)
                    return routeConfig;
                }
                );
        };

        /**
         * Get vehicles for a specific routes
         * @param {object} params { t: time from last request, r : routeTag}
         */
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

            return service.get(url + 'command=vehicleLocations&a=sf-muni&t=' + t + routeParam)
                .then(function(res) {
                    var vehicles = res.vehicle
                    return vehicles;
                }
                )
        }

        /**
         * Check if the error returned ia an error
         */
        function isError(data) {
            var x2js = new X2JS();
            return x2js.xml2js(data);
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
            angular.forEach(config.path, function(path) {
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
                angular.forEach(path.point, function(point) {
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
            angular.forEach(vehicles, function(vehicle) {
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