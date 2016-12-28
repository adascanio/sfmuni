
angular.module('MapServiceFactoryModule', ['SFMapService'])
    .factory('MapServiceFactory', ['$http', '$cacheFactory', '$q', '$location', 'NextBusFactory', 'SFMap', function ($http, $cacheFactory, $q, $location, NextBusFactory, SFMap) {


        getMapService = function (mapName) {

            switch (mapName.toUpperCase()) {
                case 'SFO': return SFMap;
                default: return null;

            }

        }

        return {
            getMapService: getMapService
        }

    }]);