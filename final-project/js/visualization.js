var Visualization = (function(){ 

    var loadDataAndSetupVisualizations = function(){
        d3.csv("/data/placeholder.csv", function(data){
            setupMap();
            setupBrush(data);
            setupDoughnut()
            setupCalendar();
            setupScatterPlot();
            setupTreemap();
        })

        /* we can make different csv imports for each viz depending on the preprocessing e.g.
        
        d3.csv("/data/mapData.csv", function(data){
            setupMap(data);
        })
        */
    };

    var setupMap = function(){
        console.log(d3.version);        
        console.log("init map");
    };

    var setupBrush = function(data){
        
        let entries = d3.nest()
            .key(function (d) { return d.arst_date; })
            .entries(data);

        let parseTime = d3.timeParse("%m/%d/%Y");
        
        for (let i = 0; i < data.length; i++) {
            data[i].arst_date = parseTime(data[i].arst_date);
        }

        data.sort((x, y) => {
            return d3.ascending(x.arst_date, y.arst_date);
        });

        startDate = d3.min(entries, function (d) { 
            return parseTime(d.key); 
        });
        endDate = d3.max(entries, function (d) { 
            return parseTime(d.key); 
        });

        xScale = d3.scaleTime()
            .domain([startDate, endDate])
            .rangeRound([0, w]);
    
        yScale = d3.scaleLinear()
            .domain([0, d3.max(entries, function (d) { return d.values.length; })])
            .range([h, 0]);
        
        let xAxis = d3.axisBottom()
            .scale(xScale);

        let yAxis = d3.axisLeft()
            .scale(yScale)
            .ticks(10); // check how many

        let svg = d3.select("#timeline")
            .append("svg")
            .attr("width", w + margin.left + margin.right)
            .attr("height", h + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        svg.selectAll("rect")
            .data(entries)
            .enter()
            .append("rect")
            .attr("x", function (d) {
                return xScale(parseTime(d.key));
            })
            .attr("y", function (d) {
                return yScale(d.values.length);
            })
            .attr("width", w / entries.length)
            .attr("height", function (d) {
                return h - yScale(d.values.length);
            })
            .attr("fill", "darkslateblue");

        svg.append("g")
            .attr("class", "axis")
            .attr("transform", "translate(0," + (h) + ")")
            .call(xAxis);

        svg.append("g")
            .attr("class", "axis")
            .attr("transform", "translate(0,0)")
            .call(yAxis);

        svg.append("text")
            .attr("class", "label")
            .attr("text-anchor", "middle")
            .attr("x", w / 2)
            .attr("y", h + padding)
            .text("Day");

        svg.append("text")
            .attr("text-anchor", "middle")
            .attr("transform", "translate(" + -(padding) + "," + (h / 2) + ")rotate(-90)")
            .text("# of Arrests Conducted");

        x = d3.scaleTime()
            .range([0, w]);
    };

    var setupDoughnut = function(){
        console.log("init doughnut");
    };

    var setupCalendar = function(){
        console.log("init calendar");
    };

    var setupScatterPlot = function(){
        console.log("init scatter plot");
    };

    var setupTreemap = function(){
        console.log("init treemap");
    };

    var load = function(){
        loadDataAndSetupVisualizations();
    }

    return {
        load : load
    }

})();