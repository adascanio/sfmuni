
angular.module('BusServiceFactoryModule', ['NextBusService'])
    .factory('BusServiceFactory', ['$http', '$cacheFactory', '$q', '$location', 'NextBusFactory', function ($http, $cacheFactory, $q, $location, NextBusFactory) {


        getBusService = function (serviceName, agencyName) {

            switch (serviceName.toLowerCase()) {
                case 'nextbus': return new NextBusFactory(agencyName);
                default: return null;

            }

        }

        return {
            getBusService: getBusService
        }

    }]);