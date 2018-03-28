var margin = {top: 10, right: 50, bottom: 60, left: 60};
var w = 800 - margin.left - margin.right
var h = 200 - margin.top - margin.bottom;        
var padding = 30;

d3.csv("data/all_murder.csv", function(data){
    
  let entries = d3.nest()
    .key(function(d) { return d.RPT_DT; })
    .key(function(d) { return d.BORO_NM ; })
    .entries(data);

  let parseTime = d3.timeParse("%m/%d/%Y");

  let startDate = d3.min(entries, function(d) { return parseTime(d.key); });
  let endDate = d3.max(entries, function(d) { return parseTime(d.key); });

  let xScale = d3.scaleTime()
           .domain([startDate, endDate])
           .rangeRound([0, w]);

  let yScale = d3.scaleLinear()
          .domain([0, d3.max(entries, function(d) { return d.values.length;})])
          .range([h, 0]);

  let xAxis = d3.axisBottom()
    .scale(xScale);

  let yAxis = d3.axisLeft()
          .scale(yScale)
          .ticks(5);

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
    .attr("x", function(d) {
        return xScale(parseTime(d.key));
    })
    .attr("y", function(d) {
      return yScale(d.values.length);
    })
    .attr("width", w / entries.length)
    .attr("height", function(d) {        
           return h - yScale(d.values.length); })
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
      .attr("x", w/2)
      .attr("y", h + padding)
      .text("Day");
  
  svg.append("text")
    .attr("text-anchor", "middle")
    .attr("transform", "translate("+ -(padding) + "," + (h / 2) + ")rotate(-90)")
    .text("# of Murders Commited");
});