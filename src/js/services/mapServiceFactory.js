
angular.module('MapServiceFactoryModule', ['SFOMapService','LAXMapService', 'LocalMapServiceModule'])
    .factory('MapServiceFactory', ['$http', '$cacheFactory', '$q', '$location', 'SFOMap', 'LAXMap', 'LocalMapService',
    function ($http, $cacheFactory, $q, $location, SFOMap, LAXMap, LocalMapService) {


        getMapService = function (config) {

            switch (config.code.toUpperCase()) {
                case 'SFO': return new LocalMapService(config);
                case 'LAX': return new LocalMapService(config);
                default: return null;

            }

        }

        return {
            getMapService: getMapService
        }

    }]);