angular.module('SFmuniMap', ['MapCtrl'])
.directive('sfMuniMap', function() {
  return {
    restrict: 'E',
    transclude: true,
    template: '<svg id="sf-map" class="geomap"></svg>',
    link : function (scope, element, attrs) {
        console.log(scope.loadSuccess);

        var svg = d3.select( "#sf-map" )
        
        
        
        /*svg.append("g")
        .call(d3.zoom().scaleExtent([1, 8]).on("zoom", zoom))
        
        function zoom () {
            d3.event
            //svg.selectAll("g").attr("transform", "scale(" + d3.event.transform.k + ")");
        }*/
        var width = svg.style("width").replace(/px/g,'')
        var height = svg.style("height").replace(/px/g,'')
        
        //Check that all the information are loaded before drawing the maps 
        scope.$watch('loadSuccess', function(newValue, oldValue){

            if (newValue) {
                //Map first
                drawPath({
                    selector : '.neighborhood',
                    classNames : ['neighborhood'],
                    attrs : { stroke :'#fff', fill : "#ccc" },
                    data : scope.neighborhoods.features
                });

                //2. Streets
                drawPath({
                    selector : '.street',
                    classNames : ['street'],
                    attrs : { stroke :'#fff', fill : "none" },
                    data : scope.streets.features
                });
                
                //3. Arteries
                drawPath({
                    selector : '.artery',
                    classNames : ['artery'],
                    attrs : { stroke :'orange', fill : "none" },
                    data : scope.arteries.features
                });

                //4. Freeways
                drawPath({
                    selector : '.freeway',
                    classNames : ['freeway'],
                    attrs : { stroke :'green', fill : "none" },
                    data : scope.freeways.features
                });
            }
            
        });

        scope.$watch('selectedRoutes', function (newValue, oldValue) {
           
            console.log(newValue);
            /*if (newValue === oldValue) {
                //4. Freeways
                drawPath({
                    selector : '.route',
                    classNames : ['route'],
                    attrs : { stroke :'blue', fill : "none" },
                    data : scope.freeways.features
                });
            }*/
        })

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
               
                var svgmap = svg.append("g")
                
                var albersProjection = d3.geoAlbers()
                    .scale(300000)
                    .rotate( [122.431,0] )
                    .center( [0, 37.760] )
                    .translate( [width/2,height/2] );

                var geoPath = d3.geoPath()
                    .projection( albersProjection );
                
                var elms = svgmap.selectAll( "path" + options.selector )
                    .data( options.data )
                    .enter()
                    .append("g")
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