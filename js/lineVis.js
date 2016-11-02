// James Jelin and Tucker Gordon
// Project 1
// lineVis.js
// Includes all of the D3 script for creating the line graph visualization

var dataset = [],
	svgLine,							// the svg element
	margin,
	width,
	height,
	xAxis,
	yAxis,
	avgAlcConsumption,					// array w/ avg weekly alc consumption
	avgParentsSepMotherAlcConsumption,	// array w/ avg weekly alc (sep parents, father = guardian)
	avgParentsSepFatherAlcConsumption,	// array w/ avg weekly alc (sep parents, mother = guardian)
	showingDalcAndWalc = false,			// dalc and walc consumption lines showing
	showingParents = false,				// parent consumption lines showing
	avgAlcLine,							// general D3 line object for creating all lines
	pointRadius = 5;

// loading in data from csv
d3.csv("student-por.csv", function(error, data) {
	dataset = data;         // copy to dataset

    // error checking
    if (error) {
		console.log(error);
    }
    else {
    	// calculate weekly averages based on age
		avgAlcConsumption = calculateAvgAlcConsumption();
		// create initial visualization
		createVis(avgAlcConsumption);
    }
});

// create the initial visualization based on the weekly averages
function createVis(avgAlcConsumption) {
	margin = {top: 20, right: 200, bottom: 30, left: 50};
    width = 960 - margin.left - margin.right;
    height = 500 - margin.top - margin.bottom;

	xScale = d3.scale.linear().range([0, width]);
	yScale = d3.scale.linear().range([height, 0]);

	xScale.domain([15, 20]);	// the ages we're dealing with
	yScale.domain([1, 5]);		// alc consumption is on a scale 1-5

	xAxis = d3.svg.axis()
					.scale(xScale)
					.orient("bottom")
					.ticks(6);

	yAxis = d3.svg.axis()
					.scale(yScale)
					.orient("left")
					.ticks(5);

	// initializing the svg element
	svgLine = d3.select("body")
				.append("svg")
				// compensate for width/height not including margins
				.attr("width", width + margin.left + margin.right)
				.attr("height", height + margin.top + margin.bottom)
				.attr("id", "svgLine")
				.append("g")
				.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	// avgAlcLine is a general D3 line element that we will use to create
	// all of our lines. Whenever we call it, we can give it a dataset to use
	// (assuming it's a 1D array), and it will build the line. This is possible
	// because all of the lines have the same x coordinates and y scale
	avgAlcLine = d3.svg.line()
							// function for all of the x,y values of the path
							// "i+15" because i is 0-5 and our ages are 15-20
							.x(function(d, i) { return xScale(i + 15); })
							.y(function(d) { return yScale(d); });

	// add the weekly averages line
	svgLine.append("path")
	  .attr("class", "line")
	  // this line uses the avgAlcConsumption calculated earlier as its dataset
	  .attr("d", avgAlcLine(avgAlcConsumption));

  	addPointsToLine(avgAlcConsumption, "weekly");

  	addLabelToLine(avgAlcConsumption, "Weekly Average", "weeklyLabel");

	addAxes();
}

// append the axes to the svg
function addAxes() {
	// x axis
	svgLine.append("g")
		      .attr("class", "axis")
		      .attr("transform", "translate(0," + height + ")")
		      .call(xAxis);

  	// y axis
	svgLine.append("g")
			  .attr("class", "axis")
			  .call(yAxis);

  	// x axis label
  	svgLine.append("text")
			  .attr("fill", "#000")
			  .attr("x", width)
			  .attr("y", height - 12)
			  .attr("dy", "0.71em")
			  .style("text-anchor", "end")
			  .text("Age");

  	// y axis label
	svgLine.append("text")
			  .attr("fill", "#000")
			  .attr("transform", "rotate(-90)")
			  .attr("y", 6)
			  .attr("dy", "0.71em")
			  .style("text-anchor", "end")
			  .text("Avg. Weekly Alcohol Consumption");
}

// display the tool tip at a specified location with given data
function showTooltip(d, cx, cy) {
	// Get this point's x/y values, then augment for the tooltip
	// the scrollX/scrollY are there because the location changes based on the viewport
	var xPosition = document.getElementById("svgLine").getBoundingClientRect().left +
					window.scrollX + cx + margin.left;

	var yPosition = document.getElementById("svgLine").getBoundingClientRect().top + 
					window.scrollY + cy + margin.top;

	// rounding to 1 decimal place to dispaly alc. consumption
	var tooltipText = (Math.round(d * 100) / 100) + " / 5";

	var tooltip = d3.select("#tooltip");

	//Update the tooltip position and value
	d3.select("#tooltip").style("left", xPosition + "px")
			.style("top", yPosition + "px")						
			.select("#value")
			.text(tooltipText);

	//Show the tooltip
	tooltip.classed("hidden", false);
}

