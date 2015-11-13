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

	var method = 3;
	var methods = [ //interpolation methods
		'linear',
		'step-before',
		'step-after',
		'basis',
		'basis-open',
		'basis-closed',
		'bundle',
		'cardinal',
		'cardinal-open',
		'cardinal-closed',
		'monotone'
    ];

	var margin = {top: 40, right: 40, bottom: 40, left:40},
		width = 600,
		height = 500;

	var xAxis = d3.svg.axis()
		.scale(x)
		.orient('bottom');

	var yAxis = d3.svg.axis()
		.scale(y)
		.orient('left');

	var x = d3.scale.linear().range([0, w]),
		y = d3.scale.linear().range([h, 0]);

	var line = d3.svg.line()
		.x(function(d) { return x(d[0]); })
		.y(function(d) { return y(d[1]); });

}
