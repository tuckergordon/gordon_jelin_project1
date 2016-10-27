var dataset = [];

d3.csv("students.csv", function(error, data) {
	dataset = data;         // copy to dataset
    // error checking
    if (error) {
		console.log(error)
    }
    else {
		console.log(data[681]["age"])	//just testing that it works
		//createVis()
    }
});