
angular.module('RouteModule', []).factory('Route', [function(props) {

    function Route (props) {
        this.tag = props.tag || "??";
         this.title = props.title || "Unknown route";
         this.color = props.color || "#f00";
         this.oppositeColor = props.oppositeColor || "#00f";
         this.features = props.features || [];
         this.selected = props.selected || false;
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

    Route.prototype.setColor = function (color) {
        this.color = color;
    }

    Route.prototype.getOppositeColor = function () {
        return this.oppositeColor;
    }

    Route.prototype.setOppositeColor = function (oppositeColor) {
        this.oppositeColor = oppositeColor;
    }

    Route.prototype.getSelected = function () {
        return this.selected;
    }

    Route.prototype.setSelected = function (selected) {
        this.selected = selected;
    }

    Route.prototype.getFeatures = function () {
        return this.features;
    }

    return Route;

}]);