// Ensures that the "Weekly Average" radio button starts checked
// Adopted from: 
// http://stackoverflow.com/questions/17732704/how-to-make-the-checkbox-unchecked-by-default-always
function defaultCheck() {
	$("#radioWeekly").prop('checked', true);
}

// toggle which lines are displayed based on the selected radio buttons
function toggleLines() {
	// get the id of the selected radio button
	var checkedRadio = $("input:radio:checked")[0].id;
	switch (checkedRadio) {
		// show only the weekly average line
		case "radioWeekly":
			if(showingDalcAndWalc) hideDalcAndWalc();
			showingDalcAndWalc = false;
			if(showingParents) hideParents();
			showingParents = false;
			break;
		// show weekly average line and Dalc and Walc lines
		case "radioDalcWalc":
			showDalcAndWalc();
			showingDalcAndWalc = true;
			if(showingParents) hideParents();
			showingParents = false;
			break;
		// show weekly average line and the parent lines
		case "radioParents":
			if(showingDalcAndWalc) hideDalcAndWalc();
			showingDalcAndWalc = false;
			showParents();
			showingParents = true;
			break;
	}
}

// show the Dalc and Walc lines
function showDalcAndWalc() {

	// calculate the average workday and weekend alcohol consumption 
	// arrays for each age
	var avgDalcConsumption = calculateAvgOf("Dalc"),
		avgWalcConsumption = calculateAvgOf("Walc");

	// we give "dalcWalcLabel" to both lines because it will be assigned as
	// as class to each of them so that we can remove them together
	showLine(avgDalcConsumption, "avgDalcLine");
  	addPointsToLine(avgDalcConsumption, "dalcWalc");			
  	addLabelToLine(avgDalcConsumption, "Workday Average", "dalcWalcLabel");

  	showLine(avgWalcConsumption, "avgWalcLine");
  	addPointsToLine(avgWalcConsumption, "dalcWalc");			
  	addLabelToLine(avgWalcConsumption, "Weekend Average", "dalcWalcLabel");
}

