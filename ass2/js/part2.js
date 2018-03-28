const width = 650
const height = 600

const loadChart = (geoJson) => {

    const projection = d3.geoMercator()
                        .fitExtent([[0, 0], [width, height]], geoJson);

    const geoGenerator = d3.geoPath(projection);

    const svg = d3.select('#map')
                .append('svg')
                .attr('width', width)
                .attr('height',height)
                .attr('id','Figure1');

    const u = svg.selectAll('path')
                .data(geoJson.features);
    
    u.enter()
        .append('path')
        .attr('d', geoGenerator);
};

window.onload = () => {
    d3.json("data/boroughs.geojson", (err, geoJson) => {
        loadChart(geoJson);
    });
};