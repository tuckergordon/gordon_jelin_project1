// James Jelin and Tucker Gordon
// Project 1
// treeVis.js
// Includes all of the D3 script for creating the tree visualization
var dataset = [];

d3.csv("student-por.csv", function(error, data) {
	dataset = data;         // copy to dataset
    // error checking
    if (error) {
		console.log(error)
    }
    else {
		createVis()
    }
});

// generates a JSON of the tree structure based on the CSV file
function generateTreeJSON() {
	var treeJSON = [];

	// the attributes, and values that they can have
	var sexes = ["Male", "Female"],
		ages = ["15", "16", "17", "18", "19", "20"],
		familySizes = ["Family size > 3", "Family size <= 3"],
		extraCurrs = ["Extracurriculars", "No extracurriculars"];

	// starting node
	var start = {};
	start["name"] = "Start";
	start["parent"] = "null";

	var startChildren = [];

	// build all children of the start, starting with the 2 sexes
	for (var i = 0; i < sexes.length; i++) {
		var sex = {};
		sex["name"] = sexes[i];
		sex["parent"] = "Start";

		var sexChildren = [];

		// for each sex, build children nodes
		for (var j = 0; j < ages.length; j++) {
			var age = {};
			age["name"] = ages[j];
			age["parent"] = sexes[i];

			var ageChildren = [];

			// for each age, build children nodes
			for (var k = 0; k < familySizes.length; k++) {
				var familySize = {};
				familySize["name"] = familySizes[k];
				familySize["parent"] = ages[j];

				var familySizeChildren = [];

				// for each family size, build children nodes
				for (var l = 0; l < extraCurrs.length; l++) {
					var extraCurr = {};
					extraCurr["name"] = extraCurrs[l];
					extraCurr["parent"] = familySizes[k];

					var extraCurrChildren = [];

					var result = {};

					var averages = getAvgWalcAndDalcForStudent(sex.name,
														age.name,
														familySize.name,
														extraCurr.name);

					// there will be some configurations for which there is no data,
					// so we want to list that as "NA"
					if (averages == -1) {
						result["name"] = "NA";
					// otherwise, round the averages to 1 decimal place, and build a string
					// to display the result
					} else {
						var avgWalc = (Math.round(Number(averages["walc"]) * 100) / 100);
						var avgDalc = (Math.round(Number(averages["dalc"]) * 100) / 100);
						var numStudents = averages["numStudents"];
						result["name"] = "Avg. Weekend Alcohol Consumption: " + avgWalc + "/5 ("
											+ numStudents + " students)"
					}

					result["parent"] = extraCurrs[l];

					extraCurrChildren.push(result);

					extraCurr["children"] = extraCurrChildren;
					familySizeChildren.push(extraCurr);
				}

				familySize["children"] = familySizeChildren;
				ageChildren.push(familySize);
			}

			age["children"] = ageChildren;
			sexChildren.push(age);
		}

		sex["children"] = sexChildren;
		startChildren.push(sex);
	}

	start["children"] = startChildren;

	treeJSON.push(start);
	return treeJSON;
}

// calculate the average Walc and Dalc for a student with 
// the specified attributes sex, age, famsize, and activities
function getAvgWalcAndDalcForStudent(sex, age, famsize, activities) {
	var totalWalc = 0,
		totalDalc = 0,
		numStudents = 0;
	// calculate sums
	for (var i = 0; i < dataset.length; i++) {
		var student = dataset[i];
		if (student["sex"].valueOf() == sex.valueOf()) {
			if (student["age"].valueOf() == age.valueOf()) {
				if (student["famsize"].valueOf() == famsize.valueOf()) {
					if (student["activities"].valueOf() == activities.valueOf()) {
						totalWalc += Number(student["Walc"]);
						totalDalc += Number(student["Dalc"]);
						numStudents++;
					}
				}
			}
		}
	}
	// compute averages, which will be an array
	if (numStudents != 0) {
		var avgWalc = totalWalc / numStudents;
		var avgDalc = totalDalc / numStudents;
		var averages = {};
		averages["walc"] = avgWalc;
		averages["dalc"] = avgDalc;
		averages["numStudents"] = numStudents;
		return averages;
	}
	else return -1;
}

