angular.module('BusMap', [])
    .directive('busMap', function() {

        function link (scope, element, attr) {

            var svg = d3.select("#sf-map")
                svg.append("g")

            var width = svg.style("width").replace(/px/g, '')
            var height = svg.style("height").replace(/px/g, '')

            var mapConfig = scope.config;
                mapConfig.translate = mapConfig.translate || [width / 2, height / 2];


            function init () {


                
                scope.$watch("loaded", function (newValue, oldValue) {
                    if (scope.loaded) {
                        drawPath({
                            selector: '.neighborhoods',
                            attrs: {
                                class: 'neighborhoods map-feature'
                            },
                            data: scope.map.neighborhoods.features
                        });

                        printMap();
                    }
                })

                if (scope.pan) {
                    attachPan();
                }
                if (scope.zoom) {
                    //Attach zoom
                }
            }



            function attachPan () {
                // Drag Event Handling
                function getTransformProperties(elm) {
                    var transform = elm.attr("transform") || "";
                    var matchTranslate = transform ? /translate\((-?\d+),(-?\d+)\)/gi.exec(transform) : null;
                    var matchScale = transform ? /scale\((-?\d+)\)/gi.exec(transform) : null;

                    return {
                        transform: transform,
                        matchScale: matchScale,
                        matchTranslate: matchTranslate
                    }
                }
                var drag = d3.drag();

                function started() {
                    var elm = d3.select(this).classed("dragging", true)

                    var props = getTransformProperties(elm);

                    var trans = props.transform;

                    //Calculate dragging point offset
                    var xx = 0,
                        yy = 0,
                        ss = 0;


                    if (props.matchTranslate) {

                        xx = props.matchTranslate[1] * 1;
                        yy = props.matchTranslate[2] * 1;
                    }


                    //calculate offser from top left
                    var x = d3.event.x;
                    var y = d3.event.y;

                    d3.event.on("drag", dragged).on("end", ended);

                    function dragged(d) {

                        var props = getTransformProperties(elm);

                        var translateAttr = "translate(" + [d3.event.x - x + xx, d3.event.y - y + yy] + ")";
                        var trans = props.transform;

                        trans = props.matchTranslate ? trans.replace(/translate\(-?[0-9]+,-?[0-9]+\)/g, translateAttr) : trans + translateAttr;

                        elm.attr("transform", trans);
                    }

                    function ended() {
                        var props = getTransformProperties(elm);
                        elm.classed("dragging", false);
                    }

                    
                } 
                    var rootGroup = svg.select("g");

                    rootGroup.call(drag.on("start", started));
            }//ATTACH PAN

            function printMap() {
                    //1. Map loaded already
                    //2. Streets
                    drawPath({
                        selector: '.streets',
                        attrs: {
                            class: 'streets empty-path map-feature'
                        },
                        data: scope.map.streets.features
                    });

                    //3. Arteries
                    drawPath({
                        selector: '.arteries',
                        attrs: {
                            class: 'arteries empty-path map-feature',
                        },
                        data: scope.map.arteries.features
                    });

                    //4. Freeways
                    drawPath({
                        selector: '.freeways',
                        attrs: {
                            class: 'freeways empty-path map-feature'
                        },
                        data: scope.map.freeways.features
                    });
                }
        

        function drawPath(options) {

                    var svgmap = svg.select("g")
                        .append("g")
                        .attr("class", options.groupClasses)


                    var albersProjection = d3.geoAlbers()
                        .scale(mapConfig.scale)
                        .rotate(mapConfig.rotate)
                        .center(mapConfig.center)
                        .translate(mapConfig.translate);

                    var geoPath = d3.geoPath()
                        .projection(albersProjection);

                    var elms = svgmap.selectAll("path" + options.selector)
                        .data(options.data)
                        .enter()
                        .append("g")
                        .append("path")
                        .attr("d", geoPath);

                    angular.forEach(options.attrs, function(value, key) {
                        elms.attr(key, value);
                    });

                };


                //ENTRY POINT
                init()

        }


        

        return {
            restrict: 'E',
            templateUrl: 'static/js/directives/sfmunimap/busmap.html',
            link : link,
            scope : {
                map : "=map",
                loaded : "=loaded",
                config : "=config",
                zoom : "@zoom", // eg {range [1,3], step 0.5, initial 2} | true (default [1,3] step 0.5 init 1 | false (no zoom) )
                pan : "@pan" // default true
            }

        };
    });