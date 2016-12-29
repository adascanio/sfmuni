
angular.module('NextBusService', [])
    .factory('NextBusFactory', ['$http', '$cacheFactory', '$q', '$location', function ($http, $cacheFactory, $q, $location) {


        var Service = function (agencyName) {
            this.agencyName = agencyName;

            this.cache = {};
            this.cache[this.agencyName] = {};

            this.protocol = $location.protocol();

            this.url = this.protocol + "://webservices.nextbus.com/service/publicXMLFeed?a=" + this.agencyName+ "&";

            /**
             * Wrapper for <pre>$http</pre>
             * Error from nextbusService returns with status 200.
             * In case of Error message a reject is called instead
             * @param {Object} options $http#get configuration object 
             */

            this.service = {
                get: function (options) {
                    return $http.get(options).then(function (res) {
                        return $q(function (resolve, reject) {
                            var json = toJson(res.data);
                            if (!json || json.body.Error) {
                                var error = json ? json.body.Error : { Error: "An error has occurrd for the request ", args : options }
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

        };


        Service.prototype.getCache = function (key) {
            return this.cache[this.agencyName][key];
        }

        Service.prototype.setCache = function (key, value) {
            this.cache[this.agencyName][key] = value;
        }


        /**
         * Reject function for {@see service.get}
         */
        function fnReject(res) {
            return toJson(res);
        }

        /**
         * Get the list of all routes for agency sf-muni
         * @return {Promise} promise with routes value
         */
        Service.prototype.getRoutes = function () {

            var routesCache = this.getCache('routes');
            var that = this;

            if (routesCache) {
                return $q(function (resolve, reject) {
                    resolve(routesCache);
                });
            }

            return this.service.get(this.url + 'command=routeList')
                .then(function (res) {
                    var jsonRoutes = res.route;

                    that.setCache('routes', jsonRoutes);
                    return jsonRoutes;
                }
                );
        };

        /**
         * Get the route configuration
         * @param {string} routeTag
         * @return {Promise} promise with routeConfiguration value
         */
        Service.prototype.getRouteConfig = function (routeTag) {

            var that = this;

            var routesConfigCache = this.getCache("routes-config");

            if (routesConfigCache && routesConfigCache[routeTag]) {
                return $q(function (resolve, reject) {
                    resolve(routesConfigCache[routeTag]);
                });
            }
            return this.service.get(this.url + 'command=routeConfig&r=' + routeTag)
                .then(function (res) {

                    var routeConfig = res.route;
                    if (routesConfigCache == null) {
                        routesConfigCache = {};
                    }

                    var route = createRoute(routeConfig)
                    routesConfigCache[routeTag] = route;
                    that.setCache('routes-config', routesConfigCache);
                    return route;
                }
                );
        };

        /**
         * Get vehicles for a specific routes
         * @param {Object} params { t: time from last request, r : routeTag}
         */
        Service.prototype.getVehicleLocations = function (params) {
            var t = params.t;
            var r = params.r;
            if (t == null) {
                t = new Date().getTime() - 60000;
            }

            var routeParam = '';
            if (r) {
                routeParam += '&r=' + r;
            }

            return this.service.get(this.url + 'command=vehicleLocations&t=' + t + routeParam)
                .then(function (res) {
                    var vehicles = res.vehicle
                    return createVehicles(vehicles);
                }
                )
        }

        /**
         * Convert xml to json
         * @param {string} data the xml data
         * @return {Object} the json converted xml data 
         */
        function toJson(data) {
            var x2js = new X2JS();
            return x2js.xml2js(data);
        }

        /**
         * convert data to Geolocation features
         * 
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
         * Convert point returned by the service in GeoJson point feature
         * @param {Object|Array} rawVehicles data coming from xmlservice
         * @return {Array} GeoJson vehicle feature
         */
        function convertToPointFeature(rawVehicles) {

            if (!angular.isArray(rawVehicles)) {
                rawVehicles = rawVehicles ? [rawVehicles] : [];
            }

            var features = [];
            angular.forEach(rawVehicles, function (rawVehicle) {
                var v = {
                    "type": "Feature",
                    "properties": {
                        "id": rawVehicle._id,
                        "speedKmHr": rawVehicle._speedKmHr,
                        "routeTag": rawVehicle._routeTag,
                        "heading": rawVehicle._heading
                    },
                    "geometry": {
                        "type": "Point",
                        "coordinates": [rawVehicle._lon, rawVehicle._lat]
                    }
                };

                features.push(v);
            });

            return features;
        };

        /**
         * Decorate raw data coming from the xmlservice with GeoJson elements
         * @param {Object|Array} rawVehicles data coming from xmlservice
         * @return {Object} associative array of vehicles with GeoJson information. key = vehicleId 
         */
        function createVehicles(rawVehicles) {
            var vehicles = {};

            if (!angular.isArray(rawVehicles)) {
                rawVehicles = rawVehicles ? [rawVehicles] : [];
            }
            angular.forEach(rawVehicles, function (rawVehicle) {
                var vehicle = {
                    id: rawVehicle._id,
                    routeTag: rawVehicle._routeTag,
                    speedKmHr: rawVehicle._speedKmHr,
                    secsSinceReport: rawVehicle._secsSinceReport,
                    lat: rawVehicle._lat,
                    lon: rawVehicle._lon,
                    heading: rawVehicle._heading,
                    feature: convertToPointFeature(rawVehicle)

                };
                vehicles[vehicle.id] = vehicle;
            });
            return vehicles;
        };

        function createRoute (resRoute) {
           return {
                    tag: resRoute._tag,
                    title: resRoute._title,
                    color: "#" + resRoute._color,
                    oppositeColor: "#" + resRoute._oppositeColor,
                    features: convertToPathFeature(resRoute)
                }
        }

        return Service;

    }]);