

var dataset = [],
	svg,
	width,
	height,
	xAxis,
	yAxis,
	avgAlcConsumption,
	showingDalcAndWalc = false,
	avgAlcLine;

d3.csv("student-por.csv", function(error, data) {
	dataset = data;         // copy to dataset

    // error checking
    if (error) {
		console.log(error);
    }
    else {
		avgAlcConsumption = calculateAvgAlcConsumption();

		createVis(avgAlcConsumption);
    }
});

function createVis(avgAlcConsumption) {
	var margin = {top: 20, right: 80, bottom: 30, left: 50};
    width = 960 - margin.left - margin.right;
    height = 500 - margin.top - margin.bottom;

	xScale = d3.scale.linear().range([0, width]);
	yScale = d3.scale.linear().range([height, 0]);

	xScale.domain([15, 20]);
	yScale.domain([0, 5]);

	xAxis = d3.svg.axis()
					.scale(xScale)
					.orient("bottom")
					.ticks(6);

	yAxis = d3.svg.axis()
					.scale(yScale)
					.orient("left")
					.ticks(6);

	svg = d3.select("body")
				.append("svg")
					.attr("width", width + margin.left + margin.right)
					.attr("height", height + margin.top + margin.bottom)
				.append("g")
					.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	avgAlcLine = d3.svg.line()
							.x(function(d, i) { return xScale(i + 15); })
							.y(function(d) { return yScale(d); });

	svg.append("path")
	  .attr("class", "line")
	  .attr("d", avgAlcLine(avgAlcConsumption));

	// Appending the axes
	svg.append("g")
	      .attr("class", "axis axis--x")
	      .attr("transform", "translate(0," + height + ")")
	      .call(xAxis);

	svg.append("g")
	  .attr("class", "axis axis--y")
	  .call(yAxis);

	svg.append("text")
	  .attr("fill", "#000")
	  .attr("transform", "rotate(-90)")
	  .attr("y", 6)
	  .attr("dy", "0.71em")
	  .style("text-anchor", "end")
	  .text("Avg. Weekly Alcohol Consumption");
}

function toggleWalcAndDalc() {
	if (showingDalcAndWalc) {
		hideWalcAndDalc();
		document.getElementById("btnToggleWalcDalc").value = "Show weekend vs weekday drinking";
		showingDalcAndWalc = false;
	} else {
		showWalcAndDalc();
		document.getElementById("btnToggleWalcDalc").value = "Hide weekend vs weekday drinking";
		showingDalcAndWalc = true;
	}
}

function showWalcAndDalc() {

	var avgDalcConsumption = calculateAvgOf("Dalc"),
		avgWalcConsumption = calculateAvgOf("Walc");

	svg.append("path")
		  .attr("class", "line")
		  .attr("id", "avgDalcLine")
		  .attr("d", avgAlcLine(avgAlcConsumption))
		  .transition()
		  .duration(1000)
		  .attr("d", avgAlcLine(avgDalcConsumption));				

	svg.append("path")
	  .attr("class", "line")
	  .attr("id", "avgWalcLine")
	  .attr("d", avgAlcLine(avgAlcConsumption))
	  .transition()
	  .duration(1000)
	  .attr("d", avgAlcLine(avgWalcConsumption));
}

function hideWalcAndDalc() {
	var avgDalcLine = svg.select("#avgDalcLine")
							.transition()
							.duration(1000)
							.attr("d", avgAlcLine(avgAlcConsumption))
							.remove();
	var avgWalcLine = svg.select("#avgWalcLine")
							.transition()
							.duration(1000)
							.attr("d", avgAlcLine(avgAlcConsumption))
							.remove();
						
	console.log("here");
}

function calculateAvgAlcConsumption() {

	var avgDalcArray = calculateAvgOf("Dalc"),
		avgWalcArray = calculateAvgOf("Walc"),
		avgAlcConsumption = [];

	for (var i = 0; i < avgDalcArray.length; i++) {
		avgAlcConsumption.push((avgDalcArray[i] + avgWalcArray[i]) / 2);
	}
	return avgAlcConsumption;
}

function calculateAvgOf(attribute) {
	var total = [],
		numStudents = [],
		averages = [];

	for (var i = 0; i < 6; i++) {
		total.push(0);
		numStudents.push(0);
	}

	for (var i = 0; i < dataset.length; i++) {
		var alcConsumption = Number(dataset[i][attribute]);

		 var ageIndex = Number(dataset[i]["age"]) - 15;

		 total[ageIndex] += alcConsumption;
		 numStudents[ageIndex]++;
	}

	for (var i = 0; i < 6; i++) {
		averages.push(total[i] / numStudents[i]);
	}
	console.log(averages);
	return averages;
}