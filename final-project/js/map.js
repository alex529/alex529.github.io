const width = 600
const height = 800
margin = { top: 40, right: 50, bottom: 40, left: 50 }

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
}
const colors = [
    '#D8E5E5',
    '#90D1D1',
    '#B1EDED',
    '#63B5B5',
    '#E2F1F1',
    '#A0F4F4',
    '#7BCECE',
    '#CAC6D1',
    '#EBE7F3',
    '#C4C4C5',
    '#F0E9FF',
    '#BCB6C6',
    '#E3E0EA',
    '#DBD5E6',
    '#D5CDE4',
    '#9C99A1',
    '#B1A5CB',
    '#C8B8E9',
    '#DFD4F3',
    '#9F9CA4',
    '#ABA6B5'
];

const setupTimeline = (data) => {

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
        .attr('d', geoGenerator)
        .style("fill", (d,i) => {
            return colors[i];
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

    //add points
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
    })
};
