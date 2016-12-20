angular.module('SFmuniMap', [])
    .directive('sfMuniMap', function() {

        return {
            restrict: 'E',
            transclude: true,
            templateUrl: 'static/js/directives/sfmunimap/sfmunimap.html',
            link: function(scope, element, attrs, controller) {

                var svg = d3.select("#sf-map")
                svg.append("g")

                var width = svg.style("width").replace(/px/g, '')
                var height = svg.style("height").replace(/px/g, '')


                var mapConfig = scope.mapConfig;
                mapConfig.translate = [width / 2, height / 2];

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

                //Zoom
                scope.zoomLevel = 1;
                scope.zoomRange = [1, 3];
                var zoomStep = 0.5;
                svg.attr("data-zoom", scope.zoomLevel);
                function zoom(sign, threshold) {
                    if (scope.zoomLevel === threshold) {
                        return;
                    }
                    scope.zoomLevel = scope.zoomLevel + zoomStep * sign;

                    var transform = rootGroup.attr("transform");
                    if (transform == null) {
                        transform = "";
                    }
                    var scaleStr = "scale(" + scope.zoomLevel + ")";
                    transform = transform.indexOf("scale") >= 0 ? transform.replace(/scale\(-?[0-9]+(\.[0-9]+)?\)/g, scaleStr) : transform + scaleStr;
                    rootGroup.attr("transform", transform);

                    svg.attr("data-zoom", scope.zoomLevel);

                }

                scope.zoomIn = function() {
                    zoom(1, scope.zoomRange[1])
                }

                scope.zoomOut = function() {
                    zoom(-1, scope.zoomRange[0])
                }

                scope.$watch('loadSuccess', function(newValue, oldValue) {
                    if (newValue) {
                        drawPath({
                            selector: '.neighborhoods',
                            attrs: {
                                class: 'neighborhoods map-feature'
                            },
                            data: scope.neighborhoods.features
                        });
                    }
                });

                scope.$watch('restOfMapLoaded', function(newValue, oldValue) {

                    if (newValue) {
                        printMap();
                    }

                });


                function printMap() {
                    //1. Map loades already
                    //2. Streets
                    drawPath({
                        selector: '.streets',
                        attrs: {
                            class: 'streets empty-path map-feature'
                        },
                        data: scope.streets.features
                    });

                    //3. Arteries
                    drawPath({
                        selector: '.arteries',
                        attrs: {
                            class: 'arteries empty-path map-feature',
                        },
                        data: scope.arteries.features
                    });

                    //4. Freeways
                    drawPath({
                        selector: '.freeways',
                        attrs: {
                            class: 'freeways empty-path map-feature'
                        },
                        data: scope.freeways.features
                    });
                }

                /**
                 * Draw Route on svg
                 */
                function drawRoute(routeId) {
                    drawPath({
                        selector: '.route',
                        attrs: {
                            'fill': "none",
                            'stroke': function(d) {
                                return "#" + d.properties.color;
                            },
                            'stroke-width': 2,
                            'class': ['route', 'route-' + routeId, 'route-group-' + routeId].join(' ')
                        },
                        groupClasses: ['route-group-' + routeId].join(' '),

                        data: scope.selectedRoutes.get(routeId).getFeatures()
                    });
                }

                /**
                 * Remove selected route
                 */
                function removeRoute(routeId) {

                    d3.selectAll(".route-group-" + routeId).remove();

                }

                function toggleRoute(routeId, show) {
                    if (show) {
                        drawRoute(routeId);
                    }
                    else {
                        removeRoute(routeId);
                    }
                }

                //Add callback after a route has been toggled
                scope.addToggleRoutesSubscribers(toggleRoute);

                /**
                 * Callback after polling vehicles
                 */
                function afterPollVehicle(data, routeId, color) {

                    if (data) {
                        angular.forEach(data.getAll(), function(vehicle, id) {
                            drawPoint({
                                selector: '.vehicle',
                                attrs: {
                                    fill: color,
                                    stroke: color,
                                    class: function(d) {
                                        return ['vehicle', 'vehicle-route-' + routeId, 'route-group-' + routeId, 'vehicle-id-' + d.properties.id].join(' ')
                                    }
                                },
                                groupClasses: function(d) {
                                    return ['vehicle-route-' + routeId, 'route-group-' + routeId, 'vehicle-group-' + d.properties.id].join(' ')
                                },
                                data: vehicle.getFeature() || []
                            });
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
                 *   selector,
                 *   attrs,   {Array} list of attributes to be added
                 * }
                 * </pre>
                 */
                function drawPoint(options) {


                    var svgmap = svg.select("g");

                    var albersProjection = d3.geoAlbers()
                        .scale(mapConfig.scale)
                        .rotate(mapConfig.rotate)
                        .center(mapConfig.center)
                        .translate(mapConfig.translate);

                    var geoPath = d3.geoPath()
                        .projection(albersProjection);

                    var elms = svgmap.selectAll("path" + options.selector);


                    elms = elms.data(options.data, function(d) { return d.properties.id; })

                    elms.transition()
                        .duration(15000)
                        .ease(d3.easeLinear)
                        .attr("d", geoPath)

                    angular.forEach(options.attrs, function(value, key) {
                        elms = elms.attr(key, value);
                    });

                    var enterElms = elms.enter()

                    enterElms = enterElms.append("path");
                    enterElms.transition()
                        .duration(1000)
                        .ease(d3.easeLinear)
                        .attr("fill", options.attrs.fill)
                        .attr("stroke", options.attrs.stroke);


                    enterElms.attr("d", geoPath)

                        .on("mouseover", function(d, i, elm) {
                            var w = 230, h = 50, yText = 130, yRect = 95, xRect = 95;
                            svg.append("rect")
                                .attr("id", "text-" + d.properties.id)
                                .attr("class", "vehicle-info")
                                .attr("y", yRect)
                                .attr("rx", 4)
                                .attr("ry", 4)
                                .attr("x", xRect)
                                .attr("width", w)
                                .attr("height", h)
                                .attr("fill", "#fff")
                                .attr("stroke", function() {
                                    return elm[0].getAttribute("fill");
                                })
                                .attr("stroke-width", 3);

                            svg.append("text")
                                .attr("class", "vehicle-info")
                                .attr("y", yText)
                                .attr("x", 120)
                                .attr("font-size", 30)
                                .attr("fill", function() {
                                    return elm[0].getAttribute("fill");
                                })
                                .text(d.properties.routeTag)

                            svg.append("text")
                                .attr("class", "vehicle-info")
                                .attr("y", yText)
                                .attr("x", 235)
                                .attr("font-size", 30)
                                .text(d.properties.speedKmHr)

                            svg.append("text")
                                .attr("class", "vehicle-info")
                                .attr("y", yText)
                                .attr("x", 270)
                                .attr("font-size", 15)
                                .text("Km/hr")


                        })
                        .on("mouseout", function(d) {
                            svg.selectAll(".vehicle-info").remove();
                        })

                    enterElms = enterElms.attr("fill", "transparent")
                        .attr("stroke", "transparent")
                        .attr("class", options.attrs.class);

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
                 *   selector,
                 *   attrs,   {Array} list of attributes to be added
                 * }
                 * </pre>
                 */
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


            }

        };
    });