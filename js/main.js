function loadSampleDataClicked() {
	$('#load-sample-button').prop("disabled",true);
	loadSampleData();
}

function loadSampleData() {
	$.get('data/somatic.graphite.vcf', function (vcfString) {
		var vcf = new VCF(vcfString);
		var samples = vcf.getSamples();
		for (var sampleName in samples) {
			var sample = samples[sampleName];
			console.log(sample);
			addSelector(sample);
			addSampleGraph(sample);
		}
	});
}

function addSelector(sample) {
	var source = $('#sample-template').html();
	var template = Handlebars.compile(source);
	var html = template(sample);
	$('#allele-selectors').append(html);

	var connectSlider = document.getElementById(sample.sampleName + "-slider");
	noUiSlider.create(connectSlider, {
		start: [20, 80],
		connect: false,
		orientation: 'vertical',
		range: {
			'min': 0,
			'max': 100
		}
	});
	connectSlider.noUiSlider.on('slide', function (data) {
		console.log(data);
	});
}

function addSampleGraph(sample) {
	var maxAF = sample.getMaximumAlternateCount();
	var minAF = sample.getMinimumAlternateCount();
	var frequenciesAndCounts = sample.getFrequenciesAndCounts();

	var maxCount = d3.max(frequenciesAndCounts, function (d) { return d[1]; });
	var minCount = d3.min(frequenciesAndCounts, function (d) { return d[1]; });

	console.log("minaf: ", minAF);
	console.log("maxaf: ", maxAF);
	console.log("mincount: ", minCount);
	console.log("maxCount: ", maxCount);
	// console.log(countsAndFrequencies);

	var margin = {top: 20, right: 20, bottom: 30, left:50},
		width = 600,
		height = 500;

	var x = d3.scale.linear()
		.domain([minAF, maxAF])
		.range([0, width - (margin.left + margin.right)]);
	var y = d3.scale.linear()
		.domain([minCount, maxCount])
		.range([height - (margin.top + margin.bottom), 0]);

	var xAxis = d3.svg.axis()
		.scale(x)
		.orient('bottom');

	var yAxis = d3.svg.axis()
		.scale(y)
		.orient('left');

	var line = d3.svg.line()
		.x(function(d) { return x(d[0]); })
		.y(function(d) { return y(d[1]); });

	var svg = d3.select("body").append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
		.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	var lineGraph = svg.append("path")
		.attr("d", line(frequenciesAndCounts))
		.attr("stroke", "blue")
	    .attr("stroke-width", 2)
	    .attr("fill", "none");

	var translationYAmount = height - (margin.top + margin.bottom);
	svg.append("g")
		.attr("class", "x axis")
		.attr("transform", "translate(0," + translationYAmount + ")")
		.call(xAxis);

	svg.append("g")
		.attr("class", "y axis")
		.call(yAxis)
		.append("text")
		.attr("transform", "rotate(-90)")
		.attr("y", 6)
		.attr("dy", ".71em")
		.style("text-anchor", "end")
		.text("Frequency Count");



}
