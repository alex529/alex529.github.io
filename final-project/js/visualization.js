String.prototype.width = function(font) {
    var f = font || '15px arial',
        o = $('<div></div>')
              .text(this)
              .css({'position': 'absolute', 'float': 'left', 'white-space': 'nowrap', 'visibility': 'hidden', 'font': f})
              .appendTo($('body')),
        w = o.width();
  
    o.remove();
  
    return w;
  }
  
const Visualization = (() => {

    var activeFeature = d3.select(null);
    var geoGenerator, projection;
    let oldti1 = 0, oldti2 = 0
    var allCalendarsLoaded = false;



    var loadDataAndSetupVisualizations = function () {
        setupMap();
        setupDoughnut();
        setupCalendar();
        setupScatterPlot();
        setupTreemap();
    };

    /* --------- MAP AND TIMELINE ----------  */

    var setupMap = function () {
        const width = 800;
        const height = 800;
        var margin = { top: 40, right: 50, bottom: 40, left: 50 };


        var dataset;
        var xScale, yScale;
        var brush;
        const map = {
            width: width,
            height: height * 8 / 10,
        };

        const drawMap = (geoJson) => {

            projection = d3.geoMercator()
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
                .on("click", function (d, i) {
                    let id = d.properties.external_id;
                    if (activeFeature.node() === this) {
                        resetZoom();
                        resetCharts();
                    }
                    else {
                        redrawCharts(d, id, this);
                    }


                });
            /*.on("mouseover", function(d, i) {
                d3.select(this).style('fill', config.colors.hover);
            });
            .on("mouseout", function(d, i) {
                d3.select(this).style('fill', config.colors.basemap[i]);
            })*/

            d3.json('./data/district-agr.json', (err, data) => {

                //data.Districts.splice(0, 1);

                let tmpDistricts = data.Districts.slice(0); // clone array
                tmpDistricts.splice(0, 1); // removing index 0 because it contains no data

                var min = d3.min(tmpDistricts, (d) => {
                    return d.count;
                });
                var max = d3.max(tmpDistricts, (d) => {
                    return d.count;
                });

                var colorScale = d3.scaleQuantize()
                    .domain([min, max])
                    .range(config.colors.scaleColors);

                svg.selectAll('path')
                    .style("fill", (d, i) => {
                        let id = d.properties.external_id;
                        return colorScale(data.Districts[id].count);
                    })
                    .append("title")
                    .text(function (d) {
                        return d.properties.name + ": " + data.Districts[d.properties.external_id].count + " arrests";
                    });;

                let legendSvg = d3.select('#color-legend')
                    .append('svg')
                    .attr('height', '400');

                legendSvg.append("g")
                    .attr("class", "legendQuant")
                    .attr("transform", "translate(20,20)");

                let legend = d3.legendColor()
                    .shapeWidth(25)
                    .shapeHeight(25)
                    .labelFormat(d3.format(".0f"))
                    .useClass(false)
                    .title("Number of arrests")
                    .scale(colorScale);

                legendSvg.select(".legendQuant")
                    .call(legend);

                hideLoader("color-legend");
            });

            const radialGradient = svg.append("defs")
                .append("radialGradient")
                .attr("id", "radial-gradient");

            radialGradient.append("stop")
                .attr("offset", "0%")
                .attr("stop-color", "rgba(136,0,69, 1)")
                .attr("stop-opacity", 0.2);

            radialGradient.append("stop")
                .attr("offset", "100%")
                .attr("stop-color", "rgba(136,0,69, 0)")
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
                .attr("x", function (d) {
                    return geoGenerator.centroid(d)[0];
                })
                .attr("y", function (d) {
                    return geoGenerator.centroid(d)[1];
                })
                .text(function (d) {
                    return d.properties.name;
                });
        };

        d3.json('./data/la.geojson', (err, geoJson) => {
            drawMap(geoJson);
            hideLoader('map');
        });
    };

    const setupTimeline = () => {

        hideLoader('timeline');

        const width = 1000;
        const height = 600;
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
            .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
        // .style('display', 'none');
    };

    const populateTimeline = (data) => {
        const width = 1000;
        const height = 600;
        const margin = { top: 20, right: 50, bottom: 40, left: 50 };
        const timeline = {
            width: width - margin.left - margin.right,
            height: height * 3 / 10 - margin.top - margin.bottom,
            padding: 30
        }

        const svg = d3.selectAll('#timeline svg g');
        let parseTime = d3.timeParse("%m/%d/%Y");

        var dataWithDates = data.map(function (d) {
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
            .domain([0, d3.max(data, function (d) {
                let count = 0;
                for (let k in d.Locations) {
                    if (d.Locations.hasOwnProperty(k)) {
                        count += d.Locations[k].count;
                    }
                }
                return count;
            })])
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
                let count = 0;
                for (let k in d.Locations) {
                    if (d.Locations.hasOwnProperty(k)) {
                        count += d.Locations[k].count;
                    }
                }
                return yScale(count);
            })
            .attr('width', timeline.width / data.length)
            .attr('height', function (d) {
                let count = 0;
                for (let k in d.Locations) {
                    if (d.Locations.hasOwnProperty(k)) {
                        count += d.Locations[k].count;
                    }
                }
                return timeline.height - yScale(count);
            })
            .attr('fill', 'rgb(216, 103, 119)');

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


        oldti1 = [xScale.domain()[0], 0]
        oldti2 = [xScale.domain()[1], data.length - 1]

        const brushed = () => {
            var s = d3.event.selection || x.range();

            const t1 = (xScale.invert(s[0]));
            const t2 = (xScale.invert(s[1]));
            let circles = d3.selectAll('#map svg circle');

            circles.attr("class", "not-brushed");

            circles.filter(function (d) {
                return t1 <= d.time && d.time <= t2;
            })
                .attr("class", "brushed");
        }

        brush = d3.brushX()
            .extent([[0, 0], [timeline.width, timeline.height]])
            .on("brush end", brushed);

        svg.append("g")
            .attr("class", "brush")
            .call(brush)
            .call(brush.move, x.range());

    };

    const redrawCharts = (d, id, that) => {
        d3.json('./data/districts/d' + id + '.json', (err, data) => {
            window.setTimeout(() => {
                resetCharts();
                redrawTimeline(data);
                redrawMapPoints(data);
                zoomToFeature(d, that);
            }, config.mapTransitionTime - 500);
        });
    };

    const redrawTimeline = (data) => {
        setupTimeline();
        populateTimeline(data);
        hideLoader('timeline');
    }

    const ln5 = Math.log(50)

    const redrawMapPoints = (data) => {
        const svg = d3.select('#map svg')
        var groups = svg.selectAll('g')
            .data(data)
            .enter()

        var circles = groups.selectAll('circle')
            .data(function (d) {

                for (let k in d.Locations)
                    d.Locations[k].time = d.time

                return d.Locations;
            })
            .enter()
            .append('circle')
            .attr('cx', (d) => {
                if (d.location.y != 0) {
                    return projection([d.location.y, d.location.x])[0];
                }
            })
            .attr('cy', (d) => {
                if (d.location.y != 0) {
                    return projection([d.location.y, d.location.x])[1];
                }
            })
            .attr('r', (d) => {
                const r = Math.log(d.count) / ln5
                return r < 0.3 ? 0.3 : r
            })
            .style('fill', 'url(#radial-gradient)')
            .attr('id', (d) => { return d.id });

        return circles;
    }

    const resetCharts = () => {
        resetMap();
        resetTimeline();
    }

    const resetMap = () => {
        d3.selectAll('#map svg circle')
            .remove();
    }

    const resetTimeline = () => {
        d3.selectAll('#timeline svg')
            .remove();
    }

    const resetZoom = () => {
        activeFeature.classed("active", false);
        activeFeature = d3.select(null);

        d3.selectAll('#map svg')
            .transition()
            .duration(config.mapTransitionTime)
            .call(zoom.transform, d3.zoomIdentity);
    };

    const zoomed = () => {
        d3.selectAll('#map svg g')
            .style("stroke-width", 1.5 / d3.event.transform.k + "px")
            .attr("transform", d3.event.transform);

        d3.selectAll('#map svg circle')
            .attr("transform", d3.event.transform);
    };

    const zoom = d3.zoom()
        .scaleExtent([1, 10])
        .on("zoom", zoomed);

    const zoomToFeature = (d, that) => {
        const width = 800;
        const height = 800;
        var margin = { top: 40, right: 50, bottom: 40, left: 50 };

        var dataset;
        var xScale, yScale;
        var brush;
        const map = {
            width: width,
            height: height * 8 / 10,
        };
        activeFeature.classed("active", false);
        activeFeature = d3.select(that)
            .classed("active", true);

        var bounds = geoGenerator.bounds(d),
            dx = bounds[1][0] - bounds[0][0],
            dy = bounds[1][1] - bounds[0][1],
            x = (bounds[0][0] + bounds[1][0]) / 2,
            y = (bounds[0][1] + bounds[1][1]) / 2,
            scale = Math.max(1, Math.min(8, 0.9 / Math.max(dx / map.width, dy / map.height))),
            translate = [map.width / 2 - scale * x, map.height / 2 - scale * y];

        const svg = d3.selectAll('#map svg');
        svg.transition()
            .duration(config.mapTransitionTime)
            .call(zoom.transform, d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale));
    };


    /* --------- CALENDAR ----------  */

    var setupCalendar = function () {
        d3.json('data/calendar/calendar-agr.json', (err, data) => {
            drawCalendar(data, true);
            hideLoader('calendar');
        });
    };

    const toggleCalendars = function () {
        let wrapper = $("#yearly-calendars");
        wrapper.toggle();

        let calendarBtn = $("#calendar-btn");

        if($(wrapper).is(":visible"))
            calendarBtn.html("- Collapse years");
        else
            calendarBtn.html("+ Expand years");

        if(!allCalendarsLoaded)
            loadAllCalendars();
        
    }

    const loadAllCalendars = function () {
        d3.json('data/calendar/calendar-by-year.json', (err, data) => {
            for(year in data){
                drawCalendar(data[year], false, year);
                hideLoader("calendar-" + year);                 
            }
        });
    }

    d3.json('data/calendar/calendar-by-year.json', (err, data) => {
        for(year in data){
            drawCalendar(data[year], false, year);
            hideLoader("calendar-" + year);                 
        }
    });

    var drawCalendar = function (data, groupedYears, year) {
        var width = 960,
            height = 150,
            cellSize = 17;

        var formatPercent = d3.format(".1%");

        let id = "#calendar";
        id += groupedYears ? "" : "-" + year;

        let range = [];
        if (groupedYears)
            range = [2006, 2007];
        else
            range = [parseInt(year), parseInt(year) + 1];

        var svg = d3.select(id)
            .selectAll("svg")
            .data(d3.range(range[0], range[1]))
            .enter().append("svg")
            .attr("width", width)
            .attr("height", height)
            .append("g")
            .attr("transform", "translate(" + ((width - cellSize * 53) / 2) + "," + (height - cellSize * 7 - 1) + ")");

        /*
            SHOW YEARS, DAYS, MONTHS
        */
        if (groupedYears) {
            svg.append("text")
                .attr("dy", -20)
                .attr("dx", width / 2)
                .attr("font-family", "sans-serif")
                .attr("font-size", 14)
                .attr("text-anchor", "middle")
                .text(function (d) { return "Arrests per date (Aggregated data from all years)"; });
        }
        else {
            svg.append("text")
                .attr("dy", -20)
                .attr("dx", width / 2)
                .attr("font-family", "sans-serif")
                .attr("font-size", 14)
                .attr("text-anchor", "middle")
                .text(function (d) { return d });
        }

        month = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        for (var i = 0; i < month.length; i++) {
            x = (i + 1) * 4.33 * cellSize - cellSize;
            svg.append("text")
                .attr("class", "calendar-month")
                .style("text-anchor", "end")
                .attr("dy", "-.25em")
                .attr("dx", x)
                .text(month[i]);
        }

        if (!groupedYears) {
            days = ['Sun', 'Mon', 'Tue', 'Wes', 'Thu', 'Fri', 'Sat'];
            for (var j = 0; j < days.length; j++) {
                y = cellSize + j * cellSize - 5;
                svg.append("text")
                    .attr("class", "calendar-day")
                    .style("text-anchor", "end")
                    .attr("dy", y)
                    .attr("dx", "-1em")
                    .text(days[j]);
            }
        }

        var rect = svg.append("g")
            .attr("fill", "none")
            .attr("stroke", "#ccc")
            .selectAll("rect")
            .data(function (d) { return d3.timeDays(new Date(d, 0, 1), new Date(d + 1, 0, 1)); })
            .enter().append("rect")
            .attr("width", cellSize)
            .attr("height", cellSize)
            .attr("x", function (d) { return d3.timeWeek.count(d3.timeYear(d), d) * cellSize; })
            .attr("y", function (d) { return d.getDay() * cellSize; })
            .datum(d3.timeFormat("%d-%m"));

        svg.append("g")
            .attr("fill", "none")
            .attr("stroke", "#000")
            .selectAll("path")
            .data(function (d) { return d3.timeMonths(new Date(d, 0, 1), new Date(d + 1, 0, 1)); })
            .enter().append("path")
            .attr("d", pathMonth);

        if (groupedYears) {
            delete data['29-02'];
        }

        let minCount = d3.min(d3.values(data));
        let maxCount = d3.max(d3.values(data));

        var color = d3.scaleQuantize()
            .domain([minCount, maxCount])
            .range(config.colors.scaleColors);

        rect.filter(function (d) { return d in data; })
            .attr("fill", function (d) {
                return color(data[d]);
            });

        rect.filter(function (d) { return d in config.celebrationDays })
            .attr('stroke', 'white')
            .attr('stroke-width', '3')
            .attr('stroke-dasharray', '5, 5, 1, 5')
            .attr('shape-rendering', "crispEdges")
            .append("title")
            .text(function (d) {
                return d + ": " + config.celebrationDays[d];
            });

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



    /* --------- DOUGHNUT ----------  */

    var setupDoughnut = function () {
        drawGenderDoughnut();
        drawDescentDoughnut();
        drawAgeDoughnut();
    };
    var drawDescentDoughnut = function () {
        //Width and height
        var margin = { top: 0, right: 0, bottom: 0, left: 10 };
        var width = 300 - margin.left - margin.right,
            height = 400 - margin.top - margin.bottom;
        padding = 100;
        var dataset, xScale, yScale, xAxis, yAxis;  //Empty, for now 
        var startDate, endDate;


        function rowConverter(d) {
            return {
                Races: d.Races,
                SumRaces: d.Sum
            };
        }

        d3.csv("./data/excel/descent_code_pie_chart_resampled.csv", rowConverter, function (error, rawData) {
            if (error) {
                console.log("Please check if the CSV file is present");
            }
            dataSet = rawData;
            //Width and height
            var w = 250;
            var h = 250;
            var outerRadius = w / 2;
            var innerRadius = w / 3;
            var arc = d3.arc()
                .innerRadius(innerRadius)
                .cornerRadius(3) // sets how rounded the corners are on each slice                        
                .outerRadius(outerRadius);

            var pie = d3.pie()
                .value(function (d) { return d.SumRaces; })
                .padAngle(0.01);
            //Easy colors accessible via a 10-step ordinal scale
            var color = d3.scaleOrdinal(d3.schemeCategory10);

            //Create SVG element
            var svg = d3.select("#doughnut1").append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

            //Set up groups
            var arcs = svg.selectAll("g.arc")
                .data(pie(dataSet))
                .enter()
                .append("g")
                .attr("class", "arc")
                .attr("transform", "translate(" + outerRadius + "," + outerRadius + ")");

            //calculate total
            var total = d3.sum(dataSet, function (d) { return d.SumRaces });

            //Draw arc paths
            arcs.append("path")
                .attr("fill", function (d, i) {
                    return color(i);
                })
                .attr("d", arc)
                .data(dataSet)
                .append("title")
                .text(function (d) {
                    return "The number of " + d.Races + " is: " + d.SumRaces + " or " + Math.round(d.SumRaces / total * 100) + "%";
                });

            //legend
            var legendRectSize = 14;
            var legendSpacing = 3;

            var legend = svg.selectAll('.legend')
                .data(color.domain())
                .enter()
                .append('g')
                .attr('class', 'legend')
                .attr('transform', function (d, i) {
                    var hLegend = legendRectSize + legendSpacing;
                    var horz = 7 * legendRectSize;
                    var vert = i * hLegend + h / 2.8;
                    return 'translate(' + horz + ',' + vert + ')';
                });

            legend.append('rect')
                .attr('width', legendRectSize)
                .attr('height', legendRectSize)
                .style('fill', color)
                .style('stroke', color);

            legend.append('text')
                .data(dataSet)
                .attr('x', legendRectSize + legendSpacing)
                .attr('y', legendRectSize - legendSpacing)
                .text(function (d) { return d.Races; });


            //Labels
            arcs.append("text")
                .attr("text-anchor", "middle")
                .attr("transform", function (d) {
                    var _d = arc.centroid(d);
                    _d[0] *= 1.35;	//multiply by a constant factor
                    _d[1] *= 1.35;	//multiply by a constant factor
                    return "translate(" + _d + ")";
                })
                .attr("dy", ".50em")
                .data(dataSet)
                .text(function (d) {
                    return Math.round(d.SumRaces / total * 100) + "%";
                });

            //Title
            svg.append("text")
                .attr("x", (width / 2) - 20)
                .attr("y", (margin.bottom + 300))
                .attr("text-anchor", "middle")
                .style("font-size", "10px")
                .data(dataSet)
                .text("Distribution of arrests based on Race");
        });

    };
    var drawGenderDoughnut = function () {
        //Width and height
        var margin = { top: 0, right: 0, bottom: 0, left: 0 };
        var width = 300 - margin.left - margin.right,
            height = 400 - margin.top - margin.bottom;
        padding = 100;
        var dataset, xScale, yScale, xAxis, yAxis;  //Empty, for now 
        var startDate, endDate;

        function rowConverter(d) {
            return {
                Gender: d.Gender,
                SumGender: d.Sum
            };
        }


        d3.csv("./data/excel/sex_code_pie_chart.csv", rowConverter, function (error, rawData) {
            if (error) {
                console.log("Please check if the CSV file is present");
            }
            dataSet = rawData;
            //Width and height
            var w = 250;
            var h = 250;
            var outerRadius = w / 2;
            var innerRadius = w / 3;
            var arc = d3.arc()
                .innerRadius(innerRadius)
                .cornerRadius(3) // sets how rounded the corners are on each slice
                .outerRadius(outerRadius);

            var pie = d3.pie()
                .value(function (d) { return d.SumGender; })
                .padAngle(0.01);
            //Easy colors accessible via a 10-step ordinal scale
            var color = d3.scaleOrdinal(d3.schemeCategory10);

            //Create SVG element
            var svg = d3.select("#doughnut2").append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

            //Set up groups
            var arcs = svg.selectAll("g.arc")
                .data(pie(dataSet))
                .enter()
                .append("g")
                .attr("class", "arc")
                .attr("transform", "translate(" + outerRadius + "," + outerRadius + ")");

            //calculate total
            var total = d3.sum(dataSet, function (d) { return d.SumGender });

            //Draw arc paths
            arcs.append("path")
                .attr("fill", function (d, i) {
                    return color(i);
                })
                .attr("d", arc)
                .data(dataSet)
                .append("title")
                .text(function (d) {
                    return "The number of " + d.Gender + " is: " + d.SumGender + " or " + Math.round(d.SumGender / total * 100) + "%";
                });

            //legend
            var legendRectSize = 14;
            var legendSpacing = 3;

            var legend = svg.selectAll('.legend')
                .data(color.domain())
                .enter()
                .append('g')
                .attr('class', 'legend')
                .attr('transform', function (d, i) {
                    var hLegend = legendRectSize + legendSpacing;
                    //var offset2 =  h * color.domain().length / 2;
                    var horz = 7 * legendRectSize;
                    var vert = i * hLegend + h / 2.2;
                    return 'translate(' + horz + ',' + vert + ')';
                });

            legend.append('rect')
                .attr('width', legendRectSize)
                .attr('height', legendRectSize)
                .style('fill', color)
                .style('stroke', color);

            legend.append('text')
                .data(dataSet)
                .attr('x', legendRectSize + legendSpacing)
                .attr('y', legendRectSize - legendSpacing)
                .text(function (d) { return d.Gender; });

            //Labels
            arcs.append("text")
                .attr("text-anchor", "middle")
                .attr("transform", function (d) {
                    var _d = arc.centroid(d);
                    _d[0] *= 1.35;	//multiply by a constant factor
                    _d[1] *= 1.35;	//multiply by a constant factor
                    return "translate(" + _d + ")";
                })
                .attr("dy", ".50em")
                .data(dataSet)
                .text(function (d) {
                    return Math.round(d.SumGender / total * 100) + "%";
                });
            //Title
            svg.append("text")
                .attr("x", (width / 2) - 20)
                .attr("y", (margin.bottom + 300))
                .attr("text-anchor", "middle")
                .style("font-size", "10px")
                .data(dataSet)
                .text("Distribution of arrests based on Gender");

            //General title
            svg.append("text")
                .attr("x", (width / 2) - 20)
                .attr("y", (margin.bottom + 340))
                .attr("text-anchor", "middle")
                .style("font-size", "12px")
                .data(dataSet)
                .text("All distributions are for the 2010-2018 interval");                 

        });
    };
    var drawAgeDoughnut = function () {
        //Width and height
        var margin = { top: 0, right: 10, bottom: 0, left: 0 };
        var width = 300 - margin.left - margin.right,
            height = 400 - margin.top - margin.bottom;
        padding = 100;
        var dataset, xScale, yScale, xAxis, yAxis;  //Empty, for now 
        var startDate, endDate;

        function rowConverter(d) {
            return {
                Age: d.Age,
                SumAge: d.Sum_Age
            };
        }


        d3.csv("./data/excel/descent_code_pie_age.csv", rowConverter, function (error, rawData) {
            if (error) {
                console.log("Please check if the CSV file is present");
            }
            dataSet = rawData;
            //Width and height
            var w = 250;
            var h = 250;
            var outerRadius = w / 2;
            var innerRadius = w / 3;
            var arc = d3.arc()
                .innerRadius(innerRadius)
                .cornerRadius(3) // sets how rounded the corners are on each slice
                .outerRadius(outerRadius);

            var pie = d3.pie()
                .value(function (d) { return d.SumAge; })
                .padAngle(0.01);
            //Easy colors accessible via a 10-step ordinal scale
            var color = d3.scaleOrdinal(d3.schemeCategory10);

            //Create SVG element
            var svg = d3.select("#doughnut3").append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

            //Set up groups
            var arcs = svg.selectAll("g.arc")
                .data(pie(dataSet))
                .enter()
                .append("g")
                .attr("class", "arc")
                .attr("transform", "translate(" + outerRadius + "," + outerRadius + ")");

            //calculate total
            var total = d3.sum(dataSet, function (d) { return d.SumAge });

            //Draw arc paths
            arcs.append("path")
                .attr("fill", function (d, i) {
                    return color(i);
                })
                .attr("d", arc)
                .data(dataSet)
                .append("title")
                .text(function (d) {
                    return "The number of arrest for the age " + d.Age + " is: " + d.SumAge + " or " + Math.round(d.SumAge / total * 100) + "%";
                });

            //legend
            var legendRectSize = 14;
            var legendSpacing = 3;

            var legend = svg.selectAll('.legend')
                .data(color.domain())
                .enter()
                .append('g')
                .attr('class', 'legend')
                .attr('transform', function (d, i) {
                    var hLegend = legendRectSize + legendSpacing;
                    //var offset2 =  h * color.domain().length / 2;
                    var horz = 7 * legendRectSize;
                    var vert = i * hLegend + h / 4.2;
                    return 'translate(' + horz + ',' + vert + ')';
                });

            legend.append('rect')
                .attr('width', legendRectSize)
                .attr('height', legendRectSize)
                .style('fill', color)
                .style('stroke', color);

            legend.append('text')
                .data(dataSet)
                .attr('x', legendRectSize + legendSpacing)
                .attr('y', legendRectSize - legendSpacing)
                .text(function (d) { return d.Age; });

            //Labels
            arcs.append("text")
                .attr("text-anchor", "middle")
                .attr("transform", function (d) {
                    var _d = arc.centroid(d);
                    _d[0] *= 1.35;	//multiply by a constant factor
                    _d[1] *= 1.35;	//multiply by a constant factor
                    return "translate(" + _d + ")";
                })
                .attr("dy", ".50em")
                .data(dataSet)
                .text(function (d) {
                    return Math.round(d.SumAge / total * 100) + "%";
                });
            //Title
            svg.append("text")
                .attr("x", (width / 2) - 20)
                .attr("y", (margin.bottom + 300))
                .attr("text-anchor", "middle")
                .style("font-size", "10px")
                .data(dataSet)
                .text("Distribution of arrests based on Age");                             

        });
    };    

    /* --------- SCATTER PLOT ----------  */
    var setupScatterPlot = function () {
        //1st SCATTER PLOT           
        //Width and height
        var margin = { top: 10, right: 50, bottom: 60, left: 100 };
        var width = 650 - margin.left - margin.right,
            height = 350 - margin.top - margin.bottom;
        padding = 100;
        var dataset, xScale, yScale, xAxis, yAxis;  //Empty, for now 
        var startDate, endDate;
        var parseTime = d3.timeParse("%d-%m-%y");
        //2nd SCATTER PLOT
        var dataset, xScale, yScale2, xAxis, yAxis2;  //Empty, for now 
        var startDate2, endDate2;
        //covert data from CSV
        // var rowConverter = function (d) {
        function rowConverter(d) {
            return {
                Date: parseTime(d.Date),
                //genders
                Males: parseInt(d.Males),
                Females: parseInt(d.Females),
                //races
                Blacks: parseInt(d.Blacks),
                Hispanic: parseInt(d.Hispanic),
                White: parseInt(d.White),
                Asians: parseInt(d.Asians),
                Others: parseInt(d.Others),
                Sum: parseInt(d.Sum),
                Per_Males: parseFloat(d.Per_Males).toFixed(5) * 1000,
                Per_Females: parseFloat(d.Per_Females).toFixed(5) * 1000,
                Per_Hispanic: parseFloat(d.Per_Hispanic).toFixed(5) * 1000,
                Per_Blacks: parseFloat(d.Per_Blacks).toFixed(5) * 1000,
                Per_White: parseFloat(d.Per_White).toFixed(5) * 1000,
                Per_Asians: parseFloat(d.Per_Asians).toFixed(5) * 1000,
                Per_Others: parseFloat(d.Per_Others).toFixed(5) * 1000,
                Per_Sum: parseFloat(d.Per_Sum).toFixed(5) * 1000,
                //Age
                Age_0_9: parseInt(d.Age_0_9),
                Age_10_19: parseInt(d.Age_10_19),
                Age_20_29: parseInt(d.Age_20_29),
                Age_30_39: parseInt(d.Age_30_39),
                Age_40_49: parseInt(d.Age_40_49),
                Age_50_59: parseInt(d.Age_50_59),
                Age_60_69: parseInt(d.Age_60_69),
                Age_70_plus: parseInt(d.Age_70_plus), 
                Per_Age_0_9: parseFloat(d.Per_Age_0_9).toFixed(5) * 1000,
                Per_Age_10_19: parseFloat(d.Per_Age_10_19).toFixed(5) * 1000,
                Per_Age_20_29: parseFloat(d.Per_Age_20_29).toFixed(5) * 1000,
                Per_Age_30_39: parseFloat(d.Per_Age_30_39).toFixed(5) * 1000,
                Per_Age_40_49: parseFloat(d.Per_Age_40_49).toFixed(5) * 1000,
                Per_Age_50_59: parseFloat(d.Per_Age_50_59).toFixed(5) * 1000,
                Per_Age_60_69: parseFloat(d.Per_Age_60_69).toFixed(5) * 1000,
                Per_Age_70_plus: parseFloat(d.Per_Age_70_plus).toFixed(5) * 1000
            };
        }

        //read from CSV 
        d3.csv("./data/excel/arrests_races_sex_age_percentage.csv", rowConverter, function (error, rawData) {
            if (error) {
                console.log("Please check if the CSV file is present");
            }
            //assign raw data to datesets 
            dataSet = rawData;

            //1st SCATTER PLOT
            //x-axis starting and ending points
            startDate = d3.min(dataSet, function (d) { return d.Date; });
            endDate = d3.max(dataSet, function (d) { return d.Date; });

            //x and y scales
            xScale = d3.scaleTime()
                .domain([startDate, endDate])
                .range([0, width]);

            yScale = d3.scaleLinear()
                .domain([0, d3.max(dataSet, function (d) { return d.Sum; })])
                .range([height, 0]);

            //Define X axis
            var xAxis = d3.axisBottom()
                .scale(xScale)
                .tickFormat(function (date) {
                    if (d3.timeYear(date) < date) {
                        return d3.timeFormat('%b')(date);
                    } else {
                        return d3.timeFormat('%Y')(date);
                    }
                });

            //Define Y axis
            var yAxis = d3.axisLeft()
                .scale(yScale)
                .ticks(10);
            //Define line generator
            function generate_line(type_line) {
                line = d3.line()
                    .x(function (d) { return xScale(d.Date); })
                    .y(type_line);
            }

            //Create SVG element
            var svg = d3.select("#scatter").append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

            var circlePoints = svg.selectAll("g");

            //Create x-axis
            svg.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + height + ")")
                .call(xAxis);

            //Create y-axis
            svg.append("g")
                .attr("class", "y axis")
                .call(yAxis);

            //axes labels
            svg.append("text")
                .attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
                .attr("transform", "translate(" + -(padding / 3) + "," + (height / 2) + ")rotate(-90)")  // text is drawn off the screen top left, move down and out and rotate
                .text("Total Number of Arrests");

            svg.append("text")
                .attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
                .attr("transform", "translate(" + (width / 2) + "," + (height + (padding / 3)) + ")")  // centre below axis
                .text("Year");

            //Title
            svg.append("text")
                .attr("transform", "translate(" + (width / 2) + "," + (height + (padding / 2)) + ")")  // centre below axis
                .attr("text-anchor", "middle")
                .style("font-size", "12px")
                .data(dataSet)
                .text("Total number of arrests distribution per race/gender/age group over time");

            //draw points(dots) function
            function drawPoints(type, Points, class_type) {
                svg.selectAll(type + "." + class_type)
                    .data(dataSet)
                    .enter()
                    .append(type)
                    .attr("cx", function (d) {
                        return xScale(d.Date);
                    })
                    .attr("cy", Points)
                    .attr("r", 2)
                    .attr("class", class_type)
                    .append("title")
                //.text(function(d) {
                // return  "Type: "+ d.Athlete +"\n" + "Number:" + parseInt(d.Time) +" min " + ", Date:" + d.Date; 
                //});   
            }
            //gender yScaled points
            malePoints = (function (d) { return yScale(d.Males); })
            femalePoints = (function (d) { return yScale(d.Females); })
            //races yScaled points
            blacksPoints = (function (d) { return yScale(d.Blacks); })
            hispanicPoints = (function (d) { return yScale(d.Hispanic); })
            whitePoints = (function (d) { return yScale(d.White); })
            asiansPoints = (function (d) { return yScale(d.Asians); })
            othersPoints = (function (d) { return yScale(d.Others); })
            sumPoints = (function (d) { return yScale(d.Sum); })
            //age
            age_0_9_Points = (function (d) { return yScale(d.Age_0_9); })
            age_10_19_Points = (function (d) { return yScale(d.Age_10_19); })
            age_20_29_Points = (function (d) { return yScale(d.Age_20_29); })
            age_30_39_Points = (function (d) { return yScale(d.Age_30_39); })
            age_40_49_Points = (function (d) { return yScale(d.Age_40_49); })
            age_50_59_Points = (function (d) { return yScale(d.Age_50_59); })
            age_60_69_Points = (function (d) { return yScale(d.Age_60_69); })
            age_70_plus_Points = (function (d) { return yScale(d.Age_70_plus); })  
            //draw points
            drawPoints("circle", femalePoints, "circleFemale")
            drawPoints("circle", malePoints, "circleMale")
            drawPoints("circle", blacksPoints, "circleBlacks")
            drawPoints("circle", hispanicPoints, "circleHispanic")
            drawPoints("circle", whitePoints, "circleWhite")
            drawPoints("circle", asiansPoints, "circleAsians")
            drawPoints("circle", othersPoints, "circleOthers")
            drawPoints("circle", sumPoints, "circleSum")
            drawPoints("circle", age_0_9_Points, "circle0_9")
            drawPoints("circle", age_10_19_Points, "circle10_19")
            drawPoints("circle", age_20_29_Points, "circle20_29")
            drawPoints("circle", age_30_39_Points, "circle30_39")
            drawPoints("circle", age_40_49_Points, "circle40_49")
            drawPoints("circle", age_50_59_Points, "circle50_59")
            drawPoints("circle", age_60_69_Points, "circle60_69")
            drawPoints("circle", age_70_plus_Points, "circle70_plus")  


            //draw lines between dots
            function drawLinesBetweenDots(dataSetType, typeClass) {
                svg.append("path")
                    .datum(dataSet, dataSetType)
                    .attr("class", typeClass)
                    .attr("d", line);
            }
            //gender datasets
            maleDataSet = function (d) { return d.Males; }
            femaleDataSet = function (d) { return d.Females; }
            //races datasets
            blacksDataSet = function (d) { return d.Blacks; }
            hispanicDataSet = function (d) { return d.Hispanic; }
            whiteDataSet = function (d) { return d.White; }
            asiansDataSet = function (d) { return d.Asians; }
            othersDataSet = function (d) { return d.Others; }
            sumDataSet = function (d) { return d.Sum; }
            //age datasets
            age_0_9_DataSet = function (d) { return d.Age_0_9; }
            age_10_19_DataSet = function (d) { return d.Age_10_19; }
            age_20_29_DataSet = function (d) { return d.Age_20_29; }
            age_30_39_DataSet = function (d) { return d.Age_30_39; }
            age_40_49_DataSet = function (d) { return d.Age_40_49; }
            age_50_59_DataSet = function (d) { return d.Age_50_59; }
            age_60_69_DataSet = function (d) { return d.Age_60_69; }
            age_70_plus_DataSet = function (d) { return d.Age_70_plus; } 
            
            //generate lines and draw lines between dots
            generate_line(femalePoints)
            drawLinesBetweenDots(femaleDataSet, "lineFemale")
            generate_line(malePoints)
            drawLinesBetweenDots(maleDataSet, "lineMale")
            generate_line(blacksPoints)
            drawLinesBetweenDots(blacksDataSet, "lineBlacks")
            generate_line(hispanicPoints)
            drawLinesBetweenDots(hispanicDataSet, "lineHispanic")
            generate_line(whitePoints)
            drawLinesBetweenDots(whiteDataSet, "lineWhite")
            generate_line(asiansPoints)
            drawLinesBetweenDots(asiansDataSet, "lineAsians")
            generate_line(othersPoints)
            drawLinesBetweenDots(othersDataSet, "lineOthers")
            generate_line(sumPoints)
            drawLinesBetweenDots(sumDataSet, "lineSum")
            generate_line(age_0_9_Points)
            drawLinesBetweenDots(age_0_9_DataSet, "line0_9")
            generate_line(age_10_19_Points)
            drawLinesBetweenDots(age_10_19_DataSet, "line10_19")
            generate_line(age_20_29_Points)
            drawLinesBetweenDots(age_20_29_DataSet, "line20_29")
            generate_line(age_30_39_Points)
            drawLinesBetweenDots(age_30_39_DataSet, "line30_39")
            generate_line(age_40_49_Points)
            drawLinesBetweenDots(age_40_49_DataSet, "line40_49")
            generate_line(age_50_59_Points)
            drawLinesBetweenDots(age_50_59_DataSet, "line50_59")
            generate_line(age_60_69_Points)
            drawLinesBetweenDots(age_60_69_DataSet, "line60_69")
            generate_line(age_70_plus_Points)
            drawLinesBetweenDots(age_70_plus_DataSet, "line70_plus")          

            //remove men and women data functions
            function removeData(circleType, lineType) {
                //remove data     
                svg.selectAll(circleType).remove();
                svg.selectAll(lineType).remove();
            }
            //flags for cleared data
            clearMale = 0
            clearFemale = 0
            clearBlacks = 0
            clearHispanic = 0
            clearWhite = 0
            clearAsians = 0
            clearOthers = 0
            clearSum = 0
            clear_age_0_9 = 0
            clear_age_10_19 = 0
            clear_age_20_29 = 0
            clear_age_30_39 = 0
            clear_age_40_49 = 0
            clear_age_50_59 = 0
            clear_age_60_69 = 0
            clear_age_70_plus = 0            
            //update axis
            function update_axis() {
                svg.select(".y.axis")
                    .transition()
                    .duration(500)
                    .call(yAxis);
                svg.select(".x.axis")
                    .transition()
                    .duration(500)
                    .call(xAxis);
            }

            function transition(typePoints, typeLine, typeDataSet, typeCircle) {
                //transition path
                generate_line(typePoints);
                svg.select("path." + typeLine)
                    .datum(dataSet, typeDataSet)
                    .transition()
                    .duration(1000)
                    .attr("d", line);
                //points transitions data transition
                svg.selectAll("circle." + typeCircle)
                    .data(dataSet)
                    .transition()
                    .duration(1000)
                    .attr("cx", function (d) {
                        return xScale(d.Date);
                    })
                    .attr("cy", typePoints)
            }
            function all_transitions() {
                //gender
                transition(malePoints, "lineMale", maleDataSet, "circleMale")
                transition(femalePoints, "lineFemale", femaleDataSet, "circleFemale")
                transition(sumPoints, "lineSum", sumDataSet, "circleSum")
                //race
                transition(hispanicPoints, "lineHispanic", hispanicDataSet, "circleHispanic")
                transition(blacksPoints, "lineBlacks", blacksDataSet, "circleBlacks")
                transition(whitePoints, "lineWhite", whiteDataSet, "circleWhite")
                transition(asiansPoints, "lineAsians", asiansDataSet, "circleAsians")
                transition(othersPoints, "lineOthers", othersDataSet, "circleOthers")
                //age
                transition(age_0_9_Points, "line0_9", age_0_9_DataSet, "circle0_9")
                transition(age_10_19_Points, "line10_19", age_10_19_DataSet, "circle10_19")
                transition(age_20_29_Points, "line20_29", age_20_29_DataSet, "circle20_29")
                transition(age_30_39_Points, "line30_39", age_30_39_DataSet, "circle30_39")
                transition(age_40_49_Points, "line40_49", age_40_49_DataSet, "circle40_49")
                transition(age_50_59_Points, "line50_59", age_50_59_DataSet, "circle50_59")
                transition(age_60_69_Points, "line60_69", age_60_69_DataSet, "circle60_69")
                transition(age_70_plus_Points, "line70_plus", age_70_plus_DataSet, "circle70_plus")                 
            }
            function scale() {
                if (clearSum == 0) {
                    yScale.domain([0, d3.max(dataSet, sumDataSet)]);
                } else if (clearSum == 1 && clearMale == 0) {
                    yScale.domain([0, d3.max(dataSet, maleDataSet)]);
                } else if (clearSum == 1 && clearMale == 1 && clearHispanic == 0) {
                    yScale.domain([0, d3.max(dataSet, hispanicDataSet)]);
                } else if (clearSum == 1 && clearMale == 1 && clearHispanic == 1 && clear_age_20_29 == 0 ) {
                    yScale.domain([0, d3.max(dataSet, age_20_29_DataSet)]);    
                } else if (clearSum == 1 && clearMale == 1 && clearHispanic == 1 && clear_age_20_29 == 1 && clearBlacks == 0 ) {
                    yScale.domain([0, d3.max(dataSet, blacksDataSet)]);
                } else if (clearSum == 1 && clearMale == 1 && clearHispanic == 1 && clear_age_20_29 == 1 && clearBlacks == 1 && clear_age_10_19 == 0) {
                    yScale.domain([0, d3.max(dataSet, age_10_19_DataSet)]);                    
                } else if (clearSum == 1 && clearMale == 1 && clearHispanic == 1 && clear_age_20_29 == 1 && clearBlacks == 1 && clear_age_10_19 == 1 && clearFemale == 0) {
                    yScale.domain([0, d3.max(dataSet, femaleDataSet)]);                    
                } else if (clearSum == 1 && clearMale == 1 && clearHispanic == 1 && clear_age_20_29 == 1 && clearFemale == 1 && clearBlacks == 1 && clear_age_10_19 == 1 && clear_age_30_39 == 0) {
                    yScale.domain([0, d3.max(dataSet, age_30_39_DataSet)]);
                } else if (clearSum == 1 && clearMale == 1 && clearHispanic == 1 && clear_age_20_29 == 1 && clearFemale == 1 && clearBlacks == 1 && clear_age_10_19 == 1 && clear_age_30_39 == 1 && clearWhite == 0) {
                    yScale.domain([0, d3.max(dataSet, whiteDataSet)]);                    
                } else if (clearSum == 1 && clearMale == 1 && clearHispanic == 1 && clear_age_20_29 == 1 && clearFemale == 1 && clearBlacks == 1 && clear_age_10_19 == 1 && clear_age_30_39 == 1 && clearWhite == 1 && clear_age_40_49 == 0) {
                    yScale.domain([0, d3.max(dataSet, age_40_49_DataSet)]);
                } else if (clearSum == 1 && clearMale == 1 && clearHispanic == 1 && clear_age_20_29 == 1 && clearFemale == 1 && clearBlacks == 1 && clear_age_10_19 == 1 && clear_age_30_39 == 1 && clearWhite == 1 && clear_age_40_49 == 1 && clear_age_50_59 == 0) {
                    yScale.domain([0, d3.max(dataSet, age_50_59_DataSet)]);
                } else if (clearSum == 1 && clearMale == 1 && clearHispanic == 1 && clear_age_20_29 == 1 && clearFemale == 1 && clearBlacks == 1 && clear_age_10_19 == 1 && clear_age_30_39 == 1 && clearWhite == 1 && clear_age_40_49 == 1 && clear_age_50_59 == 1 && clearOthers == 0) {
                    yScale.domain([0, d3.max(dataSet, othersDataSet)]); 
                } else if (clearSum == 1 && clearMale == 1 && clearHispanic == 1 && clear_age_20_29 == 1 && clearFemale == 1 && clearBlacks == 1 && clear_age_10_19 == 1 && clear_age_30_39 == 1 && clearWhite == 1 && clear_age_40_49 == 1 && clear_age_50_59 == 1 && clearOthers == 1 && clear_age_60_69 == 0) {
                    yScale.domain([0, d3.max(dataSet, age_60_69_DataSet)]);                     
                } else {
                    yScale.domain([0, d3.max(dataSet, age_0_9_DataSet)]);
                }

            }

            //2nd SCATTER PLOT
            //scale %
            yScale2 = d3.scaleLinear()
                .domain([0, d3.max(dataSet, function (d) { return d.Per_Blacks; })])
                .range([height, 0]);
            //Define % Y axis
            var yAxis2 = d3.axisLeft()
                .scale(yScale2)
                .ticks(10);

            //Define line generator
            function generate_line2(type_line) {
                line = d3.line()
                    .x(function (d) { return xScale(d.Date); })
                    .y(type_line);
            }
            //Create svg2 element
            var svg2 = d3.select("#scatter2").append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


            //Create x-axis
            svg2.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + height + ")")
                .call(xAxis);

            //Create y-axis
            svg2.append("g")
                .attr("class", "y axis")
                .call(yAxis2);

            //axes labels
            svg2.append("text")
                .attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
                .attr("transform", "translate(" + -(padding / 3) + "," + (height / 2) + ")rotate(-90)")  // text is drawn off the screen top left, move down and out and rotate
                .text("Number of Arrests per 1000");

            svg2.append("text")
                .attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
                .attr("transform", "translate(" + (width / 2) + "," + (height + (padding / 3)) + ")")  // centre below axis
                .text("Year");

            //Title
            svg2.append("text")
                .attr("transform", "translate(" + (width / 2) + "," + (height + (padding / 2)) + ")")  // centre below axis
                .attr("text-anchor", "middle")
                .style("font-size", "12px")
                .data(dataSet)
                .text("Number of arrests per 1000 inhabitants based on race/gender/age group over time");


            //draw points(dots) function
            function drawPoints2(type, Points, class_type) {
                svg2.selectAll(type + "." + class_type)
                    .data(dataSet)
                    .enter()
                    .append(type)
                    .attr("cx", function (d) {
                        return xScale(d.Date);
                    })
                    .attr("cy", Points)
                    .attr("r", 2)
                    .attr("class", class_type)
                    .append("title")
                //.text(function(d) {
                // return  "Type: "+ d.Athlete +"\n" + "Number:" + parseInt(d.Time) +" min " + ", Date:" + d.Date; 
                //});   
            }
            //gender yScale2d points
            malePoints2 = (function (d) { return yScale2(d.Per_Males); })
            femalePoints2 = (function (d) { return yScale2(d.Per_Females); })
            //races yScale2d points
            blacksPoints2 = (function (d) { return yScale2(d.Per_Blacks); })
            hispanicPoints2 = (function (d) { return yScale2(d.Per_Hispanic); })
            whitePoints2 = (function (d) { return yScale2(d.Per_White); })
            asiansPoints2 = (function (d) { return yScale2(d.Per_Asians); })
            othersPoints2 = (function (d) { return yScale2(d.Per_Others); })
            sumPoints2 = (function (d) { return yScale2(d.Per_Sum); })
            //age
            age_0_9_Points2 = (function (d) { return yScale2(d.Per_Age_0_9); })
            age_10_19_Points2 = (function (d) { return yScale2(d.Per_Age_10_19); })
            age_20_29_Points2 = (function (d) { return yScale2(d.Per_Age_20_29); })
            age_30_39_Points2 = (function (d) { return yScale2(d.Per_Age_30_39); })
            age_40_49_Points2 = (function (d) { return yScale2(d.Per_Age_40_49); })
            age_50_59_Points2 = (function (d) { return yScale2(d.Per_Age_50_59); })
            age_60_69_Points2 = (function (d) { return yScale2(d.Per_Age_60_69); })
            age_70_plus_Points2 = (function (d) { return yScale2(d.Per_Age_70_plus); })             
            
            //draw points
            drawPoints2("circle", femalePoints2, "circleFemale")
            drawPoints2("circle", malePoints2, "circleMale")
            drawPoints2("circle", blacksPoints2, "circleBlacks")
            drawPoints2("circle", hispanicPoints2, "circleHispanic")
            drawPoints2("circle", whitePoints2, "circleWhite")
            drawPoints2("circle", asiansPoints2, "circleAsians")
            drawPoints2("circle", othersPoints2, "circleOthers")
            drawPoints2("circle", sumPoints2, "circleSum")
            
            drawPoints2("circle", age_0_9_Points2, "circle0_9")
            drawPoints2("circle", age_10_19_Points2, "circle10_19")
            drawPoints2("circle", age_20_29_Points2, "circle20_29")
            drawPoints2("circle", age_30_39_Points2, "circle30_39")
            drawPoints2("circle", age_40_49_Points2, "circle40_49")
            drawPoints2("circle", age_50_59_Points2, "circle50_59")
            drawPoints2("circle", age_60_69_Points2, "circle60_69")
            drawPoints2("circle", age_70_plus_Points2, "circle70_plus")             

            //draw lines between dots
            function drawLinesBetweenDots2(dataSetType, typeClass) {
                svg2.append("path")
                    .datum(dataSet, dataSetType)
                    .attr("class", typeClass)
                    .attr("d", line);
            }
            //gender datasets
            maleDataSet2 = function (d) { return d.Per_Males; }
            femaleDataSet2 = function (d) { return d.Per_Females; }
            //races datasets
            blacksDataSet2 = function (d) { return d.Per_Blacks; }
            hispanicDataSet2 = function (d) { return d.Per_Hispanic; }
            whiteDataSet2 = function (d) { return d.Per_White; }
            asiansDataSet2 = function (d) { return d.Per_Asians; }
            othersDataSet2 = function (d) { return d.Per_Others; }
            sumDataSet2 = function (d) { return d.Per_Sum; }
            //age datasets
            age_0_9_DataSet2 = function (d) { return d.Per_Age_0_9; }
            age_10_19_DataSet2 = function (d) { return d.Per_Age_10_19; }
            age_20_29_DataSet2 = function (d) { return d.Per_Age_20_29; }
            age_30_39_DataSet2 = function (d) { return d.Per_Age_30_39; }
            age_40_49_DataSet2 = function (d) { return d.Per_Age_40_49; }
            age_50_59_DataSet2 = function (d) { return d.Per_Age_50_59; }
            age_60_69_DataSet2 = function (d) { return d.Per_Age_60_69; }
            age_70_plus_DataSet2 = function (d) { return d.Per_Age_70_plus; }             
            

            //generate lines and draw lines between dots
            generate_line2(femalePoints2)
            drawLinesBetweenDots2(femaleDataSet2, "lineFemale")
            generate_line2(malePoints2)
            drawLinesBetweenDots2(maleDataSet2, "lineMale")
            generate_line2(blacksPoints2)
            drawLinesBetweenDots2(blacksDataSet2, "lineBlacks")
            generate_line2(hispanicPoints2)
            drawLinesBetweenDots2(hispanicDataSet2, "lineHispanic")
            generate_line2(whitePoints2)
            drawLinesBetweenDots2(whiteDataSet2, "lineWhite")
            generate_line2(asiansPoints2)
            drawLinesBetweenDots2(asiansDataSet2, "lineAsians")
            generate_line2(othersPoints2)
            drawLinesBetweenDots2(othersDataSet2, "lineOthers")
            generate_line2(sumPoints2)
            drawLinesBetweenDots2(sumDataSet2, "lineSum")
            generate_line2(age_0_9_Points2)
            drawLinesBetweenDots2(age_0_9_DataSet2, "line0_9")
            generate_line2(age_10_19_Points2)
            drawLinesBetweenDots2(age_10_19_DataSet2, "line10_19")
            generate_line2(age_20_29_Points2)
            drawLinesBetweenDots2(age_20_29_DataSet2, "line20_29")
            generate_line2(age_30_39_Points2)
            drawLinesBetweenDots2(age_30_39_DataSet2, "line30_39")
            generate_line2(age_40_49_Points2)
            drawLinesBetweenDots2(age_40_49_DataSet2, "line40_49")
            generate_line2(age_50_59_Points2)
            drawLinesBetweenDots2(age_50_59_DataSet2, "line50_59")
            generate_line2(age_60_69_Points2)
            drawLinesBetweenDots2(age_60_69_DataSet2, "line60_69")
            generate_line2(age_70_plus_Points2)
            drawLinesBetweenDots2(age_70_plus_DataSet2, "line70_plus") 
           
            //remove men and women data functions
            function removeData2(circleType, lineType) {
                //remove data     
                svg2.selectAll(circleType).remove();
                svg2.selectAll(lineType).remove();
            }
            //flags for cleared data
            clearMale2 = 0
            clearFemale2 = 0
            clearBlacks2 = 0
            clearHispanic2 = 0
            clearWhite2 = 0
            clearAsians2 = 0
            clearOthers2 = 0
            clearSum2 = 0
            clear_age_0_9_2 = 0
            clear_age_10_19_2 = 0
            clear_age_20_29_2 = 0
            clear_age_30_39_2 = 0
            clear_age_40_49_2 = 0
            clear_age_50_59_2 = 0
            clear_age_60_69_2 = 0
            clear_age_70_plus_2 = 0              
            //update axis
            function update_axis2() {
                svg2.select(".y.axis")
                    .transition()
                    .duration(500)
                    .call(yAxis2);
                svg2.select(".x.axis")
                    .transition()
                    .duration(500)
                    .call(xAxis);
            }

            function transition2(typePoints, typeLine, typeDataSet, typeCircle) {
                //transition2 path
                generate_line2(typePoints);
                svg2.select("path." + typeLine)
                    .datum(dataSet, typeDataSet)
                    .transition()
                    .duration(1000)
                    .attr("d", line);
                //points transitions data transition2
                svg2.selectAll("circle." + typeCircle)
                    .data(dataSet)
                    .transition()
                    .duration(1000)
                    .attr("cx", function (d) {
                        return xScale(d.Date);
                    })
                    .attr("cy", typePoints)
            }
            function all_transitions2() {
                transition2(malePoints2, "lineMale", maleDataSet2, "circleMale")
                transition2(femalePoints2, "lineFemale", femaleDataSet2, "circleFemale")
                //race  
                transition2(hispanicPoints2, "lineHispanic", hispanicDataSet2, "circleHispanic")
                transition2(blacksPoints2, "lineBlacks", blacksDataSet2, "circleBlacks")
                transition2(whitePoints2, "lineWhite", whiteDataSet2, "circleWhite")
                transition2(asiansPoints2, "lineAsians", asiansDataSet2, "circleAsians")
                transition2(othersPoints2, "lineOthers", othersDataSet2, "circleOthers")
                transition2(sumPoints2, "lineSum", sumDataSet2, "circleSum")
                //age
                transition2(age_0_9_Points2, "line0_9", age_0_9_DataSet2, "circle0_9")
                transition2(age_10_19_Points2, "line10_19", age_10_19_DataSet2, "circle10_19")
                transition2(age_20_29_Points2, "line20_29", age_20_29_DataSet2, "circle20_29")
                transition2(age_30_39_Points2, "line30_39", age_30_39_DataSet2, "circle30_39")
                transition2(age_40_49_Points2, "line40_49", age_40_49_DataSet2, "circle40_49")
                transition2(age_50_59_Points2, "line50_59", age_50_59_DataSet2, "circle50_59")
                transition2(age_60_69_Points2, "line60_69", age_60_69_DataSet2, "circle60_69")
                transition2(age_70_plus_Points2, "line70_plus", age_70_plus_DataSet2, "circle70_plus")                
            }
            function scale2() {
                if (clearBlacks2 == 0) {
                    yScale2.domain([0, d3.max(dataSet, blacksDataSet2)]);
                } else if (clearBlacks2 == 1 && clearSum2 == 0) {
                    yScale2.domain([0, d3.max(dataSet, sumDataSet2)]);
                } else if (clearBlacks2 == 1 && clearSum2 == 1 && clear_age_10_19_2 == 0) {
                    yScale2.domain([0, d3.max(dataSet, age_10_19_DataSet2)]); 
                } else if (clearBlacks2 == 1 && clearSum2 == 1 && clear_age_10_19_2 == 1 && clear_age_20_29_2 == 0) {
                    yScale2.domain([0, d3.max(dataSet, age_20_29_DataSet2)]);                     
                } else if (clearBlacks2 == 1 && clearSum2 == 1 && clear_age_10_19_2 == 1 && clear_age_10_19_2 == 1 && clearOthers2 == 0) {
                    yScale2.domain([0, d3.max(dataSet, othersDataSet2)]);
                } else if (clearBlacks2 == 1 && clearSum2 == 1 && clear_age_10_19_2 == 1 && clear_age_10_19_2 == 1 && clearOthers2 == 1 && clearMale2 == 0) {
                    yScale2.domain([0, d3.max(dataSet, maleDataSet2)]);    
                } else if (clearBlacks2 == 1 && clearSum2 == 1 && clear_age_10_19_2 == 1 && clear_age_10_19_2 == 1 && clearOthers2 == 1 && clearMale2 == 1 && clear_age_40_49_2 == 0) {
                    yScale2.domain([0, d3.max(dataSet, age_40_49_DataSet2)]);
                } else if (clearBlacks2 == 1 && clearSum2 == 1 && clear_age_10_19_2 == 1 && clear_age_10_19_2 == 1 && clearOthers2 == 1 && clearMale2 == 1 && clear_age_40_49_2 == 1 && clear_age_30_39_2 == 0) {
                    yScale2.domain([0, d3.max(dataSet, age_30_39_DataSet2)]);    
                } else if (clearBlacks2 == 1 && clearSum2 == 1 && clear_age_10_19_2 == 1 && clear_age_10_19_2 == 1 && clearOthers2 == 1 && clearMale2 == 1 && clear_age_40_49_2 == 1 && clear_age_30_39_2 == 1 && clear_age_50_59_2 == 0) {
                    yScale2.domain([0, d3.max(dataSet, age_50_59_DataSet2)]);    
                } else if (clearBlacks2 == 1 && clearSum2 == 1 && clear_age_10_19_2 == 1 && clear_age_10_19_2 == 1 && clearOthers2 == 1 && clearMale2 == 1 && clear_age_40_49_2 == 1 && clear_age_30_39_2 == 1 && clear_age_50_59_2 == 1 && clearHispanic2 == 0) {
                    yScale2.domain([0, d3.max(dataSet, hispanicDataSet2)]);
                } else if (clearBlacks2 == 1 && clearSum2 == 1 && clear_age_10_19_2 == 1 && clear_age_10_19_2 == 1 && clearOthers2 == 1 && clearMale2 == 1 && clear_age_40_49_2 == 1 && clear_age_30_39_2 == 1 && clear_age_50_59_2 == 1 && clearHispanic2 == 1 && clearWhite2 == 0) {
                    yScale2.domain([0, d3.max(dataSet, whiteDataSet2)]);
                } else if (clearBlacks2 == 1 && clearSum2 == 1 && clear_age_10_19_2 == 1 && clear_age_10_19_2 == 1 && clearOthers2 == 1 && clearMale2 == 1 && clear_age_40_49_2 == 1 && clear_age_30_39_2 == 1 && clear_age_50_59_2 == 1 && clearHispanic2 == 1 && clearWhite2 == 1 && clear_age_60_69_2 == 0) {
                    yScale2.domain([0, d3.max(dataSet, age_60_69_DataSet2)]);                    
                } else if (clearBlacks2 == 1 && clearSum2 == 1 && clear_age_10_19_2 == 1 && clear_age_10_19_2 == 1 && clearOthers2 == 1 && clearMale2 == 1 && clear_age_40_49_2 == 1 && clear_age_30_39_2 == 1 && clear_age_50_59_2 == 1 && clearHispanic2 == 1 && clearWhite2 == 1 && clear_age_60_69_2 == 1 && clearFemale2 == 0) {
                    yScale2.domain([0, d3.max(dataSet, femaleDataSet2)]);
                } else {
                    yScale2.domain([0, d3.max(dataSet, age_70_plus_DataSet2)]);
                }

            }

            function toggleButtonClass(d) {
                let btn = d3.select(d)
                btn.classed("btn-toggled", !btn.classed("btn-toggled"));
            }
            function unToggleAllBtns() {
                d3.selectAll('.grid-btn-container')
                    .selectAll('.btn')
                    .classed("btn-toggled", false);
            }

            //Transitions                      
            d3.select("div.buttonClearAll")
                .on("click", function () {

                    unToggleAllBtns();
                    //scale domain    
                    yScale.domain([0, d3.max(dataSet, function (d) { return d.Sum; })]);
                    xScale.domain([d3.min(dataSet, function (d) { return d.Date; }), d3.max(dataSet, function (d) { return d.Date; })]);
                    //remove function
                    removeData("circle.circleMale", "path.lineMale")
                    removeData("circle.circleFemale", "path.lineFemale")
                    removeData("circle.circleBlacks", "path.lineBlacks")
                    removeData("circle.circleHispanic", "path.lineHispanic")
                    removeData("circle.circleWhite", "path.lineWhite")
                    removeData("circle.circleAsians", "path.lineAsians")
                    removeData("circle.circleOthers", "path.lineOthers")
                    removeData("circle.circleSum", "path.lineSum")
                    removeData("circle.circle0_9", "path.line0_9")
                    removeData("circle.circle10_19", "path.line10_19")
                    removeData("circle.circle20_29", "path.line20_29")
                    removeData("circle.circle30_39", "path.line30_39")
                    removeData("circle.circle40_49", "path.line40_49")
                    removeData("circle.circle50_59", "path.line50_59")
                    removeData("circle.circle60_69", "path.line60_69")
                    removeData("circle.circle70_plus", "path.line70_plus") 
                                        
                    //update axis   
                    update_axis();
                    //set the triggers that everything was cleared
                    clearMale = 1
                    clearFemale = 1
                    clearBlacks = 1
                    clearHispanic = 1
                    clearWhite = 1
                    clearAsians = 1
                    clearOthers = 1
                    clearSum = 1
                    clear_age_0_9 = 1
                    clear_age_10_19 = 1
                    clear_age_20_29 = 1
                    clear_age_30_39 = 1
                    clear_age_40_49 = 1
                    clear_age_50_59 = 1
                    clear_age_60_69 = 1
                    clear_age_70_plus = 1                      

                    //2nd scatter plot
                    //scale
                    yScale2.domain([0, d3.max(dataSet, function (d) { return d.Per_Blacks; })]);
                    //remove
                    removeData2("circle.circleMale", "path.lineMale")
                    removeData2("circle.circleFemale", "path.lineFemale")
                    removeData2("circle.circleBlacks", "path.lineBlacks")
                    removeData2("circle.circleHispanic", "path.lineHispanic")
                    removeData2("circle.circleWhite", "path.lineWhite")
                    removeData2("circle.circleAsians", "path.lineAsians")
                    removeData2("circle.circleOthers", "path.lineOthers")
                    removeData2("circle.circleSum", "path.lineSum")
                    removeData2("circle.circle0_9", "path.line0_9")
                    removeData2("circle.circle10_19", "path.line10_19")
                    removeData2("circle.circle20_29", "path.line20_29")
                    removeData2("circle.circle30_39", "path.line30_39")
                    removeData2("circle.circle40_49", "path.line40_49")
                    removeData2("circle.circle50_59", "path.line50_59")
                    removeData2("circle.circle60_69", "path.line60_69")
                    removeData2("circle.circle70_plus", "path.line70_plus")                     

                    //update axis   
                    update_axis2();
                    //set the triggers that everything was cleared
                    clearMale2 = 1
                    clearFemale2 = 1
                    clearBlacks2 = 1
                    clearHispanic2 = 1
                    clearWhite2 = 1
                    clearAsians2 = 1
                    clearOthers2 = 1
                    clearSum2 = 1
                    clear_age_0_9_2 = 1
                    clear_age_10_19_2 = 1
                    clear_age_20_29_2 = 1
                    clear_age_30_39_2 = 1
                    clear_age_40_49_2 = 1
                    clear_age_50_59_2 = 1
                    clear_age_60_69_2 = 1
                    clear_age_70_plus_2 = 1                     
                });
            d3.select("div.buttonMale")
                .on("click", function () {
                    toggleButtonClass(this);
                    //draw new line  
                    if (clearMale == 1) {
                        malePoints = (function (d) { return yScale(d.Males); })
                        drawPoints("circle", malePoints, "circleMale")
                        generate_line(malePoints)
                        drawLinesBetweenDots(maleDataSet, "lineMale")
                        clearMale = 0
                        scale()
                        all_transitions()
                    } else {
                        //remove function
                        removeData("circle.circleMale", "path.lineMale")
                        clearMale = 1
                        scale()
                        all_transitions()
                    }
                    //update axis   
                    update_axis();

                    //2nd scatter plot
                    if (clearMale2 == 1) {
                        malePoints2 = (function (d) { return yScale2(d.Per_Males); })
                        drawPoints2("circle", malePoints2, "circleMale")
                        generate_line2(malePoints2)
                        drawLinesBetweenDots2(maleDataSet2, "lineMale")
                        clearMale2 = 0
                        scale2()
                        all_transitions2()
                    } else {
                        //remove function
                        removeData2("circle.circleMale", "path.lineMale")
                        clearMale2 = 1
                        scale2()
                        all_transitions2()
                    }
                    //update axis   
                    update_axis2();
                });
            d3.select("div.buttonFemale")
                .on("click", function () {
                    toggleButtonClass(this);
                    //draw new line    
                    if (clearFemale == 1) {
                        femalePoints = (function (d) { return yScale(d.Females); })
                        drawPoints("circle", femalePoints, "circleFemale")
                        generate_line(femalePoints)
                        drawLinesBetweenDots(femaleDataSet, "lineFemale")
                        clearFemale = 0
                        scale()
                        all_transitions()
                    } else {
                        //remove function
                        removeData("circle.circleFemale", "path.lineFemale")
                        clearFemale = 1
                        scale()
                        all_transitions()
                    }
                    //update axis   
                    update_axis();

                    //2nd scatter plot
                    if (clearFemale2 == 1) {
                        femalePoints2 = (function (d) { return yScale2(d.Per_Females); })
                        drawPoints2("circle", femalePoints2, "circleFemale")
                        generate_line2(femalePoints2)
                        drawLinesBetweenDots2(femaleDataSet2, "lineFemale")
                        clearFemale2 = 0
                        scale2()
                        all_transitions2()
                    } else {
                        //remove function
                        removeData2("circle.circleFemale", "path.lineFemale")
                        clearFemale2 = 1
                        scale2()
                        all_transitions2()
                    }
                    //update axis   
                    update_axis2();
                });

            d3.select("div.buttonBlacks")
                .on("click", function () {
                    toggleButtonClass(this);

                    //draw new line    
                    if (clearBlacks == 1) {
                        blacksPoints = (function (d) { return yScale(d.Blacks); })
                        drawPoints("circle", blacksPoints, "circleBlacks")
                        generate_line(blacksPoints)
                        drawLinesBetweenDots(blacksDataSet, "lineBlacks")
                        clearBlacks = 0
                        scale()
                        all_transitions()
                    } else {
                        //remove function
                        removeData("circle.circleBlacks", "path.lineBlacks")
                        clearBlacks = 1
                        scale()
                        all_transitions()
                    }
                    //update axis   
                    update_axis();

                    //2nd scatter plot
                    if (clearBlacks2 == 1) {
                        blacksPoints2 = (function (d) { return yScale2(d.Per_Blacks); })
                        drawPoints2("circle", blacksPoints2, "circleBlacks")
                        generate_line2(blacksPoints2)
                        drawLinesBetweenDots2(blacksDataSet2, "lineBlacks")
                        clearBlacks2 = 0
                        scale2()
                        all_transitions2()
                    } else {
                        //remove function
                        removeData2("circle.circleBlacks", "path.lineBlacks")
                        clearBlacks2 = 1
                        scale2()
                        all_transitions2()
                    }
                    //update axis   
                    update_axis2();
                });

            d3.select("div.buttonHispanic")
                .on("click", function () {
                    toggleButtonClass(this);

                    //draw new line    
                    if (clearHispanic == 1) {
                        hispanicPoints = (function (d) { return yScale(d.Hispanic); })
                        drawPoints("circle", hispanicPoints, "circleHispanic")
                        generate_line(hispanicPoints)
                        drawLinesBetweenDots(hispanicDataSet, "lineHispanic")
                        clearHispanic = 0
                        scale()
                        all_transitions()
                    } else {
                        //remove function
                        removeData("circle.circleHispanic", "path.lineHispanic")
                        clearHispanic = 1
                        scale()
                        all_transitions()
                    }
                    //update axis   
                    update_axis();

                    //2nd scatter plot
                    if (clearHispanic2 == 1) {
                        hispanicPoints2 = (function (d) { return yScale2(d.Per_Hispanic); })
                        drawPoints2("circle", hispanicPoints2, "circleHispanic")
                        generate_line2(hispanicPoints2)
                        drawLinesBetweenDots2(hispanicDataSet2, "lineHispanic")
                        clearHispanic2 = 0
                        scale2()
                        all_transitions2()
                    } else {
                        //remove function
                        removeData2("circle.circleHispanic", "path.lineHispanic")
                        clearHispanic2 = 1
                        scale2()
                        all_transitions2()
                    }
                    //update axis   
                    update_axis2();
                });
            d3.select("div.buttonWhite")
                .on("click", function () {
                    toggleButtonClass(this);

                    //draw new line    
                    if (clearWhite == 1) {
                        whitePoints = (function (d) { return yScale(d.White); })
                        drawPoints("circle", whitePoints, "circleWhite")
                        generate_line(whitePoints)
                        drawLinesBetweenDots(whiteDataSet, "lineWhite")
                        clearWhite = 0
                        scale()
                        all_transitions()
                    } else {
                        //remove function
                        removeData("circle.circleWhite", "path.lineWhite")
                        clearWhite = 1
                        scale()
                        all_transitions()
                    }
                    //update axis   
                    update_axis();

                    //2nd scatter plot
                    if (clearWhite2 == 1) {
                        whitePoints2 = (function (d) { return yScale2(d.Per_White); })
                        drawPoints2("circle", whitePoints2, "circleWhite")
                        generate_line2(whitePoints2)
                        drawLinesBetweenDots2(whiteDataSet2, "lineWhite")
                        clearWhite2 = 0
                        scale2()
                        all_transitions2()
                    } else {
                        //remove function
                        removeData2("circle.circleWhite", "path.lineWhite")
                        clearWhite2 = 1
                        scale2()
                        all_transitions2()
                    }
                    //update axis   
                    update_axis2();
                });
            d3.select("div.buttonAsians")
                .on("click", function () {
                    toggleButtonClass(this);

                    //draw new line    
                    if (clearAsians == 1) {
                        asiansPoints = (function (d) { return yScale(d.Asians); })
                        drawPoints("circle", asiansPoints, "circleAsians")
                        generate_line(asiansPoints)
                        drawLinesBetweenDots(asiansDataSet, "lineAsians")
                        clearAsians = 0
                        scale()
                        all_transitions()
                    } else {
                        //remove function
                        removeData("circle.circleAsians", "path.lineAsians")
                        clearAsians = 1
                        scale()
                        all_transitions()
                    }
                    //update axis   
                    update_axis();

                    //2nd scatter plot
                    if (clearAsians2 == 1) {
                        asiansPoints2 = (function (d) { return yScale2(d.Per_Asians); })
                        drawPoints2("circle", asiansPoints2, "circleAsians")
                        generate_line2(asiansPoints2)
                        drawLinesBetweenDots2(asiansDataSet2, "lineAsians")
                        clearAsians2 = 0
                        scale2()
                        all_transitions2()
                    } else {
                        //remove function
                        removeData2("circle.circleAsians", "path.lineAsians")
                        clearAsians2 = 1
                        scale2()
                        all_transitions2()
                    }
                    //update axis   
                    update_axis2();
                });
            d3.select("div.buttonOthers")
                .on("click", function () {
                    toggleButtonClass(this);

                    //draw new line    
                    if (clearOthers == 1) {
                        othersPoints = (function (d) { return yScale(d.Others); })
                        drawPoints("circle", othersPoints, "circleOthers")
                        generate_line(othersPoints)
                        drawLinesBetweenDots(othersDataSet, "lineOthers")
                        clearOthers = 0
                        scale()
                        all_transitions()
                    } else {
                        //remove function
                        removeData("circle.circleOthers", "path.lineOthers")
                        clearOthers = 1
                        scale()
                        all_transitions()
                    }
                    //update axis   
                    update_axis();

                    //2nd scatter plot
                    if (clearOthers2 == 1) {
                        othersPoints2 = (function (d) { return yScale2(d.Per_Others); })
                        drawPoints2("circle", othersPoints2, "circleOthers")
                        generate_line2(othersPoints2)
                        drawLinesBetweenDots2(othersDataSet2, "lineOthers")
                        clearOthers2 = 0
                        scale2()
                        all_transitions2()
                    } else {
                        //remove function
                        removeData2("circle.circleOthers", "path.lineOthers")
                        clearOthers2 = 1
                        scale2()
                        all_transitions2()
                    }
                    //update axis   
                    update_axis2();

                });
            d3.select("div.buttonSum")
                .on("click", function () {
                    toggleButtonClass(this);

                    //draw new line  
                    if (clearSum == 1) {
                        sumPoints = (function (d) { return yScale(d.Sum); })
                        drawPoints("circle", sumPoints, "circleSum")
                        generate_line(sumPoints)
                        drawLinesBetweenDots(sumDataSet, "lineSum")
                        clearSum = 0
                        scale()
                        all_transitions()
                    } else {
                        //remove function
                        removeData("circle.circleSum", "path.lineSum")
                        clearSum = 1
                        scale()
                        all_transitions()
                    }
                    //update axis   
                    update_axis();

                    //2nd scatter plot
                    if (clearSum2 == 1) {
                        sumPoints2 = (function (d) { return yScale2(d.Per_Sum); })
                        drawPoints2("circle", sumPoints2, "circleSum")
                        generate_line2(sumPoints2)
                        drawLinesBetweenDots2(sumDataSet2, "lineSum")
                        clearSum2 = 0
                        scale2()
                        all_transitions2()
                    } else {
                        //remove function
                        removeData2("circle.circleSum", "path.lineSum")
                        clearSum2 = 1
                        scale2()
                        all_transitions2()
                    }
                    //update axis   
                    update_axis2();
                });
             d3.select("div.button0_9")
                .on("click", function () {
                    toggleButtonClass(this);

                    //draw new line  
                    if (clear_age_0_9 == 1) {
                        age_0_9_Points = (function (d) { return yScale(d.Age_0_9); })
                        drawPoints("circle", age_0_9_Points, "circle0_9")
                        generate_line(age_0_9_Points)
                        drawLinesBetweenDots(age_0_9_DataSet, "line0_9")
                        clear_age_0_9 = 0
                        scale()
                        all_transitions()
                    } else {
                        //remove function
                        removeData("circle.circle0_9", "path.line0_9")
                        clear_age_0_9 = 1
                        scale()
                        all_transitions()
                    }
                    //update axis   
                    update_axis();

                    //2nd scatter plot 
                    //draw new line  
                    if (clear_age_0_9_2 == 1) {
                        age_0_9_Points2 = (function (d) { return yScale2(d.Per_Age_0_9); })
                        drawPoints2("circle", age_0_9_Points2, "circle0_9")
                        generate_line2(age_0_9_Points2)
                        drawLinesBetweenDots2(age_0_9_DataSet2, "line0_9")
                        clear_age_0_9_2 = 0
                        scale2()
                        all_transitions2()
                    } else {
                        //remove function
                        removeData2("circle.circle0_9", "path.line0_9")
                        clear_age_0_9_2 = 1
                        scale2()
                        all_transitions2()
                    }
                    //update axis   
                    update_axis2();                    
                });  
             d3.select("div.button10_19")
                .on("click", function () {
                    toggleButtonClass(this);

                    //draw new line  
                    if (clear_age_10_19 == 1) {
                        age_10_19_Points = (function (d) { return yScale(d.Age_10_19); })
                        drawPoints("circle", age_10_19_Points, "circle10_19")
                        generate_line(age_10_19_Points)
                        drawLinesBetweenDots(age_10_19_DataSet, "line10_19")
                        clear_age_10_19 = 0
                        scale()
                        all_transitions()
                    } else {
                        //remove function
                        removeData("circle.circle10_19", "path.line10_19")
                        clear_age_10_19 = 1
                        scale()
                        all_transitions()
                    }
                    //update axis   
                    update_axis();

                    //2nd scatter plot
                    //draw new line  
                    if (clear_age_10_19_2 == 1) {
                        age_10_19_Points2 = (function (d) { return yScale2(d.Per_Age_10_19); })
                        drawPoints2("circle", age_10_19_Points2, "circle10_19")
                        generate_line2(age_10_19_Points2)
                        drawLinesBetweenDots2(age_10_19_DataSet2, "line10_19")
                        clear_age_10_19_2 = 0
                        scale2()
                        all_transitions2()
                    } else {
                        //remove function
                        removeData2("circle.circle10_19", "path.line10_19")
                        clear_age_10_19_2 = 1
                        scale2()
                        all_transitions2()
                    }
                    //update axis   
                    update_axis2();                    
                });  
             d3.select("div.button20_29")
                .on("click", function () {
                    toggleButtonClass(this);

                    //draw new line  
                    if (clear_age_20_29 == 1) {
                        age_20_29_Points = (function (d) { return yScale(d.Age_20_29); })
                        drawPoints("circle", age_20_29_Points, "circle20_29")
                        generate_line(age_20_29_Points)
                        drawLinesBetweenDots(age_20_29_DataSet, "line20_29")
                        clear_age_20_29 = 0
                        scale()
                        all_transitions()
                    } else {
                        //remove function
                        removeData("circle.circle20_29", "path.line20_29")
                        clear_age_20_29 = 1
                        scale()
                        all_transitions()
                    }
                    //update axis   
                    update_axis();

                    //2nd scatter plot  
                    //draw new line  
                    if (clear_age_20_29_2 == 1) {
                        age_20_29_Points2 = (function (d) { return yScale2(d.Per_Age_20_29); })
                        drawPoints2("circle", age_20_29_Points2, "circle20_29")
                        generate_line2(age_20_29_Points2)
                        drawLinesBetweenDots2(age_20_29_DataSet2, "line20_29")
                        clear_age_20_29_2 = 0
                        scale2()
                        all_transitions2()
                    } else {
                        //remove function
                        removeData2("circle.circle20_29", "path.line20_29")
                        clear_age_20_29_2 = 1
                        scale2()
                        all_transitions2()
                    }
                    //update axis   
                    update_axis2();                    
                });  
             d3.select("div.button30_39")
                .on("click", function () {
                    toggleButtonClass(this);

                    //draw new line  
                    if (clear_age_30_39 == 1) {
                        age_30_39_Points = (function (d) { return yScale(d.Age_30_39); })
                        drawPoints("circle", age_30_39_Points, "circle30_39")
                        generate_line(age_30_39_Points)
                        drawLinesBetweenDots(age_30_39_DataSet, "line30_39")
                        clear_age_30_39 = 0
                        scale()
                        all_transitions()
                    } else {
                        //remove function
                        removeData("circle.circle30_39", "path.line30_39")
                        clear_age_30_39 = 1
                        scale()
                        all_transitions()
                    }
                    //update axis   
                    update_axis();

                    //2nd scatter plot  
                    //draw new line  
                    if (clear_age_30_39_2 == 1) {
                        age_30_39_Points2 = (function (d) { return yScale2(d.Per_Age_30_39); })
                        drawPoints2("circle", age_30_39_Points2, "circle30_39")
                        generate_line2(age_30_39_Points2)
                        drawLinesBetweenDots2(age_30_39_DataSet2, "line30_39")
                        clear_age_30_39_2 = 0
                        scale2()
                        all_transitions2()
                    } else {
                        //remove function
                        removeData2("circle.circle30_39", "path.line30_39")
                        clear_age_30_39_2 = 1
                        scale2()
                        all_transitions2()
                    }
                    //update axis   
                    update_axis2();                    
                });  
             d3.select("div.button40_49")
                .on("click", function () {
                    toggleButtonClass(this);

                    //draw new line  
                    if (clear_age_40_49 == 1) {
                        age_40_49_Points = (function (d) { return yScale(d.Age_40_49); })
                        drawPoints("circle", age_40_49_Points, "circle40_49")
                        generate_line(age_40_49_Points)
                        drawLinesBetweenDots(age_40_49_DataSet, "line40_49")
                        clear_age_40_49 = 0
                        scale()
                        all_transitions()
                    } else {
                        //remove function
                        removeData("circle.circle40_49", "path.line40_49")
                        clear_age_40_49 = 1
                        scale()
                        all_transitions()
                    }
                    //update axis   
                    update_axis();

                    //2nd scatter plot  
                    //draw new line  
                    if (clear_age_40_49_2 == 1) {
                        age_40_49_Points2 = (function (d) { return yScale2(d.Per_Age_40_49); })
                        drawPoints2("circle", age_40_49_Points2, "circle40_49")
                        generate_line2(age_40_49_Points2)
                        drawLinesBetweenDots2(age_40_49_DataSet2, "line40_49")
                        clear_age_40_49_2 = 0
                        scale2()
                        all_transitions2()
                    } else {
                        //remove function
                        removeData2("circle.circle40_49", "path.line40_49")
                        clear_age_40_49_2 = 1
                        scale2()
                        all_transitions2()
                    }
                    //update axis   
                    update_axis2();                    
                });  
             d3.select("div.button50_59")
                .on("click", function () {
                    toggleButtonClass(this);

                    //draw new line  
                    if (clear_age_50_59 == 1) {
                        age_50_59_Points = (function (d) { return yScale(d.Age_50_59); })
                        drawPoints("circle", age_50_59_Points, "circle50_59")
                        generate_line(age_50_59_Points)
                        drawLinesBetweenDots(age_50_59_DataSet, "line50_59")
                        clear_age_50_59 = 0
                        scale()
                        all_transitions()
                    } else {
                        //remove function
                        removeData("circle.circle50_59", "path.line50_59")
                        clear_age_50_59 = 1
                        scale()
                        all_transitions()
                    }
                    //update axis   
                    update_axis();

                    //2nd scatter plot 
                    //draw new line  
                    if (clear_age_50_59_2 == 1) {
                        age_50_59_Points2 = (function (d) { return yScale2(d.Per_Age_50_59); })
                        drawPoints2("circle", age_50_59_Points2, "circle50_59")
                        generate_line2(age_50_59_Points2)
                        drawLinesBetweenDots2(age_50_59_DataSet2, "line50_59")
                        clear_age_50_59_2 = 0
                        scale2()
                        all_transitions2()
                    } else {
                        //remove function
                        removeData2("circle.circle50_59", "path.line50_59")
                        clear_age_50_59_2 = 1
                        scale2()
                        all_transitions2()
                    }
                    //update axis   
                    update_axis2();                    
                });  
             d3.select("div.button60_69")
                .on("click", function () {
                    toggleButtonClass(this);

                    //draw new line  
                    if (clear_age_60_69 == 1) {
                        age_60_69_Points = (function (d) { return yScale(d.Age_60_69); })
                        drawPoints("circle", age_60_69_Points, "circle60_69")
                        generate_line(age_60_69_Points)
                        drawLinesBetweenDots(age_60_69_DataSet, "line60_69")
                        clear_age_60_69 = 0
                        scale()
                        all_transitions()
                    } else {
                        //remove function
                        removeData("circle.circle60_69", "path.line60_69")
                        clear_age_60_69 = 1
                        scale()
                        all_transitions()
                    }
                    //update axis   
                    update_axis();

                    //2nd scatter plot 
                    //draw new line  
                    if (clear_age_60_69_2 == 1) {
                        age_60_69_Points2 = (function (d) { return yScale2(d.Per_Age_60_69); })
                        drawPoints2("circle", age_60_69_Points2, "circle60_69")
                        generate_line2(age_60_69_Points2)
                        drawLinesBetweenDots2(age_60_69_DataSet2, "line60_69")
                        clear_age_60_69_2 = 0
                        scale2()
                        all_transitions2()
                    } else {
                        //remove function
                        removeData2("circle.circle60_69", "path.line60_69")
                        clear_age_60_69_2 = 1
                        scale2()
                        all_transitions2()
                    }
                    //update axis   
                    update_axis2();                    
                });  
             d3.select("div.button70_plus")
                .on("click", function () {
                    toggleButtonClass(this);

                    //draw new line  
                    if (clear_age_70_plus == 1) {
                        age_70_plus_Points = (function (d) { return yScale(d.Age_70_plus); })
                        drawPoints("circle", age_70_plus_Points, "circle70_plus")
                        generate_line(age_70_plus_Points)
                        drawLinesBetweenDots(age_70_plus_DataSet, "line70_plus")
                        clear_age_70_plus = 0
                        scale()
                        all_transitions()
                    } else {
                        //remove function
                        removeData("circle.circle70_plus", "path.line70_plus")
                        clear_age_70_plus = 1
                        scale()
                        all_transitions()
                    }
                    //update axis   
                    update_axis();

                    //2nd scatter plot     
                    //draw new line  
                    if (clear_age_70_plus_2 == 1) {
                        age_70_plus_Points2 = (function (d) { return yScale2(d.Per_Age_70_plus); })
                        drawPoints2("circle", age_70_plus_Points2, "circle70_plus")
                        generate_line2(age_70_plus_Points2)
                        drawLinesBetweenDots2(age_70_plus_DataSet2, "line70_plus")
                        clear_age_70_plus_2 = 0
                        scale2()
                        all_transitions2()
                    } else {
                        //remove function
                        removeData2("circle.circle70_plus", "path.line70_plus")
                        clear_age_70_plus_2 = 1
                        scale2()
                        all_transitions2()
                    }
                    //update axis   
                    update_axis2();                    
                });                  
        });
    };



    /* --------- TREE MAP ----------  */

    const setupTreemap = () => {

        const width = 1000;
        const height = 800;

        const svg = d3.select('#treemap')
            .append('svg')
            .attr('width', width)
            .attr('height', height)
            .attr('id', 'tree-svg');

        const fader = function (color) { return d3.interpolateRgb(color, "#fff")(0.2); },
            color = d3.scaleOrdinal(d3.schemeCategory20.map(fader)),
            format = d3.format(",d");

        const treemap = d3.treemap()
            .tile(d3.treemapResquarify)
            .size([width, height])
            .round(true)
            .paddingInner(1);

        d3.json("./data/arrest-agr.json", function (error, data) {
            if (error) throw error;

            const root = d3.hierarchy(data)
                .eachBefore((d) => {
                    let tmp = d.data.name.toLowerCase();
                    tmp = tmp.charAt(0).toUpperCase() + tmp.slice(1);
                    d.data.name = tmp;
                    d.data.id = (d.parent ? d.parent.data.id + "|" : "") + tmp;
                })
                .sum((d) => {
                    return d.size;
                })
                .sort(function (a, b) {
                    return b.value - a.value;
                });

            treemap(root);

            const cell = svg.selectAll("g")
                .data(root.leaves())
                .enter().append("g")
                .attr("transform", function (d) { return "translate(" + d.x0 + "," + d.y0 + ")"; });

            cell.append("rect")
                .attr("id", function (d) { return d.data.id; })
                .attr("width", function (d) { return d.x1 - d.x0; })
                .attr("height", function (d) { return d.y1 - d.y0; })
                .attr("fill", function (d) {
                    return color(d.parent.data.id);
                });

            cell.append("clipPath")
                .attr("id", function (d) { return "clip-" + d.data.id; })
                .append("use")
                .attr("xlink:href", function (d) { return "#" + d.data.id; });

            cell.append("text")
                .attr("clip-path", function (d) { return "url(#clip-" + d.data.id + ")"; })
                .selectAll("tspan")
                .data(function (d) {
                    let txt = [d.data.name]
                    if ((d.x1 - d.x0) < d.data.name.width()) {
                        txt = d.data.name.split(" ")
                    }
                    const tmp = []
                    const width = d.x1 - d.x0
                    const height = d.y1 - d.y0
                    for (let i = 0; i < txt.length; i++) {
                        tmp.push({
                            txt: txt[i],
                            width: width,
                            height: height,
                        });
                    }
                    return tmp;
                })
                .enter().append("tspan")
                .attr('font-size', (d) => {
                    if (d.height<15) {
                        return 5 + 'px'
                    }
                    if (d.width > 70) {
                        return '14px';
                    }
                    return d.width * 13 / 80 + "px";
                })
                .attr("x", 4)
                .attr("y", function (d, i) { return 13 + i * 10; })
                .text(function (d) { return d.txt; });

            cell.append("title")
                .text(function (d) {
                    const first = d.data.id.indexOf('|');
                    const last = d.data.id.lastIndexOf('|');
                    return d.data.id.slice(0, first) + ": " + d.data.id.slice(first + 1, last) + "\nArrest Subtype: " + d.data.id.slice(last + 1) + "\nNumer of Arrests: " + format(d.value);
                });

            cell.transition()
                .duration(750)
                .attr("transform", (d) => { return "translate(" + d.x0 + "," + d.y0 + ")"; })
                .select("rect")
                .attr("width", (d) => { return d.x1 - d.x0; })
                .attr("height", (d) => { return d.y1 - d.y0; });

            var legend = ['part1', 'part2', 'part3'];

            // // create legend
            // var svg1 = d3.select('#treemap-legend')
            //     .append('svg')
            //     .attr('width', 200)
            //     .attr('height', 500).append('g')
            //     .attr('class', 'legend')
            //     .attr('transform', 'translate(' + width + ', ' + 30 + ')');

            // // legend title
            // svg1.append('text')
            //     .style('font-weight', 'bold')
            //     .attr('x', 10)
            //     .attr('y', -10)
            //     .text('Legend');


            // // create g for each legend item
            // var legendItem = svg1.selectAll('.legend-item')
            //     .data(legend).enter()
            //     .append('g')
            //     .attr('class', 'legend-item')
            //     .attr('transform', function (d, i) {
            //         return 'translate(10,' + i * 25 + ')'
            //     });

            // // legend rectangle
            // legendItem.append('rect')
            //     .attr('width', 20)
            //     .attr('height', 20)
            //     .style('fill', function (d) {
            //         return color(d)
            //     });

            // // legend text
            // legendItem.append('text')
            //     .attr('x', 25)
            //     .attr('y', 15).text(function (d) {
            //         return d;
            //     });
        });

        hideLoader('treemap');
    };

    const hideLoader = function (parentId) {
        $('#' + parentId).find('.loader').hide()
    };

    const load = function () {
        loadDataAndSetupVisualizations();
    };


    return {
        load: load,
        redrawTimeline: redrawTimeline,
        toggleCalendars: toggleCalendars,
    }

})();
