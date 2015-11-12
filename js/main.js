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
	var margin = {top: 20, right: 20, bottom: 30, left: 50},
    width = 760 - margin.left - margin.right,
    height = 300 - margin.top - margin.bottom;

	var maxAF = d3.max(sample.variants, function (v) { var maximum = 0; for (var i = 0; i < v.alternateCounts.length; ++i) { maximum = (v.alternateCounts[i] > maximum) ? v.alternateCounts[i] : maximum; } return maximum; });

	var minAF = d3.min(sample.variants, function (v) { var minimum = 0; for (var i = 0; i < v.alternateCounts.length; ++i) { minimum = (v.alternateCounts[i] < minimum) ? v.alternateCounts[i] : minimum; } return minimum; });

	var afCounts = {};
	var maxCount = 0;
	var minCount = 0;
	for (var i = 0; i < sample.variants.length; ++i) {
		var v = sample.variants[i];
		for (var j = 0; j < v.alternateCounts.length; ++j) {
			if (typeof afCounts[v.alternateCounts[j]] === "undefined") {
				afCounts[v.alternateCounts[j]] = 1;
			}
			else {
				afCounts[v.alternateCounts[j]] += 1;
			}
			maxCount = (afCounts[v.alternateCounts[j]] > maxCount) ? afCounts[v.alternateCounts[j]] : maxCount;
			minCount = (afCounts[v.alternateCounts[j]] < minCount) ? afCounts[v.alternateCounts[j]] : minCount;
		}
	}
	var maxAFCounts = d3.max(afCounts, function (afCount) { console.log(afCount); return afCount[1]; });
	console.log(minCount);
	console.log(maxCount);

	var x = d3.scale.linear()
		.range([minAF, maxAF]);
	var y = d3.scale.linear()
		.range([minCount, maxCount]);

	var xAxis = d3.svg.axis()
		.scale(x)
		.orient("bottom");

	var yAxis = d3.svg.axis()
		.scale(y)
		.orient("left");

	var line = d3.svg.line()
		.x(function(v) { var maximum = 0; for (var i = 0; i < v.alternateCounts.length; ++i) { maximum = (v.alternateCounts[i] > maximum) ? v.alternateCounts[i] : maximum; } return x(maximum); })
		   .y(function(v) { var maximum = 0; for (var i = 0; i < v.alternateCounts.length; ++i) { maximum = (v.alternateCounts[i] > maximum) ? v.alternateCounts[i] : maximum; } return y(afCounts[maximum]); });

	var svg = d3.select(sample.sampleName + "-slider").append("svg")
		.data(sample.variants, function (v) { return v)
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
		.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
}
