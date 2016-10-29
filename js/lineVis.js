

var dataset = [];

d3.csv("student-por.csv", function(error, data) {
	dataset = data;         // copy to dataset

    // error checking
    if (error) {
		console.log(error);
    }
    else {
		//console.log(data[0]["Walc"])	//just testing that it works
		createVis();
    }
});

function createVis() {
	var margin = {top: 20, right: 80, bottom: 30, left: 50},
	    width = 960 - margin.left - margin.right,
	    height = 500 - margin.top - margin.bottom;

	var svg = d3.select("body")
				.append("svg")
					.attr("width", width + margin.left + margin.right)
					.attr("height", height + margin.top + margin.bottom)
				.append("g")
					.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	var xScale = d3.scale.linear().range([0, width]),
		yScale = d3.scale.linear().range([height, 0]);

	xScale.domain([15, 22]);
	yScale.domain([0, 5]);

	var line = d3.svg.line()
				.x(function(d) { return xScale(Number(d.age)); })
				.y(function(d) { return xScale(Number(d.Walc)); });


	Appending the axes
	svg.append("g")
	      .attr("class", "axis axis--x")
	      .attr("transform", "translate(0," + height + ")")
	      .call(d3.axisBottom(xScale));

	svg.append("g")
	  .attr("class", "axis axis--y")
	  .call(d3.axisLeft(yScale))

	svg.append("text")
	  .attr("fill", "#000")
	  .attr("transform", "rotate(-90)")
	  .attr("y", 6)
	  .attr("dy", "0.71em")
	  .style("text-anchor", "end")
	  .text("Avg. Weekly Alcohol Consumption");

	svg.append("path")
	  .datum(dataset)
	  .attr("class", "line")
	  .attr("d", line);
}

