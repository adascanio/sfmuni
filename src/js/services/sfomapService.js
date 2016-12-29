
angular.module('SFOMapService', []).factory('SFOMap', ['$http', '$log', function ($http, $log) {

    var base = 'static/js/maps/sfo/'

    function getNeighborhoods() {
        $log.info("Service getNeighborhoods")
        return $http.get(base + 'neighborhoods.json');
    };

    function getFreeways() {
        $log.info("Service getFreeways")
        return $http.get(base + 'freeways.json');
    };

    function getArteries() {
        $log.info("Service getArteries")
        return $http.get(base + 'arteries.json');
    };

    function getStreets() {
        $log.info("Service getStreets")
        return $http.get(base + 'streets.json');
    };

    var config = {
        scale: 500000,
        rotate: [122.370, 0],
        center: [0, 37.770]
    }

    return {

        get: function (type) {
            switch (type) {
                case 'neighborhoods': return getNeighborhoods
                case 'freeways': return getFreeways
                case 'arteries': return getArteries
                case 'streets': return getStreets
            }
        },

        getNeighborhoods: getNeighborhoods,

        getFreeways: getFreeways,

        getArteries: getArteries,

        getStreets: getStreets,

        config: config

    }

}]);