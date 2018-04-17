var Visualization = (function(){ 

    var importData = function(){

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
        setupMap();
        setupDoughnut()
        setupCalendar();
        setupScatterPlot();
        setupTreemap();
    }

    return {
        load : load
    }

})();