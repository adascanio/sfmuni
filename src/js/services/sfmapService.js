
angular.module('SFMapService', []).factory('SFMap', ['$http', function ($http) {

    function getNeighborhoods() {
        $log("Service getNeighborhoods")
        return $http.get('static/js/sfmaps/neighborhoods.json');
    };

    function getFreeways() {
        $log("Service getFreeways")
        return $http.get('static/js/sfmaps/freeways.json');
    };

    function getArteries() {
        $log("Service getArteries")
        return $http.get('static/js/sfmaps/arteries.json');
    };

    function getStreets() {
        $log("Service getStreets")
        return $http.get('static/js/sfmaps/streets.json');
    };
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

        getStreets: getStreets

    }

}]);