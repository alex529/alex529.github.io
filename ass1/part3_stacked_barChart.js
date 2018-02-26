			var margin3 = {top: 10, right: 50, bottom: 60, left: 60};
            var width3 = 650 - margin3.left - margin3.right,
                height3 = 400 - margin3.top - margin3.bottom;        
                padding3 = 100;

            
          

            //covert data from CSV
            var rowConverter2 = function(d) {
                return {
                        Month: d.Month, //No conversion
                        f0: parseInt(d.f0),
                        f1: parseInt(d.f1),
                        v2: parseInt(d.v2),
                        v3: parseInt(d.v3)
                    };
                }  

            var stack = d3.stack();
            
                //read from CSV 
                d3.csv("stackedBarFruits.csv", rowConverter2, function(rawData){
                var dataset, xScale2, yScale2, xAxis2, zScale2, yAxis2;  //Empty, for now 

                //names in the Legend
                var items = ["Fresh Fruits","Storage Fruits","Fresh Vegetable","Storage Vegetable"];  
            
                dataset = rawData;

				var startdate2 = d3.min(dataset, function(d) { return d.Month; });
				var endDate2 = d3.max(dataset, function(d) { return d.Month; });
                
                xScale2 = d3.scaleBand()
                            .domain(dataset.map(function(d){return d.Month; }))
                            .rangeRound([0, width3])
                            .padding(0.7)
                            .align(0.3);
                
                yScale2 = d3.scaleLinear()
                           //.domain([0, d3.max(dataset, function(d) { return d.Count;})])
                           .domain([0, 45])
                           .rangeRound([height3, 0]);
                
                zScale2 = d3.scaleOrdinal(d3.schemeCategory10)
                            .range(["#ff0000", "#33cc33", "#ff9999", "#ccff99"])
                            .domain(dataset.columns.slice(1));


                //Define X axis
				var xAxis2 = d3.axisBottom()
								  .scale(xScale2);

				//Define Y axis
				var yAxis2 = d3.axisLeft()
								  .scale(yScale2)
								  .ticks(10);
                             
                //Create SVG element
                var svg = d3.select("#part3-stacked-barChart").append("svg")
                            .attr("width", width3 + margin3.left + margin3.right)
                            .attr("height", height3 + margin3.top + margin3.bottom)
                            .append("g")
                            .attr("transform", "translate(" + margin3.left + "," + margin3.top + ")");       
                          
                //create the stacked plot
                svg.selectAll(".serie")
                    .data(stack.keys(dataset.columns.slice(1))(dataset))
                    .enter().append("g")
                      .attr("class", "serie")
                      .attr("fill", function(d) { return zScale2(d.key); })
                    .selectAll("rect")
                    .data(function(d) { return d; })
                    .enter().append("rect")
                      .attr("x", function(d) { return xScale2(d.data.Month); })
                      .attr("y", function(d) { return yScale2(d[1]); })
                      .attr("height", function(d) { return yScale2(d[0]) - yScale2(d[1]); })
                      .attr("width", 20);


                var legend = svg.selectAll(".legend")
                    .data(items)
                    .enter().append("g")
                      .attr("class", "legend")
                      .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; })
                      .style("font", "10px sans-serif");

                legend.append("rect")
                      .attr("x", width3 -80)
                      .attr("width", 18)
                      .attr("height", 18)                     
                      .attr("fill", zScale2);
                      
                legend.append("text")
                  .attr("x", width3 -40)
                  .attr("y", 9)
                  .attr("dy", ".35em")
                  .attr("text-anchor", "start")
                  .text(function(d) { return d; });                                 

                //Create x-axis
                svg.append("g")
                    .attr("class", "x axis")    
                    .attr("transform", "translate(0," + height3 + ")")
                    .call(xAxis2);
                //Create y-axis
                svg.append("g")
                    .attr("class", "y axis")    
                    .call(yAxis2);
                    
                //axes labels
                svg.append("text")
                    .attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
                    .attr("transform", "translate("+ -(padding3/3) +","+(height3/2)+")rotate(-90)")  // text is drawn off the screen top left, move down and out and rotate
                    .text("# of Unique Kinds of Produce");

                svg.append("text")
                    .attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
                    .attr("transform", "translate("+ (width3/2) +","+(height3+(padding3/3))+")")  // centre below axis
                    .text("Month of the Year");
    
            });             
         
    
                