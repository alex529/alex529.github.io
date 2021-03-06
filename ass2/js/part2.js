const width = 800
const height = 700

const boroughColors = {
    "StatenIsland": "#f2f0f7",
    "Queens": "#cbc9e2",
    "Bronx": "#939ac8",
    "Manhattan": "#756bb1",
    "Brooklyn": "#54178f"
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

    const radialGradient = svg.append("defs")
        .append("radialGradient")
        .attr("id", "radial-gradient");

    radialGradient.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", "red")
        .attr("stop-opacity", 0.4);

    radialGradient.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", "rgba(255, 0, 0, 0)")
        .attr("stop-opacity", 0);

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
            .attr('r', 4)
            // .style('fill', 'rgba(255, 0, 0, 0.2)')
            .style('fill', 'url(#radial-gradient)')
            .attr('id', (d) => { return d.lat + "|" + d.lon })
    })
};

window.onload = () => {
    d3.json("data/boroughs.geojson", (err, geoJson) => {
        loadChart(geoJson);
    });
};