
angular.module('MapServiceFactoryModule', ['LocalMapServiceModule'])
    .factory('MapServiceFactory', ['LocalMapService',
    function (LocalMapService) {


        getMapService = function (config) {

            //local by default
            if (!config.mapUrl) {
                return new LocalMapService(config);
            }

        }

        return {
            getMapService: getMapService
        }

    }]);