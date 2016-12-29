
angular.module('MapServiceFactoryModule', ['SFOMapService','LAXMapService'])
    .factory('MapServiceFactory', ['$http', '$cacheFactory', '$q', '$location', 'SFOMap', 'LAXMap',
    function ($http, $cacheFactory, $q, $location, SFOMap, LAXMap) {


        getMapService = function (mapName) {

            switch (mapName.toUpperCase()) {
                case 'SFO': return SFOMap;
                case 'LAX': return LAXMap;
                default: return null;

            }

        }

        return {
            getMapService: getMapService
        }

    }]);