// these commented out functions are how we generated the tree's JSON
// setTimeout(alert("Ready"), 100000);
// var treeData = generateTreeJSON();
// console.log(JSON.stringify(treeData));

// Create the visualization
// NOTE: most of the tree code is adopted from http://bl.ocks.org/d3noob/8375092
function createVis() {
	var margins = [20, 120, 20, 120],
		width = 1280 - margins[1] - margins[3],
		height = 700 - margins[0] - margins[2],
		duration = 750,
		i = 0,
		root;

	// the tree object
	var tree = d3.layout.tree()
						.size([height, width]);

	// used to draw curved lines
	var diagonal = d3.svg.diagonal()
							.projection(function(d) {return [d.y, d.x];});

	// append the tree
	var svgTree = d3.select("body").append("svg")
				.attr("width", width + margins[1] + margins[3])
				.attr("height", height + margins[0] + margins[2])
				.append("g")
				.attr("transform", "translate(" + margins[3] + "," + margins[0] + ")");

	// set the root's data and position
	root = treeData[0];
	root.x0 = height / 2;
	root.y0 = 0;

	// calculate all other nodes
	update(root, tree);

	d3.select(self.frameElement).style("height", "600px");

	function update(source) {

	  // Compute the new tree layout.
	  var nodes = tree.nodes(root).reverse(),
		  links = tree.links(nodes);

	  // Normalize for fixed-depth.
	  nodes.forEach(function(d) { d.y = d.depth * 120; });

	  // Update the nodes…
	  var node = svgTree.selectAll("g.node")
		  .data(nodes, function(d) { return d.id || (d.id = ++i); });

	  // Enter any new nodes at the parent's previous position.
	  var nodeEnter = node.enter().append("g")
		  .attr("class", "node")
		  .attr("transform", function(d) { return "translate(" + source.y0 + "," + source.x0 + ")"; })
		  .on("click", click);

	  nodeEnter.append("circle")
		  .attr("r", 1e-6)
		  .style("fill", function(d) { return d._children ? "lightsteelblue" : "#fff"; });

	  nodeEnter.append("text")
		  .attr("x", function(d) { return d.children || d._children ? -13 : 13; })
		  .attr("dy", ".35em")
		  .attr("text-anchor", function(d) { return d.children || d._children ? "end" : "start"; })
		  .text(function(d) { return d.name; })
		  .style("fill-opacity", 1e-6);

	  // Transition nodes to their new position.
	  var nodeUpdate = node.transition()
		  .duration(duration)
		  .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; });

	  nodeUpdate.select("circle")
		  .attr("r", 10)
		  .style("fill", function(d) { return d._children ? "lightsteelblue" : "#fff"; });

	  nodeUpdate.select("text")
		  .style("fill-opacity", 1);

	  // Transition exiting nodes to the parent's new position.
	  var nodeExit = node.exit().transition()
		  .duration(duration)
		  .attr("transform", function(d) { return "translate(" + source.y + "," + source.x + ")"; })
		  .remove();

	  nodeExit.select("circle")
		  .attr("r", 1e-6);

	  nodeExit.select("text")
		  .style("fill-opacity", 1e-6);

	  // Update the links…
	  var link = svgTree.selectAll("path.link")
		  .data(links, function(d) { return d.target.id; });

	  // Enter any new links at the parent's previous position.
	  link.enter().insert("path", "g")
		  .attr("class", "link")
		  .attr("d", function(d) {
			var o = {x: source.x0, y: source.y0};
			return diagonal({source: o, target: o});
		  });

	  // Transition links to their new position.
	  link.transition()
		  .duration(duration)
		  .attr("d", diagonal);

	  // Transition exiting nodes to the parent's new position.
	  link.exit().transition()
		  .duration(duration)
		  .attr("d", function(d) {
			var o = {x: source.x, y: source.y};
			return diagonal({source: o, target: o});
		  })
		  .remove();

	  // Stash the old positions for transition.
	  nodes.forEach(function(d) {
		d.x0 = d.x;
		d.y0 = d.y;
	  });
	}

	// Toggle children on click.
	function click(d) {
	  if (d.children) {
		d._children = d.children;
		d.children = null;
	  } else {
		d.children = d._children;
		d._children = null;
	  }
	  update(d);
	}
}