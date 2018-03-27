var projection = d3.geoMercator().center([-73.946342, 40.740610]).scale(60000).translate([350, 250])

var geoGenerator = d3.geoPath()
    .projection(projection);

function update(geojson) {
    var u = d3.select('#content g.map')
    .selectAll('path')
    .data(geojson.features);

    u.enter()
    .append('path')
    .attr('d', geoGenerator);
}
d3.json("boroughs.geojson", function (err, geojson) {
    update(geojson);
});