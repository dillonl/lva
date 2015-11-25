var parcoords = d3.parcoords()("#example")
	 .alpha(0.4)
	 .mode("queue") // progressive rendering
	 .height(d3.max([document.body.clientHeight-326, 220]))
	 .margin({
		 top: 36,
		 left: 0,
		 right: 0,
		 bottom: 16
		 });

$.get('data/somatic.graphite.vcf', function (data) {
		var vcf = new VCF(data);
		var samples = vcf.getSamples();
		var sampleData = [];
		for (var sampleName in samples) {
			var sample = samples[sampleName];
			for (var i = 0; i < sample.variants.length; ++i) {
				if (sampleData.length <= i) {
					sampleObj = {};
					sampleData.push(sampleObj);
				}
				sampleObj = sampleData[i];
				var variant = sample.variants[i];
				sampleObj[sampleName] = variant.getAlternateAlleleFrequency();
				sampleObj['Depth'] = variant.getDepthCount();
				sampleObj['Chrom'] = variant.chromosome;
				sampleObj['Position'] = variant.position;
				sampleObj['Gene Name'] = variant.getInfo('geneName');
				sampleObj['Annotation'] = variant.getInfo('annotation');
			}
		}
		processData(sampleData);
	});

function processData(data) {
	// slickgrid needs each data element to have an id
	data.forEach(function(d,i) { d.id = d.id || i; });

	parcoords
		.data(data)
		.hideAxis(["name"])
		.hideAxis(['id'])
		.hideAxis(['B0'])
		.hideAxis(['Depth'])
		.hideAxis(['Chrom'])
		.hideAxis(['Gene Name'])
		.hideAxis(['Annotation'])
		.hideAxis(['Position'])
		.render()
		.reorderable()
		.brushMode("1D-axes");

	// setting up grid
	var column_keys = d3.keys(data[0]);
	column_keys = ["id", "Chrom", "Position", "B1", "B2", "B3", "B4", "Depth", "Gene Name", "Annotation"];
	var columns = column_keys.map(function(key,i) {
			return {
			id: key,
			name: key,
			field: key,
			sortable: true
			}
		});

	var options = {
    enableCellNavigation: true,
    enableColumnReorder: false,
    multiColumnSort: false
	};

	var dataView = new Slick.Data.DataView();
	var grid = new Slick.Grid("#grid", dataView, columns, options);
	var pager = new Slick.Controls.Pager(dataView, grid, $("#pager"));
	var rowSelectionModel = new Slick.RowSelectionModel();
	grid.setSelectionModel(rowSelectionModel);

	// wire up model events to drive the grid
	dataView.onRowCountChanged.subscribe(function (e, args) {
			grid.updateRowCount();
			grid.render();
		});

	dataView.onRowsChanged.subscribe(function (e, args) {
			grid.invalidateRows(args.rows);
			grid.render();
		});

	// column sorting
	var sortcol = column_keys[0];
	var sortdir = 1;

	function comparer(a, b) {
		var x = a[sortcol], y = b[sortcol];
		return (x == y ? 0 : (x > y ? 1 : -1));
	}

	// click header to sort grid column
	grid.onSort.subscribe(function (e, args) {
			sortdir = args.sortAsc ? 1 : -1;
			sortcol = args.sortCol.field;
			if ($.browser.msie && $.browser.version <= 8) {
				dataView.fastSort(sortcol, args.sortAsc);
			} else {
				dataView.sort(comparer, args.sortAsc);
			}
		});

	// highlight row in chart
	grid.onMouseEnter.subscribe(function(e,args) {
			parcoords.unhighlight();
			var i = grid.getCellFromEvent(e).row;
			highlightSelectedData(i);
		});
	grid.onMouseLeave.subscribe(function(e,args) {
			if (rowSelectionModel.getSelectedRows().length == 0) {
				parcoords.unhighlight();
			}
			else {
				highlightSelectedData();
			}
		});
	grid.onSelectedRowsChanged.subscribe(function(e, args) {
			highlightSelectedData();
		});

	function highlightSelectedData(additionalIndex) {
		var d = parcoords.brushed() || data;
		var highlightedData = [];
		for (var j = 0; j < rowSelectionModel.getSelectedRows().length; ++j) {
			highlightedData.push(d[rowSelectionModel.getSelectedRows()[j]]);
		}
		if (additionalIndex != undefined) {
			highlightedData.push(d[additionalIndex]);
		}
		parcoords.highlight(highlightedData);
	}

	// fill grid with data
	gridUpdate(data);

	// update grid on brush
	parcoords.on("brush", function(d) {
			gridUpdate(d);
		});
	// parcoords.width($(window).width() * 0.9);
	// parcoords.height(600);

	function gridUpdate(data) {
		dataView.beginUpdate();
		dataView.setItems(data);
		dataView.endUpdate();
	};

};
/*
var samplePlots = {};

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
			addSelector(sample);
			addSampleGraph(sample);
		}
	});
}

function addSelector(sample) {
	var maxAF = sample.getMaximumAlternateCount();
	var minAF = sample.getMinimumAlternateCount();
	var frequenciesAndCounts = sample.getFrequenciesAndCounts();

	var maxCount = d3.max(frequenciesAndCounts, function (d) { return d[1]; });
	var minCount = d3.min(frequenciesAndCounts, function (d) { return d[1]; });

	var source = $('#sample-template').html();
	var template = Handlebars.compile(source);
	var html = template(sample);
	$('#allele-selectors').append(html);

	var connectSlider = document.getElementById(sample.sampleName + "-slider");
	noUiSlider.create(connectSlider, {
		start: [minAF, maxAF],
		connect: false,
		orientation: 'vertical',
		range: {
			'min': minAF,
			'max': maxAF
		}
	});
	$('#' + sample.sampleName + '-min').html(minAF);
	$('#' + sample.sampleName + '-max').html(maxAF);
	connectSlider.noUiSlider.on('slide', function (data, index) {
		var minAF = parseInt(data[0]);
		var maxAF = parseInt(data[1]);
		updateSampleGraph(sample, minAF, maxAF);
	});
}

function updateSampleGraph(sample, minAF, maxAF) {
	var graphInfo = samplePlots[sample.sampleName];
	var svg = graphInfo.svg;
	var x = graphInfo.x;
	var y = graphInfo.y;
	var xAxis = graphInfo.xAxis;
	var yAxis = graphInfo.yAxis;

	var minCount = 0;
	var maxCount = 0;
	var frequenciesAndCounts = sample.getFrequenciesAndCounts();
	var fac = [];
	for (var i = 0; i < frequenciesAndCounts.length; ++i) {
		if (frequenciesAndCounts[i][0] >= minAF && frequenciesAndCounts[i][0] <= maxAF) {
			minCount = (frequenciesAndCounts[i][1] <= minCount) ? frequenciesAndCounts[i][1] : minCount;
			maxCount = (frequenciesAndCounts[i][1] >= maxCount) ? frequenciesAndCounts[i][1] : maxCount;
			fac.push(frequenciesAndCounts[i]);
		}
	}

	// Scale the range of the data again
    x.domain([minAF, maxAF]);
	xAxis.scale(x);

	y.domain([minCount, maxCount]);
	yAxis.scale(y);

	var line = d3.svg.line()
		.interpolate("basis")
		.x(function(d) { return x(d[0]); })
		.y(function(d) { return y(d[1]); });

	svg.selectAll("path").remove();
	var lineGraph = svg.append("path")
		.attr("d", line(fac))
		.attr("stroke", "steelblue")
	    .attr("stroke-width", 2)
	    .attr("fill", "none");

	svg.select(".xaxis")
		.call(xAxis);

	svg.select(".yaxis")
		.call(yAxis);

	$('#' + sample.sampleName + '-min').html(minAF);
	$('#' + sample.sampleName + '-max').html(maxAF);
}

function addSampleGraph(sample) {
	var maxAF = sample.getMaximumAlternateCount();
	var minAF = sample.getMinimumAlternateCount();
	var frequenciesAndCounts = sample.getFrequenciesAndCounts();

	var maxCount = d3.max(frequenciesAndCounts, function (d) { return d[1]; });
	var minCount = d3.min(frequenciesAndCounts, function (d) { return d[1]; });

	var margin = {top: 10, right: 0, bottom: 30, left:80};
	var width = 600;
	var height = 300;

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
		.interpolate("basis")
		.x(function(d) { return x(d[0]); })
		.y(function(d) { return y(d[1]); });

	var svg = d3.select("#" + sample.sampleName + "-plot").append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
		.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	var lineGraph = svg.append("path")
		.attr("d", line(frequenciesAndCounts))
		.attr("stroke", "steelblue")
	    .attr("stroke-width", 2)
	    .attr("fill", "none");

	var translationYAmount = height - (margin.top + margin.bottom);
	svg.append("g")
		.attr("class", "xaxis")
		.attr("transform", "translate(0," + translationYAmount + ")")
		.call(xAxis)
		.append("text")
		.attr("y", 35)
		.attr("x", 90)
		.attr("dy", ".71em")
		.style("text-anchor", "end")
		.text("Allele Frequency");

	svg.append("g")
		.attr("class", "yaxis")
		.call(yAxis)
		.append("text")
		.attr("transform", "rotate(-90)")
		.attr("y", -69)
		.attr("dy", ".71em")
		.style("text-anchor", "end")
		.text("Frequency Count");

	samplePlots[sample.sampleName] = { svg: svg, x: x, y: y, xAxis: xAxis, yAxis: yAxis };
}
*/
