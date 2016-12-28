
angular.module('CitiesServiceFactoryModule', ['BusServiceFactoryModule', 'MapServiceFactoryModule'])
    .factory('CitiesServiceFactory', ['BusServiceFactory', 'MapServiceFactory', function (BusServiceFactory, MapServiceFactory) {

        var cities = {
            SFO: {
                code: "SFO",
                name: "San Francisco",
                busServiceName: "nextbus",
                agencyName : "sf-muni"
            },
            LAX : {
                code: "LAX",
                name: "Los Angeles",
                busServiceName: "nextbus",
                agencyName : "lametro"
            }
        }

        getBusService = function (cityCode) {

            var city = cities[cityCode];

            return BusServiceFactory.getBusService(city.busServiceName, city.agencyName);

        };

        getMapService = function (cityCode) {
            var city = cities[cityCode];

            return MapServiceFactory.getMapService(city.code);

        }




        return {
            getBusService: getBusService,
            getMapService: getMapService,
            cities: cities
        }

    }]);