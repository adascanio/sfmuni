
angular.module('VehicleCollectionModule', [])
    .factory('VehicleCollection', [function () {

        function VehicleCollection(vehicles) {

            this.vehicles = vehicles || {};
        }

        VehicleCollection.prototype.getAll = function () {
            return this.vehicles;
        }

        VehicleCollection.prototype.get = function (id) {
            return this.vehicles[id];
        }

        VehicleCollection.prototype.set = function (vehicle) {
            this.vehicles[vehicle.getId()] = vehicle;
        }

        VehicleCollection.prototype.remove = function (id) {
            delete this.vehicles[id];
        }


        return VehicleCollection

    }]);