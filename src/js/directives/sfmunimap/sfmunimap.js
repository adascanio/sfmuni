angular.module('SFmuniMap', ['MapCtrl'])
.directive('sfMuniMap', function() {
  return {
    restrict: 'E',
    transclude: true,
    template: '<svg id="sf-map" class="geomap"></svg>',
    link : function (scope, element, attrs, controller) {
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
                //printMap();
            }
            
        });

        function printMap () {
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

        scope.$watch('selectedRoute', function (newValue, oldValue) {
           
          if (newValue) {
              console.log("add route " + newValue);
              
                drawPath({
                    selector : '.route',
                    classNames : ['route','route-'+newValue],
                    attrs : { 
                        fill : "none",
                        stroke : function (d) {
                            return "#" + d.properties.color;
                        } 
                    },
                    data :  scope.selectedRoutes[newValue]
                });
          }
          else if (oldValue) {
              d3.selectAll("path.route-"+oldValue).remove();
              console.log("remove route " + oldValue);
          }
         
        })

        scope.$watch('pollVehicles', function (newValue, oldValue) {
         console.log("polling Vehicles for s");
         
            angular.forEach('vehicles', function (value, routeId){
                var data = scope.vehicles[routeId];

                if (data && data.length > 0) {
                        drawPath({  
                        selector : '.vehicle',
                        classNames : ['vehicle', 'vehicle-route-'+routeId],
                        attrs : { 
                            fill : "red",
                            stroke :"red"
                        },
                        data : scope.vehicles[routeId] || []
                    });
                }
                
            });
         
        });

        (function testdraw() {
            console.log("TEST DRAW");
                drawPath({  
                        selector : '.vehicle',
                        classNames : ['vehicle', 'vehicle-route-L'],
                        attrs : { 
                            fill : "red",
                            stroke :"red"
                        },
                        data : [{"type":"Feature","properties":{"id":"1494","speedKmHr":"1","routeTag":"L"},"geometry":{"type":"Point","coordinates":["-122.431","37.76"]}}]
                });
        })();
       
        

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
               
                var svgmap = svg
                
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