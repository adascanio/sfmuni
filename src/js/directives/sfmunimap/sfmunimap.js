angular.module('SFmuniMap', ['MapCtrl'])
.directive('sfMuniMap', function() {
  
  
                   
  
  return {
    restrict: 'E',
    transclude: true,
    template: '<svg id="sf-map" class="geomap"></svg>',
    link : function (scope, element, attrs, controller) {
        
        var svg = d3.select( "#sf-map" )
        svg.append("g")
        
        var width = svg.style("width").replace(/px/g,'')
        var height = svg.style("height").replace(/px/g,'')

        
        var mapConfig = scope.mapConfig;
        mapConfig.translate = [width/2,height/2];
        
        // Drag Event Handling
        var drag = d3.drag();
        function started() {
            var elm = d3.select(this).classed("dragging", true)
            
            var trans = elm.attr("transform");

            //Calculate dragging point offset
            var xx = 0,
                yy = 0;
            if (trans) {
                var match = /translate\((-?\d+),(-?\d+)\)/gi.exec(trans);
                xx = match[1] * 1;
                yy = match[2] * 1;
            }
           
            console.log(xx +' ' +yy)

            //calculate offser from top left
            var x = d3.event.x;
            var y = d3.event.y;
             console.log(x +' ' +y)

            d3.event.on("drag", dragged).on("end", ended);

            function dragged(d) {
                console.log( d3.event.x +' '+ (d3.event.y))
                elm.attr("transform", "translate(" + [d3.event.x - x + xx, d3.event.y - y + yy] + ")");
            }

            function ended() {
                elm.classed("dragging", false);
            }
        }

        var rootGroup = svg.select("g");
        
        rootGroup.call(drag.on("start", started));
        
        // Zooming Event 
        function zoom () {
           svg.select("g").attr("transform", "scale(" + d3.event.transform.k + ")");
        }
        //rootGroup.call(d3.zoom().scaleExtent([1, 8]).on("zoom", zoom))
        
        
        //Check that all the information are loaded before drawing the maps 
        scope.$watch('loadSuccess', function(newValue, oldValue){

           if (newValue) {
                printMap();
            }
            
        });

        function printMap () {
                //Map first
                drawPath({
                    selector : '.neighborhood',
                    attrs : { 
                        class : 'neighborhood map-feature'
                    },
                    data : scope.neighborhoods.features
                });

                //2. Streets
                drawPath({
                    selector : '.street',
                    attrs : { 
                        class : 'street empty-path map-feature'
                    },
                    data : scope.streets.features
                });
                
                //3. Arteries
                drawPath({
                    selector : '.artery',
                    attrs : { 
                        class : 'artery empty-path map-feature', 
                    },
                    data : scope.arteries.features
                });

                //4. Freeways
                drawPath({
                    selector : '.freeway',
                    attrs : { 
                        class : 'freeway empty-path map-feature'
                     },
                    data : scope.freeways.features
                });
        }

        function drawRoute(routeId) {
                console.log("add route " + routeId);
                drawPath({
                    selector : '.route',
                    attrs : { 
                        fill : "none",
                        stroke : function (d) {
                            return "#" + d.properties.color;
                        },
                        class : ['route','route-'+routeId, 'route-group-' + routeId].join(' ')
                    },
                    groupClasses :  ['route-group-' + routeId].join(' '),
                    
                    data :  scope.selectedRoutes[routeId]
                });
        }

        function removeRoute(routeId) {

              d3.selectAll(".route-group-"+routeId).remove();
              
              console.log("remove route " + routeId);
        }

        function toggleRoute (routeId, show) {
            if (show) {
                drawRoute(routeId);
            }
            else {
                removeRoute (routeId);
            }
        }

        //Add callback after a route has been toggled
        scope.addToggleRoutesSubscribers(toggleRoute);

        /**
         * Callback after polling vehicles
         */
        function afterPollVehicle (data, routeId, color) {
                if (data && data.length > 0) {


                            drawPoint({  
                            selector : '.vehicle',
                            attrs : { 
                                fill : color,
                                stroke : color,
                                class : function (d) {
                                    return ['vehicle','vehicle-route-'+routeId, 'route-group-' + routeId, 'vehicle-id-' + d.properties.id].join(' ')
                                }
                            },
                            groupClasses : function (d) {
                                    return ['vehicle-route-'+routeId, 'route-group-' + routeId, 'vehicle-group-' + d.properties.id].join(' ')
                            },
                            data : data || []
                        });
                    }
        };

        scope.addPollVehiclesSubscriber(afterPollVehicle);
        
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
        function drawPoint (options) {
               
                var svgmap = svg.select("g");
                
                var albersProjection = d3.geoAlbers()
                    .scale(mapConfig.scale)
                    .rotate( mapConfig.rotate )
                    .center( mapConfig.center )
                    .translate( mapConfig.translate );

                var geoPath = d3.geoPath()
                    .projection( albersProjection );
                
                var elms = svgmap.selectAll( "path" + options.selector )
                    .data( options.data, function(d) { return d.properties.id; } )
                    .attr( "d", geoPath )
                    .enter()
                    .append( "path" )
                    .attr( "d", geoPath );
                
                angular.forEach(options.attrs, function(value, key) {
                   elms.attr(key,value);
                });
                    
        };
       

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
               
                var svgmap = svg.select("g")
                                .append("g")
                                .attr("class", options.groupClasses)
                
                var albersProjection = d3.geoAlbers()
                    .scale(mapConfig.scale)
                    .rotate( mapConfig.rotate )
                    .center( mapConfig.center )
                    .translate( mapConfig.translate );

                var geoPath = d3.geoPath()
                    .projection( albersProjection );
                
                var elms = svgmap.selectAll( "path" + options.selector )
                    .data( options.data )
                    .enter()
                    .append("g")
                    .append( "path" )
                    .attr( "d", geoPath );
                
                angular.forEach(options.attrs, function(value, key) {
                   elms.attr(key,value);
                });
                    
        };

        
    }
        
  };
});