var width = $(window).width(),
    height = $(window).height();

var projection = d3.geo.mercator()
    .center([9.1906, 45.4640])
    .translate([width / 2, height / 2])
    .scale(310000)

var tile = d3.geo.tile()
    .scale(projection.scale() * 2 * Math.PI)
    .translate(projection([0, 0]))
    //.zoomDelta((window.devicePixelRatio || 1) - .5)
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

var format = d3.time.format("%Y-%m-%d %H:%M");


var defs = svg.append("defs");


svg.selectAll("image")
    .data(tiles)
    .enter().append("image")
    //.attr("xlink:href", function(d) { return "http://" + ["a", "b", "c", "d"][Math.random() * 4 | 0] + ".tiles.mapbox.com/v3/examples.map-vyofok3q/" + d[2] + "/" + d[0] + "/" + d[1] + ".png"; })
    .attr("xlink:href", function(d) { return "http://api.tiles.mapbox.com/v2/giorgiouboldi.ifkdj2f1/" + d[2] + "/" + d[0] + "/" + d[1] + ".jpg"; })
    .attr("width", Math.round(tiles.scale))
    .attr("height", Math.round(tiles.scale))
    .attr("x", function(d) { return Math.round((d[0] + tiles.translate[0]) * tiles.scale); })
    .attr("y", function(d) { return Math.round((d[1] + tiles.translate[1]) * tiles.scale); });


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
    ti=0;

    //setInterval(function(){

    function computeVoronoi(t) {


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
               // .style("fill","#a0d3c6")
               // .style("stroke","#a0d3c6")

            ciao.enter().append("path")
               // .filter(function(d){ return d.cell.length>0; })
                .attr("class", "car-cell")
                .style("fill","#e8c102")
                .style("stroke","#e8c102")
                .style("stroke-opacity",0)
                .style("stroke-width",1)
                .style("fill-opacity",0)
                /*.attr("d", function(d) {
                    var str="M"+ d.x+","+ d.y;
                    d.cell.forEach(function(e,j){
                       str=str+"L"+ d.x+","+ d.y
                    })
                    var a=str+"Z"; return a })*/
                .transition().duration(200).ease("sin")
                .attr("d", function(d) { return  "M" + d.cell.join("L") + "Z"; })
                .style("stroke-opacity",function(d){ return 1-d3.geom.polygon(d.cell).area()/40000})
                .style("stroke-width",function(d){return 1-d3.geom.polygon(d.cell).area()/10000})
                .style("fill-opacity",0.05)


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

            d3.select("text").remove();

            svg.append("text")
                .text(format(new Date(+times[t])))
                .attr("x",40)
                .attr("y",40)
                .attr("font-size",22)
                .attr("font-family","Raleway")
                .style("fill","#e8c102")
                .attr("font-wieght","800")


            ti++;
            if(ti==times.length) ti=0;

            setTimeout(function() {
                computeVoronoi(ti);
            }, 250)

        });
        }
    computeVoronoi(ti);

})




