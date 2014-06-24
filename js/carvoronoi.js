var width = $("#voronoi").width(),
    height = 805;

console.log(width,height)

var focused = false;

var computeVoronoi,ti=0;

var projection = d3.geo.mercator()
    .center([9.1906, 45.4640])
    .translate([width / 2, height / 2])
    .scale(280000)

var tile = d3.geo.tile()
    .scale(projection.scale() * 2 * Math.PI)
    .translate(projection([0, 0]))
    .size([width, height]);

var tiles = tile();

var path = d3.geo.path()
    .projection(projection);

var voronoi = d3.geom.voronoi()
    .x(function(d) { return d.x; })
    .y(function(d) { return d.y; })
    .clipExtent([[0, 0], [width, height]]);

var svg = d3.select("#voronoi").append("svg")
    .attr("width", width)
    .attr("height", height);

var data,times;

var hours = d3.time.format("%H:%M");
var date = d3.time.format("%Y-%m-%d");
var day = d3.time.format("%A");


var defs = svg.append("defs");


svg.selectAll("image")
    .data(tiles)
    .enter().append("image")
    .attr("xlink:href", function(d) { return "http://api.tiles.mapbox.com/v2/giorgiouboldi.ifkdj2f1/" + d[2] + "/" + d[0] + "/" + d[1] + ".jpg"; })
    .attr("width", Math.round(tiles.scale))
    .attr("height", Math.round(tiles.scale))
    .attr("x", function(d) { return Math.round((d[0] + tiles.translate[0]) * tiles.scale); })
    .attr("y", function(d) { return Math.round((d[1] + tiles.translate[1]) * tiles.scale); });

var timegroup=svg.append("g")
    .attr("class","voronoi-time");

timegroup
    .append("image")
    .attr("xlink:href","img/clock.png")
    .attr("width",30)
    .attr("height",30)
    .attr("x", 30)
    .attr("y", 30);

timegroup
    .append("image")
    .attr("xlink:href","img/calendar.png")
    .attr("width",40)
    .attr("height",40)
    .attr("x", 30)
    .attr("y", 80);

timegroup
    .append("line")
    .attr("x1", 30)
    .attr("y1", 70)
    .attr("x2", 170)
    .attr("y2", 70)
    .style("stroke","#e8c102");


d3.json("data/voronoi/milano.json", function(error, topology) {


    defs.append("path")
        .attr("id", "land")
        .datum(topojson.feature(topology, topology.objects.layer1))
        .attr("d", path)


    defs.append("clipPath")
        .attr("id", "clip")
        .append("use")
        .attr("xlink:href", "#land")


    var contour = svg.append("path")
        .datum(topojson.feature(topology, topology.objects.layer1))
        .attr("d", path)
        .style("stroke","#e8c102")
        .style("stroke-opacity",0.6)
        .style("fill","none");
});

var vorg= svg.append("g")
    .attr("class", "vor")
    .attr("clip-path", "url(#clip)")




d3.json("data/voronoi/times.json", function(json) {

    times=json;

    computeVoronoi=function (t) {

        if(!focused) return;

        d3.json("data/voronoi/"+times[t]+".json", function(json) {
            data=json;

            data.cars.forEach(function(d,i){
                var position = projection([d.lon, d.lat]);
                d.x = position[0];
                d.y = position[1];
            })

            voronoi(data.cars)
                .forEach(function(d) { d.point.cell = d;});

            var ciao = vorg.selectAll(".car-cell")
                .data(data.cars,function(d){return d.plate})

            ciao.exit().remove();

            ciao.transition().duration(200).ease("sin")
                //.filter(function(d){ return d.cell.length>0; })
                .attr("d", function(d) { return  "M" + d.cell.join("L") + "Z"; })

            ciao.enter().append("path")
                .attr("class", "car-cell")
                .style("fill","none")
                .style("stroke","#e8c102")
                .style("stroke-opacity",0)
                .style("stroke-width",1)
                .style("fill-opacity",0)
                .transition().duration(200).ease("sin")
                .attr("d", function(d) { return  "M" + d.cell.join("L") + "Z"; })
                .style("stroke-opacity",function(d){

                    if(d3.geom.polygon(d.cell).area()>40000) return 0.1;
                    else return d3.min([0.7, 1-d3.geom.polygon(d.cell).area()/40000])})

                .style("stroke-width",function(d){return 1-d3.geom.polygon(d.cell).area()/10000


                })

            var palle = vorg.selectAll(".car-point")
                .data(data.cars,function(d){return d.plate})

            palle.exit().remove();

            palle.transition().duration(200).ease("sin")
                .attr("cx",function(s){return s.x})
                .attr("cy",function(s){return s.y})

            palle.enter().append("circle")
                .attr("class", "car-point")
                .style("fill","#e8c102")
                .style("opacity",0)
                .attr("cx",function(s){return s.x})
                .attr("cy",function(s){return s.y})
                .attr("r",2)
                 .style("stroke","none")
                .transition().duration(200).ease("sin")
                .style("opacity",1)

            d3.selectAll("#voronoi text").remove();

            timegroup.append("text")
                .text(hours(new Date(+times[t])))
                .attr("x",67)
                .attr("y",55)
                .attr("font-size",32)
                .attr("font-family","Raleway")
                .style("fill","#e8c102")
                .attr("font-weight",700)

            timegroup.append("text")
                .text(date(new Date(+times[t])))
                .attr("x",80)
                .attr("y",95)
                .attr("font-size",14)
                .attr("font-family","Raleway")
                .style("fill","#e8c102")
                .attr("font-weight",700)

            timegroup.append("text")
                .text(day(new Date(+times[t])))
                .attr("x",80)
                .attr("y",115)
                .attr("font-size",14)
                .attr("font-family","Raleway")
                .style("fill","#e8c102")
                .attr("font-weight",700)


            ti++;
            if(ti==times.length-1) {
                ti = 0;
            }
            setTimeout(function() {
                computeVoronoi(ti);
            }, 250)

        });
        }

})


function fireVoronoi (el, focusVoronoi, blurVoronoi) {
    return function () {
        if ( elementInViewport(el) ) {
            focusVoronoi();
        }else{
            blurVoronoi();
        }
    }
}

function focusVoronoi() {
    if(!focused) {
        focused = true;
        computeVoronoi(ti);
    }
}

function blurVoronoi() {
    focused = false;
}
var voronoiHandler = fireVoronoi($("#voronoi"), focusVoronoi, blurVoronoi);

$(window).on('resize scroll focus blur', voronoiHandler);


var vis = (function(){
    var stateKey, eventKey, keys = {
        hidden: "visibilitychange",
        webkitHidden: "webkitvisibilitychange",
        mozHidden: "mozvisibilitychange",
        msHidden: "msvisibilitychange"
    };
    for (stateKey in keys) {
        if (stateKey in document) {
            eventKey = keys[stateKey];
            break;
        }
    }
    return function(c) {
        if (c) document.addEventListener(eventKey, c);
        return !document[stateKey];
    }
})();

vis(function(){
    if (vis()) focusVoronoi();
    else blurVoronoi();
});

