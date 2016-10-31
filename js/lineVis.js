

var dataset = [],
	svgLine,
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
	var margin = {top: 20, right: 200, bottom: 30, left: 50};
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

	svgLine = d3.select("body")
				.append("svg")
					.attr("width", width + margin.left + margin.right)
					.attr("height", height + margin.top + margin.bottom)
				.append("g")
					.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	avgAlcLine = d3.svg.line()
							.x(function(d, i) { return xScale(i + 15); })
							.y(function(d) { return yScale(d); });

	svgLine.append("path")
	  .attr("class", "line")
	  .attr("d", avgAlcLine(avgAlcConsumption));

  	svgLine.append("text")
  		.attr("transform", function(d, i) {
  			return "translate(" + xScale(avgAlcConsumption.length -1 + 15) + ","
								+ yScale(avgAlcConsumption[avgAlcConsumption.length-1]) + ")";
		})
  		.attr("x", 3)
  		.attr("dy", "0.3em")
  		.text("Weekly Average");

	// Appending the axes
	svgLine.append("g")
	      .attr("class", "axis axis--x")
	      .attr("transform", "translate(0," + height + ")")
	      .call(xAxis);

	svgLine.append("g")
	  .attr("class", "axis axis--y")
	  .call(yAxis);

	svgLine.append("text")
	  .attr("fill", "#000")
	  .attr("transform", "rotate(-90)")
	  .attr("y", 6)
	  .attr("dy", "0.71em")
	  .style("text-anchor", "end")
	  .text("Avg. Weekly Alcohol Consumption");

	  svgLine.append("text")
		  .attr("fill", "#000")
		  .attr("x", width)
		  .attr("y", height - 12)
		  .attr("dy", "0.71em")
		  .style("text-anchor", "end")
		  .text("Age");
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

	svgLine.append("path")
		  .attr("class", "line")
		  .attr("id", "avgDalcLine")
		  .attr("d", avgAlcLine(avgAlcConsumption))
		  .transition()
		  .duration(1000)
		  .attr("d", avgAlcLine(avgDalcConsumption));		

  	svgLine.append("text")
  		.attr("class", "dalcWalcLabel")
  		.attr("transform", function(d, i) {
  			return "translate(" + xScale(avgDalcConsumption.length -1 + 15) + ","
								+ yScale(avgDalcConsumption[avgDalcConsumption.length-1]) + ")";
		})
		.attr("x", 3)
  		.attr("dy", "0.3em")
  		.text("Workday Average")
  		.attr("visibility", "hidden")
		.transition()
		.delay(1000)
  		.attr("visibility", "visible");
  			

	svgLine.append("path")
	  .attr("class", "line")
	  .attr("id", "avgWalcLine")
	  .attr("d", avgAlcLine(avgAlcConsumption))
	  .transition()
	  .duration(1000)
	  .attr("d", avgAlcLine(avgWalcConsumption));

  	svgLine.append("text")
  		.attr("class", "dalcWalcLabel")
  		.attr("transform", function(d, i) {
  			return "translate(" + xScale(avgWalcConsumption.length -1 + 15) + ","
								+ yScale(avgWalcConsumption[avgWalcConsumption.length-1]) + ")";
		})
		.attr("x", 3)
  		.attr("dy", "0.3em")
  		.text("Weekend Average")
  		.attr("visibility", "hidden")
		.transition()
		.delay(1000)
  		.attr("visibility", "visible");
}

function hideWalcAndDalc() {
	svgLine.selectAll(".dalcWalcLabel")
			.transition()
			.remove();

	svgLine.select("#avgDalcLine")
			.transition()
			.duration(1000)
			.attr("d", avgAlcLine(avgAlcConsumption))
			.remove();
	svgLine.select("#avgWalcLine")
			.transition()
			.duration(1000)
			.attr("d", avgAlcLine(avgAlcConsumption))
			.remove();
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