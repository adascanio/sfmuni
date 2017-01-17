
angular.module('LocalMapServiceModule', []).factory('LocalMapService', ['$http', '$log', '$cacheFactory', '$q',
    function ($http, $log, $cacheFactory, $q) {


        var Service = function (cityConfig) {
            this.cityCode = cityConfig.code.toLowerCase();
            this.mapConfig = cityConfig.mapConfig;

            this.baseUrl = 'static/js/maps/' + this.cityCode + "/";

            this.cacheName = 'map:' + this.cityCode;
            this.cache = $cacheFactory.get(this.cacheName) || $cacheFactory(this.cacheName);

        }

        Service.prototype.cached = function (type) {
            return this.cache.get(type);
        }

        Service.prototype.httpGet = function (options, cacheOptions) {

            var useCache = cacheOptions ? cacheOptions.useCache : false;

            if (useCache) {
                var cache = $cacheFactory.get(cacheOptions.cacheName);
                var cachedJson = cache ? cache.get(cacheOptions.key) : null;
                if (cachedJson) {
                    $log.info("Map " + cacheOptions.cacheName + "->" + cacheOptions.key + " from cache");
                    return $q(function (resolve, reject) {
                        resolve(cachedJson);
                    })
                }
            }

            var that = this;
            return $http.get(options).then(function (res) {
                return $q(function (resolve, reject) {
                    try {
                        var json = angular.fromJson(res.data);
                        if (useCache) {
                            var cache = $cacheFactory.get(cacheOptions.cacheName) || $cacheFactory(cacheOptions.cacheName);
                            cache.put(cacheOptions.key, json);
                        }

                        resolve(json);
                    }
                    catch (e) {
                        reject({ Error: "An error has occurrd for the requested map ", args: options, trace: e });
                    }
                });
            }
                , function (res) {
                    return res;
                })
        };

        Service.prototype.get = function (type) {

            if (this.isAvailable(type)) {
                return this.httpGet(this.baseUrl + type + '.json', { useCache: true, cacheName: this.cacheName, key: type });
            }
            return false;
        };


        Service.prototype.getNeighborhoods = function () {

            return this.get('neighborhoods')
        };

        Service.prototype.getStreets = function () {

            return this.get('streets')
        };

        Service.prototype.getArteries = function () {

            return this.get('arteries')
        };

        Service.prototype.getFreeways = function () {

            return this.get('freeways')
        };

        Service.prototype.isAvailable = function (type) {

            return this.mapConfig.availableMaps.find(function (mapType) {
                return type === mapType
            })
        };

        return Service;

    }]);