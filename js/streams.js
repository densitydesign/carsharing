d3.tsv("data/nil/aggHour.tsv", function(data){

    var width = $("#streams").width(),
        streamHeight = 50;

    var format = d3.time.format("%Y-%m-%d %H:%M:%S");

    var carCountDomain = d3.extent(data, function(d){return +d.count})

    var timeDomain = d3.extent(data, function(d){return format.parse(d.date)})

    var pad=20;

    data = d3.nest().key(function(d){return d.nil}).entries(data)

    data.sort(function(a,b){
        var a = d3.sum(a.values, function(d){return +d.count})
        var b = d3.sum(b.values, function(d){return +d.count})
        return b - a
    })

    var height = data.length*streamHeight

    var x = d3.time.scale()
        .domain(timeDomain)
        .range([200, width]);

    var y = d3.scale.ordinal()
        .domain(data.map(function(d){return d.key}))
        .rangePoints([0, height], 1);



    var yStream = d3.scale.linear()
        .domain(carCountDomain)
        .range([1, streamHeight]);

    var xlines = d3.svg.axis()
        .scale(x)
        .orient('bottom')
        .ticks(d3.time.days, 1)
        .tickFormat(null)
        .tickSize(height)

    var area = d3.svg.area()
        .interpolate("basis")
        .x(function(d) { return x(format.parse(d.date)) })
        .y0(function(d) { return -yStream(+d.count) / 2; })
        .y1(function(d) { return yStream(+d.count) / 2; });

    var svglabel = d3.select("#stream-label").append("svg")
        .attr("width", width+pad)
        .attr("height",30);


    var svg = d3.select("#stream-viz").append("svg")
        .attr("width", width+pad)
        .attr("height", height);

    console.log(data)

    svg.selectAll("path")
        .data(data)
        .enter().append("path")
        .attr("transform", function(d, i) { return "translate(0," + y(d.key) + ")"; })
        .style("fill", "#E8C102")
        .style("stroke", "none")
        .attr("d", function(d){ return area(d.values)});

    svg.selectAll("text")
        .data(data)
        .enter().append("text")
        .attr("x", 195)
        .attr("dy",3)
        .attr("y", function(d){return y(d.key)})
        .style("font-size",10)
        .style("text-anchor","end")
        .text(function(d){return d.key})


//vertical dynamic legend
    var legend = svg.append("g")
        .attr("class","legend");


    var lines = legend.append("g")
        .attr("class","v-lines axis")
        .call(xlines)
    /*.data(d3.range(8)).enter()
     .append("line")
     .attr("class","v-line")
     .attr("x1",function(d){return d*(width-200)})*/

    legend.append("line")
        .attr("x1",0)
        .attr("y1",0)
        .attr("x2",0)
        .attr("y2",height)
        .attr("class","scan")
        .style("stroke","#333")
        .style("opacity",0)
        .style("stroke-width",1);


    legend.selectAll(".value")
        .data(data).enter()
        .append("text")
        .attr("x",0)
        .attr("y",3)
        .attr("class","value")
        //.attr("font-family","sans-serif")
        .attr("font-size",12)
        .style("fill","#333")
        .text("init")
        .style("opacity",0)
        .style("font-weight",700)
        .attr("transform", function(d, i) { return "translate(0," + y(d.key) + ")"; });


    //update legend on mousemove
    svg.on('mousemove', function() {

        var xc = d3.min([width,d3.mouse(this)[0]]);
        xc = d3.max([200,xc]);
        var t = x.invert(xc)

        d3.select(".legend").select(".scan")
            .attr("x1",xc)
            .attr("x2",xc)
            .style("opacity",0.6)

        legend.selectAll(".value")
            .attr("x",xc+2)
            .text(function(d){
                var val = d.values[0].count;
                d.values.forEach(function(e,i){
                    if(format.parse(e.date)<t ) {
                        val= e.count;
                    }
                })
                return parseInt(val);
            })
            .style("opacity","1")
    });


//static top legend
    var xAxis = d3.svg.axis()
        .scale(x)
        .orient('bottom')
        .ticks(d3.time.days, 1)
        .tickFormat(d3.time.format('%A'))
        .tickSize(0)

    var xAxis2 = d3.svg.axis()
        .scale(x)
        .orient('bottom')
        .ticks(d3.time.hours, 6)
        .tickFormat("")
        .tickSize(12)


    svglabel.append('g')
        .attr('class', 'x axis')
        .call(xAxis)
        .call(adjustTextLabels)


    svglabel.append('g')
        .attr('class', 'x2 axis')
        .attr("transform","translate(0,20)")
        .call(xAxis2)

    d3.select(".x").selectAll("text")
        .attr("x", 5)
        .attr("dy", 8)
    // .style("text-anchor", null);




    function adjustTextLabels(selection) {
        selection.selectAll('text')
            .attr('transform', function(d){return 'translate('+ daysToPixels(1, x, d) / 2 + ',0)'});
    }

// calculate the width of the days in the timeScale
    function daysToPixels(days, timeScale,d1) {
        //var d1 = new Date();
        //timeScale || (timeScale = Global.timeScale);
        console.log(timeScale(d3.time.day.offset(d1, days)) - timeScale(d1))
        return timeScale(d3.time.day.offset(d1, days)) - timeScale(d1);
    }

})