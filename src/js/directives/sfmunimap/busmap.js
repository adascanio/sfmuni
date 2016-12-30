angular.module('BusMap', ['MapCtrl'])
    .directive('busMap', ["$log", function ($log) {

        function link(scope, element, attr) {

            //scope.svgId = scope.svgId || '';

            var svg = d3.select("#sf-map");
            svg.append("g")

            var width = svg.style("width").replace(/px/g, '')
            var height = svg.style("height").replace(/px/g, '')

            var mapConfig = scope.mapConfig;
            mapConfig.translate = mapConfig.translate || [width / 2, height / 2];

            /**
             * Flag for triggering the map display 
             */
            scope.mapLoaded = false;

            /**
             * vehicle to be displayed in the popup
             */
            scope.selectedVehicle = {};

            /**
             * whether the vehicle should be shown/higlighted
             */
            scope.showVehicleInfo = false;

            function isMapLoaded(map) {

                var availableMaps = mapConfig.availableMaps;
                for (var i = 0, len = availableMaps.length; i < len; i++) {
                    if (!map[availableMaps[i]]) {
                        return false;
                    }
                }
                return true;
            }

            /**
             * Entry point
             */
            function init() {

                scope.$watch("mapLoaded", function (newValue, oldValue) {
                    if (newValue) {
                        printMap();
                    }

                })

                scope.$watchCollection("selectedRoutes", function (newValue, oldValue) {

                    var diff = routeDiff(newValue, oldValue);

                    showRoutes(diff.added);
                    hideRoutes(diff.removed);

                })

                scope.$watch("updateVehicles", function (newValue, oldValue) {

                    angular.forEach(scope.vehicles, function (vehicle, key) {

                        var routeTag = vehicle.routeTag;
                        if (routeTag == null) {
                            return;
                        }
                        var route = scope.selectedRoutes[routeTag];
                        var color = route.color;

                        drawVehicle({
                            selector: '.vehicle',
                            attrs: {
                                fill: color,
                                stroke: color,
                                class: function (d) {
                                    var selected = '';
                                    if (scope.selectedVehicle.id === d.properties.id && scope.showVehicleInfo) {
                                        selected = 'selected';
                                    }
                                    return ['vehicle', 'vehicle-route-' + routeTag, 'route-group-' + routeTag, 'vehicle-id-' + d.properties.id, selected].join(' ')
                                }
                            },
                            groupClasses: function (d) {
                                return ['vehicle-route-' + routeTag, 'route-group-' + routeTag, 'vehicle-group-' + d.properties.id].join(' ')
                            },
                            data: vehicle.feature || []
                        });
                    })
                    //drawRoute("E")

                })

                //Pan enabled by default
                if ((scope.pan == null || scope.pan === true) && !scope.static) {
                    attachPan();
                }

                //Zoom enabled by default
                if ((scope.zoom == null || scope.zoom) && !scope.static) {
                    attachZoom(scope.zoom)
                }
            }

            scope.hideVehicleInfo = function  () {
                scope.showVehicleInfo = false;
                d3.select(".vehicle-id-" + scope.selectedVehicle.id).classed("selected", false);
                
            }

            function routeDiff(newValue, oldValue) {
                var added = [];
                angular.forEach(newValue, function (value, key) {
                    if (oldValue[key]) {
                        delete oldValue[key];
                    }
                    else {
                        added.push(key);
                    }
                });
                return {
                    added: added,
                    removed: Object.keys(oldValue)
                }
            }

            function showRoutes(routeTags) {
                angular.forEach(routeTags, function (routeTags) {

                    drawRoute(routeTags);

                });
            };

            function hideRoutes(routeTags) {
                angular.forEach(routeTags, function (routeTag) {
                    d3.selectAll(".route-group-" + routeTag).remove();

                    var selVehicle = scope.selectedVehicle;
                    if (selVehicle && selVehicle.routeTag === routeTag) {
                        scope.showVehicleInfo = false
                    }

                });
            };


            /**
             * Enable pan behaviour on map
             */
            function attachPan() {
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
            };//ATTACH PAN

            /**
             * Enable zoom behaviour
             * @param {Object|boolean} {range [1,3], step 0.5, initial 2} | true (default [1,3] step 0.5 init 1 | false (no zoom)
             */
            function attachZoom(zoomConfig) {

                var rootGroup = svg.select("g");

                //default values i.e. zoomConfig is true | undefined                
                scope.zoomLevel = 1;
                scope.zoomRange = [1, 3];
                scope.zoomStep = 0.5;

                if (zoomConfig instanceof Object) {
                    scope.zoomLevel = zoomConfig.initial;
                    scope.zoomRange = zoomConfig.range;
                    scope.step = 0.5;
                }
                //zoom should not be attached
                else if (zoomConfig === false) {
                    return;
                }



                svg.attr("data-zoom", scope.zoomLevel);

                function zoom(sign, threshold) {
                    if (scope.zoomLevel === threshold) {
                        return;
                    }
                    scope.zoomLevel = scope.zoomLevel + scope.zoomStep * sign;

                    applyZoom();

                }

                function applyZoom () {
                    var transform = rootGroup.attr("transform");
                    if (transform == null) {
                        transform = "";
                    }
                    var scaleStr = "scale(" + scope.zoomLevel + ")";
                    transform = transform.indexOf("scale") >= 0 ? transform.replace(/scale\(-?[0-9]+(\.[0-9]+)?\)/g, scaleStr) : transform + scaleStr;
                    rootGroup.attr("transform", transform);

                    svg.attr("data-zoom", scope.zoomLevel);
                }

                scope.zoomIn = function () {
                    zoom(1, scope.zoomRange[1])
                }

                scope.zoomOut = function () {
                    zoom(-1, scope.zoomRange[0])
                }

                applyZoom();

            }; //ATTACH ZOOM

            /**
             * Draw Route on svg
             * @param {string} routeTag
             */
            function drawRoute(routeTag) {
                drawPath({
                    selector: '.route',
                    attrs: {
                        'fill': "none",
                        'stroke': function (d) {
                            return "#" + d.properties.color;
                        },
                        'stroke-width': 2,
                        'class': ['route', 'route-' + routeTag, 'route-group-' + routeTag].join(' ')
                    },
                    groupClasses: ['route-group-' + routeTag].join(' '),

                    data: scope.selectedRoutes[routeTag].features
                });
            };

            function printMap() {
                angular.forEach(mapConfig.availableMaps, function (value) {
                    var emptyClass = '';
                    if (value !== "neighborhoods") {
                        emptyClass = 'empty-path';
                    }
                    drawPath({
                        selector: '.' + value,
                        attrs: {
                            class: value + ' map-feature ' + emptyClass
                        },
                        data: scope.map[value].features
                    })
                })
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

                angular.forEach(options.attrs, function (value, key) {
                    elms.attr(key, value);
                });

            };

            /**
             * Draw vehicle on map
             */
            function drawVehicle(options) {


                var svgmap = svg.select("g");

                var albersProjection = d3.geoAlbers()
                    .scale(mapConfig.scale)
                    .rotate(mapConfig.rotate)
                    .center(mapConfig.center)
                    .translate(mapConfig.translate);

                var geoPath = d3.geoPath()
                    .projection(albersProjection);

                var elms = svgmap.selectAll("path" + options.selector);


                elms = elms.data(options.data, function (d) { return d.properties.id; })

                

                elms.transition()
                    .duration(15000)
                    .ease(d3.easeLinear)
                    .attr("d", geoPath)

                angular.forEach(options.attrs, function (value, key) {
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

                    .on("click", function (d, i, elm) {
                        scope.$apply(function () {
                            var selected = $(elm).hasClass("selected");
                            d3.select(".vehicle.selected").classed("selected", false);

                            scope.selectedVehicle = d.properties;
                            scope.showVehicleInfo = !selected

                            if (!selected) {
                                $(elm).toggleClass("selected");
                            }


                        })
                    })


                enterElms = enterElms.attr("fill", "transparent")
                    .attr("stroke", "transparent")
                    .attr("class", options.attrs.class);

            };

            //ENTRY POINT
            init()

        }// Link function


        return {
            restrict: 'E',
            templateUrl: 'static/js/directives/sfmunimap/busmap.html',
            link: link,
            controller: 'MapController',
            scope: {
                pan: "=pan",
                zoom: "=zoom", // eg {range [1,3], step 0.5, initial 2} | true (default [1,3] step 0.5 init 1 | false (no zoom) )
                busService : "=busservice",
                mapService : "=mapservice",
                static : "=static", //disable zoom and pan in one shot if true
                mapConfig : "=mapconfig",
                svgId : "=svgid"
                //svgId : "=svgid"  //the id of the svg element
                //map : "=map",
                /*loaded : "=loaded",
                toggleRouteOnLoad : "=toggleRouteOnLoad", // true select one arbitrary route | string select a specific route | false
                routes : "=routes", //list of routes to be rendered
                vehicles : "=vehicles", // vehicles to be rendered
                config : "=config",
                zoom : "=zoom", // eg {range [1,3], step 0.5, initial 2} | true (default [1,3] step 0.5 init 1 | false (no zoom) )
                pan : "@pan", // default true
                updateVehicles :  "=updateVehicles" // default true*/
            }

        };
    }]);