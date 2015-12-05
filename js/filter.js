(function ($) {
	/*
	  create the grid filter, html and functionality.
	 */
	function SlickGridFilter(dataView, grid, $container, data) {
		$dataView = dataView;
		$grid = grid;
		function init(data) {
			constructFilterUI(data);
		}

		// construct the UI for the filter
		function constructFilterUI(data) {
			$container.empty();

			// there are 3 filters, chromosome, gene, annotation
			var chromosomes = getUniqueProperties(data, 'Chrom');
			var geneName = getUniqueProperties(data, 'Gene Name');
			var annotation = getUniqueProperties(data, 'Annotation');

			// set the html
			$(getSelector(chromosomes, "subclone-filter-chromosome", "Chrom")).appendTo($container);
			$(getSelector(geneName.sort(), "subclone-filter-gene-name", "Gene Name")).appendTo($container);
			$(getSelector(annotation.sort(), "subclone-filter-annotation", "Annotation")).appendTo($container);

			// append selection, deselection, delete, and save buttons
			$('<button id="select-all-button">Select All</button>').appendTo($container);
			$('<button id="deselect-all-button">Deselect All</button>').appendTo($container);
			$('<button id="invert-selection-button" class="filter-buttons" disabled>Invert Selection</button>').appendTo($container);
			$('<button id="delete-selection-button" class="filter-buttons" disabled>Delete Selection</button>').appendTo($container);
			$('<button id="save-selected-button" class="filter-buttons" disabled>Export Selected</button>').appendTo($container);

			// add callbacks to the filter input elements
			$('#subclone-filter-chromosome').change(updateFilteredData);
			$('#subclone-filter-gene-name').change(updateFilteredData);
			$('#subclone-filter-annotation').change(updateFilteredData);

			// add click callbacks
			$('#select-all-button').click(selectAll);
			$('#deselect-all-button').click(deselectAll);
			$('#delete-selection-button').click(deleteSelection);
			$('#save-selected-button').click(saveSelected);
			$container.children().wrapAll("<div class='subclone-filter' />");

		}
		init(data);
	}

	// save selected items to VCF file
	function saveSelected() {
		var fileName = prompt("Enter the filename", ""); // get the VCF file name from the user, if cancel is pressed then exit
		if (fileName == null) { return; }

		// get the VCF information
		var vcfFile = $DataManager.getVCF();
		var header = vcfFile.getHeader();
		var lines = vcfFile.getLines();
		var vcf = "";
		for (var i = 0; i < header.length; ++i) { // add header to the vcf file
			vcf += header[i] + "\n";
		}
		var currentlySelectedItems = $RowSelectionModel.getSelectedRows();

		currentlySelectedItems.sort();
		var added = {};

		// add the selected lines to the vcf file
		for (var i = 0; i < currentlySelectedItems.length; ++i) {
			if (!added[currentlySelectedItems[i]]) {
				vcf += lines[currentlySelectedItems[i]] + "\n";
				added[currentlySelectedItems[i]] = true;
			}
		}

		// save vcf with the user-provided filename
		var blob = new Blob([vcf], {type: "text/plain;charset=utf-8"});
		fileName = (fileName.endsWith(".vcf")) ? fileName : fileName + ".vcf";
		saveAs(blob, fileName);
	}

	// inverts the selected items
	function invertSelection() {
		var highlightedData = [];
		var selectedRows = $RowSelectionModel.getSelectedRows();
		var gridItems = $grid.getData().getItems();
		var tmpData = {};
		for (var i = 0; i < gridItems.length; ++i) {
			if (selectedRows.indexOf(i) < 0) {
				highlightedData.push(i);
			}
		}
		$RowSelectionModel.setSelectedRows(highlightedData);
		if (highlightedData.length == 0) { parcoords.unhighlight(); }
	}

	// deselects all items
	function deselectAll() {
		$RowSelectionModel.setSelectedRows([]);
		parcoords.unhighlight();
		$dataView.beginUpdate();
		$dataView.setItems($DataManager.getAllGridData());
		$dataView.endUpdate();
		parcoords.data($DataManager.getAllGridData()).render();
		parcoords.brushReset();
	}

	// delete selected items
	function deleteSelection() {
		var sparedData = []; // the rows that are not deleted
		var selectedRows = $RowSelectionModel.getSelectedRows();
		var gridItems = $grid.getData().getItems();
		var deletedItems = {};
		for (var i = 0; i < selectedRows.length; ++i) { // create a map of selected items
			var gridItem = gridItems[selectedRows[i]];
			deletedItems[gridItem.id] = true;
		}
		for (var i = 0; i < $DataManager.getAllGridData().length; ++i) { // if the item is not in the selected dictionary then the item is not deleted
			if (!deletedItems[$DataManager.getAllGridData()[i].id]) {
				sparedData.push($DataManager.getAllGridData()[i]);
			}
		}
		$DataManager.setAllGridData(sparedData);
		$dataView.beginUpdate();
		$dataView.setItems(sparedData);
		$dataView.endUpdate();
		$RowSelectionModel.setSelectedRows([]);
		parcoords.unhighlight();
		updateFilteredData();
		parcoords.brushReset();
	}

	// select all items
	function selectAll() {
		var highlightedData = [];
		for (var i = 0; i < $grid.getData().getItems().length; ++i) {
			highlightedData.push(i);
		}
		$RowSelectionModel.setSelectedRows(highlightedData);
	}

	// update the rows and parcoords based on the filter selections
	function updateFilteredData(event) {
		var tmpData = $DataManager.getAllGridData();
		var filteredData = [];
		$.each($('select.filter'), function (i, el) { // using jquery select the filter items and filter the data based on the filters
			var selectedValue = $(el).val();
			if (selectedValue == '[]') { return; }
			filteredData = [];
			for (var i = 0; i < tmpData.length; ++i) {
				if (tmpData[i][$(el).attr('data')] == selectedValue) {
					filteredData.push(tmpData[i]);
				}
			}
			tmpData = filteredData; // this is an AND operation so use these filtered results on the next filter input element
		});

		$dataView.beginUpdate();
		$dataView.setItems(tmpData);
		$dataView.endUpdate();
		parcoords.data(tmpData).render();
		$RowSelectionModel.setSelectedRows([]);
		parcoords.unhighlight();
	}

	// makes sure dupicate properties are filtered out
	function getUniqueProperties(data, property) {
		var values = [];
		var dups = {};
		$.each(data, function (i, el) {
			if (!dups[el[property]]) {
				dups[el[property]] = true;
				values.push(el[property]);
			}
		});
		return values;
	}

	// generates the HTML for the filter selector
	function getSelector(values, id, label) {
		var selector = '<label for="'+id+'">'+label+'</label><select id="'+id+'" class="filter" data="'+label+'"><option value="[]">[No Filter]</option>';
		$.each(values, function (i, el) {
				selector += '<option value="'+el+'">'+el+'</option>';
		});
		selector += '</select>';
		return selector
	}

	$.extend(true, window, { Slick:{ Controls:{ SlickGridFilter:SlickGridFilter }}});
})(jQuery);
