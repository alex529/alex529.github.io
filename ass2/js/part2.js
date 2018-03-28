const width = 800
const height = 700

const boroughColors = {
    "StatenIsland": "#edf8fb",
    "Queens": "#b3cde3",
    "Bronx": "#8c96c6",
    "Manhattan": "#8856a7",
    "Brooklyn": "#810f7c"
};

const loadChart = (geoJson) => {

    const projection = d3.geoMercator()
        .fitExtent([[0, 0], [width, height]], geoJson);
    const geoGenerator = d3.geoPath(projection);

    //create svg
    const svg = d3.select('#map')
        .append('svg')
        .attr('width', width)
        .attr('height', height)
        .attr('id', 'Figure1');
    // plot paths
    svg.selectAll('path')
        .data(geoJson.features)
        .enter()
        .append('path')
        .attr('d', geoGenerator)
        .style('fill', (d) => {
            return boroughColors[d.properties.BoroName]
        });

    //add points
    d3.csv("data/all_murder.csv", (data) => {
        svg.selectAll('circle')
            .data(data)
            .enter()
            .append('circle')
            .attr('cx', (d) => {
                return projection([d.lon, d.lat])[0];
            })
            .attr('cy', (d) => {
                return projection([d.lon, d.lat])[1];
            })
            .attr('r', 2)
            .style('fill', 'green')
            .attr('id', (d) => {return d.lat+"|"+d.lon})
    })
};

window.onload = () => {
    d3.json("data/boroughs.geojson", (err, geoJson) => {
        loadChart(geoJson);
    });
};