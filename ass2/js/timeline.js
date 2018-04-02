var margin = { top: 10, right: 50, bottom: 60, left: 60 };
var w = 800 - margin.left - margin.right
var h = 200 - margin.top - margin.bottom;
var startDate, endDate;
var isAnimationToggled = false;

let oldti1 = 0, oldti2 = 0

d3.csv("data/all_murder.csv", function (data) {
  let entries = d3.nest()
    .key(function (d) { return d.RPT_DT; })
    .entries(data);

  let parseTime = d3.timeParse("%m/%d/%Y");
  const formatTime = d3.timeFormat("%m/%d/%Y");

  for (let i = 0; i < data.length; i++) {
    data[i].RPT_DT = parseTime(data[i].RPT_DT)
  }

  data.sort((x, y) => {
    return d3.ascending(x.RPT_DT, y.RPT_DT)
  })

  startDate = d3.min(entries, function (d) { return parseTime(d.key); });
  endDate = d3.max(entries, function (d) { return parseTime(d.key); });

  let xScale = d3.scaleTime()
    .domain([startDate, endDate])
    .rangeRound([0, w]);

  let yScale = d3.scaleLinear()
    .domain([0, d3.max(entries, function (d) { return d.values.length; })])
    .range([h, 0]);

  let xAxis = d3.axisBottom()
    .scale(xScale);

  let yAxis = d3.axisLeft()
    .scale(yScale)
    .ticks(10);

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
    .text("# of Murders Committed");

  x = d3.scaleTime().range([0, w])

  const brushed = () => {
    var s = d3.event.selection || x.range();

    const t1 = (xScale.invert(s[0]))
    const t2 = (xScale.invert(s[1]))

    if (oldti1 == 0 || oldti2 == 0) {
      //this is normal behavior, but inefficient, it is used only the first time
      //after the first change the else block gets executed looks uglier but 
      //much more efficient
      let s1 = true, s2 = true
      for (let i = 0; i < data.length; i++) {
        const id = data[i].lat + "|" + data[i].lon
        if (data[i].RPT_DT >= t1 && s1) {
          oldti1 = [t1, i]
          s1 =false
        }
        if (data[i].RPT_DT >= t2 && s2) {
          oldti2 = [t2, i]
          s2 = false
        }

        if (data[i].RPT_DT < t1 || data[i].RPT_DT > t2) {
          document.getElementById(id).style.display = 'none';
        } else {
          document.getElementById(id).style.display = 'initial';
        }
      }
    } else {
      let j
      if (oldti1[0] < t1) {
        //left edge of the brushed moved ->
        for (j = oldti1[1]; data[j].RPT_DT < t1; j++) {
          const id = data[j].lat + "|" + data[j].lon
          document.getElementById(id).style.display = 'none';
        }
        oldti1 = [t1, j]
      } else {
        //left edge of the brushed moved <-
        for (j = oldti1[1]; data[j].RPT_DT > t1; j--) {
          const id = data[j].lat + "|" + data[j].lon
          document.getElementById(id).style.display = 'initial';
        }
        oldti1 = [t1, j]
      }
      if (oldti2[0] < t2) {
        //right edge of the brushed moved ->
        for (j = oldti2[1]; data[j].RPT_DT < t2; j++) {
          const id = data[j].lat + "|" + data[j].lon
          document.getElementById(id).style.display = 'initial';
        }
        oldti2 = [t2, j]
      } else {
        //right edge of the brushed moved <-
        for (j = oldti2[1]; data[j].RPT_DT > t2; j--) {
          const id = data[j].lat + "|" + data[j].lon
          document.getElementById(id).style.display = 'none';
        }
        oldti2 = [t2, j]
      }
    }
  }

  const brush = d3.brushX()
    .extent([[0, 0], [w, h]])
    .on("brush end", brushed);


  svg.append("g")
    .attr("class", "brush")
    .call(brush)
    .call(brush.move, x.range());

});

var toggleAnimation = function(d){
  if(isAnimationToggled){
    isAnimationToggled = !isAnimationToggled;
  }
  else{
    
  }
  let brush = d3.selectAll(".brush");
  brush.extent
}

function getTimeDiffInDays(d1, d2){
  var timeDiff = Math.abs(d2.getTime() - d1.getTime());
  return Math.ceil(timeDiff / (1000 * 3600 * 24));
}

function addDays(date, days) {
  var result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}