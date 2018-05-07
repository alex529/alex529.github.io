const Visualization = (() => {

    var activeFeature = d3.select(null);
    var geoGenerator, projection;

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
                .on("click", function(d, i) {
                    if (activeFeature.node() === this){
                        resetZoom();
                        resetCharts();
                    }
                    else{
                        zoomToFeature(d, this);
                        redrawCharts(i);
                    }

                    
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

    const redrawCharts = (id) => {
        d3.json('./data/districts/d' + id + '.json', (err, data) => {
            redrawTimeline(data);
            redrawMapPoints(data);
        });
    };

    const redrawTimeline = (data) => {
        const g = d3.selectAll('#timeline svg g');
        g.selectAll("*").remove();
        populateTimeline(data);
        hideLoader('timeline');
    }

    const redrawMapPoints = (data) => {
        d3.select('#map svg')
            .selectAll('circle')
            .data(data)
            .enter()
            .append('circle')
            .attr('cx', (d, i) => {
                return projection([d.Locations[0].location.y, d.Locations[0].location.x])[0];
            })
            .attr('cy', (d, i) => {
                return projection([d.Locations[0].location.y, d.Locations[0].location.x])[1];
            })
            .attr('r', (d, i) => {
                return 2
            })
            .style('fill', 'url(#radial-gradient)')
            .attr('id', (d) => { return d.lat + '|' + d.lon });
    }

    const resetCharts = () => {
        
    }

    const resetZoom = () => {
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
    
    
    
    /* --------- DOUGHNUT ----------  */

    var setupDoughnut = function () {
        drawGenderDoughnut();
        drawDescentDoughnut();
    };
    var drawDescentDoughnut = function () {
            //Width and height
			var margin = {top: 0, right: 50, bottom: 0, left: 60};
            var width = 650 - margin.left - margin.right,
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
             
            d3.csv("./data/excel/descent_code_pie_chart_resampled.csv", rowConverter, function(error, rawData){
                           if (error){
                                console.log("Please check if the CSV file is present");
                             }
            dataSet = rawData;
            //Width and height
			var w = 300;
			var h = 300;
			var outerRadius = w / 2;
			var innerRadius = w / 3;
			var arc = d3.arc()
						.innerRadius(innerRadius)
                        .cornerRadius(3) // sets how rounded the corners are on each slice                        
						.outerRadius(outerRadius);
			
			var pie = d3.pie()
                        .value(function(d) {return d.SumRaces;})
                        .padAngle(0.01); 			
			//Easy colors accessible via a 10-step ordinal scale
			var color = d3.scaleOrdinal(d3.schemeCategory10);               
                
			//Create SVG element
			var svg = d3.select("#doughnut").append("svg")
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
            var total = d3.sum(dataSet, function(d){return d.SumRaces});                        
			
			//Draw arc paths
			arcs.append("path")
			    .attr("fill", function(d, i) {
			    	return color(i);
			    })
			    .attr("d", arc)
                .data(dataSet)
                .append("title")
                    .text(function(d) {
                        return "The number of " + d.Races + " is: " + d.SumRaces + " or " + Math.round(d.SumRaces/total*100) + "%";
                    });                       
            
            //legend
            var legendRectSize = 18;
            var legendSpacing = 4;
            
            var legend = svg.selectAll('.legend')
              .data(color.domain())
              .enter()
              .append('g')
              .attr('class', 'legend')
              .attr('transform', function(d, i) {
                var hLegend = legendRectSize + legendSpacing;
                var horz = 7 * legendRectSize;
                var vert = i * hLegend + h/2.8;
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
              .text(function(d) { return d.Races; });
            

            //Labels
			arcs.append("text")
			    .attr("text-anchor", "middle")
                .attr("transform", function(d) {
                    var _d = arc.centroid(d);
                    _d[0] *= 1.35;	//multiply by a constant factor
                    _d[1] *= 1.35;	//multiply by a constant factor
                    return "translate(" + _d + ")";
                  })
                .attr("dy", ".50em")
                .data(dataSet)
			    .text(function(d) {
			    	return Math.round(d.SumRaces/total*100) + "%";
			    });    
              
              
            });      
      
    };    
    var drawGenderDoughnut = function () {
            //Width and height
			var margin = {top: 0, right: 50, bottom: 0, left: 60};
            var width = 650 - margin.left - margin.right,
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
            
            
            d3.csv("./data/excel/sex_code_pie_chart.csv", rowConverter, function(error, rawData){
                           if (error){
                                console.log("Please check if the CSV file is present");
                             }
            dataSet = rawData;
            //Width and height
			var w = 300;
			var h = 300;
			var outerRadius = w / 2;
			var innerRadius = w / 3;
			var arc = d3.arc()
						.innerRadius(innerRadius)
                        .cornerRadius(3) // sets how rounded the corners are on each slice
						.outerRadius(outerRadius);
			
			var pie = d3.pie()
                        .value(function(d) {return d.SumGender;})
                        .padAngle(0.01); 
			//Easy colors accessible via a 10-step ordinal scale
			var color = d3.scaleOrdinal(d3.schemeCategory10);               
                
			//Create SVG element
			var svg = d3.select("#doughnut").append("svg")
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
            var total = d3.sum(dataSet, function(d){return d.SumGender});
                          
			//Draw arc paths
			arcs.append("path")
			    .attr("fill", function(d, i) {
			    	return color(i);
			    })
			    .attr("d", arc)
                .data(dataSet)
                .append("title")
                    .text(function(d) {
                        return "The number of " + d.Gender + " is: " + d.SumGender + " or " + Math.round(d.SumGender/total*100) + "%";
                    });
                    
            //legend
            var legendRectSize = 18;
            var legendSpacing = 4;
            
            var legend = svg.selectAll('.legend')
              .data(color.domain())
              .enter()
              .append('g')
              .attr('class', 'legend')
              .attr('transform', function(d, i) {
                var hLegend = legendRectSize + legendSpacing;
                //var offset2 =  h * color.domain().length / 2;
                var horz = 7 * legendRectSize;
                var vert = i * hLegend + h/2.2;
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
              .text(function(d) { return d.Gender; });
             
            //Labels
			arcs.append("text")
			    .attr("text-anchor", "middle")
                .attr("transform", function(d) {
                    var _d = arc.centroid(d);
                    _d[0] *= 1.35;	//multiply by a constant factor
                    _d[1] *= 1.35;	//multiply by a constant factor
                    return "translate(" + _d + ")";
                  })
                .attr("dy", ".50em")
                .data(dataSet)
			    .text(function(d) {
			    	return Math.round(d.SumGender/total*100) + "%";
			    });  
            
            });        
    };

    /* --------- SCATTER PLOT ----------  */
    var setupScatterPlot = function () {
            //Width and height
			var margin = {top: 10, right: 50, bottom: 60, left: 60};
            var width = 650 - margin.left - margin.right,
                height = 400 - margin.top - margin.bottom;        
                padding = 100;
			var dataset, xScale, yScale, xAxis, yAxis;  //Empty, for now 
			var startDate, endDate;

            //linear regression
            var lg;
            //updating and transition triggers if data was removed from the graph
            var menDataRemoved, womenDataRemoved;
            var parseTime = d3.timeParse("%d-%m-%y");   
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
                        Others: parseInt(d.Others)    
                    };
                }            
            
            //read from CSV 
            d3.csv("./data/excel/arrests_races_and_sex_resampled.csv", rowConverter, function(error, rawData){
               if (error){
                    console.log("Please check if the CSV file is present");
                 }
                //assign raw data to datesets 
                dataSet = rawData;
                
                //x-axis starting and ending points
                startDate = d3.min(dataSet, function(d) { return d.Date; });
				endDate = d3.max(dataSet, function(d) { return d.Date; });
                
                //x and y scales
                xScale = d3.scaleTime()
                             .domain([startDate, endDate])
                             .range([0, width]);
                
                yScale = d3.scaleLinear()
                           .domain([0, d3.max(dataSet, function(d) { return d.Males;})])
                           .range([height, 0]);
                
                //Define X axis
				var xAxis = d3.axisBottom()
                              .scale(xScale)
                              .tickFormat(function(date){
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
                function generate_line(type_line){
                    line = d3.line()
                                .x(function(d) { return xScale(d.Date); })
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
                    .attr("transform", "translate("+ -(padding/3) +","+(height/2)+")rotate(-90)")  // text is drawn off the screen top left, move down and out and rotate
                    .text("Number of Arrests");

                svg.append("text")
                    .attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
                    .attr("transform", "translate("+ (width/2) +","+(height+(padding/3))+")")  // centre below axis
                    .text("Year");
                
                //draw points(dots) function
                function drawPoints(type, Points, class_type){
                svg.selectAll(type+"."+class_type)
                       .data(dataSet)
                       .enter()
                       .append(type)
                       .attr("cx", function(d){
                            return xScale(d.Date);
                        })
                       .attr("cy", Points)
                       .attr("r", 2 )
                       .attr("class", class_type)
                       .append("title")
                       //.text(function(d) {
                       // return  "Type: "+ d.Athlete +"\n" + "Number:" + parseInt(d.Time) +" min " + ", Date:" + d.Date; 
                       //});   
                }
                //gender yScaled points
                malePoints = (function(d) { return yScale(d.Males); })
                femalePoints = (function(d) { return yScale(d.Females); })                
                //races yScaled points
                blacksPoints = (function(d) { return yScale(d.Blacks); })
                hispanicPoints = (function(d) { return yScale(d.Hispanic); })
                whitePoints = (function(d) { return yScale(d.White); })
                asiansPoints = (function(d) { return yScale(d.Asians); })
                othersPoints = (function(d) { return yScale(d.Others); })
                //draw points
                drawPoints("circle", femalePoints, "circleFemale")  
                drawPoints("circle", malePoints, "circleMale") 
                drawPoints("circle", blacksPoints, "circleBlacks")
                drawPoints("circle", hispanicPoints, "circleHispanic")
                drawPoints("circle", whitePoints, "circleWhite")
                drawPoints("circle", asiansPoints, "circleAsians")
                drawPoints("circle", othersPoints, "circleOthers")                
                
                
                //draw lines between dots
                function drawLinesBetweenDots(dataSetType, type_class){ 
                    svg.append("path")
                        .datum(dataSet, dataSetType)
                        .attr("class", type_class)
                        .attr("d", line);                    
                }
                //gender datasets
                maleDataSet = function(d) { return d.Males;}
                femaleDataSet = function(d) { return d.Females;}
                //races datasets
                blacksDataSet = function(d) { return d.Blacks;}
                hispanicDataSet = function(d) { return d.Hispanic;}
                whiteDataSet = function(d) { return d.White;}
                asiansDataSet = function(d) { return d.Asians;}
                othersDataSet = function(d) { return d.Others;}
                
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

                //remove men and women data functions
                function removeData(circleType, lineType){    
                    //remove data     
                    svg.selectAll(circleType).remove();
                    svg.selectAll(lineType).remove();
                    //svg.selectAll("line.lgMen").remove();
                    //svg.selectAll("rect.legendMen").remove();
                    //svg.selectAll("text.legendMen").remove(); 
                }             
                //flags for cleared data
                clearMale = 0 
                clearFemale = 0
                clearBlacks = 0
                clearHispanic = 0 
                clearWhite = 0 
                clearAsians = 0
                clearOthers = 0
                //update axis
                function update_axis(){ 
                    svg.select(".y.axis")
                       .transition()
                       .duration(500)
                       .call(yAxis);
                    svg.select(".x.axis")
                       .transition()
                       .duration(500)
                       .call(xAxis); 
                }
                //Transitions                      
                d3.select("div.buttonClearAll")
                    .on("click", function() {
                    //scale domain    
                    yScale.domain([0, d3.max(dataSet, function(d) { return d.Males;}) ]);
                    xScale.domain([d3.min(dataSet, function(d) { return d.Date; }), d3.max(dataSet, function(d) { return d.Date; }) ]);                       
                    //remove function
                    removeData("circle.circleMale", "path.lineMale") 
                    removeData("circle.circleFemale", "path.lineFemale") 
                    removeData("circle.circleBlacks", "path.lineBlacks") 
                    removeData("circle.circleHispanic", "path.lineHispanic") 
                    removeData("circle.circleWhite", "path.lineWhite") 
                    removeData("circle.circleAsians", "path.lineAsians") 
                    removeData("circle.circleOthers", "path.lineOthers") 
                    //update axis   
                    update_axis(); 
                    //set the triggers that everythin was cleared
                    clearMale = 1 
                    clearFemale = 1
                    clearBlacks = 1
                    clearHispanic = 1 
                    clearWhite = 1 
                    clearAsians = 1
                    clearOthers = 1
                });
                d3.select("div.buttonMale")
                    .on("click", function() {
                    //scale domain    
                    yScale.domain([0, d3.max(dataSet, function(d) { return d.Males;}) ]);                       
                    //draw new line  
                    if(clearMale==1){
                        malePoints = (function(d) { return yScale(d.Males); })
                        drawPoints("circle", malePoints, "circleMale") 
                        generate_line(malePoints)
                        drawLinesBetweenDots(maleDataSet, "lineMale")
                        clearMale = 0
                    } else{
                    //remove function
                        removeData("circle.circleMale", "path.lineMale")
                        clearMale = 1
                    }
                    //update axis   
                    update_axis(); 
  
                });
                d3.select("div.buttonFemale")
                    .on("click", function() {
                    //scale domain  
                    yScale.domain([0, d3.max(dataSet, function(d) { return d.Males;}) ]); 
                    //draw new line    
                    if(clearFemale==1){
                        femalePoints = (function(d) { return yScale(d.Females); })
                        drawPoints("circle", femalePoints, "circleFemale") 
                        generate_line(femalePoints)
                        drawLinesBetweenDots(femaleDataSet, "lineFemale")
                        clearFemale = 0
                    } else{
                    //remove function
                        removeData("circle.circleFemale", "path.lineFemale")
                        clearFemale = 1
                    }
                    //update axis   
                    update_axis(); 
                });
                
                d3.select("div.buttonBlacks")
                    .on("click", function() {
                    //scale domain  
                    yScale.domain([0, d3.max(dataSet, function(d) { return d.Males;}) ]); 
                    //draw new line    
                    if(clearBlacks==1){
                        blacksPoints = (function(d) { return yScale(d.Blacks); })
                        drawPoints("circle", blacksPoints, "circleBlacks") 
                        generate_line(blacksPoints)
                        drawLinesBetweenDots(blacksDataSet, "lineBlacks")
                        clearBlacks = 0
                    } else{
                    //remove function
                        removeData("circle.circleBlacks", "path.lineBlacks")
                        clearBlacks = 1
                    }
                    //update axis   
                    update_axis(); 
                });
                
                d3.select("div.buttonHispanic")
                    .on("click", function() {
                    //scale domain  
                    yScale.domain([0, d3.max(dataSet, function(d) { return d.Males;}) ]); 
                    //draw new line    
                    if(clearHispanic==1){
                        hispanicPoints = (function(d) { return yScale(d.Hispanic); })
                        drawPoints("circle", hispanicPoints, "circleHispanic") 
                        generate_line(hispanicPoints)
                        drawLinesBetweenDots(hispanicDataSet, "lineHispanic")
                        clearHispanic = 0
                    } else{
                    //remove function
                        removeData("circle.circleHispanic", "path.lineHispanic")
                        clearHispanic = 1
                    }
                    //update axis   
                    update_axis(); 
                });
                d3.select("div.buttonWhite")
                    .on("click", function() {
                    //scale domain  
                    yScale.domain([0, d3.max(dataSet, function(d) { return d.Males;}) ]); 

                    //draw new line    
                    if(clearWhite==1){
                        whitePoints = (function(d) { return yScale(d.White); })
                        drawPoints("circle", whitePoints, "circleWhite") 
                        generate_line(whitePoints)
                        drawLinesBetweenDots(whiteDataSet, "lineWhite")
                        clearWhite = 0
                    } else{
                    //remove function
                        removeData("circle.circleWhite", "path.lineWhite")
                        clearWhite = 1
                    }
                    //update axis   
                    update_axis(); 
                });
                d3.select("div.buttonAsians")
                    .on("click", function() {
                    //scale domain  
                    yScale.domain([0, d3.max(dataSet, function(d) { return d.Males;}) ]); 

                    //draw new line    
                    if(clearAsians==1){
                        asiansPoints = (function(d) { return yScale(d.Asians); })
                        drawPoints("circle", asiansPoints, "circleAsians") 
                        generate_line(asiansPoints)
                        drawLinesBetweenDots(asiansDataSet, "lineAsians")
                        clearAsians = 0
                    } else{
                    //remove function
                        removeData("circle.circleAsians", "path.lineAsians")
                        clearAsians = 1
                    }
                    //update axis   
                    update_axis(); 
                });
                d3.select("div.buttonOthers")
                    .on("click", function() {
                    //scale domain  
                    yScale.domain([0, d3.max(dataSet, function(d) { return d.Males;}) ]); 

                    //draw new line    
                    if(clearOthers==1){
                        othersPoints = (function(d) { return yScale(d.Others); })
                        drawPoints("circle", othersPoints, "circleOthers") 
                        generate_line(othersPoints)
                        drawLinesBetweenDots(othersDataSet, "lineOthers")
                        clearOthers = 0
                    } else{
                    //remove function
                        removeData("circle.circleOthers", "path.lineOthers")
                        clearOthers = 1
                    }
                    //update axis   
                    update_axis(); 
                });                
                
                                       
            });                   
 
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