angular.module('SFmuniMap', ['MapCtrl'])
.directive('sfMuniMap', function() {
  return {
    restrict: 'E',
    transclude: true,
    template: '<svg id="sf-map" class="geomap"></svg>',
    link : function (scope, element, attrs) {
        console.log(scope.loadSuccess);

        var svg = d3.select( "#sf-map" );

        var width = svg.style("width").replace(/px/g,'')
        var height = svg.style("height").replace(/px/g,'')
        
        //Check that all the information are loaded before drawing the maps 
        scope.$watch('loadSuccess', function(newValue, oldValue){

            if (newValue) {
                //Map first
                drawPath({
                    scale : 300000,
                    center: [0, 37.753],
                    rotate: [122.431,0],
                    translate: [width/2,height/2],
                    selector : '.neighborhood',
                    classNames : ['neighborhood'],
                    attrs : { stroke :'#fff', fill : "#ccc" },
                    data : scope.neighborhoods.features
                });

                //2. Streets
                drawPath({
                    scale : 300000,
                    center: [0, 37.753],
                    rotate: [122.431,0],
                    translate: [width/2,height/2],
                    selector : '.street',
                    classNames : ['street'],
                    attrs : { stroke :'#fff', fill : "none" },
                    data : scope.streets.features
                });
                
                //3. Arteries
                drawPath({
                    scale : 300000,
                    center: [0, 37.753],
                    rotate: [122.431,0],
                    translate: [width/2,height/2],
                    selector : '.artery',
                    classNames : ['artery'],
                    attrs : { stroke :'orange', fill : "none" },
                    data : scope.arteries.features
                });

                //4. Freeways
                drawPath({
                    scale : 300000,
                    center: [0, 37.753],
                    rotate: [122.431,0],
                    translate: [width/2,height/2],
                    selector : '.freeway',
                    classNames : ['freeway'],
                    attrs : { stroke :'green', fill : "none" },
                    data : scope.freeways.features
                });
            }
            
        });

        /**
         * @param {Object} options
         * <pre>
         * {
         *   data,
         *   rotate,  
         *   center, 
         *   scale,
         *   translate,
         *   classNames,
         *   selector,
         *   attrs,   {Array} list of attributes to be added
         * }
         * </pre>
         */
        function drawPath (options) {
               
                var neighborhoods = svg

                var albersProjection = d3.geoAlbers()
                    .scale(options.scale)
                    .rotate( options.rotate )
                    .center( options.center )
                    .translate( options.translate );

                var geoPath = d3.geoPath()
                    .projection( albersProjection );
                
                var elms = neighborhoods.selectAll( "path" + options.selector )
                    .data( options.data )
                    .enter()
                    .append( "path" )
                    .attr("class", options.classNames.join(' '))
                    .attr( "d", geoPath );
                
                angular.forEach(options.attrs, function(value, key) {
                   elms.attr(key,value);
                });
                    
        };
        
    }
        
  };
});