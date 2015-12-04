var $RowSelectionModel;
var $CurrentRows;
var $Clustarmanager
var $SampleNames = [];

var parcoords = d3.parcoords()("#example")
	 .alpha(0.4)
	 .mode("queue") // progressive rendering
	 .height(document.body.clientHeight - 470) // reduces the size of the parcoords plot, because the title bar and the grid take up so much room
	 .margin({
		 top: 36,
		 left: 0,
		 right: 0,
		 bottom: 16
		 });
var standardColor = '#069'; // this is the default color for the parallel-coordinates plot
// renders each item's color
parcoords.color(function (item) {
	if (item == undefined) {
		console.log(item);
	}
	return item.Color;
});

// randomly generates colors
function pastelColors(){
    var r = (Math.round(Math.random()* 127) + 127);
    var g = (Math.round(Math.random()* 127) + 127);
    var b = (Math.round(Math.random()* 127) + 127);
    return 'rgba(' + r + "," + g + "," + b + "," + 255 + ")";
}

// this is the list of variant parameters that the parcoords plot should ignore.
var axisRejectList = ["id", "name", "Chrom", "Position", "Gene Name", "Annotation", "B0", "Color", "ClusterID"];
// get the VCF data, in the future the VCF will be loaded by the user but for now we just load the default data set.
$.get('data/somatic.graphite.vcf', function (data) {
	var variants = [];
	var vcf = new VCF(data);
	$DataManager.setVCF(vcf); // register the vcf with the datamanager, keeps track of the vcf lines so clusters can be printed out to file
	var setRejectList = true;
	for (var sampleName in vcf.getVariants()[0].getSamples()) { // populate all the sample names
		$SampleNames.push(sampleName);
	}
	for (var i = 0; i < vcf.getVariants().length; ++i) {
		var variant = vcf.getVariants()[i];
		var variantObj = {};
		variantObj['Chrom'] = variant.getChromosome();parcoords.unhighlight();
		variantObj['Position'] = variant.getPosition();
		variantObj['Gene Name'] = variant.getGeneName();
		variantObj['Annotation'] = variant.getAnnotation();
		variantObj['Color'] = standardColor;
		variantObj['ClusterID'] = -1;
		var samples = variant.getSamples();
		for (var sampleName in samples) {
			if (setRejectList) {
				axisRejectList.push(sampleName + " Depth");
				axisRejectList.push(sampleName + " Reference Counts");
				axisRejectList.push(sampleName + " Alternate Count");
			}
			variantObj[sampleName] = samples[sampleName].getAlleleFrequency();
			variantObj[sampleName + " Depth"] = samples[sampleName].getDepthCount();
			variantObj[sampleName + " Reference Counts"] = samples[sampleName].getReferenceCount();
			variantObj[sampleName + " Alternate Count"] = samples[sampleName].getAlternateCount();
		}
		setRejectList = false;
		variants.push(variantObj);
	}
	variants.forEach(function(d,i) { d.id = d.id || i; });
	$DataManager.setAllGridData(variants);

	$('#load-data-button').removeAttr('disabled');
	processData(variants);
});

function processData(data) {
	// slickgrid needs each data element to have an id
	// data.forEach(function(d,i) { d.id = d.id || i; });

	parcoords
		.data(data)
	for (var i = 0; i < axisRejectList.length; ++i) { parcoords.hideAxis([axisRejectList[i]]); }

	parcoords
		.render()
		.reorderable()
		.brushMode("1D-axes");


	// setting up grid
	var column_keys = d3.keys(data[0]);
	column_keys = ["id", "Chrom", "Position", "B0", "B0 Alternate Count", "B1", "B2", "B3", "B4", "Gene Name", "Annotation"];
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
	var filter = new Slick.Controls.SlickGridFilter(dataView, grid, $('#filter'), data);
	$ClusterManager = new SlickGridCluster(dataView, grid, $('#cluster-manager'), data);
	$RowSelectionModel = new Slick.RowSelectionModel();
	grid.setSelectionModel($RowSelectionModel);

	// wire up model events to drive the grid
	dataView.onRowCountChanged.subscribe(function (e, args) {
			grid.updateRowCount();
			grid.render();
		});

	dataView.onRowsChanged.subscribe(function (e, args) {
		    $CurrentRows = args.rows;
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
		var highlightedData = [];
		var gridData = args.grid.getData().getItems();
		for (var j = 0; j < $RowSelectionModel.getSelectedRows().length; ++j) {
			highlightedData.push(gridData[$RowSelectionModel.getSelectedRows()[j]]);
		}
		var i = grid.getCellFromEvent(e).row;
		highlightedData.push(gridData[i]);
		parcoords.highlight(highlightedData);
		});
	grid.onMouseLeave.subscribe(function(e,args) {
			if ($RowSelectionModel.getSelectedRows().length == 0) {
				parcoords.unhighlight();
			}
		});
	grid.onSelectedRowsChanged.subscribe(function(e, args) {
		var highlightedData = [];
		var gridData = args.grid.getData().getItems();
		for (var j = 0; j < $RowSelectionModel.getSelectedRows().length; ++j) {
			highlightedData.push(gridData[$RowSelectionModel.getSelectedRows()[j]]);
			parcoords.unhighlight();
		}
		parcoords.highlight(highlightedData);
		if (highlightedData.length > 0) {
			$('.filter-buttons').removeAttr("disabled");
		}
		else {
			$('.filter-buttons').attr('disabled', true);
		}
		});

	// fill grid with data
	gridUpdate(data);

	// update grid on brush
	parcoords.on("brush", function(d) {
			gridUpdate(d);
		});
	// parcoords.width($(window).width() * 0.9);

	function gridUpdate(data) {
		dataView.beginUpdate();
		dataView.setItems(data);
		dataView.endUpdate();
	};
};
