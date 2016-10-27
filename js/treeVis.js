var dataset = [];

d3.csv("student-por.csv", function(error, data) {
	dataset = data;         // copy to dataset
    // error checking
    if (error) {
		console.log(error)
    }
    else {
		//createVis()
    }
});

function generateTreeJSON() {
	var treeJSON = [];

	var sexes = ["Male", "Female"],
		ages = ["15", "16", "17", "18", "19", "20", "21", "22"],
		familySizes = ["Family size > 3", "Family size <= 3"],
		extraCurrs = ["Extracurriculars", "No extracurriculars"];

	var start = {};
	start["name"] = "Start";
	start["parent"] = "null";

	var startChildren = [];

	for (var i = 0; i < sexes.length; i++) {
		var sex = {};
		sex["name"] = sexes[i];
		sex["parent"] = "Start";

		var sexChildren = [];

		for (var j = 0; j < ages.length; j++) {
			var age = {};
			age["name"] = ages[j];
			age["parent"] = sexes[i];

			var ageChildren = [];

			for (var k = 0; k < familySizes.length; k++) {
				var familySize = {};
				familySize["name"] = familySizes[k];
				familySize["parent"] = ages[j];

				var familySizeChildren = [];

				for (var l = 0; l < extraCurrs.length; l++) {
					var extraCurr = {};
					extraCurr["name"] = extraCurrs[l];
					extraCurr["parent"] = familySizes[k];

					var extraCurrChildren = [];

					var result = {};
					result["name"] = "Avg. Weekend Alcohol Consumption: ";

					var avgWalc = getAvgWalcForStudent(sex.name,
														age.name,
														familySize.name,
														extraCurr.name).toString();

					if (avgWalc.valueOf() == (-1).toString()) {
						avgWalc = "NA";
					} else {
						avgWalc = (Math.round(avgWalc * 100) / 100);
					}

					result["name"] += avgWalc.toString();
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

function getAvgWalcForStudent(sex, age, famsize, activities) {
	var totalWalc = 0,
		numStudents = 0;
	for (var i = 0; i < dataset.length; i++) {
		var student = dataset[i];
		if (student["sex"].valueOf() == sex.valueOf()) {
			if (student["age"].valueOf() == age.valueOf()) {
				if (student["famsize"].valueOf() == famsize.valueOf()) {
					if (student["activities"].valueOf() == activities.valueOf()) {
						totalWalc += Number(student["Walc"]);
						numStudents++;
					}
				}
			}
		}
	}
	if (numStudents != 0) return totalWalc / numStudents;
	else return -1;
	// var avgWalc = (numStudents != 0) ? totalWalc / numStudents : -1;
	// return avgWalc;
}

//var treeData = generateTreeJSON();

//console.log(JSON.stringify(treeData));

var margins = [20, 120, 20, 120],
	width = 1280 - margins[1] - margins[3],
	height = 800 - margins[0] - margins[2],
	duration = 750,
	i = 0,
	root;

//var treeData = getTreeData();

// $(document).ready(function() {
// 	$.getJSON("treeData.json", function(data) {
// 		treeData = data;
// 		alert("here");
// 		//alert(JSON.property);
// 	});
// 	 // .success(function() { alert("second success"); })
// 	 // .error(function() { alert("error"); })
// 	 // .complete(function() { alert("complete"); });
// });


var tree = d3.layout.tree()
					.size([height, width]);

var diagonal = d3.svg.diagonal()
						.projection(function(d) {return [d.y, d.x];});

var svg = d3.select("body").append("svg")
			.attr("width", width + margins[1] + margins[3])
			.attr("height", height + margins[0] + margins[2])
			.append("g")
			.attr("transform", "translate(" + margins[3] + "," + margins[0] + ")");

root = treeData[0];
root.x0 = height / 2;
root.y0 = 0;

update(root);

d3.select(self.frameElement).style("height", "800px");

function update(source) {

  // Compute the new tree layout.
  var nodes = tree.nodes(root).reverse(),
	  links = tree.links(nodes);

  // Normalize for fixed-depth.
  nodes.forEach(function(d) { d.y = d.depth * 180; });

  // Update the nodes…
  var node = svg.selectAll("g.node")
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
  var link = svg.selectAll("path.link")
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