const Visualization = (() => {

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
        const width = 600;
        const height = 800;
        margin = { top: 40, right: 50, bottom: 40, left: 50 };

        var isAnimationToggled = false;
        var dataset;
        var xScale, yScale;
        var brush;
        const map = {
            width: width,
            height: height * 8 / 10,
            timeline: {
                width: width - margin.left - margin.right,
                height: height * 3 / 10 - margin.top - margin.bottom,
                padding: 30,
            }
        };

        const drawMap = (geoJson) => {

            const projection = d3.geoMercator()
                .fitExtent([[0, 0], [map.width, map.height]], geoJson);
            const geoGenerator = d3.geoPath(projection);
        
            //create svg
            const svg = d3.select('#map')
                .append('svg')
                .attr('width', map.width)
                .attr('height', map.height)
                .attr('id', 'Figure1');
        
            // plot paths
            svg.selectAll('path')
                .data(geoJson.features)
                .enter()
                .append('path')
                .attr('d', geoGenerator);
                /*.on("mouseover", function(d, i) {
                    d3.select(this).style('fill', config.colors.hover);
                })
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
                            console.log(data.Districts[i].count);
                            console.log(colorScale(data.Districts[i].count));
                            
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
        
            //create title 
            svg.append("text")
                .attr("x", (width / 2))             
                .attr("y", map.height)
                .attr("text-anchor", "middle")   
                .text("LAPD Divisons");
                
            // add labels to divisions
            svg.selectAll('text.divison-label')
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

        const drawTimeline = (data) => {
            const entries = d3.nest()
                .key(function (d) { return d["Arrest Date"]; })
                .entries(data);
        
            const parseTime = d3.timeParse('%m/%d/%Y');
        
            for (let i = 0; i < data.length; i++) {
                data[i]["Arrest Date"] = parseTime(data[i]["Arrest Date"]);
            }
        
            data.sort((x, y) => {
                return d3.ascending(x["Arrest Date"], y["Arrest Date"]);
            });
        
            const startDate = d3.min(entries, function (d) {
                return parseTime(d.key);
            });
            const endDate = d3.max(entries, function (d) {
                return parseTime(d.key);
            });
        
            const xScale = d3.scaleTime()
                .domain([startDate, endDate])
                .rangeRound([0, map.timeline.width]);
        
            const yScale = d3.scaleLinear()
                .domain([0, d3.max(entries, function (d) { return d.values.length; })])
                .range([map.timeline.height, 0]);
        
            const xAxis = d3.axisBottom()
                .scale(xScale);
        
            const yAxis = d3.axisLeft()
                .scale(yScale)
                .ticks(10); // check how many
        
            const svg = d3.select('#timeline')
                .append('svg')
                .attr('width', map.timeline.width + margin.left + margin.right)
                .attr('height', map.timeline.height + margin.top + margin.bottom)
                .append('g')
                .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
        
            svg.selectAll('rect')
                .data(entries)
                .enter()
                .append('rect')
                .attr('x', function (d) {
                    return xScale(parseTime(d.key));
                })
                .attr('y', function (d) {
                    return yScale(d.values.length);
                })
                .attr('width', map.timeline.width / entries.length)
                .attr('height', function (d) {
                    return map.timeline.height - yScale(d.values.length);
                })
                .attr('fill', 'darkslateblue');
        
            svg.append('g')
                .attr('class', 'axis')
                .attr('transform', 'translate(0,' + (map.timeline.height) + ')')
                .call(xAxis);
        
            svg.append('g')
                .attr('class', 'axis')
                .attr('transform', 'translate(0,0)')
                .call(yAxis);
        
            svg.append('text')
                .attr('class', 'label')
                .attr('text-anchor', 'middle')
                .attr('x', map.timeline.width / 2)
                .attr('y', map.timeline.height + map.timeline.padding)
                .text('Day');
        
            svg.append('text')
                .attr('text-anchor', 'middle')
                .attr('transform', 'translate(' + -(map.timeline.padding) + ',' + (map.timeline.height / 2) + ')rotate(-90)')
                .text('# of Arrests');
        
            const x = d3.scaleTime()
                .range([0, map.timeline.width]);
        };

        d3.json('./data/all-arrests.json', (err, data) => {
            //drawTimeline(data);
            hideLoader('timeline');
        });
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
        load: load
    }

})();