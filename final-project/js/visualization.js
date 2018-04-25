const Visualization = (() => {

    var activeFeature = d3.select(null);
    var geoGenerator;

    const mapTransitionTime = 1000;

    var loadDataAndSetupVisualizations = function () {
        setupMap();
        setupTimeline();
        setupDoughnut()
        setupCalendar();
        setupScatterPlot();
        setupTreemap();
    };

    /* --------- MAP AND TIMELINE ----------  */

    var setupMap = function () {
        const width = 1000;
        const height = 800;
        var margin = { top: 40, right: 50, bottom: 40, left: 50 };

        var isAnimationToggled = false;
        var dataset;
        var xScale, yScale;
        var brush;
        const map = {
            width: width,
            height: height * 8 / 10,
        };      

        const drawMap = (geoJson) => {

            const projection = d3.geoMercator()
                .fitExtent([[0, 0], [map.width, map.height]], geoJson);
            geoGenerator = d3.geoPath(projection);
        
            //create svg
            const svg = d3.select('#map')
                .append('svg')
                .attr('width', map.width)
                .attr('height', map.height)
                .attr('id', 'Figure1');

            var g = svg.append('g');
        
            // plot paths
            g.selectAll('path')
                .data(geoJson.features)
                .enter()
                .append('path')
                .attr('d', geoGenerator)
                .attr('class', 'path')
                .on("click", function(d, i) {
                    zoomToFeature(d, this);
                    redrawTimeline(i);
                })
                /*.on("mouseover", function(d, i) {
                    d3.select(this).style('fill', config.colors.hover);
                });
                .on("mouseout", function(d, i) {
                    d3.select(this).style('fill', config.colors.basemap[i]);
                })*/

                d3.json('./data/district-agr.json', (err, data) => {
                                    
                    var min = d3.min(data.Districts, (d) => {
                        return d.count;
                    });
                    var max = d3.max(data.Districts, (d) => {
                        return d.count;
                    });
                
                    var colorScale = d3.scaleQuantize()
                        .domain([min, max])
                        .range(config.colors.scaleColors);

                    svg.selectAll('path')
                        .style("fill", (d, i) => {                            
                            return colorScale(data.Districts[i].count);
                        });

                });
        
            const radialGradient = svg.append("defs")
                .append("radialGradient")
                .attr("id", "radial-gradient");
        
            radialGradient.append("stop")
                .attr("offset", "0%")
                .attr("stop-color", "red")
                .attr("stop-opacity", 0.5);
        
            radialGradient.append("stop")
                .attr("offset", "100%")
                .attr("stop-color", "rgba(255, 0, 0, 0)")
                .attr("stop-opacity", 0);
        
            g.append("text")
                .attr("x", (width / 2))             
                .attr("y", map.height)
                .attr("text-anchor", "middle")   
                .text("LAPD Divisons");
                
            g.selectAll('text.divison-label')
                .data(geoJson.features)
                .enter()
                .append('text')
                .attr('class', 'divison-label')
                .attr("x", function(d) {
                    return geoGenerator.centroid(d)[0];
                })
                .attr("y", function(d) {
                    return geoGenerator.centroid(d)[1];
                })
                .text(function(d) {
                    return d.properties.name;  
                });
        
            /*//add points
            d3.json('./data/agr.json', (data) => {
                //console.log(data);
        
                svg.selectAll('circle')
                    .data(data)
                    .enter()
                    .append('circle')
                    .attr('cx', (d) => {
                        //console.log(d);
        
                        return projection([d.location.y, d.location.x])[0];
                    })
                    .attr('cy', (d) => {
                        return projection([d.location.y, d.location.x])[1];
                    })
                    .attr('r', (d) => {
                        return d.count / 1000
                    })
                    // .style('fill', 'rgba(255, 0, 0, 0.2)')
                    .style('fill', 'url(#radial-gradient)')
                    .attr('id', (d) => { return d.lat + '|' + d.lon })
            })*/
        };

        d3.json('./data/la.geojson', (err, geoJson) => {
            drawMap(geoJson);
            hideLoader('map');
        });
    };

    const setupTimeline = () => {

        const width = 1000;
        const height = 800;
        const margin = { top: 20, right: 50, bottom: 40, left: 50 };
        const timeline = {
            width: width - margin.left - margin.right,
            height: height * 3 / 10 - margin.top - margin.bottom,
            padding: 30
        }

        const svg = d3.select('#timeline')
            .append('svg')
            .attr('width', timeline.width + margin.left + margin.right)
            .attr('height', timeline.height + margin.top + margin.bottom)
            .append('g')
            .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

        d3.json('./data/districts/d1.json', (err, data) => {
            populateTimeline(data);
            hideLoader('timeline');
        });
    };

    const populateTimeline = (data) => {
        const width = 1000;
        const height = 800;
        const margin = { top: 20, right: 50, bottom: 40, left: 50 };
        const timeline = {
            width: width - margin.left - margin.right,
            height: height * 3 / 10 - margin.top - margin.bottom,
            padding: 30
        }

        const svg = d3.selectAll('#timeline svg g');
        let parseTime = d3.timeParse("%m/%d/%Y");

        var dataWithDates = data.map(function(d) {
            d.time = parseTime(d.time);
            return d;
        });
    
        const startDate = d3.min(data, function (d) {
            return d.time;
        });

        const endDate = d3.max(data, function (d) {
            return d.time;
        });
    
        const xScale = d3.scaleTime()
            .domain([startDate, endDate])
            .rangeRound([0, timeline.width]);
    
        const yScale = d3.scaleLinear()
            .domain([0, d3.max(data, function (d) { return d.Locations.length; })])
            .range([timeline.height, 0]);
    
        const xAxis = d3.axisBottom()
            .scale(xScale);
    
        const yAxis = d3.axisLeft()
            .scale(yScale)
            .ticks(10);
       
        svg.selectAll('rect')
            .data(data)
            .enter()
            .append('rect')
            .attr('x', function (d) {
                return xScale(d.time);
            })
            .attr('y', function (d) {
                return yScale(d.Locations.length);
            })
            .attr('width', timeline.width / data.length)
            .attr('height', function (d) {
                return timeline.height - yScale(d.Locations.length);
            })
            .attr('fill', 'darkslateblue');
    
        svg.append('g')
            .attr('class', 'axis')
            .attr('transform', 'translate(0,' + (timeline.height) + ')')
            .call(xAxis);
    
        svg.append('g')
            .attr('class', 'axis')
            .attr('transform', 'translate(0,0)')
            .call(yAxis);         
    
        svg.append('text')
            .attr('class', 'label')
            .attr('text-anchor', 'middle')
            .attr('x', timeline.width / 2)
            .attr('y', timeline.height + timeline.padding)
            .text('Day');
    
        svg.append('text')
            .attr('text-anchor', 'middle')
            .attr('transform', 'translate(' + -(timeline.padding) + ',' + (timeline.height / 2) + ')rotate(-90)')
            .text('# of Arrests');
    
        const x = d3.scaleTime()
            .range([0, timeline.width]);
    };

    const redrawTimeline = (id) => {
        d3.json('./data/districts/d' + id + '.json', (err, data) => {
            const g = d3.selectAll('#timeline svg g');
            g.selectAll("*").remove();
            populateTimeline(data);
            hideLoader('timeline');
        });
    };

    const reset = () => {
        activeFeature.classed("active", false);
        activeFeature = d3.select(null);

        d3.selectAll('#map svg')
            .transition()
            .duration(mapTransitionTime)
            .call(zoom.transform, d3.zoomIdentity);
    };

    const zoomed = () => {
        var g = d3.selectAll('#map svg g');
        g.style("stroke-width", 1.5 / d3.event.transform.k + "px");
        g.attr("transform", d3.event.transform);
    };

    const zoom = d3.zoom()
        .scaleExtent([1, 10])
        .on("zoom", zoomed); 

    const zoomToFeature = (d, that) => {
        const width = 1000;
        const height = 800;
        var margin = { top: 40, right: 50, bottom: 40, left: 50 };

        var isAnimationToggled = false;
        var dataset;
        var xScale, yScale;
        var brush;
        const map = {
            width: width,
            height: height * 8 / 10,
        }; 

        if (activeFeature.node() === that){
            return reset();
        } 
        activeFeature.classed("active", false);
        activeFeature = d3.select(that)
            .classed("active", true);
      
        var bounds = geoGenerator.bounds(d),
            dx = bounds[1][0] - bounds[0][0],
            dy = bounds[1][1] - bounds[0][1],
            x = (bounds[0][0] + bounds[1][0]) / 2,
            y = (bounds[0][1] + bounds[1][1]) / 2,
            scale = Math.max(1, Math.min(8, 0.9 / Math.max(dx / width, dy / height))),
            translate = [map.width / 2 - scale * x, map.height / 2 - scale * y];
      
        const svg = d3.selectAll('#map svg');
        svg.transition()
            .duration(mapTransitionTime)
            .call(zoom.transform, d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale));
    };


    /* --------- DOUGHNUT ----------  */

    var setupDoughnut = function () {
        console.log('init doughnut');
    };

    /* --------- CALENDAR ----------  */

    var setupCalendar = function () {
        drawCalendar();
        hideLoader();
    };

    var drawCalendar = function(data){
        var width = 960,
        height = 136,
        cellSize = 17;

        var formatPercent = d3.format(".1%");

        var color = d3.scaleQuantize()
            .domain([-0.05, 0.05])
            .range(["#a50026", "#d73027", "#f46d43", "#fdae61", "#fee08b", "#ffffbf", "#d9ef8b", "#a6d96a", "#66bd63", "#1a9850", "#006837"]);

        var svg = d3.select("#calendar")
            .selectAll("svg")
            .data(d3.range(2016, 2017))
            .enter().append("svg")
            .attr("width", width)
            .attr("height", height)
            .append("g")
            .attr("transform", "translate(" + ((width - cellSize * 53) / 2) + "," + (height - cellSize * 7 - 1) + ")");

        svg.append("text")
            .attr("transform", "translate(-6," + cellSize * 3.5 + ")rotate(-90)")
            .attr("font-family", "sans-serif")
            .attr("font-size", 10)
            .attr("text-anchor", "middle")
            .text(function(d) { return d; });

        var rect = svg.append("g")
            .attr("fill", "none")
            .attr("stroke", "#ccc")
            .selectAll("rect")
            .data(function(d) { return d3.timeDays(new Date(d, 0, 1), new Date(d + 1, 0, 1)); })
            .enter().append("rect")
            .attr("width", cellSize)
            .attr("height", cellSize)
            .attr("x", function(d) { return d3.timeWeek.count(d3.timeYear(d), d) * cellSize; })
            .attr("y", function(d) { return d.getDay() * cellSize; })
            .datum(d3.timeFormat("%Y-%m-%d"));

        svg.append("g")
            .attr("fill", "none")
            .attr("stroke", "#000")
            .selectAll("path")
            .data(function(d) { return d3.timeMonths(new Date(d, 0, 1), new Date(d + 1, 0, 1)); })
            .enter().append("path")
            .attr("d", pathMonth);

        function pathMonth(t0) {
            var t1 = new Date(t0.getFullYear(), t0.getMonth() + 1, 0),
                d0 = t0.getDay(), w0 = d3.timeWeek.count(d3.timeYear(t0), t0),
                d1 = t1.getDay(), w1 = d3.timeWeek.count(d3.timeYear(t1), t1);
            return "M" + (w0 + 1) * cellSize + "," + d0 * cellSize
                + "H" + w0 * cellSize + "V" + 7 * cellSize
                + "H" + w1 * cellSize + "V" + (d1 + 1) * cellSize
                + "H" + (w1 + 1) * cellSize + "V" + 0
                + "H" + (w0 + 1) * cellSize + "Z";
        }
    }

    /* --------- SCATTER PLOT ----------  */

    var setupScatterPlot = function () {
        console.log('init scatter plot');
    };

    /* --------- TREE MAP ----------  */

    var setupTreemap = function () {
        console.log('init treemap');
    };

    var hideLoader = function (parentId) {
        $('#' + parentId).find('.loader').hide()
    };

    var load = function () {
        loadDataAndSetupVisualizations();
    };

    

    return {
        load: load,
        redrawTimeline: redrawTimeline
    }

})();