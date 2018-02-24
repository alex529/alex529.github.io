            //Width and height
			var margin = {top: 10, right: 50, bottom: 60, left: 60};
            var width = 960 - margin.left - margin.right,
                height = 500 - margin.top - margin.bottom;        
                padding = 100;
			var dataset, xScale, yScale, xAxis, yAxis;  //Empty, for now 
			var startDate, endDate;

            //linear regression
            var lg;
            //updating and transition triggers if data was removed from the graph
            var menDataRemoved, womenDataRemoved;
               
           //covert data from CSV
           // var rowConverter = function (d) {
            function rowConverter(d) {
                return {
                        Year: parseInt(d.Year),  
                        Athlete: d.Athlete,
                        Time: HoursToMinutes(d.Time)
                    };
                }
            
            //convert HH:MM:SS to MINUTES
            function HoursToMinutes(str) {
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
                //assign raw data to datesets 
                dataSetMen = rawDataMen;
                dataSetWomen = rawDataWomen;
                //x-axis starting and ending points
                startDate = d3.min(dataSetMen, function(d) { return d.Year; });
				endDate = d3.max(dataSetMen, function(d) { return d.Year; });
 
                //x and y scales
                xScale = d3.scaleLinear()
                           .domain([d3.timeYear.offset(startDate, 0), d3.timeYear.offset(endDate, 0)])
                           .range([0, width]);
               
                yScale = d3.scaleLinear()
                           .domain([0, d3.max(dataSetWomen, function(d) { return d.Time;})])
                           .range([height, 0]);
                
                //Define X axis
				var xAxis = d3.axisBottom()
								  .scale(xScale)
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
                
                var circlePoints = svg.selectAll("g");
                
                function drawMenPoints(){
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
                       .attr("r", 4 )
                       .append("title")
                       .text(function(d) {
                        return  "Name: "+ d.Athlete +"\n" + "Time:" + parseInt(d.Time) +" min " + ", Year:" + d.Year; 
                       });   
                }
                drawMenPoints();
                function drawWomenPoints(){
                //women data
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
                   .attr("height", 6)
                   .attr("width", 6)
                   .attr("class", "womenDataRects")
                   .append("title")
                   .text(function(d) {
			   		return  "Name: "+ d.Athlete +"\n" + "Time:" + parseInt(d.Time) +" min " + ", Year:" + d.Year; 
                   });
                }   
                drawWomenPoints();
                
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

                function drawLinesBetweenDotsWomen() {
                    //Create lines between dots
                    svg.append("path")
                        .datum(dataSetWomen)
                        .attr("class", "line2")
                        .attr("d", line);
                }   
                drawLinesBetweenDotsWomen(); 
                
                function drawLinesBetweenDotsMen(){
                    //Create lines between dots    
                    svg.append("path")
                        .datum(dataSetMen)
                        .attr("class", "line1")
                        .attr("d", line);                    
                }
                drawLinesBetweenDotsMen();
                
                //Linear Regression lines
                //lg women
                lgWomen = calcLinear(dataSetWomen, "Year", "Time", d3.min(dataSetWomen, function(d){ return d.Year}), d3.min(dataSetWomen, function(d){ return d.Time}));
                function drawLinearRegressionWomen(){
                svg.append("line")
                    .attr("x1", xScale(lgWomen.ptA.x))
                    .attr("y1", yScale(lgWomen.ptA.y))
                    .attr("x2", xScale(lgWomen.ptB.x))
                    .attr("y2", yScale(lgWomen.ptB.y))
                    .attr("class", "lgWomen");
                }
                drawLinearRegressionWomen();
                //lg men
                lgMen = calcLinear(dataSetMen, "Year", "Time", d3.min(dataSetMen, function(d){ return d.Year}), d3.min(dataSetMen, function(d){ return d.Time}));                    
                function drawLinearRegressionMen(){    
                svg.append("line")
                    .attr("x1", xScale(lgMen.ptA.x))
                    .attr("y1", yScale(lgMen.ptA.y))
                    .attr("x2", xScale(lgMen.ptB.x))
                    .attr("y2", yScale(lgMen.ptB.y))
                    .attr("class", "lgMen");  
                }
                drawLinearRegressionMen();
                //remove men and women data functions
                function removeMenData(){    
                    //remove men data     
                    svg.selectAll("circle").remove();
                    svg.selectAll("path.line1").remove();
                    svg.selectAll("line.lgMen").remove();
                    svg.selectAll("rect.legendMen").remove();
                    svg.selectAll("text.legendMen").remove(); 
                }                    
                function removeWomenData(){
                    //remove women data     
                        svg.selectAll("rect").remove();                    
                        svg.selectAll("path.line2").remove();                    
                        svg.selectAll("line.lgWomen").remove();
                        svg.selectAll("rect.legendWomen").remove();
                        svg.selectAll("text.legendWomen").remove();  
                }
                
                //Transitions                      
                d3.select("div.menAndWomenButton")
                    .on("click", function() {
                    //scale domain    
                    yScale.domain([0, d3.max(dataSetWomen, function(d) { return d.Time;}) ]);
                    xScale.domain([d3.min(dataSetMen, function(d) { return d.Year; }), d3.max(dataSetWomen, function(d) { return d.Year; }) ]);                      
                    //remove data if only one of them was displayed before
                    removeMenData();     
                    removeWomenData();  
                    //add women data
                    drawWomenPoints();   
                    drawLinesBetweenDotsWomen();                   
                    drawLinearRegressionWomen();
                    //add men data
                    drawMenPoints();                        
                    drawLinesBetweenDotsMen();
                    drawLinearRegressionMen();
                    //legend 
                    drawLegendWomen();                     
                    drawLegendRegressionLine();  
                    drawLegendMen();                    
                    //update axis   
                    svg.select(".y.axis")
                       .transition()
                       .duration(500)
                       .call(yAxis);
                    svg.select(".x.axis")
                       .transition()
                       .duration(500)
                       .call(xAxis);   
                    //reset the triggers for men and women data removal
                    menDataRemoved = 0;
                    womenDataRemoved = 0;
                });
                d3.select("div.womenButton")
                    .on("click", function() {
                    //scale domain    
                    yScale.domain([0, d3.max(dataSetWomen, function(d) { return d.Time;}) ]);
                    xScale.domain([d3.min(dataSetWomen, function(d) { return d.Year; }), d3.max(dataSetWomen, function(d) { return d.Year; }) ]);    

                    if(womenDataRemoved == 1){
                        //remove man data     
                        removeMenData();
                    //add women data
                        drawWomenPoints();   
                        drawLinesBetweenDotsWomen();                   
                        drawLinearRegressionWomen();
                    //legend women and straight-line only
                        drawLegendWomen();                     
                        drawLegendRegressionLine();            
                    }else{                    
                        //remove man data     
                        removeMenData();
                        //transition women path
                        svg.select("path.line2")
                           .datum(dataSetWomen)
                           .transition()
                           .duration(1000)
                           .attr("d", line);
                        //transition women lg   
                        svg.select("line.lgWomen")
                            .attr("x1", xScale(lgWomen.ptA.x))
                            .attr("y1", yScale(lgWomen.ptA.y))
                            .attr("x2", xScale(lgWomen.ptB.x))
                            .attr("y2", yScale(lgWomen.ptB.y))
                            .transition()
                            .duration(1000);
                        //women data transition
                        svg.selectAll("rect")
                           .data(dataSetWomen)
                           .transition()
                           .duration(1000)
                           .attr("x", function(d) {
                                return xScale(d.Year);
                           })
                           .attr("y",  function(d){
                                return yScale(d.Time);
                           });
                    }
                        //set the trigger of men data to true
                        menDataRemoved = 1
                        //update axis   
                        svg.select(".y.axis")
                           .transition()
                           .duration(500)
                           .call(yAxis);
                         svg.select(".x.axis")
                           .transition()
                           .duration(500)
                           .call(xAxis);                                          
                });  
                d3.select("div.menButton")
                    .on("click", function() {
                     //scale domain    
                    yScale.domain([0, d3.max(dataSetMen, function(d) { return d.Time;}) ]);
                    xScale.domain([d3.min(dataSetMen, function(d) { return d.Year; }), d3.max(dataSetWomen, function(d) { return d.Year; }) ]);    
                    
                    if(menDataRemoved==1){
                        //remove women data     
                        removeWomenData();
                        //add men data
                        drawMenPoints();                        
                        drawLinesBetweenDotsMen();
                        drawLinearRegressionMen(); 
                    //legend men and straight-line only  
                        drawLegendMen();                    
                        drawLegendRegressionLine();                          
                    }else{
                        //remove women data     
                        removeWomenData();
                        
                        //transition men path
                        svg.select("path.line1")
                           .datum(dataSetMen)
                           .transition()
                           .duration(1000)
                           .attr("d", line);
                        //transition lg
                        svg.select("line.lgMen")
                            .attr("x1", xScale(lgMen.ptA.x))
                            .attr("y1", yScale(lgMen.ptA.y))
                            .attr("x2", xScale(lgMen.ptB.x))
                            .attr("y2", yScale(lgMen.ptB.y))
                            .transition()
                            .duration(1000);
                        //men data transition
                        svg.selectAll("circle")
                           .data(dataSetMen)
                           .transition()
                           .duration(1000)
                           .attr("cx", function(d) {
                                return xScale(d.Year);
                           })
                           .attr("cy",  function(d){
                                return yScale(d.Time);
                           });
                    //legend men update because "rect" was removed with women data
                        drawLegendMen();                    
                        drawLegendRegressionLine();                            
                    }          
                    //update axis   
                        svg.select(".y.axis")
                           .transition()
                           .duration(500)
                           .call(yAxis);
                         svg.select(".x.axis")
                           .transition()
                           .duration(500)
                           .call(xAxis);
                    //set the trigger of women data to true
                        womenDataRemoved = 1;                             
                });                                       
                //Legend                                    
                var legendRectSideSize = 20;
                var legendPositionX = 200;
                    legendPositionY = 100;    
                function drawLegendWomen(){
                    //women
                    svg.append("rect")
                       .attr("class", "legendWomen")
                       .attr("x", width - legendPositionX)
                       .attr("y", height - legendPositionY)
                       .attr("width", legendRectSideSize)
                       .attr("height", legendRectSideSize);
                    svg.append("text")
                       .attr("x", width - legendPositionX + 1.5*legendRectSideSize)
                       .attr("y", height - legendPositionY + 0.8*legendRectSideSize)
                       .attr("class", "legendWomen")
                       .text("Women");  
                }
                function drawLegendMen(){
                    //men   
                    svg.append("rect")
                       .attr("class", "legendMen")
                       .attr("x", width - legendPositionX)
                       .attr("y", height - legendPositionY - 1.5*legendRectSideSize)
                       .attr("width", legendRectSideSize)
                       .attr("height", legendRectSideSize);  
                    svg.append("text")
                       .attr("class", "legendMen")
                       .attr("x", width - legendPositionX + 1.5*legendRectSideSize)
                       .attr("y", height - legendPositionY - 0.7*legendRectSideSize)
                       .text("Men");  
                }
                function drawLegendRegressionLine(){
                    //regression line
                    svg.append("rect")
                       .attr("class", "legendLr")
                       .attr("x", width - legendPositionX)
                       .attr("y", height - legendPositionY - 3*legendRectSideSize)
                       .attr("width", legendRectSideSize)
                       .attr("height", legendRectSideSize);                      
                    svg.append("text")
                       .attr("x", width - legendPositionX + 1.5*legendRectSideSize)
                       .attr("y", height - legendPositionY - 2.2*legendRectSideSize)
                       .attr("class", "legendLrText")
                       .text("Straight-line fit");  
                }
                //draw initial legend
                drawLegendMen();
                drawLegendWomen();
                drawLegendRegressionLine();
            });                  
        });  
        
