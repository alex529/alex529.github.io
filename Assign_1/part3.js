 //width2 and height2
			var margin2 = {top: 10, right: 50, bottom: 60, left: 60};
            var width2 = 960 - margin2.left - margin2.right,
                height2 = 500 - margin2.top - margin2.bottom;        
                padding2 = 100;
			var dataset, xScale2, yScale2, xAxis2, yAxis2;  //Empty, for now
            //For converting strings to Dates
            var parseTime = d3.timeParse("%b");
            
            //For converting Dates to strings
            var formatTime = d3.timeFormat("%b");
                        
            //covert data from CSV
            var rowConverter = function(d) {
                return {
                        Index: parseInt(d.Index),  
                        Month: parseTime(d.Month), //No conversion
                        Count: parseInt(d.Count)
                    };
                }          
            //read from CSV 
            d3.csv("data_converted.csv", rowConverter, function(rawData){
               
                //copy data into a global dataset
                dataset = rawData.slice(0,12);
                dataset2 = rawData.slice(12,24);
                dataset3 = rawData.slice(24,36);
                dataset4 = rawData.slice(36,48);
                
				var startdate2 = d3.min(dataset, function(d) { return d.Month; });
				var endDate2 = d3.max(dataset, function(d) { return d.Month; });
                
                xScale2 = d3.scaleTime()
                           .domain([
                                //d3.timeMonth.offset("", -1),
                                d3.timeMonth.offset(startdate2, -1),
                                d3.timeMonth.offset(endDate2, 0)
                                ])
                           .range([0, width2]);
                
                yScale2 = d3.scaleLinear()
                           .domain([0,
                                d3.max(dataset, function(d) { return d.Count;})
                                ])
                           .range([height2, 0]);
                
                //Define X axis
				var xAxis2 = d3.axisBottom()
								  .scale(xScale2)
								  .tickFormat(formatTime);
				//Define Y axis
				var yAxis2 = d3.axisLeft()
								  .scale(yScale2)
								  .ticks(10);
                                
                //Create SVG element
                var svg = d3.select("div.graphAndButtons").append("svg")
                            .attr("width", width2 + margin2.left + margin2.right)
                            .attr("height", height2 + margin2.top + margin2.bottom)
                            .append("g")
                            .attr("transform", "translate(" + margin2.left + "," + margin2.top + ")");
                                    
                svg.selectAll("rect")
                       .data(dataset)
                       .enter()
                       .append("rect")
                       .attr("x", function(d){
                            return xScale2(d.Month);
                        })
                       .attr("y", function(d){
                            return yScale2(d.Count);
                        })
                       .attr("height", function(d) {        
                            return height2 - yScale2(d.Count); })
                       .attr("width", 10)
                       .attr("fill", "red");
                       //.attr("class", "freshFruit");

                //Create x-axis
                svg.append("g")
                    .attr("class", "x axis")    
                    .attr("transform", "translate(0," + height2 + ")")
                    .call(xAxis2);
                //Create y-axis
                svg.append("g")
                    .attr("class", "y axis")    
                    .call(yAxis2);
                    
                //axes labels
                svg.append("text")
                    .attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
                    .attr("transform", "translate("+ -(padding2/3) +","+(height2/2)+")rotate(-90)")  // text is drawn off the screen top left, move down and out and rotate
                    .text("# of Unique Kinds of Produce");

                svg.append("text")
                    .attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
                    .attr("transform", "translate("+ (width2/2) +","+(height2+(padding2/3))+")")  // centre below axis
                    .text("Month of the Year");
                       
                //Transitions                      
                d3.select("div.button1")
                    .on("click", function() {
                    
                    //Update scale domain
                    yScale2.domain([0,
                                d3.max(dataset, function(d) { return d.Count;})
                                ]);
                    //re-draw rect with new data
                    svg.selectAll("rect")
                       .data(dataset)
                       .transition()
                       .delay(function(d, i) {
                            return i / dataset.length * 1000;  
                        })
                       .duration(500)
                       .ease(d3.easeBounceOut)
                       .attr("y", function(d){
                            return yScale2(d.Count);
                        })
                       .attr("height", function(d) {        
                            return height2 - yScale2(d.Count); })
                       .attr("width", 10)
                       .attr("fill", "red");    
                    //Update y-axis
                    svg.select(".y.axis")
                       .transition()
                       .duration(500)
                       .call(yAxis2);                            
                });
                
                
                d3.select("div.button2")
                    .on("click", function() {
                    
                    //Update scale domain
                    yScale2.domain([0,
                                d3.max(dataset2, function(d) { return d.Count;})
                                ]);
                    //Update y-axis
                    svg.select(".y.axis")
                       .transition()
                       .duration(500)
                       .call(yAxis2);
                    //re-draw rect with new data                   
                    svg.selectAll("rect")
                       .data(dataset2)
                       .transition()
                       .delay(function(d, i) {
                            return i / dataset.length * 1000;   // <-- Where the magic happens
                        })
                       .duration(500)
                       .ease(d3.easeBounceOut) 
                       .attr("y", function(d){
                            return yScale2(d.Count);
                        })
                       .attr("height", function(d) {        
                            return height2 - yScale2(d.Count) 
                        })
                       .attr("width", 10)
                       .attr("fill", "blue");
                       //.attr("class", "freshVegetable");
                });  
                d3.select("div.button3")
                    .on("click", function() {
                    
                    //Update scale domain
                    yScale2.domain([0,
                                d3.max(dataset3, function(d) { return d.Count;})
                                ]);
                    //Update y-axis
                    svg.select(".y.axis")
                       .transition()
                       .duration(500)
                       .call(yAxis2);
                    //re-draw rect with new data
                    svg.selectAll("rect")
                       .data(dataset3)
                       .transition()
                       .delay(function(d, i) {
                            return i / dataset.length * 1000;   // <-- Where the magic happens
                        })
                       .duration(500)
                       .ease(d3.easeBounceOut) 
                       .attr("y", function(d){
                            return yScale2(d.Count);
                        })
                       .attr("height", function(d) {        
                            return height2 - yScale2(d.Count) 
                        })
                       .attr("width", 10)
                       .attr("fill", "yellow");
                       //.attr("class", "storageFruit");
                }); 
                
                d3.select("div.button4")
                    .on("click", function() {
                    
                    //Update scale domain
                    yScale2.domain([0,
                                d3.max(dataset4, function(d) { return d.Count;})
                                ]);
                    //Update y-axis
                    svg.select(".y.axis")
                       .transition()
                       .duration(500)
                       .call(yAxis2);
                    //re-draw rect with new data
                    svg.selectAll("rect")
                       .data(dataset4)
                       .transition()
                       .delay(function(d, i) {
                            return i / dataset.length * 1000;   // <-- Where the magic happens
                        })
                       .duration(500)
                       .ease(d3.easeBounceOut) 
                       .attr("y", function(d){
                            return yScale2(d.Count);
                        })
                       .attr("height", function(d) {        
                            return height2 - yScale2(d.Count)
                        })
                       .attr("width", 10)
                       .attr("fill", "green");
                       //.attr("class", "storageVegetable");
                }); 
                
            });             
         
    
                