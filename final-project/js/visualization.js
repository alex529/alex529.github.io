var Visualization = (function(){ 

    var loadDataAndSetupVisualizations = function(){
        d3.csv("/data/placeholder.csv", function(data){
            setupMap();
            setupDoughnut()
            setupCalendar();
            setupScatterPlot();
            setupTreemap();
        })

        /* we can make different csv imports for each viz depending on the preprocessing e.g.
        
        d3.csv("/data/mapData.csv", function(data){
            setupMap(data);
        })
        */
    };

    var setupMap = function(){
        console.log(d3.version);        
        console.log("init map");
    };

    var setupDoughnut = function(){
        console.log("init doughnut");
    };

    var setupCalendar = function(){
        console.log("init calendar");
    };

    var setupScatterPlot = function(){
        console.log("init scatter plot");
    };

    var setupTreemap = function(){
        console.log("init treemap");
    };

    var load = function(){
        loadDataAndSetupVisualizations();
    }

    return {
        load : load
    }

})();