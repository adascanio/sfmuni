
angular.module('VehicleModule', [])
    .factory('Vehicle', [function () {

        function Vehicle(props) {
            this.id = props.id || "??";
            this.routeTag = props.routeTag || "??";
            this.speedKmHr = props.speedKmHr || "0";
            this.secsSinceReport = props.secsSinceReport || "0";
            this.lat = props.lat || 0;
            this.lon = props.lon || 0;
            this.feature = props.feature || {};

        }

        Vehicle.prototype.getId = function () {
            return this.id;
        }

        Vehicle.prototype.getRouteTag = function () {
            return this.routeTag;
        }
        Vehicle.prototype.getSpeedKmHr = function () {
            return this.speedKmHr;
        }
        Vehicle.prototype.getSecsSinceReport = function () {
            return this.secsSinceReport;
        }
        Vehicle.prototype.getLat = function () {
            return this.lat;
        }
        Vehicle.prototype.getLon = function () {
            return this.lon;
        }
        Vehicle.prototype.getFeature = function () {
            return this.feature;
        }

        return Vehicle;

    }]);