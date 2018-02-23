            //Width and height
			var margin = {top: 10, right: 50, bottom: 60, left: 60};
            var width = 960 - margin.left - margin.right,
                height = 500 - margin.top - margin.bottom;        
                padding = 100;
			var dataset, xScale, yScale, xAxis, yAxis;  //Empty, for now
			var startDate, endDate;


               
            //covert data from CSV
           // var rowConverter = function (d) {
            function rowConverter(d) {
                return {
                        Year: parseInt(d.Year),  
                        Athlete: d.Athlete,
                      //  Country/State: d.Country/State,
                        //Time: parseTime(d.Time)
                        Time: hmsToSecondsOnly(d.Time)
                    };
                }
            
            //convert HH:MM:SS to MINUTES
            function hmsToSecondsOnly(str) {
                var p = str.split(':'),
                    s = 0, m = 1;

                while (p.length > 0) {
                    s += m * parseInt(p.pop(), 10);
                    m *= 60;
            }

                return s/60;
            }
            
            //read from CSV 
            d3.csv("marathonMenData.csv", rowConverter, function(error, rawDataMen){
            
            d3.csv("marathonWomenData.csv", rowConverter, function(error, rawDataWomen){
               if (error){
                    console.log("Please check if the CSV file is present");
                 }
                 
                dataSetMen = rawDataMen;
                dataSetWomen = rawDataWomen;


                
                startDate = d3.min(dataSetMen, function(d) { return d.Year; });
				endDate = d3.max(dataSetMen, function(d) { return d.Year; });
 
               
                xScale = d3.scaleLinear()
                           .domain([
                                d3.timeYear.offset(startDate, 0),
                                d3.timeYear.offset(endDate, 0)
                                ])
                           .range([0, width]);
               
                yScale = d3.scaleLinear()
                           .domain([0,
                                d3.max(dataSetWomen, function(d) { return d.Time;})
                                ])
                           .range([height, 0]);
                
                //Define X axis
				var xAxis = d3.axisBottom()
								  .scale(xScale)
								  //.ticks(10)
								  .ticks(10);
				//Define Y axis
				var yAxis = d3.axisLeft()
								  .scale(yScale)
								  .ticks(10);
				
                //Define line generator
				line = d3.line()
							.x(function(d) { return xScale(d.Year); })
							.y(function(d) { return yScale(d.Time); });                
                
                //Create SVG element
                var svg = d3.select("div.part4").append("svg")
                            .attr("width", width + margin.left + margin.right)
                            .attr("height", height + margin.top + margin.bottom)
                            .append("g")
                            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");                
/*  */
                //men data
                svg.selectAll("circle")
                       .data(dataSetMen)
                       .enter()
                       .append("circle")
                       .attr("cx", function(d){
                            return xScale(d.Year);
                        })
                       .attr("cy", function(d){
                            return yScale(d.Time);
                        })
                       .attr("r", 3 )
                       .attr("fill", "red")
                       .attr("stroke", "red")
                       .attr("stroke-width", 1)
                       .attr("fill", "white");                        

                svg.selectAll("rect")
                   .data(dataSetWomen)
                   .enter()
                   .append("rect")
                   .attr("x", function(d) {
                        return xScale(d.Year);
                   })
                   .attr("y",  function(d){
                        return yScale(d.Time);
                   })                     
                   .attr("height", 5)
                   .attr("width", 5)
                   .attr("stroke", "green")
				   .attr("stroke-width", 1)
                   .attr("fill", "white");                   
                       
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
                    .text("Minutes");

                svg.append("text")
                    .attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
                    .attr("transform", "translate("+ (width/2) +","+(height+(padding/3))+")")  // centre below axis
                    .text("Year");
 
				//Create line
				svg.append("path")
					.datum(dataSetWomen)
					.attr("class", "line")
					.attr("d", line);
                    
				svg.append("path")
					.datum(dataSetMen)
					.attr("class", "line")
					.attr("d", line);                    
            
 
 
//Transitions                      

/*

                d3.select("div.button1")
                    .on("click", function() {
                    
                    //Update scale domain
                    yScale.domain([0,
                                d3.max(dataset, function(d) { return d.Count;})
                                ]);
                    //Update y-axis
                    svg.select(".y.axis")
                       .transition()
                       .duration(500)
                       .call(yAxis);
                    
                    
                    svg.selectAll("rect")
                       .data(dataset)
                       .transition()
                       .delay(function(d, i) {
                            return i / dataset.length * 1000;   // <-- Where the magic happens
                        })
                       .duration(500)
                       .ease(d3.easeBounceOut)
                       .attr("y", function(d){
                            return yScale(d.Count);
                        })
                       .attr("height", function(d) {        
                            return height - yScale(d.Count); })
                       .attr("width", 10)
                       .attr("fill", "red");    
                });
                
                
                d3.select("div.button2")
                    .on("click", function() {
                    
                    //Update scale domain
                    yScale.domain([0,
                                d3.max(dataset2, function(d) { return d.Count;})
                                ]);
                    //Update y-axis
                    svg.select(".y.axis")
                       .transition()
                       .duration(500)
                       .call(yAxis);
                    
                    svg.selectAll("rect")
                       .data(dataset2)
                       .transition()
                       .delay(function(d, i) {
                            return i / dataset.length * 1000;   // <-- Where the magic happens
                        })
                       .duration(500)
                       .ease(d3.easeBounceOut) 
                       .attr("y", function(d){
                            return yScale(d.Count);
                        })
                       .attr("height", function(d) {        
                            return height - yScale(d.Count); 
                        })
                       .attr("fill", "blue");
                });  
                d3.select("div.button3")
                    .on("click", function() {
                    
                    //Update scale domain
                    yScale.domain([0,
                                d3.max(dataset3, function(d) { return d.Count;})
                                ]);
                    //Update y-axis
                    svg.select(".y.axis")
                       .transition()
                       .duration(500)
                       .call(yAxis);
                    
                    svg.selectAll("rect")
                       .data(dataset3)
                       .transition()
                       .delay(function(d, i) {
                            return i / dataset.length * 1000;   // <-- Where the magic happens
                        })
                       .duration(500)
                       .ease(d3.easeBounceOut) 
                       .attr("y", function(d){
                            return yScale(d.Count);
                        })
                       .attr("height", function(d) {        
                            return height - yScale(d.Count); 
                        })
                       .attr("fill", "yellow");
                }); 
                
                d3.select("div.button4")
                    .on("click", function() {
                    
                    //Update scale domain
                    yScale.domain([0,
                                d3.max(dataset4, function(d) { return d.Count;})
                                ]);
                    //Update y-axis
                    svg.select(".y.axis")
                       .transition()
                       .duration(500)
                       .call(yAxis);
                    
                    svg.selectAll("rect")
                       .data(dataset4)
                       .transition()
                       .delay(function(d, i) {
                            return i / dataset.length * 1000;   // <-- Where the magic happens
                        })
                       .duration(500)
                       .ease(d3.easeBounceOut) 
                       .attr("y", function(d){
                            return yScale(d.Count);
                        })
                       .attr("height", function(d) {        
                            return height - yScale(d.Count); 
                        })
                       .attr("fill", "green");
                }); 
                
*/                
            });             
         
        });  