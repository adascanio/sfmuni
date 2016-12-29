
angular.module('CitiesServiceFactoryModule', ['BusServiceFactoryModule', 'MapServiceFactoryModule'])
    .factory('CitiesServiceFactory', ['BusServiceFactory', 'MapServiceFactory', function (BusServiceFactory, MapServiceFactory) {

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
                availableMaps: ['neighborhoods'],
                mapConfig: {
                    scale: 100000,
                    rotate: [118.243, 0],
                    center: [0, 34.052],
                    availableMaps: ['neighborhoods'],
                }
            }
        }

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