/*
	cronut.js
	animated donut charts
*/


// Animated donut chart appended to container

function cronut(container, values, colours, radius) {

    // Inherit dimensions from parent
    const parentDims = container.getBoundingClientRect();
    const width = parentDims.width;
    const height = parentDims.height;

    var radius_ratio = typeof(radius) === "undefined" ? 1 : radius;

    // Calculate proportions
    const total = values.reduce((a, b) => a + b);
    const proportions = values.map((x) => x / total);

    const r = radius_ratio * Math.min(width, height) / 2;

    const col_range = typeof(colours) === "undefined" ? d3.schemeSet3 : colours;

    const colour = d3.scaleOrdinal().range(col_range);

    const svg = d3.select(container).append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

    const arc = d3.arc()
        .innerRadius(r * 0.7)
        .outerRadius(r);

    // This arc sets the initial zero-degree arcs to transition from in the animation
    const zeroArc = d3.arc()
        .innerRadius(r * 0.7)
        .outerRadius(r)
        .startAngle(0)
        .endAngle(0);

    // Make sure arcs are sorted in descending order
    const arcSizes = d3.pie().sort((a, b) => (b-a))(proportions);

    const g = svg.selectAll(".arc")
        .data(arcSizes)
        .enter().append("g")
        .attr("class", "arc");

    // A tweening function for the start and end angles
    function arcTween(oldAngle) {
        return function(d) {
            var interpolate_start = d3.interpolate(oldAngle, d.startAngle);
            var interpolate_end = d3.interpolate(oldAngle, d.endAngle);
            return function(t) {
                d.startAngle = interpolate_start(t)
                d.endAngle = interpolate_end(t);
                return arc(d);
            };
        };
    }

    g.append("path")
        .attr("d", zeroArc)
        .style("fill", (d) => colour(d.index))
        .transition()
            .duration(1000)
            .attrTween("d", arcTween(0));

    g.append("text")
        .transition()
            .duration(1000)
            .attr("transform", function(d) { return "translate(" + arc.centroid(d) + ")"; })
            .attr("dy", ".35em")
            .text(function(d) { return d.value > 0.04 ? (100 * d.value).toFixed(2) + "%" : ""; });


    return svg.node();
}


// Donut in a donut
// TODO make this less horrible
function diCronut(container, values_1, values_2, colours, radius) {

    // Inherit dimensions from parent
    const parentDims = container.getBoundingClientRect();
    const width = parentDims.width;
    const height = parentDims.height;

    var radius_ratio = typeof(radius) === "undefined" ? 1 : radius;

    // Calculate proportions
    const outer_total = values_1.reduce((a, b) => a + b);
    const inner_total = values_2.reduce((a, b) => a + b);

    const outer_proportions = values_1.map((x) => x / outer_total);
    const inner_proportions = values_2.map((x) => x / inner_total);

    const r = radius_ratio * Math.min(width, height) / 2;

    const col_range = typeof(colours) === "undefined" ? d3.schemeSet3 : colours;

    const colour = d3.scaleOrdinal().range(col_range);

    const svg = d3.select(container).append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

    const outerArc = d3.arc()
        .innerRadius(r * 0.8)
        .outerRadius(r);

    const innerArc = d3.arc()
        .innerRadius(r * 0.55)
        .outerRadius(r * 0.7);

    // This arc sets the initial zero-degree arcs to transition from in the animation
    const zeroOuterArc = d3.arc()
        .innerRadius(r * 0.8)
        .outerRadius(r)
        .startAngle(0)
        .endAngle(0);

    const zeroInnerArc = d3.arc()
        .innerRadius(r * 0.55)
        .outerRadius(r * 0.7)
        .startAngle(0)
        .endAngle(0);

    // Make sure arcs are sorted in descending order
    const outerArcSizes = d3.pie().sort((a, b) => (b-a))(outer_proportions);
    const innerArcSizes = d3.pie().sort((a, b) => (b-a))(inner_proportions);

    const g_outer = svg.selectAll(".arc .outerarc")
        .data(outerArcSizes)
        .enter().append("g")
        .attr("class", "arc innerarc");

    const g_inner = svg.selectAll(".arc .innerarc")
        .data(innerArcSizes)
        .enter().append("g")
        .attr("class", "arc outerarc");

    // A tweening function for the start and end angles
    function arcTween(oldAngle, ring) {
        return function(d) {
            var interpolate_start = d3.interpolate(oldAngle, d.startAngle);
            var interpolate_end = d3.interpolate(oldAngle, d.endAngle);
            return function(t) {
                d.startAngle = interpolate_start(t)
                d.endAngle = interpolate_end(t);
                if(ring==="outer") {
                    return outerArc(d);
                } else {
                    return innerArc(d);
                }
            };
        };
    }

    g_outer.append("path")
        .attr("d", zeroOuterArc)
        .style("fill", (d) => colour(d.index))
        .transition()
            .duration(1000)
            .attrTween("d", arcTween(0, "outer"));

    g_outer.append("text")
        .transition()
            .duration(1000)
            .attr("transform", function(d) { return "translate(" + outerArc.centroid(d) + ")"; })
            .attr("dy", ".35em")
            .text(function(d) { return d.value > 0.04 ? (100 * d.value).toFixed(2) + "%" : ""; });

    g_inner.append("path")
        .attr("d", zeroInnerArc)
        .style("fill", (d) => colour(d.index))
        .transition()
            .duration(1000)
            .attrTween("d", arcTween(0, "inner"));

    g_inner.append("text")
        .transition()
            .duration(1000)
            .attr("transform", function(d) { return "translate(" + innerArc.centroid(d) + ")"; })
            .attr("dy", ".35em")
            .text(function(d) { return d.value > 0.04 ? (100 * d.value).toFixed(2) + "%" : ""; });


    return svg.node();
}