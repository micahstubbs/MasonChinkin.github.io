//Width and height
var w = 800;
var h = 500;
var active = d3.select(null);

//define projection
var projection = d3.geoEquirectangular()
    .scale(900)
    .translate([175, 900]);

//chloropleth from COLORBREWER
//var colors = d3.scaleOrdinal(d3.schemeCategory20);

//define drag behavior
var zoom = d3.zoom()
    .scaleExtent([1, 8])
    .translateExtent([
        [-100, -200],
        [1000, 600]
    ])
    .on('zoom', zooming);

// define path
var path = d3.geoPath()
    .projection(projection);

//create SVG
var svg = d3.select('#container')
    .append('svg')
    .attr('width', w)
    .attr('height', h)
    .style('background', '#a6d0ef')
    .style('border-style', 'solid')
    .style('border-color', 'grey');

//create container for all pannable/zoomable elements
var map = svg.append('g');

svg.call(zoom);

//invisible rect for dragging on whitespace
map.append('rect')
    .attr('x', 0)
    .attr('y', 0)
    .attr('width', w)
    .attr('height', h)
    .attr('opacity', 0);

//trip data
d3.csv('viz-data/trip.csv', function(data) {
    var dataset = data;
    console.log(dataset);

    //map
    d3.json('viz-data/world.json', function(error, json) {
        if (error) throw error;
        var jsonDataset = json;

        //bind data and create one path per json feature (state)
        map.selectAll('path')
            .data(json.features)
            .enter()
            .append('path')
            .attr("d", path)
            .style('fill', 'beige')
            .style('stroke', 'grey');

        //define travel line
        line = d3.line()
            .x(function(d) {
                return projection([d.lon, d.lat])[0];
            })
            .y(function(d) {
                return projection([d.lon, d.lat])[1];
            });

        //draw line
        map.append("path")
            .datum(data)
            .attr("fill", "none")
            .attr("stroke", "blue")
            .attr("stroke-width", 1.5)
            .attr("d", line);

        //bubbles for visited cities
        map.selectAll('circle')
            .data(data)
            .enter()
            .append('circle')
            .attr('cx', function(d) {
                return projection([d.lon, d.lat])[0];
            })
            .attr('cy', function(d) {
                return projection([d.lon, d.lat])[1];
            })
            .attr('r', function(d) {
                return d.stay_length * 2;
            })
            .attr('fill', 'black')
            .on('mousemove', bubbleMouseMove)
            .on('mouseout', bubbleMouseOut);

        //start label
        map.append('text')
            .data(data)
            .attr("x", function(d) {
                return projection([d.lon, d.lat])[0] + 7;
            })
            .attr("y", function(d) {
                return projection([d.lon, d.lat])[1];
            })
            .text('Start!')
            .style('font-weight', 'bold');
    });
});

function zooming() {
    map.style("stroke-width", 1.5 / d3.event.transform.k + "px");

    map.attr("transform", d3.event.transform);
}

var bubbleMouseMove = function(d) {
    d3.select(this)
        .transition('orangeHover')
        .duration(75)
        .attr('fill', 'orange')
        .attr('r', 12);

    var xpos = event.pageX;
    var ypos = event.pageY + 10;

    //Update the tooltip position and value
    d3.select('#tooltip')
        .style("left", xpos + "px")
        .style("top", ypos + "px")
        .select('#city')
        .text(d.city_country);

    d3.select('#tooltip')
        .select('#days')
        .text(d.stay_length);

    d3.select('#tooltip')
        .select('#memory')
        .text(d.memory);

    d3.select('#tooltip')
        .select('#pic')
        .attr('src', d.pic_link);

    //Show the tooltip
    d3.select('#tooltip').classed("hidden", false);
};

//properties of mouseout
var bubbleMouseOut = function(d) {
    d3.select(this)
        .transition('orangeHover')
        .duration(250)
        .attr('fill', 'black')
        .attr('r', function(d) {
            return d.stay_length * 2;
        });

    //Hide the tooltip
    d3.select("#tooltip").classed("hidden", true);
};