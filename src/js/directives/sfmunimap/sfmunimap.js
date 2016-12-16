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

        scope.$watch('selectedRoute', function (newValue, oldValue) {
           
          if (newValue) {
              console.log("add route " + newValue);
              
                drawPath({
                    selector : '.route',
                    attrs : { 
                        fill : "none",
                        stroke : function (d) {
                            return "#" + d.properties.color;
                        },
                        class : ['route','route-'+newValue, 'route-group-' + newValue].join(' ')
                    },
                    groupClasses :  ['route-group-' + newValue].join(' '),
                    
                    data :  scope.selectedRoutes[newValue]
                });
          }

          //hide route and remove all vehicles
          else if (oldValue) {
              //d3.selectAll("path.route-"+oldValue).hide();
              d3.selectAll(".route-group-"+oldValue).remove();
              //d3.selectAll("path.vehicle-"+oldValue).remove();
              console.log("remove route " + oldValue);
          }
         
        })

        /*scope.$watch('pollVehicles', function (newValue, oldValue) {
         console.log("polling Vehicles for s");
         

            angular.forEach(scope.vehicles, function (data, routeId){
                
                if (data && data.length > 0) {
                        drawPoint({  
                        selector : '.vehicle',
                        attrs : { 
                            fill : "red",
                            stroke :"red",
                            class : function (d) {
                                return ['vehicle','vehicle-route-'+routeId, 'vehicle-id-' + d.properties.id].join(' ')
                            }
                        },
                        data : scope.vehicles[routeId] || []
                    });
                }
                
            });
         
        });*/

        

        function afterPollVehicle (data, routeId) {
                if (data && data.length > 0) {
                            drawPoint({  
                            selector : '.vehicle',
                            attrs : { 
                                fill : "red",
                                stroke :"red",
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
        
        /*function testdraw() {
            drawPath({  
                        selector : '.vehicle',
                        classNames : ['vehicle', 'vehicle-route-L'],
                        attrs : { 
                            fill : function (d) {
                                return d.properties.color;
                            },
                            stroke :function (d) {
                                return d.properties.color;
                            },
                            class : function (d) {
                                return ['vehicle','vehicle-route-' + d.properties.routeTag, 'vehicle-id-' + d.properties.id].join(' ')  
                            }
                        },
                        data : [{"type":"Feature","properties":{"id":"1494","speedKmHr":"1","routeTag":"L", color: "green"},"geometry":{"type":"Point","coordinates":["-122.431","37.76"]}}]
                });
            setTimeout(function (){
                drawPath({  
                        selector : '.vehicle',
                        classNames : ['vehicle', 'vehicle-route-L'],
                        attrs : { 
                            fill : function (d) {
                                return d.properties.color;
                            },
                            stroke :function (d) {
                                return d.properties.color;
                            },
                            class : function (d) {
                                return ['vehicle','vehicle-route-' + d.properties.routeTag, 'vehicle-id-' + d.properties.id].join(' ') 
                            }
                        },
                        data : [
                                {"type":"Feature","properties":{"id":"1494","speedKmHr":"1","routeTag":"L" ,color: "green"},"geometry":{"type":"Point","coordinates":["-122.441","37.73"]}},
                                 {"type":"Feature","properties":{"id":"1495","speedKmHr":"1","routeTag":"L" ,color: "blue"},"geometry":{"type":"Point","coordinates":["-122.443","37.73"]}}
                            ]
                });

            }, 2000);
            console.log("TEST DRAW");
                
        };*/
       
        
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
               
                var svgmap = svg
                
                var albersProjection = d3.geoAlbers()
                    .scale(300000)
                    .rotate( [122.431,0] )
                    .center( [0, 37.760] )
                    .translate( [width/2,height/2] );

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
               
                var svgmap = svg.append("g").attr("class", options.groupClasses)
                
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
                    .attr( "d", geoPath );
                
                angular.forEach(options.attrs, function(value, key) {
                   elms.attr(key,value);
                });
                    
        };

        
    }
        
  };
});