angular.module('Navbar')
.directive('sfMuniMap', function() {
  
  return {
        restrict: 'E',
        scope : {
            routes: "="
        },
        templateUrl: './navbar.html',
        link : function (scope, element, attrs, controller) {
        }
    }
});