//linear regression function        
        function calcLinear(data, x, y, minX, minY){
          /////////
          //SLOPE//
          /////////

          // Let n = the number of data points
          var n = data.length;

          // Get just the points
          var pts = [];
          data.forEach(function(d,i){
            var obj = {};
            obj.x = d[x];
            obj.y = d[y];
            obj.mult = obj.x*obj.y;
            pts.push(obj);
          });

          // Let a equal n times the summation of all x-values multiplied by their corresponding y-values
          // Let b equal the sum of all x-values times the sum of all y-values
          // Let c equal n times the sum of all squared x-values
          // Let d equal the squared sum of all x-values
          var sum = 0;
          var xSum = 0;
          var ySum = 0;
          var sumSq = 0;
          pts.forEach(function(pt){
            sum = sum + pt.mult;
            xSum = xSum + pt.x;
            ySum = ySum + pt.y;
            sumSq = sumSq + (pt.x * pt.x);
          });
          var a = sum * n;
          var b = xSum * ySum;
          var c = sumSq * n;
          var d = xSum * xSum;

          // Plug the values that you calculated for a, b, c, and d into the following equation to calculate the slope
          // slope = m = (a - b) / (c - d)
          var m = (a - b) / (c - d);

          /////////////
          //INTERCEPT//
          /////////////

          // Let e equal the sum of all y-values
          var e = ySum;

          // Let f equal the slope times the sum of all x-values
          var f = m * xSum;

          // Plug the values you have calculated for e and f into the following equation for the y-intercept
          // y-intercept = b = (e - f) / n
          var b = (e - f) / n;

          // return an object of two points
          // each point is an object with an x and y coordinate
          return {
            ptA : {
              x: minX,
              y: m * minX + b
            },
            ptB : {
              y: minY,
              x: (minY - b) / m
            }
          }

        }  