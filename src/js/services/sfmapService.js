
angular.module('SFMapService', []).factory('SFMap', ['$http', '$log', function ($http, $log) {

    function getNeighborhoods() {
        $log.info("Service getNeighborhoods")
        return $http.get('static/js/sfmaps/neighborhoods.json');
    };

    function getFreeways() {
        $log.info("Service getFreeways")
        return $http.get('static/js/sfmaps/freeways.json');
    };

    function getArteries() {
        $log.info("Service getArteries")
        return $http.get('static/js/sfmaps/arteries.json');
    };

    function getStreets() {
        $log.info("Service getStreets")
        return $http.get('static/js/sfmaps/streets.json');
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