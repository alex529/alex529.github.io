const loadChart = (geoJson) => {
    const projection = d3.geoMercator().fitExtent([[0, 0], [650, 600]], geoJson);
    const geoGenerator = d3.geoPath().projection(projection);

    const u = d3.select('#Figure1').selectAll('path').data(geoJson.features);
    u.enter().each((d, i) => {
        console.log(d.properties.BoroName);        
    })
    console.log(geoGenerator);
    
    u.enter().append('path').attr('d', geoGenerator);
};

window.onload = () => {
    d3.json("boroughs.geojson", (err, geoJson) => {
        loadChart(geoJson);
    });
};