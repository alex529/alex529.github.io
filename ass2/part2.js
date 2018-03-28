d3.json("boroughs.geojson", function (err, mapData) {
    loadMap(mapData);
});

function loadMap(mapData) {
    let projection = d3.geoMercator()
                    .center([-73.946342, 40.740610])
                    .scale(60000)
                    .translate([350, 250]);

    let path =  d3.geoPath()
                .projection(projection);   
    
    d3.select('#content g.map')
        .selectAll('path')
        .data(mapData.features)
        .enter()
        .append('path')
        .attr('d', path)
        .style("fill", "lightsteelblue");
}