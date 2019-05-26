
angular.module('CitiesServiceFactoryModule', ['BusServiceFactoryModule', 'MapServiceFactoryModule'])
    .factory('CitiesServiceFactory', ['BusServiceFactory', 'MapServiceFactory', function (BusServiceFactory, MapServiceFactory) {

        /* eslint-disable */
        var cities = {
            SFO: {
                code: "SFO",
                name: "San Francisco",
                busServiceName: "nextbus",
                agencyName: "sf-muni",
                mapConfig: {
                    scale: 500000,
                    rotate: [122.370, 0],
                    center: [0, 37.770],
                    availableMaps: ['neighborhoods', 'streets', 'arteries', 'freeways']
                }
            },
            LAX: {
                code: "LAX",
                name: "Los Angeles",
                busServiceName: "nextbus",
                agencyName: "lametro",
                mapConfig: {
                    scale: 100000,
                    rotate: [118.243, 0],
                    center: [0, 34.052],
                    availableMaps: ['neighborhoods'],
                }
            },
            BOS: {
                code: "BOS",
                name: "Boston",
                busServiceName: "nextbus",
                agencyName: "mbta",
                mapConfig: {
                    scale: 250000,
                    rotate: [71.059, 0],
                    center: [0, 42.330],
                    availableMaps: ['neighborhoods'],
                }
            },
            YTZ: {
                code: "YTZ",
                name: "Torano",
                busServiceName: "nextbus",
                agencyName: "ttc",
                mapConfig: {
                    scale: 250000,
                    rotate: [79.384293, 0],
                    center: [0, 43.653908],
                    availableMaps: ['neighborhoods'],
                }
            }
        }
        /* eslint-enable */

        getBusService = function (cityCode) {

            var city = cities[cityCode];

            return BusServiceFactory.getBusService(city.busServiceName, city.agencyName);

        };

        getMapService = function (cityCode) {
            var city = cities[cityCode];

            return MapServiceFactory.getMapService(city);

        }




        return {
            getBusService: getBusService,
            getMapService: getMapService,
            cities: cities
        }

    }]);