function hideDalcAndWalc() {
	svgLine.selectAll(".dalcWalcLabel")
			.transition()
			.remove();

	svgLine.selectAll(".dalcWalcLinePoint")
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

function showParents () {

	var avgParentsTogetherAlcConsumption  = calculateParentsTogetherAvg();
	avgParentsSepMotherAlcConsumption = calculateParentsSepAvg("mother");
	avgParentsSepFatherAlcConsumption = calculateParentsSepAvg("father");

	showLine(avgParentsTogetherAlcConsumption, "avgParentsTogetherLine");
  	addPointsToLine(avgParentsTogetherAlcConsumption, "parents");	
  	addLabelToLine(avgParentsTogetherAlcConsumption, "Parents Together", "parentsLabel");

  	showLine(avgParentsSepMotherAlcConsumption, "avgParentsSepMotherLine");
  	addPointsToLine(avgParentsSepMotherAlcConsumption, "parents");	

  	// not using function we have for this because we need to make a slight adjustment
  	// to the position of the label
  	svgLine.append("text")
  		.attr("class", "parentsLabel")
  		.attr("transform", function(d, i) { 
  			return "translate(" + (xScale(avgParentsSepMotherAlcConsumption.length -1 + 15) - 20) + ","
								+ (yScale(avgParentsSepMotherAlcConsumption[
									avgParentsSepMotherAlcConsumption.length-1]) - 25) + ")";
		})
		.attr("x", 6)
  		.attr("dy", "0.3em")
  		.text("Parents Separated, Mother is Gaurdian")
  		.attr("visibility", "hidden")
		.transition()
		.delay(1000)
  		.attr("visibility", "visible");

	showLine(avgParentsSepFatherAlcConsumption, "avgParentsSepFatherLine");
  	addPointsToLine(avgParentsSepFatherAlcConsumption, "parents");	

  	// not using function we have for this because we need to make a slight adjustment
  	// to the position of the label
  	svgLine.append("text")
  		.attr("class", "parentsLabel")
  		.attr("transform", function(d, i) { 
  			return "translate(" + xScale(avgParentsSepFatherAlcConsumption.length -1 + 15) + ","
								+ (yScale(avgParentsSepFatherAlcConsumption[avgParentsSepFatherAlcConsumption.length-1])-15) + ")";
		})
		.attr("x", 6)
  		.attr("dy", "0.3em")
  		.text("Parents Separated, Father is Guardian")
  		.attr("visibility", "hidden")
		.transition()
		.delay(1000)
  		.attr("visibility", "visible");
}

function hideParents () {
	svgLine.selectAll(".parentsLabel")
			.transition()
			.remove();

	svgLine.selectAll(".parentsLinePoint")
			.transition()
			.remove();

	var sepMotherTrimmedAvgAlcConsumption = [],
		sepFatherTrimmedAvgAlcConsumption = [];

	
	for (var i = 0; i < avgParentsSepMotherAlcConsumption.length; i++) {
		sepMotherTrimmedAvgAlcConsumption.push(avgAlcConsumption[i]);
	}	

	for (var i = 0; i < avgParentsSepFatherAlcConsumption.length; i++) {
		sepFatherTrimmedAvgAlcConsumption.push(avgAlcConsumption[i]);
	}		

	svgLine.select("#avgParentsTogetherLine")
			.transition()
			.duration(1000)
			.attr("d", avgAlcLine(avgAlcConsumption))
			.remove();
	svgLine.select("#avgParentsSepMotherLine")
			.transition()
			.duration(1000)
			.attr("d", avgAlcLine(sepMotherTrimmedAvgAlcConsumption))
			.remove();
	svgLine.select("#avgParentsSepFatherLine")
			.transition()
			.duration(1000)
			.attr("d", avgAlcLine(sepFatherTrimmedAvgAlcConsumption))
			.remove();
}

function showLine(lineData, lineID) {
	svgLine.append("path")
		   .attr("class", "line")
		   .attr("id", lineID)
		   .attr("d", avgAlcLine(avgAlcConsumption))
		   .transition()
		   .duration(1000)
		   .attr("d", avgAlcLine(lineData));
}

// linetype should be "weekly", "dalcWalc" or "parents"
function addPointsToLine(lineData, lineType) {
	var delay = (lineType == "weekly") ? 0 : 1000;
	lineType += "LinePoint";
	svgLine.selectAll("linePoint")
  			.data(lineData)
  			.enter().append("circle")
  			.attr("r", pointRadius)
  			 // .attr("class", "linePoint")
  			.attr("class", lineType)
  			// hover functionality
			   .on("mouseover", function(d) {
			   		showTooltip(d, parseFloat(d3.select(this).attr("cx")), 
			   					parseFloat(d3.select(this).attr("cy")));
			   })
			   .on("mouseout", function() {
					//Hide the tooltip
					d3.select("#tooltip").classed("hidden", true);
					
		   		})
		   	.attr("cx", function(d, i) {
  				return xScale(i + 15);
  			})
  			.attr("cy", function(d) {
  				return yScale(d);
  			})
  			.attr("visibility", "hidden")
			.transition()
			.delay(delay)
	  		.attr("visibility", "visible");	
}

function addLabelToLine(lineData, label, className) {
	var delay = (label == "Weekly Average") ? 0 : 1000;
	svgLine.append("text")
	  		.attr("class", className)
	  		.attr("transform", function(d, i) {
	  			return "translate(" + xScale(lineData.length -1 + 15) + ","
									+ yScale(lineData[lineData.length-1]) + ")";
			})
			.attr("x", 6)
	  		.attr("dy", "0.3em")
	  		.text(label)
	  		.attr("visibility", "hidden")
			.transition()
			.delay(delay)
	  		.attr("visibility", "visible");
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

		 var ageIndex = Number(dataset[i].age) - 15;

		 total[ageIndex] += alcConsumption;
		 numStudents[ageIndex]++;
	}

	for (var i = 0; i < 6; i++) {
		averages.push(total[i] / numStudents[i]);
	}
	return averages;
}

function calculateParentsTogetherAvg() {
	var total = [],
		numStudents = [],
		averages = [];

	for (var i = 0; i < 6; i++) {
		total.push(0);
		numStudents.push(0);
	}

	for (var i = 0; i < dataset.length; i++) {
		var alcConsumption = (Number(dataset[i]["Dalc"]) + Number(dataset[i]["Walc"]))/2;

		 var ageIndex = Number(dataset[i].age) - 15;

		 if (dataset[i]["Pstatus"] == "T") {
		 	total[ageIndex] += alcConsumption;
		 	numStudents[ageIndex]++;
		 }
	}

	for (var i = 0; i < 6; i++) {
		averages.push(total[i] / numStudents[i]);
	}
	return averages;
}

function calculateParentsSepAvg(attribute) {
	var total = [],
		numStudents = [],
		averages = [];

	for (var i = 0; i < 6; i++) {
		total.push(0);
		numStudents.push(0);
	}

	for (var i = 0; i < dataset.length; i++) {
		var alcConsumption = (Number(dataset[i]["Dalc"]) + Number(dataset[i]["Walc"]))/2;

		 var ageIndex = Number(dataset[i].age) - 15;

		 if (dataset[i]["Pstatus"] == "A") {
		 	if (dataset[i]["guardian"] == attribute) {
		 		total[ageIndex] += alcConsumption;
		 		numStudents[ageIndex]++;
		 	}
		 }
	}

	for (var i = 0; i < 6; i++) {
		if (numStudents[i] !== 0) {
			averages.push(total[i] / numStudents[i]);
		}
	}
	return averages;
}