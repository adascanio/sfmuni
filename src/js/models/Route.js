
angular.module('RouteModule', []).factory('Route', [function(props) {

    function Route (props) {
        this.tag = props.tag || "??";
         this.title = props.title || "Unknown route";
         this.color = props.color || "#000";
         this.oppositeColor = props.oppositeColor || "#fff";
         this.features = props.features || [];
    }

    Route.prototype.getTag = function () {
        return this.tag;
    }

    Route.prototype.getTitle = function () {
        return this.title;
    }
    Route.prototype.getColor = function () {
        return this.color;
    }
    Route.prototype.getOppositeColor = function () {
        return this.oppositeColor;
    }
    Route.prototype.getFeatures = function () {
        return this.features;
    }

    return Route;

}]);